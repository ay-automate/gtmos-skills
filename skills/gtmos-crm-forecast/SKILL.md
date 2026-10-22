---
name: gtmos-crm-forecast
description: "Build the forecast narrative for a rep, team or company: the number by bucket (closed won, commit, best case, pipeline), what changed since last week, risks to commit, and the asks -- every figure from real deal data. With GTM OS connected the number comes from records.aggregate over gtm.deal (exact, not a page), commentary from a capped sample, revenue truth from money.settings.get, and changes are proposed for approval. Use for \"forecast\", \"commit number\", \"forecast call\", \"will we hit the quarter\", \"best case\", \"forecast narrative\", \"quarter outlook\"."
license: Apache-2.0
metadata:
  version: "0.1.0"
  category: "crm"
  upstream: "https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/forecast-narrative"
  upstream_sha: "6b989d6490589647c4c164f7f55c2797cf322f04"
  upstream_license: "Apache-2.0; Copyright (c) 2026 Salesforce, Inc."
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Forecast

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`forecast-narrative`](https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/forecast-narrative) in salesforce/salesforce-skills (Apache-2.0, Copyright (c) 2026 Salesforce, Inc.). Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md).

## With GTM OS connected

**1. Ground.** `pipeline.list` Q (stages), `deal_type.list` Q, `money.settings.get` Q (where revenue truth lives and the reporting currency). If revenue truth is a billing or warehouse object rather than CRM deals, `money.revenue` Q gives booked revenue.

**2. The number.** `records.aggregate {objectType: "gtm.deal", filter: {expected close inside the period}, groupBy: "stageId", sum: "baseAmount"}` Q. Map stages to buckets with the org's stage definitions; if a stage's bucket is unclear, ask once. Do not sum a page of `records.list`.

**3. Commentary.** `records.list {objectType: "gtm.deal", sort: {field: "baseAmount", dir: "desc"}, limit: 50}` Q for the top deals, with `account.relationship` and `task.list` per deal. `crm.dashboard` Q for win rate and trend. Say that per-deal lines are a sample and the totals are whole-book.

**4. Honesty.** A forecast is a judgement, not an operation result: label it as such, show the inputs, and flag concentration (one deal above about 40% of commit). Changes to deals are proposed (`deal.move_stage` D, `crm.update_record` E); submitting the forecast stays with a person.

## Without GTM OS

Use the CRM's own forecast or an opportunities report grouped by forecast category, then follow the method below. On Salesforce, the queries in the method are the upstream skill's read-only calls.

---

The method below comes from Salesforce's forecast skill. The Salesforce queries are kept as the path for a Salesforce org without GTM OS; with GTM OS connected, use the operations in each step's GTM OS note instead.

## Forecast narrative

Ground → aggregate the number + sample the deals (ONE turn) → narrative. Scope: my forecast (default), or a named rep/team. Period: current quarter (default).

## 1. Ground

**GTM OS:** `pipeline.list` Q gives the pipelines and ordered stages; `definition.deal_taxonomy` and `definition.journey` say which stages count as won and lost. Salesforce without GTM OS: ground the Opportunity fields first.

Opportunity always exists; naming a missing object fails the whole call. Its fields reveal this org's ForecastCategory/StageName picklists + any custom forecast/override `__c` fields — use exact names.

```
dispatch_readonly(method: "GET", url: "/services/data/v65.0/graphql",
  queryParams: { "queryInput": "{\"query\":\"query { uiapi { objectInfos(apiNames: [\\\"Opportunity\\\"]) { fields { ApiName label } } } }\"}" })
```

## 2. Aggregate the number, sample the deals

**GTM OS:** the number is `records.aggregate {objectType: "gtm.deal", filter, groupBy: "stageId", sum: "baseAmount"}` Q, which counts and sums every matching deal (not a page). The sample for commentary is `records.list` on `gtm.deal` sorted by value, capped at 50. Salesforce without GTM OS:

**Don't compute the number from a `first: N` page.** A raw pull caps at its page (`first: 200` returns 200 rows, not the book) — summing that page silently under-reports the total on a large book, and the first page isn't the whole set. Salesforce aggregates the totals server-side; use that for the number, and pull only a small bounded sample for the per-deal commentary.

`scope: MINE` = running user's book (no user lookup). `%QSTART%`/`%QEND%` = quarter's first/last day as explicit `YYYY-MM-DD` (never a quarter-relative literal — a bare `THIS_QUARTER` silently empties as boundaries move). Bound **both** ends of `CloseDate` — an open-ended `gte` pulls next-quarter+ deals into the current number. **Named rep/team:** swap `scope: MINE` for `OwnerId: { eq: \"<UserId>\" }`; for a team rollup, add `Owner { Name { value } }` to the sample so each deal attributes to its rep.

