-- Migration 4.1 (réécrite le 17/09) : policies RLS des tables métier.
--
-- ⚠️ RÉÉCRITURE après audit en base :
--  1. profiles n'a PAS de colonne user_id : les policies doivent filtrer sur
--     id (= auth.users.id). L'ancienne version visait user_id, donc la
--     migration était inapplicable et n'a jamais été appliquée.
--  2. La base portait des policies "legacy" (créées à la main, rôles {public},
--     noms différents). Elles sont supprimées explicitement ici : deux
--     policies permissives sur la même commande sont OR'ées, donc les laisser
--     reviendrait à garder la version permissive ({public} au lieu de
--     authenticated).
--  3. automation_reminders et recurring_invoices (présentes en base, jamais
--     versionnées jusqu'ici) sont désormais versionnées ici.
--
-- Chaque policy est scopée à auth.uid() et réservée au rôle authenticated.
-- Aucun USING (true) / WITH CHECK (true).

-- ── 1. Nettoyage des policies legacy ─────────────────────
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;

DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;

DROP POLICY IF EXISTS "items_select" ON public.invoice_items;
DROP POLICY IF EXISTS "items_insert" ON public.invoice_items;
DROP POLICY IF EXISTS "items_update" ON public.invoice_items;
DROP POLICY IF EXISTS "items_delete" ON public.invoice_items;

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

DROP POLICY IF EXISTS "Users can manage their own reminders" ON public.automation_reminders;
DROP POLICY IF EXISTS "Users can manage their own recurring invoices" ON public.recurring_invoices;

-- ── 2. clients ───────────────────────────────────────────
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

-- ── 3. invoices ──────────────────────────────────────────
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

-- ── 4. invoice_items (jointure via la facture parente) ───
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

-- ── 5. payments ──────────────────────────────────────────
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

-- ── 6. profiles (clé = id, PAS de user_id) ───────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ── 7. automation_reminders (versionné ici, existait en base) ──
DROP POLICY IF EXISTS "automation_reminders_all_own" ON public.automation_reminders;
CREATE POLICY "automation_reminders_all_own"
    ON public.automation_reminders FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ── 8. recurring_invoices (versionné ici, existait en base) ──
DROP POLICY IF EXISTS "recurring_invoices_all_own" ON public.recurring_invoices;
CREATE POLICY "recurring_invoices_all_own"
    ON public.recurring_invoices FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
