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
