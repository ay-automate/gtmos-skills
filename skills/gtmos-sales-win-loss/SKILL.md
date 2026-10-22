---
name: gtmos-sales-win-loss
description: Review recently closed deals for patterns a sales leader can act on -- win rate by rep, source, size, industry and deal type, where losses die, cycle length, loss reasons and what wins have in common, each backed by evidence. With GTM OS connected it counts closed deals with records.aggregate, reads each deal's stage history, loss reason, call transcripts and replies, groups revenue by the org's own deal types, and says "not enough data yet" when the sample is too small to call a pattern. Use for "win-loss review", "why are we losing deals", "loss reasons", "what do our wins have in common", "win rate by rep", "where do deals die", "closed-lost analysis", "quarterly deal review". For live pipeline risk see gtmos-crm-pipeline-review.
license: Apache-2.0
metadata:
  version: "0.1.0"
  category: "crm"
  upstream: "https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/win-loss-review"
  upstream_sha: "6b989d6490589647c4c164f7f55c2797cf322f04"
  upstream_license: "Apache-2.0; Copyright (c) 2026 Salesforce, Inc."
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Win-loss review

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`win-loss-review`](https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/win-loss-review) in salesforce/salesforce-skills (Apache-2.0, Copyright (c) 2026 Salesforce, Inc.). Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

GTM OS holds every closed deal with its stage history, loss reason, deal type, calls and replies. This skill only reads; it changes no record. Confirm each schema with `gtm_describe` before the first call.

**1. Count first, with exact numbers.** `records.aggregate` runs over all matching rows, not a page:

| Read | Why |
|---|---|
| `records.aggregate {objectType: "gtm.deal", filter: {status: {in: ["won", "lost"]}}, groupBy: "status", sum: "baseAmount"}` | Won and lost counts and totals in the reporting currency. Add a close-date filter for the period (check the filter shape with `gtm_describe records.aggregate`). |
| The same call with `groupBy: "ownerPrincipalId"`, `"dealType"` or `"stageId"` | Win rate by rep, by deal type, and the stage distribution. |
| `deal_type.list` and `definition.deal_taxonomy` | The org's deal types in its own words (pilot, expansion...), so cuts use their labels. |
| `pipeline.list` | Stage names and order, to say where losses die. |
| `money.revenue {from, to, groupBy: "deal_type"}` | Revenue from the org's revenue-truth source, by deal type. |

**2. Then read the deals behind the pattern.** `records.list {objectType: "gtm.deal", filter: {status: "lost"}, sort: {field: "baseAmount", dir: "desc"}, limit: 50}` and the same for won. For the five largest of each:
- `records.get` for `lossReason`, `stageChangedAt`, `closedAt`, the account;
- `activity.list {subject: {objectType: "gtm.deal", id}}` for the stage-change entries (the last open stage before close is where the deal died);
- `transcripts.list {dealId}` then `transcripts.get` for stated objections, competitors and decision criteria;
- `replies.list {dealId}` for late-stage replies and their labels.

**3. Honest numbers.** Every rate shows its `n`. If a cut has fewer than ten closed deals, show the count and write "not enough data yet" instead of a percentage. A loss reason comes from `lossReason`, a transcript or an email, with its date; an inferred reason is labelled as inferred. Totals in the headline must match the detail rows.

**4. Output.** Use the text format in step 5 of the method below. If the user wants a document, the `output-docgen` connector can render it; delivering it to a channel is `channel.deliver` (class E, proposed for approval).

When the learning loop is available, `score.learning_report` shows which score criteria actually predicted wins; cite it next to your patterns rather than in place of them.

## Without GTM OS

On Salesforce, steps 1 to 2b of the method below work as written through the Salesforce MCP tools. On another CRM, export closed deals for the period with owner, amount, created and closed dates, final stage, loss reason, source and industry, then apply steps 3 and 5. Never fill a loss reason the data does not hold; say how many deals have none.

---

> The upstream skill opens with a Salesforce connector bootstrap (connectivity checks and global rules for the Salesforce Headless 360 MCP server). It is not carried here, because it applies only to that connector. Steps 1, 2 and 2b below are the Salesforce path; with GTM OS connected, use the reads in *With GTM OS connected* instead.

## Rules

- Reconcile headline totals with the detail rows.

## Method

Ground → (read + evidence, ONE turn) → find patterns → output. Leader-focused: look across recently closed opportunities for patterns a leader can act on.

## Inputs

- **Scope:** "team" (default - all reps under leader) or a specific rep
- **Period:** last quarter (default) or specified range
- **Focus:** all / wins only / losses only

## 1. Ground (hardcoded — Opportunity only)

Ground **only Opportunity** — it always exists (naming a missing object fails the whole call). Its fields reveal this org's loss-reason `__c` schema; don't assume names.

```
dispatch_readonly(method: "GET", url: "/services/data/v65.0/graphql",
  queryParams: { "queryInput": "{\"query\":\"query { uiapi { objectInfos(apiNames: [\\\"Opportunity\\\"]) { fields { ApiName label } childRelationships { childObjectApiName relationshipName } } } }\"}" })
```

