---
name: gtmos-signals-account-digest
description: "Write a digest of what changed at target accounts since the last run -- funding and leadership news, new matching job posts, changed pricing or careers pages -- listing only what is new, each line with its source. With GTM OS connected it reads the signal feed (signals.feed), refreshes it with signals.scan_now under the per-run spend cap, respects the org's verification gate, and can hand the weekly run to the signal watch agent. Use for \"what changed at my accounts this week\", \"signal digest\", \"account watchlist\", \"weekly account news\", \"buying signals at my targets\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-account-signal-digest"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (the signal feed and scan instead of a state file, verification gate, the signal watch agent, cross-references)"
---

# Account signal digest

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-account-signal-digest`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-account-signal-digest) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (the signal feed, the scan and its spend cap, the verification gate and the signal watch agent replace the local state file), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. The feed is the state.** `signals.feed {since, kinds?, accountId?}` Q is the org-wide signal feed, newest first, filtered by class, kind, status, party tier and time; each signal carries its evidence. No state file is needed: the daily scan dedupes per fact, so a re-run never records the same article or posting twice.

**2. Refresh.** `signals.scan_status` Q shows the last scans (signals created, spend vs cap, budget stops). For an on-demand pass, `signals.scan_now {accountIds?, maxCostUsd}` D (owner or admin; *spends inline*; capped at the lower of your cap, the configured per-run cap and $1; refused in dry mode). One scan runs at a time per org.

**3. Respect the gate.** `signals.settings.get` Q gives the org's verification gate (`off`, `seller_surfaces`, `strict`). Under a gate, a digest for sellers lists verified signals only; list the unverified ones separately for the person who reviews them (`signals.review_queue` Q, then `signals.verify`, human only).

**4. Write it.** Use the output format below, grouped by account, every line with its date and source link. The first run is a baseline, not a list of news.

**5. Hand it to the agent.** The `signal-watch-agent` in `stdlib/pack.revenue-agents` runs this digest on weekdays at 07:00 UTC and opens a task for the owner where it matters. `packages.agents` Q shows whether it is installed.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-account-signal-digest` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

Paid signal tools charge a seat to tell you that a target account raised money or started hiring. This skill does the same check on demand for the user's own watchlist: it looks for new news, new matching job posts and a changed pricing or careers page per account, compares with the last run, and writes only what is new.


## Ask for these inputs

- The watchlist: domains with the company name, 5 to 200 accounts.
- Role words that count as a hiring signal (`SDR`, `RevOps`, `data engineer`).
- Pages to watch per account (default `/pricing` and `/careers` when they exist).
- Where state lives (default `signal-digest.json` in the working folder).

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `news.search` | `query` = `"<company name>"` | from $0.00099 per call |
| 2 | `jobs.search` | company name plus role words | from $0.0005 per call |
| 3 | `web.scrape.markdown` | `url` of each watched page | from $0.0002 per call |

Expected total: about $0.002 per account with one watched page, $0.004 with two pages and a fallback. 100 accounts weekly ≈ $0.20 to $0.40 a week.

## Quote before you run

1. Accounts × (1 news + 1 jobs + watched pages) × the prices above.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes. A scheduled weekly run can reuse the yes for the same watchlist and the same quote; re-quote when the list grows.
3. Cap each run with `fallback.maxCostUsd` (0.02).

## Run it

Use the ISO week in idempotency keys (`sig-2026-W41-acme.com-news`), so a re-run in the same week replays for free.

```tool
run {"endpointId": "job:news.search", "input": {"query": "\"Acme Inc\""}, "idempotencyKey": "sig-2026-W41-acme.com-news", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

```tool
run {"endpointId": "job:web.scrape.markdown", "input": {"url": "https://acme.com/pricing"}, "idempotencyKey": "sig-2026-W41-acme.com-pricing", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

Compare with the state file:

- News: an article URL not seen before and published since the last run. Tag it `funding`, `exec_change`, `launch`, `partnership`, `layoffs` or `other` from the headline.
- Jobs: a posting URL not seen before whose title matches the role words.
- Pages: hash the markdown after removing dates and numbers that change every load; a different hash is a change. Quote up to 3 changed lines.

Save URLs and hashes, never full page text, in the state file.

## Output format

```markdown
# Signal digest, week 2026-W41, 42 accounts, cost $0.11

## Accounts with new signals (7)
### Acme (acme.com)
- funding: "Acme raises $20M Series B" (2026-10-06, https://...)
- hiring: 2 new SDR roles (https://..., https://...)
- pricing page changed: "Team plan $49 -> $59 per seat"

## No change (35)
acme2.com, ...

## Errors (0)
```

State file shape: `{"lastRun": "2026-10-08", "accounts": {"acme.com": {"news": ["<url>"], "jobs": ["<url>"], "pages": {"https://acme.com/pricing": "<sha256>"}}}}`.

## Cost and stop rules

- One news search and one jobs search per account per run.
- The first run has nothing to compare against: report it as a baseline, not as a list of signals.
- Two failures on an account: list it under Errors.

## When not to use this skill

- A deep one-off look at one account: `gtmos-research-account`. Funding across a whole segment: `gtmos-signals-funding`.
