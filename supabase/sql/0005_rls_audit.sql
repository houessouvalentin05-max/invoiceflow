-- Migration 5 (audit / DoD 0.1) — version corrigée le 17/09.
--
-- 🐛 BUGS CORRIGÉS après audit :
--  1. La requête 1 lisait `forcerowsecurity` dans pg_tables : cette colonne
--     N'EXISTE PAS (elle n'est que dans pg_class) → ERROR 42703. Le script
--     n'a donc JAMAIS pu s'exécuter, ce qui explique qu'aucune alerte n'ait
--     remonté l'état réel de la base.
--  2. Les requêtes 2 et 3 passaient `relid` à pg_get_expr : cette colonne
--     n'existe pas dans la vue pg_policies (qual/with_check y sont déjà du
--     texte) → ERROR 42703.
--
-- Exécution : supabase db query --linked --project-ref <ref> -f supabase/sql/0005_rls_audit.sql
-- Lecture seule (aucune écriture).

-- 1) RLS actif + FORCE sur toutes les tables sensibles
SELECT c.relname            AS tablename,
       c.relrowsecurity     AS rowsecurity,
       c.relforcerowsecurity AS forcerowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
      'invoices', 'invoice_items', 'clients', 'payments', 'profiles',
      'notifications', 'automation_reminders', 'recurring_invoices'
  )
ORDER BY c.relname;

-- 2) Liste des policies (doit être non vide, rôles = {authenticated})
SELECT tablename,
       policyname,
       cmd,
       roles::text   AS roles,
       qual          AS using_expr,
       with_check    AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
      'invoices', 'invoice_items', 'clients', 'payments', 'profiles',
      'notifications', 'automation_reminders', 'recurring_invoices'
  )
ORDER BY tablename, cmd;

-- 3) Alerte : policies en accès libre (à traiter comme une fuite).
--    Détecte : USING(true)/WITH CHECK(true), clause manquante selon la
--    commande, ou policy ouverte aux rôles anon/public.
SELECT tablename, policyname, cmd, roles::text AS roles,
       qual AS using_expr, with_check AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
      'invoices', 'invoice_items', 'clients', 'payments', 'profiles',
      'notifications', 'automation_reminders', 'recurring_invoices'
  )
  AND (
        qual = 'true'
     OR with_check = 'true'
     OR (cmd IN ('SELECT', 'DELETE') AND qual IS NULL)
     OR (cmd = 'INSERT' AND with_check IS NULL)
     OR (cmd IN ('UPDATE', 'ALL') AND (qual IS NULL OR with_check IS NULL))
     OR roles::text LIKE '%anon%'
     OR roles::text LIKE '%public%'
  )
ORDER BY tablename, cmd;

-- 4) Sécurité de la RPC de suppression de compte (DoD 2.6) :
--    doit afficher SECURITY DEFINER et l'expression auth.uid() dans la source.
SELECT proname, prosecdef, pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'delete_user_account';

-- 5) Trigger de création de profil (ajouté le 17/09)
SELECT c.relname AS table_name, t.tgname AS trigger_name,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'auth' AND c.relname = 'users' AND NOT t.tgisinternal
ORDER BY t.tgname;
