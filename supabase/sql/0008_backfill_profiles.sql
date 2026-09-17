-- Migration 8 : backfill des profils manquants.
--
-- Contexte (audit du 17/09) : 4 comptes auth.users existaient sans ligne
-- public.profiles (aucun trigger de création n'était en place avant 0007).
-- Cette migration comble le trou de façon idempotente : elle n'insère que
-- les profils absents, et ne touche à aucune ligne existante.
--
-- Les colonnes settings sont remplies par leurs DEFAULT (0006).

INSERT INTO public.profiles (id, email, full_name)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data ->> 'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
