# Torn Company Helper

**Author:** IamEEKY  
**Platform:** Torn PDA (Android)  
**Current status:** Early public beta — v0.9.0  
**Goal:** A strictly read-only, visual Torn company decision-support dashboard.

> This is an independent community userscript. It is not affiliated with Torn.

## Install in Torn PDA

1. Open the **Torn PDA** app and its **Userscripts** manager.
2. Add a userscript using the raw script URL (or paste the script source):
   \`https://raw.githubusercontent.com/Tom-Peters/Torn-Company-Helper/main/Torn-Company-Helper.user.js\`
3. Enable it, then open Torn in PDA. Tap **Company Helper** near the lower right of the screen.
4. Torn PDA normally supplies your existing API key automatically. Use Settings only if you want to select a separate custom key for personal payment logs.
5. Tap **Refresh** to load company details. No API calls happen until you request them.

If the userscript launcher doesn't appear, check that scripts are enabled in Torn PDA and reload the Torn page.

## Redesigned interface — v0.8.0

The app now has **four primary destinations**:

- **Today:** at-a-glance star rating, profit/loss estimate, training obligations and issues needing review.
- **Staff:** employee role suggestions and a roster view; local-only what-if changes.
- **Training:** a focused queue, payment-review inbox, history importer and audit record view.
- **Growth:** company performance, membership/advertising experiments and historical financial accounts.

The Settings gear holds optional API configuration, appearance and advanced backup controls. Choose **Dark** or **Light** mode. All Torn requests remain manual, with no gameplay actions.

### API key through Torn PDA — no repeated paste

Torn PDA replaces its supported userscript placeholder with the API key configured for that script. **Company Helper automatically uses this app-managed key** when available, just like other PDA-integrated tools. If you have set a **custom API key in Torn PDA's script settings**, PDA supplies that key instead of its normal key.

For basic company data, use your existing PDA key if it has access. For importing **personal money transfer logs**, you may need a custom key including the \`user/log\` permission, restricted to incoming-money log types. Log-access keys are sensitive.

The Settings page offers an optional **session-only** custom-key override when necessary. This override is never saved or exported. Company snapshots and ledgers remain in namespaced \`PDA_storage\`.

## v0.9.0 — Data integrity and useful daily priorities

This release focuses on **trustworthy numbers before optimising**:

- The Today screen shows **Your next decisions** and **Data confidence**. Actions link to the appropriate staff, training or growth screen. They identify missing financial inputs, out-of-date snapshots, unverified personal transfers, unmatched company training history, operating loss breaches and the oldest eligible training commitment.
- The money-log importer proposes the employee and train count automatically, but **no personal transfer counts as a purchased training commitment without explicit approval that it was for training**. A $1m transfer by itself is not proof of five purchased trains.
- Previously auto-classified training payments are retained as local audit records, flagged as **NOT VERIFIED**, and excluded from purchased train counts until reviewed. A backup is recommended before upgrading. Training balances may decrease until previously imported transfers are confirmed.
- Missing company income, any staff wage, an incomplete roster or advertising budget result in **Unknown / Incomplete**, not a fabricated zero or safe financial headroom. Budget scenarios are disabled when the source totals are incomplete.
- Money review pages can show additional batches beyond the first 35. Import and review remain manual. **No gameplay actions are carried out.**

**What this still does not do:** reliably identify the purpose of a money transfer without human review, provide accurate historical settlement-day accounts, infer the hidden Torn star formula, or produce guaranteed financial or staffing outcomes.

## Staff and drill-down upgrade — v0.8.0

- Tap the **star rating, daily P/L, trains, employee-count and company finance tiles** to open a relevant detailed view.
- Tap an employee to see their **current-position working-stat fit %** alongside Torn's reported effectiveness, role requirements, alternative roles and individual training balance.
- The **Team simulator** now reports average requirement-fit score before and after proposed role changes, changes in percentage points, a list of changed employees, and Manager/Marketer/Cleaner coverage.
- Use **Try suggested assignments** to populate a conservative local scenario, or **Restore actual positions** to clear changes. The script never edits company positions.
- Each manual company refresh now records a small employee-stat snapshot, enabling employee progress comparisons after multiple observations.
- Growth checks highlight vacancies, under-covered special roles, observed revenue changes and costs relative to the configured $500,000 loss guardrail.

**Fit % definition:** a weighted measure of how much of a role's recommended MAN/INT/END requirements the employee currently meets; each component is capped at 100%. It is **not the formula for Torn effectiveness**, does not include buffs, and is **not a projected profit or star gain**. Scores depend on available employee and role data.

The company-wide What-if comparison is a **staffing decision aid**, not an exact Torn mechanics simulator. Recommendations avoid moving people out of special positions automatically and require substantial fit improvements before suggesting another role. Real performance should be evaluated using subsequent manual observations.

## Features available now

| Feature | Implementation |
|---|---|
| Company dashboard | Rating, employees, trains, income and available headroom |
| Financials | Reported daily revenue minus current wages and advertising, with explicit estimate warnings |
| $500,000 loss limit | Default setting, adjustable locally per company |
| History | Snapshots on **manual refresh**; observations tabulated and plotted |
| Staff | Live employee working stats, effectiveness and wages |
| Position optimiser | Working-stat suitability heuristics; suggested role arrangements and a what-if selector |
| Training ledger | Manual payment approval, manual training records, FIFO balance, free credit carried forward |
| Training news import | On-demand import with automatic employee matching when unambiguous; unmatched records go to review |
| Money-log import | Discover plausible payment log types in Settings; manually select sensitive categories and approve each payment |
| History corrections | Void events without erasing the audit trail |
| Price and advertising | Current membership price, scenario testing and limited observed-condition comparison |
| Local data | Torn PDA \`PDA_storage\`; JSON backup/restore; company IDs kept separate |

### Earlier improvements in v0.8.0

- **Launcher only on Torn's own company management page** (`/companies.php`), draggable with position saved in Torn PDA storage.
- **Incoming transfers automatically identified:** sender and amount are suggested where the API supports them. Since the purpose of a transfer is not certain from its price, v0.9.0 requires confirmation before crediting a training purchase.
- **No separate numeric money filter required** for normal import. The script looks up incoming payment types when you tap Import. Settings no longer asks you to configure numeric log types.
- **Duplicate protection and repair:** Torn news IDs and personal log IDs are deduplicated; duplicate existing training source IDs are voided but retained for audit. Training manually entered separately may need a one-time review to avoid counting the same event twice.
- **Rescan recent payments** updates older imported log entries that lacked sender/amount data.

### Not yet provided

- A verified model of Torn's hidden company income or star-ranking calculation.
- Automated discovery of the correct cash-transfer log-type ID, or extraction and verification of money amounts from every log format.
- Comprehensive old transaction recovery beyond manually paginated records.
- Exact historical daily P/L when advertising or wages differed in earlier days.
- A scientifically validated optimal membership price or advertising budget.
- Competitor benchmarking and reliably predicted promotion dates.

These are follow-on milestones, **not** features silently claimed by the present version.

## Pricing and training policy

The dashboard supports payments allocated by the director, including **$250,000 per train** or **5 trains for $1,000,000**. Partial payments are manually allocated. Every confirmed train given offsets purchased training; unused training counts as credit for future purchases. Paid commitments are displayed oldest-first, temporarily skipping new/ineligible employees in the visual queue.

Recording or voiding an entry **only changes local accounting records**, never Torn.

## Training history matching (v0.8.0)

In **Training**, tap **Import training history**. Identifiable training recipients are matched against current and archived employees. Matched entries contribute to the local training ledger automatically; uncertain records remain in **Needs review** and require an employee selection. For news you imported using an older version, tap **Match existing history**.

Re-imports are deduplicated by Torn news ID. **If you already entered the same training manually**, check the local audit trail and void the duplicate manual record so the balance is not counted twice. A company news entry may group more than one training action; treat its count as provisional and correct it when more precise source data is available.

For payments, press **Import older payments** or **Rescan recent payments** in Training. The script tries to identify the incoming log types itself. Recognised senders and exact amounts are suggested, but every imported transfer needs training-purpose confirmation before adding purchased trains; personal `user/log` requires sensitive custom API permission.

## Importing training without double-counting

**Training → Import older training** retrieves the next page of historical company news. **Check recent training** checks the newest page again without resetting the history cursor. Both are idempotent for Torn news IDs: repeat imports do not credit the same source twice.

The dashboard checks stored records from every company during startup and voids confirmed repeated source IDs **without deleting the audit trail**. Historical news imports that duplicate older *manual* training entries cannot always be identified automatically; manually review and void only the genuinely overlapping local entries.

**Payments received** automatically detects incoming money log categories after you manually initiate import. Employee and amount are proposed automatically; imported transfers are not credited to training balances until you approve their purpose. The script never sends money or training actions.

## Important limitations of daily P/L

The initial profit estimate is:

\`reported daily income − current daily wages − current advertising budget\`

Other unknown costs are omitted. Historical observations are tagged by **refresh time**, not certified company closing dates. A loss-limit warning is advisory and **never adjusts company spending**.

## Security & permissions

- **Only Torn API GET requests** after explicit user action.
- No Torn gameplay submissions, employee edits, training, payments, auto-refresh or background scraping.
- API key supplied in Settings, held **in memory only**, never stored in backups or this repository.
- Actual player/company information is held **on your device**, not published to GitHub.
- No analytics, tracking pixels, remote servers or third-party API endpoints.
- For payments, use a **dedicated custom scoped key** and restrict \`user/log\` to the intended money-received log types only. See [security details](docs/SECURITY.md).

## Development

The userscript is directly installable without build tools. Automated model and static security tests:

\`\`\`sh
npm test
\`\`\`

The [specification and implementation status](docs/SPECIFICATION.md) explains what's shipped and what's still planned.

## Licence

MIT — © 2026 IamEEKY.

### Money matching and duplicate safeguards

After a manual payment import, clearly identified standard-price payments are matched to current or archived employees. Ambiguous senders, missing amounts or non-standard partial payments appear in **Review payments**, with a shortcut from the top of the Training screen. A custom API key must permit `user/log` to retrieve personal money records; those permissions remain sensitive even for read-only access.

Training history is deduplicated by source record ID both when imported and when calculating balances. Old duplicate entries remain as voided audit records. If you previously **manually** entered a train that also appears in imported news, review the overlap rather than automatically voiding a potentially legitimate training session.
