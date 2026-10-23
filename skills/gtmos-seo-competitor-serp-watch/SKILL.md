---
name: gtmos-seo-competitor-serp-watch
description: "Track where your domain and your competitors appear in Google's top 10 and in AI answers (Google AI Mode, ChatGPT, Perplexity, Gemini) for buying keywords, and what changed since the last check. With GTM OS connected it adds the keywords as tracked prompts (seo_geo.create_tracked_prompt), queues the measured run with seo_geo.run_visibility under the per-run spend cap, and reads share of voice and drops from seo_geo.get_visibility and seo_geo.list_visibility_alerts. Use for \"competitor rankings\", \"SERP watch\", \"who ranks for our keywords\", \"AI answer share of voice\", \"did we lose positions\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "seo"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-competitor-serp-watch"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (tracked prompts and keywords, seo_geo.run_visibility, visibility alerts instead of a history file, cross-references)"
---

# Competitor SERP watch

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-competitor-serp-watch`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-competitor-serp-watch) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (tracked prompts and keywords, the measured visibility run and its spend cap, alerts replace the history file), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Readiness.** Google Search Console is required for the SEO & GEO engine (`seo_geo.gsc_properties` Q, `instance.readiness`). `seo_geo.list_tracked_prompts` Q shows the prompts and keywords already tracked, with brand, aliases, competitors and target URLs.

**2. Track the keywords.** `seo_geo.create_tracked_prompt` D per buying keyword or AI prompt, tagged with the user's brand, up to the competitors the user names and the target URLs. `seo_geo.get_visibility_settings` Q shows the schedule, alert thresholds and the per-run spend cap; changing them is `seo_geo.update_visibility_settings` D.

**3. Measure.** `seo_geo.run_visibility {tracked: "queue"}` D (*spends inline*) records Search Console, Ahrefs and GA4 visibility and queues the paid tracked run: AI answer engines and Google rank through the governed broker, inside the per-call ceiling, the org budget and the per-run cap. Without `tracked: "queue"` nothing is bought. Tell the user the cap before you queue it.

**4. Read the change.** `seo_geo.get_visibility` Q gives share of voice per engine and per tracked prompt; `seo_geo.list_visibility_alerts` Q lists rank drops and AI-answer visibility drops; `seo_geo.kpis` Q the headline numbers with their previous values. The engine keeps the history, so the method's JSON file is only for the plain path. Content fixes go through `gtmos-seo-page` and are published only after a person approves.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-competitor-serp-watch` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

For each buying keyword ("best crm for startups", "clay alternative"), reads the Google top 10 and Google's AI Mode answer, records which of the user's and competitors' domains appear and where, and compares with the previous check saved in a JSON file.


## Ask for these inputs

- 5 to 50 keywords people type when they are ready to buy.
- The user's domain and up to 10 competitor domains.
- Country and language (default `us`, `en`).
- Where to keep history (default `serp-watch.json` in the working folder).

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `google.serp.organic` | `query`, plus `gl` and `hl` | from $0.0009 per call |
| 2 | `google.serp.ai-mode` | `query` | from $0.002 per call |
| 3 (optional) | `search.chatgpt` | `query` | from $0.004 per call |

Expected total: about $0.003 per keyword, $0.15 for 50 keywords, with the optional ChatGPT check about $0.35.

## Quote before you run

1. Keywords × the steps chosen × the prices above.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes.
3. Cap each run with `fallback.maxCostUsd` (0.02).

## Run it

```tool
run {"endpointId": "job:google.serp.organic", "input": {"query": "clay alternative", "gl": "us", "hl": "en"}, "idempotencyKey": "serp-2026-10-08-clay-alternative", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

```tool
run {"endpointId": "job:google.serp.ai-mode", "input": {"query": "clay alternative"}, "idempotencyKey": "aimode-2026-10-08-clay-alternative", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

Put the date in the idempotency key, so the same day replays for free and the next week fetches fresh data.

For each keyword record: the position (1 to 10) of every tracked domain in the organic results (match on the host, ignore `www.`), and for AI Mode whether each domain is cited as a source or named in the answer text. Then load the previous check from the history file and compute the change.

## Output format

A markdown report, then the updated history file.

```markdown
# SERP watch, 2026-10-08 (us/en), 20 keywords, cost $0.06

## Share of voice
| Domain | Top 3 | Top 10 | Cited in AI Mode | Change vs 2026-10-01 |
|---|---|---|---|---|
| you.com | 4 | 11 | 3 | +2 top 10 |
| rival.com | 9 | 15 | 8 | -1 top 3 |

## Changes
- "clay alternative": rival.com 3 -> 1, you.com 7 -> 12 (dropped out)

## Per keyword
| Keyword | you.com | rival.com | other.com | AI Mode cites |
|---|---|---|---|---|
```

History file shape: `{"checks": [{"date": "2026-10-08", "gl": "us", "keywords": {"<kw>": {"organic": {"<domain>": <pos>}, "aiMode": ["<domain>"]}}}]}`.

## Cost and stop rules

- One results page per keyword; do not page to 20 unless the user asks.
- Two failures on a keyword: mark it `error` in the report.

## When not to use this skill

- One results page: `looot-google-serp`. AI visibility for a brand across engines: `looot-ai-search-visibility`. Both.
