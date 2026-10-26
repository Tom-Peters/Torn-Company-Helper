# Torn Company Helper — Product specification V5 and implementation status

Author: **IamEEKY** · Target: **Torn PDA** · Company type: **Fitness Center** (design baseline; other company types where data supports it).

## Fixed principles

- Visual/read-only. All Torn gameplay actions are manually carried out by the director, outside this script.
- Primary objective: move a 3-star Fitness Center with ~13 employees toward 10 stars while keeping **estimated daily operating losses at or above −$500,000**.
- Local per-company storage, manual API refresh, no servers, no personal details in the public repository.
- Manual approval of payments; manual train count overrides; manual allocation of partial payments; paid queue oldest first.
- $250,000 per train / 5 for $1,000,000 default commercial policy.
- Free training offsets outstanding debt and can be carried forward as credit.
- Temporarily skip ineligible employees while retaining chronological priority.
- Archive departed employees.
- Growth, profit and effectiveness comparisons with stability preference when full optimiser is delivered.

## Shipped: v0.9.0

- [x] Draggable, persistent-position PDA launcher visible only on company management pages
- [x] Session-only API key; manually triggered read-only API calls
- [x] Company profile, employees, stock and role requirements (fallback for Fitness Center)
- [x] Heuristic employee role analysis, with manually adjustable what-if positions
- [x] Manual payments, training entries and carry-forward credit
- [x] Oldest-first ledger, ineligible new-hire skip and local void audit corrections
- [x] Paged training news, replay-safe source IDs, duplicate repair and reviewable ambiguity
- [x] Incoming-only money-log type lookup and sender/amount suggestions; every imported money transfer requires purpose confirmation before training credit
- [x] Daily P/L estimate only when reported income, complete wages/roster and advertising are present; missing fields are unknown and block budget scenarios
- [x] Manual-refresh observations and trend visualisation
- [x] Membership price and advertising sensitivity/observational comparisons
- [x] Local storage, JSON backup/restore, company-ID separation

## Future work — not implemented yet

- [ ] Fully tested historical import cursor handling when more than 100 logs share the same timestamp
- [ ] Better validation of money amounts and sender IDs from specific log schemas; train quantities in grouped same-second news
- [ ] Reviewable opening-balance wizard when API history is incomplete
- [ ] Full combinatorial staffing optimisation, explicit growth/profit/effectiveness mode switching and model calibration
- [ ] Reliable marketing and membership experiment recommendations based on longer controlled comparisons
- [ ] Competitor weekly benchmarks, rankings and trend comparisons
- [ ] Accurate historical P/L matched to Torn's settlement day when data exists
- [ ] Confidence-calibrated star and queue timing projections
- [ ] More robust automated tests, performance profiling and in-app onboarding

## Finance definitions

\`estimate = profile.income.daily - sum(current employee wages) - profile.advertisement_budget\`

This is an **indicative current operating result**, not exact historic accounting. It excludes other unknown expenses and does not count personal training payments as company revenue.

Investment/capital expenditure and personal transfers are separate from operating performance.

## Optimiser confidence

V0.3.0's position optimiser **does not** model Torn's exact company-wide business formula. It compares working stats against job requirements, reserves one provisional Manager/Marketer/Cleaner slot for larger Fitness Centers, and considers a reassignment meaningful only when the heuristic gain clears a threshold (or when filling a designated special role). It may not produce the globally best staffing layout.

## Privacy and public distribution

Only **IamEEKY** appears as project author. The approved GitHub repository owner and URL remain visible. No real API keys, game employee records, personal data or backup files may be committed.

Review [SECURITY.md](SECURITY.md) before granting sensitive permissions.


## 0.8.0 import reliability and launcher behaviour

- Userscript match narrowed to the Torn company URL. Drag position persists in PDA storage and touch dragging doesn't scroll the page.
- In-page route changes are observed locally so the launcher disappears if the browser navigates away from the company.
- Historical importer has distinct oldest-page and newest-page operations. Same Torn news ID is only credited once.
- Startup repair checks every stored company and voids only repeated *source-linked* records. Manual allocations that appear similar are not automatically removed.
- Money receipt parsing requires identified sender fields and amount, a current or archived employee, and an exact pricing calculation. Ambiguous records remain uncredited for review.

## v0.8.0 follow-up

The training balance evaluator counts each unique imported source record at most once regardless of past accidental repeated imports. A manual entry that overlaps an imported record is flagged for review, not silently removed. The payment import UI surfaces unresolved transfers with a direct review shortcut, and explains API key permission failures.

## v0.8.0 — mobile UX and key access

- Native Torn PDA key injection is preferred: the app injects the app-managed or per-script custom key at runtime. A session-only manual override remains optional.
- The mobile UI has a Today dashboard (daily P/L estimate, outstanding trains, action alerts), Staff (role suitability and roster), Training (queue, payment exceptions, training history and audit), and Growth (performance, membership pricing/advertising experiments and observed finance snapshots).
- Settings now contains appearance switching, key state and optional advanced backup controls.
- Opening an overlay or viewing a tab never initiates Torn API reads. Only explicit Refresh/Import actions do so.
- Recorded Torn history and previous local settings are preserved across the UX upgrade; no storage schema reset is performed.
- Role suitability and revenue recommendations remain estimates. This release does not claim a validated global optimum or exact historical P/L.

## v0.8.0 — Drill-down metrics and real scenario comparison

Every primary Today tile routes to an actionable view; financial summaries and training queue rows also open details. Employees show current and hypothetical role requirement-fit and separate Torn effectiveness. The team simulator compares scored averages on the same set of staff, shows affected employees and coverage, and can populate conservative suggestions. Changes are **local only**.

Each manual refresh stores a bounded, local working-stat/effectiveness snapshot for employee trend comparisons. These are observations, not proof of which company change caused a result. Company-wide growth diagnostics cover vacancies, special-role coverage, reported revenue changes, advertising ratio and financial headroom. The $500,000/day loss limit remains the default.

The role-fit score is a weighted capped requirement-coverage heuristic; never label it as Torn's exact effectiveness, earnings, hiring advice or guaranteed star uplift. The What-if simulator does **not** predict the game's hidden formula.

## v0.9.0 — Trustworthy daily inputs (first accuracy milestone)

- Maintain existing `schema:1` storage and migration compatibility. Legacy source `log-auto` entries are marked unverified and excluded from purchased train totals even if migration was not yet saved. Review decisions retain source log IDs and existing audit records.
- Sender + transfer amount may suggest an employee and train quantity. **Training purchase purpose is never inferred solely from amount or sender.** An explicit local confirmation links the log to a purchased train commitment; an irrelevant transfer can be ignored. No Torn transactions are initiated.
- `accounting(c)` returns nullable inputs and a list of missing fields. Missing revenue, a missing staff wage, an incomplete roster or an absent advertising budget invalidate operating P/L and spending headroom. All estimates still exclude other unreported costs and do not represent settled financials.
- Today prioritises data gaps, exceeded loss allowances, unverified transfers, uncertain training-news matches, oldest eligible purchased trains and stale refreshes. Priorities are deterministic checks with evidence notes, not hidden-formula forecasts.
- Further work: full roster role optimisation, training stat investment analysis, reliable finance experiments, opening balances and competitor benchmarks.
