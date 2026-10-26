# Security and data handling

Author: **IamEEKY**

## What this script does

Torn Company Helper is a manually operated display and local calculator. It makes **GET** requests only to \`https://api.torn.com/v2/\`, using Torn PDA's \`PDA_httpGet\` and an \`Authorization: ApiKey ...\` header.

The initial manual Refresh reads:
- \`company/profile\`
- \`company/employees\`
- \`company/stock\`
- \`torn/{companyTypeId}/companies\` (role requirements, optional)

Explicit History Import reads:
- \`company/news?cat=training\` when requested.

An optional, separately requested money-log import reads:
- \`user/log?log=<specified types>\` with up to 10 log-type IDs. Type IDs are discovered on manual import when supported; the director must explicitly confirm that a matched transfer represents a training purchase before any purchased trains are credited. The script saves a bounded title, ID, timestamp and minimal sender/amount suggestion as a candidate; it does not persist the raw sensitive log payload.

No API request occurs at page load or on a timer.

## App-managed Torn PDA API keys

Torn PDA injects the user's app API key or a per-userscript custom key at runtime by replacing its official userscript token. The repository contains **only the token**, never a real key.

The effective key is used **only in memory** for user-requested GET calls to the official Torn API. It is not included in ledger persistence or JSON exports. Torn PDA's native script settings can provide an independent, narrowly scoped key for sensitive personal money logs.

A user may optionally type a session-only override, which likewise is not persisted.

## API permissions

Use Torn's custom key builder to grant only the selections required by the features you plan to use. \`user/log\` is sensitive: grant it *only* when importing personal money-received events, and narrow its log-type permissions as much as Torn allows. This key must be treated as confidential.

The script does not request Torn passwords, session cookies or private data from other accounts.

## Storage

- The API key is **held in memory only** until the page/script is closed or reloaded.
- API snapshots and explicitly approved local account records are saved in Torn PDA's namespaced \`PDA_storage\`, not public GitHub.
- Records are kept separate under the company's Torn company ID.
- Backup exports contain employee names, player IDs and financial information. **Keep exports private**.
- On changing devices, paste a private backup into Settings to restore it. Restore replaces existing local data.
- Deleted/voided ledger events remain marked in the local audit trail; imports are deduplicated by source record ID.

## What it never does

No gameplay POSTs, no employee assignment requests, no training actions, no money transfers, no simulated Torn clicks, no background scraping, no remote analytics or automated API polling.

The only programmatic download click is for the user's explicitly requested **local JSON backup**.

## Limitations

This is an initial public beta. It has not been tested against a real director's secret key or production company records. Financial estimates exclude unreported costs, and manual allocation can still introduce human errors. Review recommendations before making separate manual decisions inside Torn.

Reference documentation:
- [Torn API](https://www.torn.com/api.html)
- [Torn API v2 schema](https://www.torn.com/swagger.php)
- [Torn PDA userscript interface](https://github.com/Manuito83/torn-pda/tree/master/userscripts)

## Training news auto-matching

On a manually requested company-news import, unambiguous employee recipients are matched locally against the current and archived roster. If the recipient cannot be identified reliably, the news entry stays in review. No game action is performed. Old manually added training records may duplicate the same real session; audit and void the duplicate locally.

## Read-only payment classification (v0.5)

The director explicitly taps Import in the Training tab. Incoming money log types can be discovered from `torn/logtypes` and only incoming types are selected. The script extracts a single matching company employee ID and a single amount from `data`/`params`, storing only a small classified record, not the full sensitive log payload. Standard-price transfers are counted once in the *local* ledger by source ID. If the source cannot be read reliably (or a payment may be partial), it stays in a manual review queue. Neither path causes a Torn gameplay action.

Torn PDA launcher placement and training reconciliation are local-only. The script matches `companies.php` and does not inject itself on other Torn pages.

## v0.9.0: payment-purpose integrity

Incoming payment source data does not necessarily establish payment purpose. **No newly imported cash transfer is automatically credited as a training purchase.** The script proposes sender and amount when unambiguous; the director confirms or ignores each candidate locally.

Previous `log-auto` records are retained for traceability, labelled unverified, and excluded from purchased train balances until individually confirmed. Migration operates only in namespaced local storage; it never submits a Torn action. A private JSON backup is recommended before updating, because local displayed balances may change when unverified legacy entries are excluded.

Financial estimates use explicitly validated nonnegative amounts; unknown fields remain unknown rather than being coerced to zero. An estimated P/L is still not a complete settlement-day accounting statement.
