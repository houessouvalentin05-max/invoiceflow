-- Migration 5 (audit / DoD 0.1) : vérification exécutable de l'état RLS.
-- À lancer dans Supabase → SQL Editor après avoir appliqué 0001→0004.
-- Objectif du DoD 0.1 : prouver que RLS est ON + FORCE sur les 5 tables
-- métier et que chaque policy est scopée à auth.uid() = user_id
-- (aucun USING (true)).
--
-- 1) RLS actif + FORCE sur toutes les tables sensibles
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'invoice_items', 'clients', 'payments', 'profiles', 'notifications')
ORDER BY tablename;

-- 2) Liste des policies créées (doit être non vide et ne contenir AUCUN
--    USING (true) / WITH CHECK (true))
SELECT tablename, policyname, cmd, roles,
       pg_get_expr(qual, relid)       AS using_expr,
       pg_get_expr(with_check, relid) AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'invoice_items', 'clients', 'payments', 'profiles', 'notifications')
ORDER BY tablename, cmd;

-- 3) Alerte : détecte toute policy en accès libre (à traiter comme une fuite)
SELECT tablename, policyname, cmd,
       pg_get_expr(qual, relid)       AS using_expr,
       pg_get_expr(with_check, relid) AS with_check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('invoices', 'invoice_items', 'clients', 'payments', 'profiles', 'notifications')
  AND (
        pg_get_expr(qual, relid) IS NULL
        OR pg_get_expr(qual, relid) LIKE '%true%'
        OR pg_get_expr(with_check, relid) LIKE '%true%'
      );

-- 4) Sécurité de la RPC de suppression de compte (DoD 2.6) :
--    doit afficher SECURITY DEFINER et l'expression auth.uid() dans la source.
SELECT proname, prosecdef, pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'delete_user_account';