# AGENTS.md — Company Helper

## MUST READ — current shared Torn development rules
**Before any code change in this repository**, load the **latest** canonical suite standard:
https://raw.githubusercontent.com/Tom-Peters/Torn-ProfitStaxx/main/docs/TORN-SUITE-STANDARD.md

Also read the shared StaxxHub integration contract:
https://raw.githubusercontent.com/Tom-Peters/Torn-ProfitStaxx/main/docs/STAXX-HUB-INTEGRATION.md

The canonical standard governs all Torn scripts, including future scripts. It can change without a local commit. Do not rely on an older cached version. If you cannot access it, state the limitation and do not invent its contents. Follow this repository's tests and project documentation in addition to the shared rules.

## Project-specific entrypoint
- Active user-installed script: `Torn-Company-Helper.user.js`.
- Preserve star-growth strategy, employee roles, wages, training, payments, oldest-first credits and daily-loss guardrail. No automatic gameplay actions. Tool UI must use compact top-tab design.
- Public author credit: **IamEEKY** only; no real Torn API keys, employee records or private imported data in code, tests, documentation or commits.

## Cross-repository change checklist
1. Is this a shared UI, StaxxHub, notification, accessibility, safety or event-contract change? Update canonical `docs/TORN-SUITE-STANDARD.md` / changelog in Torn-ProfitStaxx if rules changed.
2. Edit `shared/staxx-hub.js` in Torn-ProfitStaxx first. Copy identical code to **all three active script entrypoints**, plus the current Happy Jump preview snapshot.
3. Bump relevant userscript versions; preserve stable install URLs, avoid duplicate launchers, retain panel `staxx:panel` events.
4. Test read-only behaviour, no invented metrics, persisted preferences, dismiss/snooze, launcher visibility and responsive layout.
5. Confirm each repository's CI and shared sync check. Be accurate about visual testing: CI is not Torn PDA device testing.

Do not update one shared userscript in isolation and leave the others on mismatched StaxxHub code.
