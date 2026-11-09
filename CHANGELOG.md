## 1.27.0 — company-page owed trains and daily-desk overhaul

- **Company page:** a compact, inline CompanyStaxx training desk displays confirmed trains owed to each employee, what can currently be given, the available train bank and the oldest recorded commitment. Staff within their first 72 hours and former employees remain visible but not actionable.
- **Fast actions:** from the normal Torn company page, refresh official data, open an individual employee's details, review pending receipts or jump to the full training queue without first opening the main CompanyStaxx panel.
- **Simpler Today view:** a focused company overview with training first, three high-priority actions, one-tap staffing/wage/growth shortcuts, and trends and what-if scenarios under an expandable section. Previous tools and records are preserved.
- **Training flow:** the queue shows ready-versus-waiting balances and hides manual training entry under an explicit fallback. Automatic news matching and payment reconciliation remain unchanged.
- **Integrity:** a shared read-only queue model powers both surfaces; stale company data never claims a train is ready, and training alerts avoid stale readiness. Invalid saved timestamps no longer break date rendering. Existing API permissions and 15-minute foreground refresh limits remain in force.
- **Compatibility:** unchanged userscript URL, local storage schema, TornStaxx hub ID and module messages. No automated Torn gameplay actions.

## 1.20.0 — Paid-training alerts require available trains

- Outstanding confirmed paid-training purchases remain in the employee ledger, but generate a badge, Alerts card or StaxxHub action only when Torn reports available company trains **and** an eligible employee can actually receive at least one under the oldest-first allocation plan.
- With zero or unknown train availability, or only ineligible employees, paid-training alerts disappear automatically. The Training view says that the obligation is waiting; it never deletes the confirmed debt.
- Storage-overflow/near-capacity warnings and unverified incoming payment reviews are independent and remain actionable. No training action is performed automatically.

## 1.17.0 — stockless service companies and automatic decline alerts

- **Fitness Centers are service businesses:** refresh skips the optional `company/stock` read, avoids irrelevant missing-stock warnings, and shows real customers, popularity, weekly income and operating-cost estimates instead of product replenishment.
- **Other stockless companies:** a verified empty official `company/stock` array is displayed as no product lines, not an API-permission failure. Actual failed or malformed requests remain visibly unverified and never become synthetic zero stock.
- **Company type-specific navigation:** stockless companies show a Services tab; company identity and customer-facing growth language are not hard-coded to Fitness Centers.
- **Automatic performance alerts:** sufficiently large consecutive-observation deterioration in operating result (at least $25,000 and/or 10% of previous absolute value) and a reported efficiency drop of 5+ points join the existing StaxxHub actionable alerts. The source data must cover two distinct consecutive complete UTC dates, not two refreshes of the same day. No salary, company settings, training or purchasing action is taken automatically.
- Existing automatic roster refresh, training-ledger reconciliation and bounded backfill remain active; full product companies keep stock forecasting.

## 1.16.0 — foreground company sync and automatic history catch-up

- The Company Helper updates from **any visible TornPDA page**, with its existing 15-minute check interval and required API permissions; the company panel does not need to be open.
- Recent training news and incoming-transfer logs now initialise safe official Torn continuation cursors. One additional verified historical page is processed per eligible update, alternating data streams. Cursor faults halt that stream with a warning rather than skipping same-second records.
- Existing deduplication, training-recipient reconciliation and manual review for ambiguous transfers remain in force; old payments cannot be automatically assigned a training purpose.
- All director gameplay decisions remain player-confirmed; scans stop while TornPDA is hidden.

## 1.15.0 — Growth Stress Lab

- Added interactive 5%, 10% and 20% revenue-shock scenarios to Company Overview and Growth Overview, calculated from confirmed reported income, wages and advertising costs.
- Shows hypothetical daily profit/loss, a +5% revenue case and a conservative 75%-of-headroom discretionary-spend illustration inside the saved daily operating-loss limit. Revenue, wages and advertising are held constant except for the selected revenue scenario.
- Added shortcuts to advertising and wage reviews. Never updates Torn budgets or salaries, and does not predict the hidden star-growth formula.

# Changelog

## 0.9.2 — 2026-10-27

- Fix the missing `detailView` state declaration that caused a blank dashboard on opening.
- Catch render failures and show a non-destructive, actionable recovery panel rather than a blank screen.
- Fix one mismatched metric button closing tag and synchronize the in-app version text.
- Add end-to-end-style DOM smoke tests for opening, returning from detail view, and recovery.
- No data migration, new permissions, or Torn gameplay actions.


## 0.9.1 — 2026-10-27

- Follow API v2 validated next-page links for historical training news and personal money logs; support the documented `nanostamp` continuation for same-second log entries.
- Preserve the oldest-page cursor during a recent-data rescan.
- Refuse unexpected pagination hosts/routes/query values and fail closed on full pages without safe continuation rather than advancing past possibly missing records.
- Surface a persistent import warning until a safe older-page import succeeds.
- Retain read-only manual imports, confirmed payment purpose, existing private storage and original schema.
- Add regression cases for tied timestamps, multi-page imports, rescan behaviour and invalid links.


