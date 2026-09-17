-- Migration 2.6 (réécrite le 17/09) : RPC delete_user_account + cascades.
--
-- ⚠️ RÉÉCRITURE après audit en base : la version précédente référençait
-- public.profiles.user_id, colonne qui N'EXISTE PAS (profiles est keyée sur
-- id = auth.users.id). La migration ne pouvait donc pas s'appliquer et la
-- RPC était absente en base (0 fonction publique, appel REST → PGRST202/404).
--
-- SECURITY DEFINER + contrôle strict auth.uid() : un utilisateur ne peut
-- supprimer QUE SON propre compte — jamais un user_id arbitraire. C'est ce
-- check, et non RLS, qui est le verrou principal de cette RPC.
-- Retourne un boolean pour que l'app puisse distinguer succès / refus clair.
--
-- Stratégie de suppression : on supprime la ligne auth.users et on laisse
-- les FK ON DELETE CASCADE nettoyer le reste (profiles.id, clients.user_id,
-- invoices.user_id, invoice_items→invoices, recurring_invoices,
-- automation_reminders). Seule exception : payments_user_id_fkey n'a PAS de
-- CASCADE → on purge explicitement les paiements du user d'abord.

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

    -- Seule FK sans ON DELETE CASCADE vers auth.users : on purge d'abord.
    -- ⚠️ Colonnes qualifiées OBLIGATOIREMENT : le paramètre s'appelle user_id
    -- et masquerait la colonne (erreur 42702 "column reference is ambiguous").
    DELETE FROM public.payments
    WHERE payments.user_id = target_user;

    -- Le reste suit en cascade (profiles, clients, invoices, invoice_items,
    -- recurring_invoices, automation_reminders).
    DELETE FROM auth.users
    WHERE auth.users.id = target_user;

    RETURN FOUND;
END;
$$;

-- Accès réservé au rôle authentifié (jamais anon / public)
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;

-- Nettoyage : l'ancien trigger marquait des factures "overdue" après
-- suppression d'un profil. Obsolète (les factures sont supprimées en
-- cascade) et cassé (référençait OLD.user_id, colonne inexistante).
DROP TRIGGER IF EXISTS set_invoices_overdue_on_user_delete_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.set_invoices_overdue_on_user_delete();
