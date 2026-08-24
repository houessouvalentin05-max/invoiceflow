-- Migration 4.1 (DoD 0.1 / 4.1) : policies RLS des tables métier, versionnées.
-- Chaque policy est scopée à auth.uid() = user_id. Aucun USING(true).
-- 0001 a activé FORCE ROW LEVEL SECURITY ; ici on matérialise les policies
-- qui étaient jusqu'ici "déjà vérifiées en base" mais jamais commitées
-- (règle n°4 : tout changement de schéma vit dans ce repo).
--
-- À appliquer AVANT d'utiliser delete_user_account (0002) : sous FORCE RLS,
-- un DELETE échoue silencieusement si la policy correspondante n'existe pas.

-- ── clients ─────────────────────────────────────────────
DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
CREATE POLICY "clients_select_own"
    ON public.clients FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "clients_insert_own" ON public.clients;
CREATE POLICY "clients_insert_own"
    ON public.clients FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "clients_update_own" ON public.clients;
CREATE POLICY "clients_update_own"
    ON public.clients FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "clients_delete_own" ON public.clients;
CREATE POLICY "clients_delete_own"
    ON public.clients FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ── invoices ─────────────────────────────────────────────
DROP POLICY IF EXISTS "invoices_select_own" ON public.invoices;
CREATE POLICY "invoices_select_own"
    ON public.invoices FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "invoices_insert_own" ON public.invoices;
CREATE POLICY "invoices_insert_own"
    ON public.invoices FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "invoices_update_own" ON public.invoices;
CREATE POLICY "invoices_update_own"
    ON public.invoices FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "invoices_delete_own" ON public.invoices;
CREATE POLICY "invoices_delete_own"
    ON public.invoices FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ── invoice_items (jointure via la facture parente) ──────
DROP POLICY IF EXISTS "invoice_items_select_own" ON public.invoice_items;
CREATE POLICY "invoice_items_select_own"
    ON public.invoice_items FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
          AND invoices.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "invoice_items_insert_own" ON public.invoice_items;
CREATE POLICY "invoice_items_insert_own"
    ON public.invoice_items FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
          AND invoices.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "invoice_items_update_own" ON public.invoice_items;
CREATE POLICY "invoice_items_update_own"
    ON public.invoice_items FOR UPDATE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
          AND invoices.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
          AND invoices.user_id = auth.uid()
    ));

DROP POLICY IF EXISTS "invoice_items_delete_own" ON public.invoice_items;
CREATE POLICY "invoice_items_delete_own"
    ON public.invoice_items FOR DELETE TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.invoices
        WHERE invoices.id = invoice_items.invoice_id
          AND invoices.user_id = auth.uid()
    ));

-- ── payments ─────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own"
    ON public.payments FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own"
    ON public.payments FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own"
    ON public.payments FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;
CREATE POLICY "payments_delete_own"
    ON public.payments FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- ── profiles ─────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
    ON public.profiles FOR DELETE TO authenticated
    USING (user_id = auth.uid());