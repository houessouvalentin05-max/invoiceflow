-- Migration 3.1 : Table notifications (Sprint 1 notifications UI)
-- Suit le pattern des migrations versionnées du repo (RLS + FORCE versionnés,
-- comme 0001_force_rls.sql). Aucun schéma hors de git.

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN (
        'payment_received',
        'invoice_paid',
        'invoice_overdue',
        'payment_reminder',
        'system'
    )),
    reference jsonb NOT NULL DEFAULT '{}'::jsonb,
    read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_read_created_idx
    ON public.notifications (user_id, read, created_at DESC);

-- ⚠️ Corrigé le 17/09 : la FK visait public.profiles (user_id), colonne qui
-- n'existe pas (profiles est keyée sur id = auth.users.id). La table n'avait
-- donc jamais pu être créée. La FK vise désormais profiles (id), sa PK.
-- La colonne applicative reste nommée user_id (attendu par
-- src/features/notifications/api/notification.repository.ts).

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

-- Les notifications sont créées côté serveur, au nom du user authentifié
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Realtime : exposer la table à la publication supabase_realtime si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime'
             AND schemaname = 'public'
             AND tablename = 'notifications'
       ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
    END IF;
END $$;