-- Migration 2.6 : RPC delete_user_account sécurisée + triggers (DoD 2.6)
--
-- SECURITY DEFINER + contrôle strict auth.uid() : un utilisateur ne peut
-- supprimer QUE SON propre compte — jamais un user_id arbitraire. C'est ce
-- check, et non RLS, qui est le verrou principal de cette RPC.
-- Retourne un boolean pour que l'app puisse distinguer succès / refus clair.
--
-- NB : la fonction est créée par la migration, donc possédée par le superuser
-- Supabase (BYPASSRLS) → les DELETE passent même hors policies. Les policies
-- de 0004_rls_policies.sql restent indispensables pour les accès TABLE via la
-- clé anon (lectures/écritures applicatives). Appliquer les migrations dans
-- l'ordre.

-- 1. RPC sécurisée de suppression de compte
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user uuid := user_id;
BEGIN
    -- Refus : appelant non authentifié OU tentative de cibler un autre compte
    IF auth.uid() IS NULL OR target_user IS DISTINCT FROM auth.uid() THEN
        RETURN false;
    END IF;

    -- Ordre enfants → parents pour respecter les clés étrangères
    DELETE FROM public.payments
    WHERE user_id = target_user;

    DELETE FROM public.invoice_items
    WHERE invoice_id IN (SELECT id FROM public.invoices WHERE user_id = target_user);

    DELETE FROM public.invoices
    WHERE user_id = target_user;

    DELETE FROM public.clients
    WHERE user_id = target_user;

    DELETE FROM public.profiles
    WHERE user_id = target_user;

    RETURN true;
END;
$$;

-- Accès réservé au rôle authentifié (jamais anon / public)
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;

-- 2. Trigger : passage en statut overdue des factures d'un profil supprimé
CREATE OR REPLACE FUNCTION public.set_invoices_overdue_on_user_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.invoices
    SET status = 'overdue', updated_at = now()
    WHERE user_id = OLD.user_id AND status != 'overdue';
    RETURN OLD;
END;
$$;

-- 3. Appliquer le trigger aux suppressions de profil
DROP TRIGGER IF EXISTS set_invoices_overdue_on_user_delete_trigger ON public.profiles;
CREATE TRIGGER set_invoices_overdue_on_user_delete_trigger
    AFTER DELETE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_invoices_overdue_on_user_delete();