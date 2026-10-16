# Journal des agents — InvoiceFlow

Journal commun des interventions multi-agents sur ce dépôt. Entrées les plus récentes en haut.
Protocole complet : voir « Règles de coordination multi-agents » dans `AGENTS.md`.

## 2026-10-16T13:02:48+00:00 — Cline (VS Code)

- **Mission** : installer le protocole de coordination multi-agents.
- **Fichiers touchés** : `AGENTS.md` (section de coordination hors bloc généré,
  survie vérifiée après régénération `next dev`), `docs/AGENT_LOG.md` (créé),
  `.gitignore` (`.agent-lock` ignoré), `.github/copilot-instructions.md` (créé,
  pointeur d'une ligne vers AGENTS.md — Copilot ne l'injecte pas automatiquement).
- **Commits** : le commit « docs(agents): multi-agent coordination rules + agent log »
  de cette même entrée (auto-référence non inscrivable dans le commit qui la contient ;
  hash exact = tête d'`origin/main` après push, voir rapport de mission).
- **Reste à faire / en cours** : rien. `.agent-lock` créé au début, supprimé en fin de session.

## 2026-10-15 (horodatage commits git) — historique connu : funnel invité

- **2026-10-06** : idée énoncée par Valentin (session GitHub Copilot Chat, déplacer
  l'inscription « seulement quand le visiteur voudra enregistrer une facture »).
- **2026-10-07** : implémenté par GitHub Copilot Chat (sessions `87ad22d5` +
  éditions « Chat Edit » tracées) : `/facture`, `/factures/finaliser`, `guest-draft`,
  `auth-redirect`, `/auth/continue`, CTA landing, chaîne `?next=`.
- **2026-10-09** : retravaillé / audit UI + corrections par Cline (session `7sawe`)
  et audité par Codex CLI (rollout 09/10).
- **2026-10-15** : committé et poussé — `ebe614f` (chaîne auth `?next=` +
  `/auth/continue`), `765233a` (flux facture sans compte + CTA landing).