Step 1 is the authority on names — use exact strings, never guess. Note the scalar `__c` field(s) that carry a loss-reason/lost-reason category — that's `<OPP_CUSTOM>` below. If none is grounded, omit it and rely on transcript/email evidence for loss reasons instead.

## 2. Read (fill from step 1)

Compute explicit `gte`/`lte` date-literal boundaries for the review period from today's date — do not use a relative literal like `LAST_N_DAYS:90`, it silently drifts the window as today moves. `scope: MINE` for "my closed deals"; swap for `OwnerId: { eq: \"<UserId>\" }` after resolving one User by name for a named rep (team default = no owner filter, all reps roll up together — ask once if genuinely ambiguous).

One call pulls every closed opportunity in the window — with `Account` spanned for industry/size AND the stage-history child nested (no separate round-trip). **Loss death-stage:** a lost opp's closing `StageName` is just "Closed Lost", so "where losses die" must come from the stage-history child — the last **non-closed** `StageName` before close. Nest `<HISTORY_CHILD>` = the OpportunityHistory child's exact `relationshipName` from Step 1 grounding (commonly `OpportunityHistories`); keep its `first:` small (history rows are tiny, but the child rides on up to 200 parents).

```
dispatch_readonly(method: "GET", url: "/services/data/v65.0/graphql",
  queryParams: { "queryInput": "{\"query\":\"query { uiapi { query { Opportunity(scope: MINE, where: { IsClosed: { eq: true }, CloseDate: { gte: { value: \\\"%START%\\\" }, lte: { value: \\\"%END%\\\" } } }, first: 200, orderBy: { Amount: { order: DESC } }) { edges { node { Id Name { value } StageName { value displayValue } Amount { value displayValue } CloseDate { value } CreatedDate { value } LeadSource { value } Type { value } IsWon { value } <OPP_CUSTOM> Account { Name { value } Industry { value } NumberOfEmployees { value } } Owner { Name { value } } <HISTORY_CHILD>(first: 15, orderBy: { CreatedDate: { order: DESC } }) { edges { node { StageName { value } CreatedDate { value } } } } } } } } } }\"}" })
```

Empty `edges` → no closed deals in this window/scope; say so plainly, skip the rest. `first: 200` is a bounded sample; if it truncates on a very high-volume team, note the cap rather than imply full coverage. **If the history child is empty/unavailable**, fall back to the record's final `StageName` for the death-stage line and omit the median-days-in-stage column — don't fire a separate history round-trip.

## 2b. Evidence (run IN PARALLEL with step 2 — same turn, issue all at once)

**Issue step 2 and all of step 2b as tool calls in a single turn — do not wait for the SF read to return before firing the searches.** They key on the account/rep names from the request, not the SF result:
- **docs**: call transcripts for the largest wins and losses (will narrow to the top 5 each once step 2 returns names, but a first broad pass can start now on account names already known from the request)
- **email**: late-stage threads on the same accounts → stated objections, loss reasons

Use whatever doc/email tools are available; skip silently if none are present (SFDC-only is fine). Cite source + date for anything you use.

## 3. Find patterns (record only; reconcile totals; invent nothing)

- **Win rate** overall and by: rep, lead source, deal size band, industry, type (new vs expansion)
- **Loss stage distribution:** where do losses die — the last **non-closed** `StageName` in each lost opp's history child (NOT "Closed Lost"). Most at Discovery? at Proposal? (Fall back to final `StageName` only if history is unavailable.)
- **Median days in stage:** from consecutive history-row `CreatedDate` deltas (omit if no history child).
- **Cycle length:** median days (`CloseDate` − `CreatedDate`) for wins vs losses
- **Size:** median Amount for wins vs losses
- **Qualitative:** for the 5 largest losses and 5 largest wins (by Amount, from step 2), pull the evidence gathered in 2b — stated loss reasons (competitor, budget, timing, no decision), objections in losses but not wins, what wins had in common. Cite specifics: "[Account] - lost at Proposal, transcript on [date] shows pricing objection with no follow-up."

## 4. Output

The upstream skill renders a Salesforce widget (`display_widget`) here; that template is not carried, because it only works in the Salesforce host. Use the text format in step 5 everywhere else.

## 5. Text output

```
# Win-Loss Review — <Scope> — <Period>
**Headline:** <the pattern that matters most, 2 sentences>

## Win Rate
| Cut | Win Rate | n |
|---|---|---|
| Overall | <pct>% | <N> |
| By rep / source / size band / industry | <pct>% | <N> |

## Where Losses Die
| Stage | % of losses | Median days in stage |
|---|---|---|
| <Stage> | <pct>% | <N>d |
(Stage = last non-closed stage from history; omit the median-days column if no history child.)

## Loss Reasons
| Reason | Count | Example |
|---|---|---|
| <Reason> | <N> | <Account>: <one-line evidence w/ date+source> |

## What Wins Have In Common
- <pattern> (<N of M> wins) …

## Largest Losses
- **<Account>** $<X> — died at <Stage> — <one-line evidence>

## Recommended Actions
1. Systemic — <process/enablement tied to the headline>
2. Coaching — <which rep, on what>
3. Data — <what to start capturing>
```
