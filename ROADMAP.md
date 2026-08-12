# InvoiceFlow — Vulnerability & Debt Remediation Roadmap

> Source: full project audit (Nov 2026). Order = risk, not effort. Each item has a **Definition of Done** so a fix is only "done" when it's verifiable.
>
> Estimate assumes one senior-ish dev. ⏱ = rough time.

---

## Phase 0 — Immediate security response (Day 0–2) — do this FIRST, nothing ships before it

### 0.1 Verify & enforce Row Level Security (RLS) — *Critical*
**Why:** The dashboard reads/writes Supabase directly from the browser with the **anon key**. RLS is the *only* thing stopping any visitor from reading/deleting all users' invoices, clients, payments and profiles.
- [ ] In Supabase dashboard → for each table **`invoices`, `invoice_items`, `clients`, `payments`, `profiles`**:
  - Enable **RLS** and set it to **`FORCE ROW LEVEL SECURITY`** (so even the app's own filters can't be bypassed by sending fields).
  - Verify every policy is scoped to `auth.uid()` — e.g. `USING (user_id = auth.uid())` for SELECT/INSERT/UPDATE/DELETE; `invoice_items` joins through the parent invoice's `user_id`.
  - **Watch out for `USING (true)` policies** — treat them as leaks.
- [ ] Manual test: log in as account A and account B → confirm neither can see or touch the other's rows; test an unauthenticated request gets 0 rows.
- [ ] Export the resulting schema + policies into the repo (see Phase 4) so this is auditable from now on.

**DoD:** RLS on + FORCE + verified policies on all 5 tables; two-account isolation test passes; screenshot/policy export committed.

### 0.2 Rotate & remove the service-role key — *Critical*
**Why:** `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_…`) sits in `.env.local`. It is **not used by any code** and bypasses RLS entirely.
- [ ] Regenerate the key in Supabase dashboard (old one dies).
- [ ] Delete the `SUPABASE_SERVICE_ROLE_KEY` line from `.env.local`.
- [ ] `grep -r "SERVICE_ROLE" src .env.local` → must return nothing.
- [ ] Add `.env.example` with placeholders only, committed to git.

**DoD:** no `sb_secret_*` anywhere in repo or env; `git grep sb_secret --all` is clean.

### 0.3 Secret hygiene pass
- [ ] Scan git history for any leaked secrets: `git log --all -p -S 'sb_secret'` and `git log --all --oneline -- .env*`.
- [ ] If anything leaked: rotate that credential too, then rewrite history (filter-repo) and push with `--force`.
- [ ] Confirm `.env*` is gitignored and **no** committed file matches `git ls-files | grep env`.

**DoD:** no secret ever appears in `git log --all` output.

### 0.4 Commit the pending work
- [ ] `git add src/app/dashboard/{analytics,automations,reports,settings}` and commit them (currently untracked; branch is 2 commits ahead of origin).
- [ ] Push to origin.

**DoD:** `git status` clean; origin up to date.

---

## Phase 1 — Baseline hygiene (Day 2–5)

### 1.1 Make `npm run lint` green (26 errors / 5 warnings)
Fix by category (Next 16 enforces React Compiler rules harder than before):
- [ ] **`react-hooks/static-components`** — hoist `EyeIcon` / `EyeOffIcon` (login, register) out of the component render; they're recreated every render.
- [ ] **`Cannot call impure function during render`** — the `FAC-${Math.random()}` invoice number in `invoices/new/page.tsx`; move to a lazy initializer or (better) server generation in Phase 2.5.
- [ ] **`setState synchronously within an effect`** — `clients/page.tsx` & `payments/page.tsx` call `fetchX()` (which sets state) directly in `useEffect`; use an async pattern (e.g. `void (async () => {…})()` with a mounted guard) like `invoices/page.tsx` already does.
- [ ] **`react/no-unescaped-entities`** — escape `'` → `&apos;` in register/login JSX.
- [ ] **`@typescript-eslint/no-explicit-any`** — replace `any` with real types (lean on Phase 3.2).
- [ ] **unused vars** — remove `loading`, `subtle`, unused `Link` import.

