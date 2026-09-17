-- Migration 7 : création automatique du profil à l'inscription.
--
-- Contexte (audit du 17/09) : aucun trigger n'existait sur auth.users, donc
-- aucune ligne public.profiles n'était jamais créée (4 comptes auth sans
-- profil, et le seul code censé le faire — upsertProfile — était cassé car
-- il écrivait une colonne user_id inexistante).
--
-- profiles.id = auth.users.id (FK ON DELETE CASCADE, cf. 0006).
-- Les colonnes settings sont remplies par leurs DEFAULT (0006).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, company_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'company_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Fonction de trigger : jamais appelable directement.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