## 0.9.0 — 2026-10-27

- Phase 1: prioritised decision guardrails on Today.
- Old financial or staffing observations trigger a refresh recommendation before discretionary spending advice.
- Training and payment reconciliation remain visible as review tasks, not automatically confirmed purchases.
- A conditional budget headroom recommendation is displayed only when input data is complete, recently refreshed and within the stated loss limit.
- No gameplay automation, new API permissions or ledger migration.


## 0.9.0 — 2026-10-26

- Introduced data-quality assessment and linked daily decisions on Today, with explicit confidence and refresh age.
- Changed personal money imports to auto-identify sender/amount but require confirmation of training purpose before increasing purchased training balances.
- Migrated earlier auto-credited payments to unverified audit records pending review, preserving historical evidence and preventing silent double credit.
- Made missing revenue, wages, partial roster and advertising fields explicitly unknown; blocked budget scenarios without complete inputs.
- Paginated larger payment-review queues and marked old automatic claims unverified in the audit screen.
- Added regression tests for ledger integrity, migration, financial unknowns and daily priorities.



## 0.8.0 — 2026-10-26

- Made Today and Growth metric tiles, the star header, financial breakdowns, staff cards and training queue rows open relevant detailed screens.
- Added current-role fit percentages, required-stat bars and per-employee ranked alternative positions.
- Replaced non-functional role selection with full-team What-if: before/after scores, percentage-point differences, changed employees, coverage alerts and suggested assignment presets.
- Prevented automatic suggestions that abandon important special roles or weakly justify moving an employee.
- Added practical growth diagnostics covering staff gaps, advertising ratio, revenue observations and the daily loss threshold.
- Saved employee working-stat and effectiveness observations during manual refresh, with individual progress displays when history is available.
- Preserved local ledger history, deduplication, PDA key handling and read-only behaviour.



## 0.7.0 — 2026-10-26

- Overhauled the mobile UI into Today, Staff, Training and Growth.
- Added clear daily actions, exception alerts, concise staff cards and a focused training queue.
- Added native Torn PDA API key injection with a temporary manual override for users who need it.
- Added a light/dark appearance switch and moved technical setup into Settings.
- Preserved existing local ledger, history, duplicate safeguards, monetary loss limits, backups and manual refresh.
- Added tests for PDA key substitution, mobile workflows and read-only operation.



## 0.6.2 — 2026-10-26

- Add a prominent Review payments button when imported money records are ambiguous.
- Clarify the permissions needed for sensitive incoming money logs.
- Calculate training balances using unique Torn source IDs, so repeat imports cannot double-credit sessions.


## 0.6.2 — 2026-10-26

- Match only Torn company URLs; draggable launcher remains company-page-only, with route-change hiding and stronger touch-drag CSS.
- Separate **Import older training** and **Check recent training** so historical backfills and rescans are unambiguous.
- Deduplicate training-news responses by Torn record ID before saving and repair replayed records for *every* locally stored company.
- Preserve audit history; manual records without source IDs remain visible for review instead of being silently discarded.
- Keep incoming personal payment matching read-only; exact sender and standard train payment amounts match locally, ambiguity requires review.
- Add regression tests for replay safety, alternate API news collection shapes and SPA route changes.


## 0.5.0 — 2026-10-26

- Restrict the draggable, locally position-persisted launcher to Torn company pages.
- Read payment log sender/amount fields and automatically match unambiguous incoming employee transfers using the standard train pricing.
- Automatically discover incoming-only money-log types when payment import is requested; obsolete manual filter selections are migrated. Keep uncertain/partial payments in review.
- Add re-import of recent money logs to enrich older incomplete records.
- Deduplicate repeat training source IDs and retain voided duplicates in the local audit trail.
- Include source-level payment/training replay prevention tests.



## 0.4.0 — 2026-10-26

- Automatically match unambiguous company training-history entries to current or archived employees when manually imported.
- Add Match existing history for previously imported records; retain a review queue for ambiguous events.
- Replace unexplained numeric money-log filter with public log-type discovery and labelled selection.
- Improve dark-theme text contrast, form readability, touch targets and record status labels.
- Add regression tests for news matching, replay safety and money log discovery.
- Read-only gameplay policy remains unchanged.


## 0.3.0 — 2026-10-26

- Added read-only Torn PDA dashboard and manual API refresh.
- Added employee role suitability suggestions and what-if positions.
- Added locally confirmed payments and training balances with carried-forward free training.
- Added paginated training-news and optional money-log candidate import.
- Added local void corrections that retain a traceable audit trail.
- Added financial observation history, P/L sparkline, advertising scenario and membership-price comparisons.
- Added company-scoped storage and private backup/restore.
- No automated gameplay actions.

This is a development beta; outcomes have not been validated against the user's live Torn API account.