**2a. The number — aggregate by ForecastCategory (accurate at any volume).** One row per forecast bucket: count + $ sum. This is "The Number" table and it reconciles by construction — no page cap, no client-side sum of a truncated page.
```
dispatch_readonly(method: "GET", url: "/services/data/v65.0/graphql",
  queryParams: { "queryInput": "{\"query\":\"query { uiapi { aggregate { Opportunity(scope: MINE, where: { CloseDate: { gte: { value: \\\"%QSTART%\\\" }, lte: { value: \\\"%QEND%\\\" } } }, groupBy: { ForecastCategory: { group: true } }) { edges { node { aggregate { ForecastCategory { value } Id { count { value } } Amount { sum { value } } } } } totalCount } } } }\"}" })
```
`ForecastCategory` maps to the buckets: **Closed** = Closed Won (in the bank), **Commit**, **Best Case**, **Pipeline**; **Omitted** = drop (closed-lost/omitted). Org doesn't populate `ForecastCategory` → swap `groupBy` to `StageName` and infer buckets from the stage map (ask once if unclear). **If the `aggregate` query errors** (some orgs throw `DataFetchingException` grouping a picklist) → don't re-fire the same shape; fall to the SOQL `GROUP BY` equivalent:
```
dispatch_readonly(method: "GET", url: "/services/data/v63.0/query",
  queryParams: { "q": "SELECT ForecastCategory, COUNT(Id) cnt, SUM(Amount) amt FROM Opportunity WHERE OwnerId = '%OWNERID%' AND CloseDate >= %QSTART% AND CloseDate <= %QEND% GROUP BY ForecastCategory" })
```
SOQL has no `scope: MINE`, so scope it by owner Id — without the `OwnerId` clause this fallback returns the whole org, not your book. `%OWNERID%` = the running user's Id for "my forecast"; resolve it with one `currentUser` read (needs **v66.0** — the GraphQL endpoint otherwise pins v65.0, so bump the version for this one call):
```
dispatch_readonly(method: "GET", url: "/services/data/v66.0/graphql",
  queryParams: { "queryInput": "{\"query\":\"query { uiapi { currentUser { Id } } }\"}" })
```
For a named rep/team, `%OWNERID%` is the `UserId` you already resolved for 2a's `OwnerId: { eq }` (or filter `Owner.Name` instead) — no `currentUser` lookup needed.

**2b. Sample the deals for commentary (bounded raw — Commit/Best Case lines).** The aggregate gives the number; this gives named deals to comment on. Cap hard (`first: 50`, biggest first) so it never overflows — this is a sample, not the book. Splice confirmed `__c` fields into `<OPP_CUSTOM>`. **Check `{` vs `}` balance before dispatching** — splicing `<OPP_CUSTOM>` is where a brace drops.
```
dispatch_readonly(method: "GET", url: "/services/data/v65.0/graphql",
  queryParams: { "queryInput": "{\"query\":\"query { uiapi { query { Opportunity(scope: MINE, where: { IsClosed: { eq: false }, CloseDate: { gte: { value: \\\"%QSTART%\\\" }, lte: { value: \\\"%QEND%\\\" } } }, orderBy: { Amount: { order: DESC } }, first: 50) { edges { node { Id Name { value } StageName { value displayValue } ForecastCategory { value displayValue } Amount { value displayValue } CloseDate { value } Probability { value } NextStep { value } LastActivityDate { value } <OPP_CUSTOM> Account { Name { value } } Owner { Name { value } } } } } } } }\"}" })
```

`InvalidSyntax` / "offending token `<EOF>`" → missing a closing `}`; add it and retry (once, with corrected text — never re-send identical text).

## 3. Bucket

**The Number comes from 2a's aggregate** — count + $ per bucket (Closed Won / Commit / Best Case / Pipeline), whole-book and reconciled; drop the Omitted/closed-lost row. **Per-deal commentary comes from 2b's sample** — the top-by-Amount Commit and Best Case deals (the ones that matter for the call). Prefer `ForecastCategory`; else infer from `StageName` (never invent bucketing — infer from the org's stages or ask once). Say the per-deal lines are the top deals sampled, while the bucket totals are whole-book from the aggregate.

## 4. Changes and commentary

**GTM OS:** compare with last week's saved report, or read stage moves from `activity.list` and the deal's `records.provenance`. Salesforce without GTM OS:

Prior snapshot pasted → diff it (up / slipped / added / lost). No snapshot → pull this quarter's field history for the delta (SOQL only — `OpportunityFieldHistory` has no GraphQL form), and only skip the section if that too is empty/unavailable:
```
dispatch_readonly(method: "GET", url: "/services/data/v63.0/query",
  queryParams: { "q": "SELECT OpportunityId, Field, OldValue, NewValue, CreatedDate FROM OpportunityFieldHistory WHERE CreatedDate >= %QSTART% AND Field IN ('StageName','Amount','CloseDate') ORDER BY CreatedDate DESC" })
```
Derive moved-up / slipped / added / lost from those rows. Per **Commit**/**Best Case** deal, one grounded line — status, what's needed, risk (cite `NextStep`/`LastActivityDate`). Link each deal. **Leader/team rollup across many reps:** cap per-deal commentary to top 5 by Amount per rep.

## 5. Output

```
# Forecast — <Scope> — <Period>
## The Number
| | $ | # |
|---|---|---|
| Closed Won | $<X> | <N> |
| Commit | $<X> | <N> |
| Best Case | $<X> | <N> |
| Pipeline | $<X> | <N> |
| **Commit Total** | **$<Closed+Commit>** | |

## Changes Since Last Week
- ⬆/⬇/✅/❌ <Deal> … (or "No prior snapshot — skipping delta")

## Commit Deals
- **<Account>** $<X> closing <Date> — <status, what's needed, risk>

## Best Case Deals
- **<Account>** $<X> — <what gets it to commit>

## Risk to Commit
- <Deal + specific risk + mitigation>

## On the Radar
- <Pipeline/Best-Case deals that could pull INTO the number if accelerated, or slip OUT — the upside/downside not yet in Commit>

## Asks
- <exec help / resourcing / unblocks>
```
**Concentration callout:** if a single deal is a large share (~40%+) of the Commit number, call it out explicitly — a single-deal quarter is a risk headline, not a footnote.

A deal's forecast category or stage should change? With GTM OS, propose it (`deal.move_stage` D for your own records, `crm.update_record` E for the CRM of record, approved by a different person); without it, change it in the CRM after the rep confirms. "What if this deal slips?": rerun step 2 without it. Submitting the forecast stays manual.
