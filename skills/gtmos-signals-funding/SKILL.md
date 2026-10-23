---
name: gtmos-signals-funding
description: "Find companies that just raised and fit the ICP, or check which accounts on a list raised recently, each round with its date and source. With GTM OS connected it reads funding signals the daily scan recorded, runs quoted research.news and enrich.company lookups for the rest, records each confirmed round as a funding signal with its source, and leaves verification to a person. Use for \"who raised a Series A this month\", \"recently funded companies to prospect\", \"funding signals for my list\", \"did any of these accounts raise\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-funding-signal-scan"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (funding signals from the scan, research.news through the broker, signals with evidence, cross-references)"
---

# Funding signal scan

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-funding-signal-scan`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-funding-signal-scan) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (the signal scan and feed first, quoted research.news, funding signals recorded with their source), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Use what the scan found.** `signals.feed {kinds: ["funding"]}` Q returns funding signals with their evidence; `signals.scan_status` Q shows recent scans. For target accounts, `signals.scan_now {accountIds, maxCostUsd}` D (owner or admin; *spends inline*; refused in dry mode) refreshes them.

**2. Discover a segment.** Quote `capability.quote {capability: "research.news", args: {query}}` per query and `enrich.company` per company found; show the total and run `capability.acquire` on a yes (*spends inline*). Dedupe companies across queries before enriching, and check `records.search` by domain: an existing account gets a signal, not a new record.

**3. Record each round.** `signals.record` D with `kind: "funding"`, the account, a summary (round, amount, lead investor), `occurredAt` = the announcement date, `dedupeKey` = the article URL, and `evidence {sourceUrl, matchedText, provider}`. A round seen only in the news stays marked as news-only. A person verifies signals (`signals.verify`); agents record them unverified.

**4. Act.** The signal-led first touch is the `sdr-agent` in `stdlib/pack.core-agents` (it runs on verified funding signals) or `gtmos-outreach-first-lines`. Every send is approved by a person.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-funding-signal-scan` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

A company that raised in the last 60 days is hiring and buying. This skill works in two modes: discover (search recent funding news for a segment, then confirm each round) or check (take the user's account list and read each company's latest round).


## Ask for these inputs

- Mode: discover a segment, or check a list of domains.
- Discover: the segment in words (`fintech`, `B2B SaaS in Germany`), round types (`seed`, `Series A`), window (default 60 days).
- Check: the domains.

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 (discover) | `news.search` | `query` such as `"raises Series A" fintech` | from $0.00099 per call |
| 2 | `company.enrich` | `domain` or `company` name from the article | from $0.0019 per call |
| 3 | `company.funding` | `domain` | from $0.01 per call |
| 1 (check mode) | `company.funding` | each `domain` | from $0.01 per call |

`signals.funding` (from $0.108 per call) and `company.funded.search` (from $0.05 per result) return ready-made funding feeds. They cost 10 to 100 times more per company; offer them only when the news route finds too little.

Expected total: discover with 5 queries and 30 companies ≈ $0.40. Check mode, 100 domains ≈ $1.

## Quote before you run

1. Discover: queries × $0.001, plus companies found × (step 2 + step 3). Check: domains × $0.01.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes.
3. Cap each run with `fallback.maxCostUsd` (0.03).

## Run it

```tool
run {"endpointId": "job:news.search", "input": {"query": "\"raises\" \"Series A\" fintech"}, "idempotencyKey": "fund-2026-10-08-fintech-a", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

From each article take the company name, amount, round, lead investor and date. Skip articles older than the window and roundups that name ten companies without amounts. Resolve the domain with `company.enrich`, then confirm with `company.funding`:

```tool
run {"endpointId": "job:company.funding", "input": {"domain": "acme.com"}, "idempotencyKey": "fund-acme.com", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.03}}
```

A round that appears in the news but not in `company.funding` stays on the list with `confirmed: news only`.

## Output format

```csv
company,domain,round,amount_usd,announced,lead_investor,employees,country,source_url,confirmed
Acme,acme.com,Series A,12000000,2026-09-22,Example Ventures,45,DE,https://...,funding+news
```

Sorted by announcement date, newest first. Then counts and the total `actualCost`.

## Cost and stop rules

- Dedupe companies across queries before step 2.
- Two failed queries in a row: stop and report.

## When not to use this skill

- Full company profile: `gtmos-research-account`.
