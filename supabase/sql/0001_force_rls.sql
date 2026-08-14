-- Force RLS même pour le propriétaire de la table.
-- Sans ça, un rôle "owner" (ou toute connexion qui n'est pas explicitement
-- restreinte) peut contourner les policies RLS par défaut sur Postgres.
-- Les policies elles-mêmes (auth.uid() = user_id) ont déjà été vérifiées
-- correctes sur les 7 tables le 12/08 — ce script ajoute juste la
-- deuxième barrière.

ALTER TABLE public.clients FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.payments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.automation_reminders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_invoices FORCE ROW LEVEL SECURITY;