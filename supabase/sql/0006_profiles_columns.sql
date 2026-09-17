-- Migration 6 : colonnes "settings" de public.profiles, versionnées.
--
-- Contexte (audit du 17/09) : ces colonnes existaient DÉJÀ en base, ajoutées
-- manuellement hors du repo (la "migration fantôme 0002_profile_columns" qui
-- n'a jamais existé dans git). Cette migration les rend reproductibles depuis
-- le repo (règle n°4 : tout changement de schéma vit ici).
--
-- Idempotente : ADD COLUMN IF NOT EXISTS → aucun effet si la colonne existe.
-- Les DEFAULT reprennent EXACTEMENT ceux relevés en base et ceux attendus par
-- le frontend (src/app/dashboard/settings/page.tsx, initialProfile).
--
-- ⚠️ profiles n'a PAS de colonne user_id. La clé est id (= auth.users.id).
-- Ne jamais ajouter user_id ici : le code applicatif a été aligné sur id.

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS full_name                 text,
    ADD COLUMN IF NOT EXISTS company_name              text,
    ADD COLUMN IF NOT EXISTS email                     text,
    ADD COLUMN IF NOT EXISTS phone                     text,
    ADD COLUMN IF NOT EXISTS logo_url                  text,
    ADD COLUMN IF NOT EXISTS currency                  text DEFAULT 'XOF',
    ADD COLUMN IF NOT EXISTS company_address           text,
    ADD COLUMN IF NOT EXISTS tax_number                text,
    ADD COLUMN IF NOT EXISTS website                   text,
    ADD COLUMN IF NOT EXISTS default_currency          text DEFAULT 'XOF',
    ADD COLUMN IF NOT EXISTS default_tva               text DEFAULT '18',
    ADD COLUMN IF NOT EXISTS invoice_prefix            text DEFAULT 'INV',
    ADD COLUMN IF NOT EXISTS language                  text DEFAULT 'Français',
    ADD COLUMN IF NOT EXISTS timezone                  text DEFAULT 'Africa/Lome',
    ADD COLUMN IF NOT EXISTS date_format               text DEFAULT 'DD/MM/YYYY',
    ADD COLUMN IF NOT EXISTS auto_payment_reminder_7d  boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS auto_payment_reminder_30d boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS auto_thank_you_email      boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS email_notifications       boolean DEFAULT true,
    ADD COLUMN IF NOT EXISTS push_notifications        boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at                timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at                timestamptz DEFAULT now();

-- La clé profile ↔ auth.users (existante en base, versionnée ici pour un
-- projet neuf). ON DELETE CASCADE : supprimer le compte supprime le profil.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.profiles'::regclass
          AND contype = 'f'
          AND conname = 'profiles_id_fkey'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_id_fkey
            FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;
    END IF;
END $$;

-- Deuxième barrière : RLS forcée même pour le propriétaire de la table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
