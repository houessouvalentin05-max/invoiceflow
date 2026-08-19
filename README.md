# InvoiceFlow

Plateforme de facturation professionnelle pour freelances et PME — Togo 🇹🇬 et Afrique de l'Ouest (devise par défaut XOF, TVA configurable par profil).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (`strict` partout, `npm run typecheck`)
- **Supabase** (Postgres + Auth + RLS) — serveur via `@supabase/ssr`
- **Recharts** (graphiques), **@react-pdf/renderer** (export PDF)
- **Zod** (validation des payloads API côté serveur)

## Architecture

```
src/
├── app/
│   ├── api/                     → Couche API (seule autorisée à lire/écrire la DB)
│   │   ├── clients/  invoices/  payments/  profile/
│   ├── dashboard/               → Applicatif (layout + pages métier)
│   ├── login/  register/        → Auth
│   └── page.tsx                 → Landing publique
├── features/                     → Domaines métier (services, validators, repositories)
├── lib/                          → Infra : supabase client/server, api-error, invoice-meta
└── reports/                      → Service de génération de rapports
```

**Règle absolue — data access :** les écritures (insert/update/delete) passent **uniquement** par la couche `src/app/api/*`, avec validation Zod, vérification d'appartenance `user_id` et gestion d'erreur `handleApiError`. Aucun `supabase.from()` hors de la couche API.

**Règle absolue — UI :** tout écran qui charge de la donnée gère explicitement 4 états : `loading` (placeholder de la forme finale), `success`, `empty` (message + CTA), `error` (message clair + bouton Réessayer).

## Setup local

### 1. Prérequis

- Node.js ≥ 20
- Un projet [Supabase](https://supabase.com) (ou Supabase CLI)

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

Seules 2 variables publiques sont nécessaires (clé **anon**, jamais service_role) :

| Variable | Exemple |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abcdefghijklmn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` |

### 3. Base de données

Les migrations SQL sont versionnées dans `supabase/sql/` et doivent être appliquées **dans l'ordre** :

```bash
ls supabase/sql/*.sql
# 0001_force_rls.sql  →  FORCE ROW LEVEL SECURITY sur toutes les tables
# 0002_delete_user_account.sql  →  RPC delete_user_account + triggers
```

> ⚠️ Avant tout déploiement public : [Phase 0 du ROADMAP](ROADMAP.md) doit être validée (RLS vérifiée + aucune clé service_role dans le repo).

### 4. Lancer l'app

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint (doit rester à 0 erreur / 0 warning) |
| `npm run typecheck` | TypeScript strict, sans émission |

## Feuille de route

Voir [ROADMAP.md](ROADMAP.md) pour l'audit de vulnérabilité / dette technique et son ordre de traitement (Phase 0 = sécurité, Phase 2 = hardening API, Phase 5 = tests/CI, ...).