**DoD:** `npm run lint` exits **0**.

### 1.2 Dependency & CVE cleanup
- [ ] Upgrade `next` to **≥ 16.3.0** (clears all 4 `npm audit` high findings: nanoid, next, postcss, sharp).
- [ ] `npm audit fix; npm audit --omit=dev` → **0 high**.
- [ ] Remove **unused** deps: `framer-motion`, `next-themes` (custom theme context already exists).
- [ ] Add `"typecheck": "tsc --noEmit"` to scripts.

**DoD:** `npm audit --omit=dev` shows 0 high/0 moderate; `typecheck` green.

### 1.3 Migrate `middleware.ts` → `proxy.ts`
- [ ] Rename to `src/proxy.ts` with the Next 16 convention (same `config.matcher`), keeping the auth-guard logic identical.

**DoD:** build no longer prints the "middleware file convention is deprecated" warning.

## Phase 2 — Security hardening (Week 1–2)

### 2.1 Single data-access path — kill direct browser DB writes
**Why:** Pages currently write straight to Supabase from the client (inserts/updates/deletes in `invoices`, `clients`, `payments`, `settings`), bypassing the nice API/service/validator layer that was built.
- [ ] Route **every mutation** through the existing API routes (`/api/invoices`, `/api/clients`, `/api/payments/*`, profile endpoints) using the server-side Supabase client + zod validation + ownership check.
- [ ] Keep browser-side **reads** only where no sensitive cross-user risk exists, or move them to the API/server components too.
- [ ] After the move, `grep -rn "supabase.from(" src/app src/components` must only hit the API layer.

**DoD:** no `insert/update/delete` on a Supabase table outside `src/…/api/` + repositories; code review pass confirms.

