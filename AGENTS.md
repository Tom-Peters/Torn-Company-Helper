# AGENTS.md — Company-TornStaxx

Read the current shared architecture and contract before modifying company code:
https://raw.githubusercontent.com/Tom-Peters/TornStaxx/main/AGENTS.md
https://raw.githubusercontent.com/Tom-Peters/TornStaxx/main/docs/INTEGRATION.md

- **Shared hub:** the separate fifth installer `Tom-Peters/TornStaxx/TornStaxx.user.js`. Never copy its UI into this specialist module.
- **Company module:** `Torn-Company-Helper.user.js`. Public display name **Company-TornStaxx**; keep existing raw install URL and stable tool ID `company` until a verified migration.
- **Attribution:** **IamEEKY** only. No API keys, real employee data, personal financial records or player accounts may appear in this public repository.
- Preserve star growth, staffing, support roles, wages, oldest-first training credits, confirmed payment reconciliation, stockless Fitness Center operations and daily operating-loss guardrail.
- Automatically refresh source-backed read-only observations only within established permission/rate limits while foregrounded. Never post, buy, allocate game resources, train, or modify wages automatically.
- Emit registration, summary, actionable notices, actions, diagnostics, panel state and user-led visit messages using existing `staxx:*` events; keep the single compact module fallback.
- Verify syntax with `node --check Torn-Company-Helper.user.js`, run `npm test` and check the live install manually in Torn PDA.
