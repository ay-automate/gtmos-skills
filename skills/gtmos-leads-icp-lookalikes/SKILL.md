---
name: gtmos-leads-icp-lookalikes
description: "Build a target account list from the customers you already win with: enrich the seeds, find similar companies, drop what fails the ICP or is already in the CRM, and rank the rest. With GTM OS connected it takes seeds from won deals, quotes and runs find.lookalikes and enrich.company through the governed broker, dedupes against existing accounts, and ranks with the Score engine's signed ICP-fit model instead of a hand-made score. Use for \"find companies like our top customers\", \"lookalike accounts\", \"build an ICP list from these seeds\", \"expand my account list\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-icp-lookalike-list"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (seeds from won customers, find.lookalikes through the governed broker, scoring by the signed ICP model, cross-references)"
---

# ICP list from lookalikes

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-icp-lookalike-list`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-icp-lookalike-list) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (seeds from won customers, quoted acquisition, scoring by the signed ICP model), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Seeds and filters from the org.** Best customers come from won deals (`records.list {objectType: "gtm.deal", ...}` filtered to won, or `money.revenue {groupBy: "account"}` Q for the accounts that pay most), not from logos the user admires. Hard filters come from `definition.segment`, `definition.customer_type` and the ICP-fit model (`config.get {kind: "definition.scoring_model", key: "icp_fit"}`), and `definition.suppression_rule` lists who never goes on a list.

**2. Quote, then find.** `capability.quote {capability: "find.lookalikes", args: {domain}}` per seed and `capability.quote {capability: "enrich.company", ...}` per candidate give the total. Show it; on a yes run `capability.acquire` (*spends inline*) with an `idempotencyKey` per seed. A proposal instead of data means a ceiling or budget was hit: report the approval id.

**3. Drop before you pay.** Merge candidates, drop the seeds, existing accounts (`records.search` by domain) and anything failing a hard filter before enriching, exactly as the method says.

**4. Create and score.** Create the kept candidates with `canon.edit_many {objectType: "gtm.account", items: [{values}]}` D (identity resolution matches existing accounts; from an agent key the creates are proposed for a person to approve), fill firmographics with `enrichment.enrich_accounts {ids, estimate: true}` then a run on a yes (*spends inline*), and score them with `score.score_account`. Rank with `score.list_ranked {subjectType: "gtm.account"}` and quote the engine's band and reasons (`score.explain_subject`) as the "why" column. Keep the upstream point system only as the "similar to" evidence; the org's signed model is the score.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-icp-lookalike-list` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

Starts from 1 to 5 seed companies the user already wins with, finds similar companies, enriches every candidate and scores it against a profile built from the seeds. The output is a ranked account list with the reason each account is on it.


## Ask for these inputs

- 1 to 5 seed domains (best customers, not logos they admire).
- How many accounts they want (default 50).
- Hard filters: countries, employee range, industries to exclude, existing customers to drop (a CSV or a list of domains).

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. The provider looot routes to can cost more; `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `company.enrich` | each seed `domain` | from $0.0019 per call |
| 2 | `company.similar` | each seed `domain` | from $0.0089 per call or $0.0019 per result |
| 3 | `company.search` (optional) | filters built from step 1 (industry, size, country) | from $0.0089 per call or $0.00036 per result |
| 4 | `company.enrich` | each candidate `domain` | from $0.0019 per call |

Expected total for 50 accounts: about $0.05 for the seeds, $0.10 to $0.40 for similar-company searches, $0.10 for enrichment. Under $1 with the cheapest providers.

## Quote before you run

1. Work out the number of runs: seeds × 2, plus one enrichment per candidate. Multiply by the prices above or by `costPerSuccessUsd` from `search_catalog`.
2. Tell the user the total and the `balance`, then wait for a yes. More than 100 runs: wait for an explicit yes.
3. Cap each run with `fallback.maxCostUsd` (0.05 is enough for every step here).

## Run it

```tool
run {"endpointId": "job:company.similar", "input": {"domain": "stripe.com"}, "idempotencyKey": "icp-<list>-similar-stripe.com", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.05}}
```

Inspect `company.similar` and `company.search` once before the first run: some providers take a domain, others a name or filter fields, and live input names win over this file.

Then:

1. Build the profile from the seeds: shared industry, employee range, country, business model (B2B or B2C), and any tech that all seeds share.
2. Merge candidates from all seeds, drop duplicates by domain, drop the seeds, existing customers and anything failing a hard filter. Do this before step 4 so you do not pay to enrich accounts you will drop.
3. Enrich what is left, then score: +2 same industry, +2 employee range within the seeds' range, +1 same country, +1 named by two or more seeds' similar lists. Keep the top N.

## Output format

A CSV the user can import, plus a short summary:

```csv
rank,domain,name,industry,employees,country,score,why,similar_to
1,example.com,Example Inc,Fintech,180,US,6,"same industry, size in range, similar to 2 seeds","stripe.com;adyen.com"
```

Summary lines: seeds used, candidates found, dropped by filter (with counts per reason), kept, total `actualCost`.

## Cost and stop rules

- Never enrich a candidate twice. Keep a map of domain to result for the whole session.
- Two failures on a step: stop that step and report it.
- Report `actualCost` per step and in total.

## When not to use this skill

- The user already has a list and wants to filter it by tools they use: `gtmos-leads-tech-stack`.
- One company: `gtmos-research-account`.