### 2.2 Ownership filter on every destructive write
- [ ] `clients/page.tsx` delete: add `.eq('user_id', user.id)` (today it's only `.eq('id', id)`).
- [ ] `payments/page.tsx` delete: same fix.
- [ ] Audit every repository call: **no query touches another tenant's rows** — either explicit `user_id` filter or an RLS policy that enforces it server-side.

**DoD:** no `delete()/update()` without ownership scoping in the entire codebase (checked by grep + a unit test, Phase 5).

### 2.3 Proper API error contract (400/401/403/404 vs blanket 500)
- [ ] Zod parse failure → **400** with per-field French messages (currently becomes a generic 500).
- [ ] Missing/invalid session → **401** (already done); not found → **404**; cross-user access attempt → **403**.
- [ ] Keep generic **500** only for unexpected errors, and **log them server-side** with the error detail (currently several routes swallow errors without logging).

**DoD:** posting an empty body / bad invoice returns 400 with usable errors; crash paths log and return 500; covered by tests later.

### 2.4 Security headers + CSP
- [ ] `next.config.ts`: add `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy`, `Strict-Transport-Security` (when behind HTTPS).
- [ ] Start CSP in **report-only** mode, then enforce once warnings stop. Because the app uses inline `style={{}}` and `<style>` tags, the CSP must allow inline styles (`'unsafe-inline'` for `style-src`) — worth fixing via external CSS, but not blocking.

**DoD:** `curl -I` on all routes shows the headers; CSP report-only has no violations after a QA pass.

### 2.5 Single source of truth: invoice numbers, statuses, TVA
- [ ] **Invoice numbers:** stop client-side `Math.random()` → generate server-side (per-user sequence or unique token with collision retry).
- [ ] **Statuses:** one shared Zod enum (`draft | sent | viewed | paid | overdue`) + one label/color map. Remove the stale `pending` label from UI maps so client & server can't drift. (If you want a `pending` state, add it server-side deliberately.)
- [ ] **TVA:** use `profiles.default_tva` (settings already collect it) with fallback `0.18` — in the invoice service, the "new invoice" preview, and the PDF. No more 3 hardcoded `0.18`s.

**DoD:** grep shows the status enum, TVA logic, and invoice-number generation each defined once.

### 2.6 Version `delete_user_account` RPC and DB-side logic
- [ ] Bring the function into `supabase/migrations/…` with:
  - `SECURITY DEFINER` + strict `auth.uid()` checks
  - cascade deletes scoped to that user only
  - return `boolean` so the app can surface success/failure clearly
- [ ] Audit any triggers/views (e.g. auto `overdue` status) into the same migration set.

**DoD:** the exact SQL that runs in production lives in the repo and has been reviewed.

---

## Phase 3 — Architecture consolidation (Week 2–3)

### 3.1 Delete dead code
- [ ] Remove `src/app/api/invoices/routes.ts` (byte-identical stale duplicate of `route.ts`; Next silently ignores it).
- [ ] Remove the 12 **unused** `src/components/marketing/*` files — *or* refactor the landing page (`app/page.tsx`) to actually use them. Decide one way; don't keep both.
- [ ] Remove or implement the **fake buttons** on Reports (PDF export / email / weekly report) and the "Versements vite/liens de paiement" promises if they stay fake.

**DoD:** `node_modules`-excluding diff shows only removals; production build still green.

### 3.2 Unify types & remove `any`
- [ ] Single source of truth in `src/types/index.ts` (+ ideally Supabase-generated types from `supabase gen types`), deleting the duplicated `src/features/invoices/types.ts`.
- [ ] Replace page-local `interface` duplicates with imports.
- [ ] Kill every remaining `any` (payments `any[]`, dashboard `data:any`, `CustomTooltip any`, etc.).

**DoD:** `tsc --noEmit` strict-green and `grep -rn ": any\|any[]\|as any"` ≈ 0.

### 3.3 Shared UI primitives & design tokens
- [ ] Extract one theme/token module (the `palette` object in `dashboard/layout.tsx` is a great starting point) and small primitives: `Card`, `Button`, `Input`, `Badge`, `ConfirmDialog` (replaces `confirm()`), `EmptyState`, `PageHeader`.
- [ ] Delete the per-page duplicated `inputStyle`/`labelStyle`/`surface` blocks.
- [ ] Fix the theme system: no light-flash on load (SSR-safe init / `useSyncExternalStore`), and make the `.dark` class actually drive `globals.css` variables (today only `prefers-color-scheme` works).

**DoD:** a dashboard page uses primitives + tokens; reload in dark mode shows no flash; grep for duplicated style objects drops sharply.

---
## Phase 4 — Data versioning & reproducibility (Week 2–3, parallel)

### 4.1 Supabase CLI + migrations as the source of truth
- [ ] `supabase init`, `supabase db dump` → commit the schema as `supabase/migrations/0001_init.sql` (tables, indexes, RLS + FORCE, policies, triggers, views, RPCs).
- [ ] Add a dev reset flow: `supabase db reset` plus a **seed script** (2 demo users with clients/invoices/payments across statuses).
- [ ] One-command local setup: `.env.local` → `supabase start` → `supabase db reset` → `npm run dev`.

**DoD:** fresh clone → 15 minutes → running app with data; every policy is in `git log`.

### 4.2 Environment & onboarding docs
- [ ] Commit `.env.example` with placeholder values.
- [ ] Document `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` semantics (public by design) vs **never** adding service-role/key secrets.

**DoD:** a new dev can set up without asking questions; no real secret in the example file.

---

## Phase 5 — Tests & CI (Week 3–4)

### 5.1 Test stack
- [ ] Add `vitest` + `@testing-library/react` (+ `jest-dom`, `user-event`); `test` / `test:watch` scripts.

### 5.2 Unit tests (pure logic first)
- [ ] `invoice.service`: total/TVA computation (incl. `default_tva` override), invalid-status rejection.
- [ ] `client.validator` / `invoice.validator`: boundary cases (negative qty, bad email, empty items).
- [ ] Repositories (mocked supabase client): **every query includes the `user_id` filter** — regression guard for 2.2.

### 5.3 Component tests
- [ ] Login/register forms: validation errors, submit states.
- [ ] Extract the payments "fully paid → mark invoice paid" logic into a pure helper and test it (today it lives inside a submit handler).

### 5.4 E2E (Playwright)
- [ ] Happy path: register → create client → create invoice → record payment → PDF download smoke test.
- [ ] Auth guard: `/dashboard` redirects unauthenticated visitors to `/login`.
- [ ] Tenant isolation: user B cannot open user A's invoice.

### 5.5 CI (GitHub Actions)
- [ ] `.github/workflows/ci.yml`: `lint` → `typecheck` → `test` → `build` on every PR/push; lint failures block merge.

**DoD:** `npm run lint && npm run typecheck && npm test && npm run build` all green locally and in CI.

---

## Phase 6 — Docs & release prep (Week 4)

- [ ] Rewrite `README.md`: what the app is, stack, setup steps (Phase 4.1), scripts, architecture map, testing commands.
- [ ] Fix `<html lang="en">` → `lang="fr"` + accurate metadata/OG.
- [ ] Align marketing copy with what actually ships (drop "Visa / GBP / payment links / auto-reminders" claims until real, or label as roadmap).
- [ ] Wire or remove the "Automatisations" toggles and Reports actions so the UI doesn't promise behavior that doesn't exist.
- [ ] Re-run the full audit checklist below as a release gate; tag `v0.2.0` and deploy.

---

## Verification matrix (audit finding → fix → how to prove it)

| # | Audit finding | Fixed in | Verification |
|---|---|---|---|
| C1 | RLS unverifiable / not in repo | 0.1, 2.2, 4.1 | Two-account isolation test + migrations committed |
| C2 | Service-role key in `.env.local` | 0.2, 0.3 | `git grep sb_secret` empty; key rotated |
| C3 | Deletes without ownership filter | 2.2 | grep + repo unit tests (5.2) |
| C4 | No security headers / CSP | 2.4 | `curl -I` shows headers |
| C5 | `middleware.ts` deprecated | 1.3 | build warning gone |
| C6 | RPC unversioned | 2.6, 4.1 | SQL in migrations, reviewed |
| Dead `routes.ts`, unused marketing components | 3.1 | files removed, build green |
| Per-page direct DB writes | 2.1 | grep shows API-only writes |
| Zod errors → 500 | 2.3 | bad payload returns 400 (test) |
| `Math.random()` invoice numbers | 2.5 | server-generated |
| `pending`/server status drift | 2.5 | single shared enum |
| TVA ×3 hardcoded | 2.5 | single source using `default_tva` |
| Type duplication + `any` | 3.2 | strict tsc + grep |
| 3 styling paradigms | 3.3 | shared tokens/primitives |
| Theme flash / `.dark` inert | 3.3 | reload in dark = no flash |
| 4 high CVEs | 1.2 | `npm audit` clean |
| 26 lint errors | 1.1 | `npm run lint` exit 0 |
| No tests / no CI | 5.x | CI green on push |
| Boilerplate README, `lang="en"` | 6.x | README accurate, `lang="fr"` |
| Uncommitted dashboard pages | 0.4 | `git status` clean |

---

## Notes & non-negotiable rules going forward
1. **Nothing ships before Phase 0 is done.** Until RLS is verified, the app must not be deployed publicly.
2. **No secrets in code, env files, or git history — ever.** Public anon key is fine; service-role keys never touch the browser or `.env` committed files.
3. **Every spreadsheet-style collectible (invoices, payments, clients) belongs behind the server API layer** — no new direct browser writes.
4. **Any DB schema or policy change = a migration file in this repo.** If it isn't in git, it doesn't exist.
5. **A fix isn't done until its "Definition of Done" passes** — prefer a test or command over a human "looks fine".
---