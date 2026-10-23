---
name: gtmos-signals-hiring
description: "Scan target accounts for hiring signals that predict a purchase (SDR teams, RevOps, a first data hire, postings that name a tool) and rank accounts by signal strength. With GTM OS connected it reads the signals the daily scan already found, runs signals.scan_now or quoted research.jobs lookups for the rest, records each match as a hiring signal with its posting URL, and leaves verification to a person. Use for \"which accounts are hiring SDRs\", \"hiring signals for my list\", \"who is building a data team\", \"companies posting jobs that mention Salesforce\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-hiring-signal-scan"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (the signal scan, research.jobs through the broker, hiring signals with evidence, verification, cross-references)"
---

# Hiring signal scan

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-hiring-signal-scan`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-hiring-signal-scan) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (the daily signal scan first, quoted research.jobs, signals recorded unverified with their evidence), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Use what the scan found.** `signals.feed {kinds: ["hiring"]}` Q (or `signals.list` per account) returns hiring signals with their evidence link; `signals.scan_status` Q shows the last scans and spend. The daily scan already reads jobs for the org's target accounts: do not buy the same postings twice.

**2. Scan on demand.** For the target accounts, `signals.scan_now {accountIds, maxCostUsd}` D (owner or admin; *spends inline*, capped at $1 per run; refused in dry mode) runs the same scan now. For a list outside the targets, quote `capability.quote {capability: "research.jobs", args}` per account, show the total, and on a yes run `capability.acquire` (*spends inline*).

**3. Record what matches.** Keep a posting only when the employer matches the account and the role or text matches the signal (method below). Record matches with `signals.record` D: `kind: "hiring"`, the account, a one-line summary, `occurredAt` = the posting date, `dedupeKey` = the posting URL, and `evidence {sourceUrl, matchedText, provider}`. Agents record signals unverified; a person verifies or disputes them in `signals.review_queue` / `signals.verify`. Under the org's verification gate (`signals.settings.get`) unverified signals do not reach sellers.

**4. Rank with the engine.** `signals.score` Q and `score.explain_subject` show how the signals move each account; quote them next to the method's points.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-hiring-signal-scan` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

A company hiring three SDRs needs sales tools; a company hiring its first data engineer needs data tools. This skill searches open job postings for each account, keeps the roles that match the user's buying signals, and ranks accounts by signal strength.


## Ask for these inputs

- The accounts: domains or company names (a list or a CSV).
- The signal: role titles (`SDR`, `RevOps`, `Data Engineer`) and/or words in the job text (`Salesforce`, `HubSpot`, `Snowflake`).
- How fresh: postings from the last 30 days by default.

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `jobs.search` | company name plus role words as the query | from $0.0005 per call or $0.000145 per result |
| 1 (alt) | `jobs.company` | the company (domain or LinkedIn URL) | from $0.01 per call |
| 2 (optional) | `web.scrape.markdown` | `url` of a matching posting, to read the full text | from $0.0002 per call |

`signals.hiring` (from $0.108 per call) returns a ready-made hiring signal feed. Use it only when the user asks for a market-wide feed, not to check their own list.

Expected total for 100 accounts: about $0.05 to $0.10 with `jobs.search`, about $1 with `jobs.company`.

## Quote before you run

1. Accounts × the price of the job you picked, plus step 2 for up to 3 postings per matching account.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes.
3. Cap each run with `fallback.maxCostUsd` (0.02).

## Run it

Inspect `jobs.search` once: providers differ on whether they take a free `query`, a `company` field or a location. `jobInputs` in a `search_catalog` answer lists what each one takes.

```tool
run {"endpointId": "job:jobs.search", "input": {"query": "Acme SDR", "company": "Acme"}, "idempotencyKey": "hire-<list>-acme.com", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

Keep a posting only when the employer name matches the account (job boards mix in agencies and similarly named companies) and the title or text matches the signal. Score each account: 3 points per matching role posted in the window, +2 when the role is a first hire for that function ("first", "founding", "build the team"), +1 when the text names one of the signal tools.

## Output format

```csv
domain,company,score,matching_roles,newest_posting,example_title,example_url,signal_note
acme.com,Acme,8,2,2026-10-01,Senior SDR,https://...,"2 SDR roles in 30 days, text names HubSpot"
```

Then the accounts with no matching role, and the total `actualCost`.

## Cost and stop rules

- One search per account; do not page further unless the user asks.
- Two failures on the same account: mark it `error`, move on.
- Report `actualCost` at the end.

## When not to use this skill

- One company's open roles in full: `looot-job-postings`.
