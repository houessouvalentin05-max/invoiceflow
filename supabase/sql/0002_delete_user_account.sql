-- Migration 2.6 : Versionner la RPC delete_user_account et les triggers
-- Suppression cascade d'un utilisateur : profils, factures, clients, paiements
-- Trigger de passage en statut overdue si nécessaire

-- 1. RPC pour supprimer un utilisateur et ses données associées
CREATE OR REPLACE FUNCTION delete_user_account(user_id uuid)
RETURNS void AS $$
DECLARE
    target_user uuid := user_id;
BEGIN
    -- Supprimer d'abord les données associées (ordre important pour éviter les violations de clé étrangère)
    -- Supprimer les paiements associés
    DELETE FROM public.payments WHERE user_id = target_user;
    -- Supprimer les factures associées
    DELETE FROM public.invoices WHERE user_id = target_user;
    -- Supprimer les éléments de facture associés
    DELETE FROM public.invoice_items WHERE invoice_id IN (SELECT id FROM public.invoices WHERE user_id = target_user);
    -- Supprimer les clients associés
    DELETE FROM public.clients WHERE user_id = target_user;
    -- Supprimer le profil
    DELETE FROM public.profiles WHERE user_id = target_user;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger : passage en statut overdue des factures non supprimées appartenant à un utilisateur supprimé
-- Ce trigger s'exécute après suppression d'un profil pour marquer les factures restantes en overdue
CREATE OR REPLACE FUNCTION set_invoices_overdue_on_user_delete()
RETURNS trigger AS $$
BEGIN
    -- Marquer les factures appartenant à l'utilisateur supprimé en statut overdue
    UPDATE public.invoices
    SET status = 'overdue', updated_at = now()
    WHERE user_id = OLD.user_id AND status != 'overdue';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Appliquer le trigger aux tables concernées
CREATE TRIGGER set_invoices_overdue_on_user_delete_trigger
    AFTER DELETE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_invoices_overdue_on_user_delete();
EOF"',