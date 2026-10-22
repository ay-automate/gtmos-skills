---
name: gtmos-analytics-gtm-report
description: "Build the weekly GTM report, pipeline pack or campaign post-mortem where every figure names the operation or system it came from, small samples are flagged, and data gaps are stated. With GTM OS connected it reads query.engine_kpis, crm.dashboard, money.attribution and money.revenue, each engine's KPIs, sync.health and sync.completeness, and delivers the report as a document or through channel.deliver for approval. Use for \"weekly report\", \"GTM report\", \"pipeline report\", \"sales report\", \"marketing report\", \"board pack\", \"campaign post-mortem\", \"how did we do this week\"."
license: Apache-2.0 AND MIT
metadata:
  version: "0.1.0"
  category: "analytics"
  upstream: "https://github.com/HubSpot/agent-cli-skills/tree/a015a48982b922279d8521677b7c72b0acfb9506/sales-reporting"
  upstream_sha: "a015a48982b922279d8521677b7c72b0acfb9506"
  upstream_license: "Apache-2.0; HubSpot, Inc."
  merged_from: "https://github.com/zapier/gtm-cheat-codes/tree/022a2884f40316ef22269e29fd61b8a0f0c4cb4a/skills/marketing/campaign-postmortem"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# GTM performance report

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`sales-reporting`](https://github.com/HubSpot/agent-cli-skills/tree/a015a48982b922279d8521677b7c72b0acfb9506/sales-reporting) in HubSpot/agent-cli-skills (Apache-2.0, HubSpot, Inc.). Merged with [`campaign-postmortem`](https://github.com/zapier/gtm-cheat-codes/tree/022a2884f40316ef22269e29fd61b8a0f0c4cb4a/skills/marketing/campaign-postmortem) from zapier/gtm-cheat-codes (MIT), kept in `references/zapier-campaign-postmortem.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

**1. Data health first.** `sync.health` Q and `sync.completeness` Q: if a source is stale or incomplete, the report says so at the top.

**2. Numbers.** `query.engine_kpis` Q (cross-engine), `crm.dashboard` Q (pipeline, won, win rate), `money.revenue` Q and `money.attribution` Q (name the model and window), `actions.kpis` Q, and per engine `score.kpis`, `outreach.kpis`, `perf_ads.kpis`, `seo_geo.kpis`. Custom KPIs: `metric.evaluate` Q.

**3. Write.** Apply the method below. Every figure carries its source in a footnote or column. A KPI with too little data reads "not enough data yet (n = …)" and is not compared week over week.

**4. Deliver.** Render through the `output-docgen` connector, or post with `channel.deliver` E, which a person approves.

## Without GTM OS

Pull numbers from the CRM, analytics and ad platforms the user has, name each source, and follow the format below.

---

> The method below is the upstream HubSpot skill. Its HubSpot CLI and MCP calls are the path for a HubSpot portal without GTM OS; with GTM OS connected, run each data step through the operations in the section above instead.

## Source of truth

`hubspot <command> --help` is authoritative. Build on `bulk-operations/SKILL.md` — JSONL shape, batch-read rules, and pagination live there. Reshape patterns: `bulk-operations/resources/json-patterns.md`. `search`/`list` cap at 100 rows per call; a result of exactly 100 is almost always truncated — paginate via `bulk-operations/SKILL.md` before aggregating.

## Property and output shape notes

- All CRM property values come back as **strings** in JSONL — booleans included. `hs_is_closed_won` is returned as `"true"`/`"false"` (string); `amount` is a numeric string. Use `tonumber` for arithmetic; compare booleans as strings (`== "true"`) when filtering client-side.
- **Numeric properties can be `null` *or* an empty string (`""`)** when unset/blank. `tonumber` aborts on `""`. Always guard with `select(. != null and . != "") | tonumber`.
- In `--filter` expressions, `hs_is_closed_won=true` and `hs_is_closed!=true` work — the API parses the value.
- `--properties` returns the standard nested shape: `{"id":"123","properties":{"amount":"5000","dealname":"..."}}`. Reference fields as `.properties.amount` in jq.
- Stage IDs in `dealstage` are portal-specific. Map them with `hubspot pipelines stages --type deals --pipeline <id>` (or read the `stages` array embedded in `hubspot pipelines list/get`). **`hubspot pipelines` is app-token-only** — see Auth section; it 403s under user OAuth.
- `hubspot_owner_id` is a numeric string. Resolve to a name with `hubspot owners list` (fields: `id`, `firstName`, `lastName`, `email`). `hubspot owners list` works under both user OAuth (`hubspot auth login`) and a service key.

## 1. Daily briefing

Date windows differ between macOS and GNU `date`:
```bash
# macOS
TODAY=$(date +%Y-%m-%d); NEXT_7=$(date -v+7d +%Y-%m-%d); YESTERDAY=$(date -v-1d +%Y-%m-%d)
# Linux
TODAY=$(date +%Y-%m-%d); NEXT_7=$(date -d '7 days' +%Y-%m-%d); YESTERDAY=$(date -d '1 day ago' +%Y-%m-%d)
```

**Deals closing in the next 7 days:**
```bash
hubspot objects search --type deals \
  --filter "closedate>$TODAY AND closedate<$NEXT_7 AND hs_is_closed!=true" \
  --properties dealname,amount,closedate,hubspot_owner_id
```

**Deals updated in the last 24h:**
```bash
hubspot objects search --type deals \
  --filter "hs_lastmodifieddate>$YESTERDAY AND hs_is_closed!=true" \
  --properties dealname,amount,dealstage,hs_lastmodifieddate
```

**Open-pipeline summary line:**
```bash
hubspot objects search --type deals --filter "hs_is_closed!=true" --properties amount \
| jq -rs '{count: length, value: ([.[].properties.amount | select(. != null and . != "") | tonumber] | add // 0 | round)}
          | "Open pipeline: \(.count) deals, $\(.value)"'
```

## 2. Pipeline snapshot

**By stage** — count and amount per `dealstage`:
```bash
hubspot objects search --type deals --filter "hs_is_closed!=true" \
  --properties dealstage,amount \
| jq -rs '
    group_by(.properties.dealstage)
    | map({stage: .[0].properties.dealstage, count: length,
           total: ([.[].properties.amount | select(. != null and . != "") | tonumber] | add // 0 | round)})
    | sort_by(-.total) | .[] | "\(.stage)\tcount: \(.count)\tvalue: $\(.total)"' \
| column -t -s$'\t'
```

**By owner:**
```bash
hubspot objects search --type deals --filter "hs_is_closed!=true" \
  --properties amount,hubspot_owner_id \
| jq -rs '
    group_by(.properties.hubspot_owner_id)
    | map({owner: .[0].properties.hubspot_owner_id, count: length,
           total: ([.[].properties.amount | select(. != null and . != "") | tonumber] | add // 0 | round)})
    | sort_by(-.total) | .[] | "owner \(.owner)\tdeals: \(.count)\tvalue: $\(.total)"' \
| column -t -s$'\t'
```

To label owner IDs with names, dump the owners file once and join:
```bash
hubspot owners list | jq -r '"\(.id)\t\(.firstName) \(.lastName) <\(.email)>"' > /tmp/owners.tsv
```

## 3. Win/loss analysis

Filter on `hs_is_closed_won=true` for won; `hs_is_closed=true AND hs_is_closed_won!=true` for lost. Scope with `closedate>=YYYY-MM-DD AND closedate<YYYY-MM-DD`.

**Closed won / lost in a period:**
```bash
hubspot objects search --type deals \
  --filter "hs_is_closed_won=true AND closedate>=2026-04-01 AND closedate<2026-07-01" \
  --properties dealname,amount,closedate,hubspot_owner_id

hubspot objects search --type deals \
  --filter "hs_is_closed=true AND hs_is_closed_won!=true AND closedate>=2026-04-01 AND closedate<2026-07-01" \
  --properties dealname,amount,closedate,hubspot_owner_id
```

**Win rate by rep** — pull all closed deals in the period, group, divide. Note: `hs_is_closed_won` lands as a string, so compare `== "true"`.
```bash
hubspot objects search --type deals \
  --filter "hs_is_closed=true AND closedate>=2026-01-01" \
  --properties hubspot_owner_id,hs_is_closed_won,amount \
| jq -rs '
    group_by(.properties.hubspot_owner_id)
    | map({owner: .[0].properties.hubspot_owner_id,
           total: length,
           won: ([.[] | select(.properties.hs_is_closed_won == "true")] | length),
           won_value: ([.[] | select(.properties.hs_is_closed_won == "true")
                       | .properties.amount | select(. != null and . != "") | tonumber] | add // 0 | round)})
    | map(. + {win_rate: ((.won / .total * 100) | round)})
    | sort_by(-.won_value)
    | .[] | "owner \(.owner)\twon: \(.won)/\(.total)\trate: \(.win_rate)%\twon: $\(.won_value)"' \
| column -t -s$'\t'
```

**Revenue by close month** (won deals):
```bash
hubspot objects search --type deals \
  --filter "hs_is_closed_won=true AND closedate>=2026-01-01" \
  --properties amount,closedate \
| jq -rs '
    group_by(.properties.closedate[0:7])
    | map({month: .[0].properties.closedate[0:7], count: length,
           revenue: ([.[].properties.amount | select(. != null and . != "") | tonumber] | add // 0 | round)})
    | sort_by(.month) | .[] | "\(.month)\tdeals: \(.count)\trevenue: $\(.revenue)"' \
| column -t -s$'\t'
```

## 4. Saved reports

The `hubspot reports` family runs HubSpot's saved reports and CRM-SQL reports server-side, so you don't have to recompute aggregates client-side:

- `reports list` / `get <id>` — browse and inspect saved reports.
- `reports fetch-dataset <id>` — re-execute a saved report server-side and return its dataset.
- `reports create "<CRM SQL>"` — create a report from a CRM-SQL query (a companion skill can generate the SQL); `reports insights <id>` generates AI insights (async, polls to completion).
- `reports update <id>` / `clone <id>` / `favorite <id>` / `unfavorite <id>` — manage report metadata.
- `reports delete <id>` — irreversible, digest-gated: `--dry-run` first, then `--digest <hash> --confirm "<report name>"` (confirm = the report's name).

Run `hubspot reports --help` for the full surface and the CRM-SQL grammar.

## 5. Win/loss context: sequence enrollments

`hubspot sequences enrollments <contact_id>` returns a contact's Sales Hub sequence enrollment history (read-only) — useful for attributing wins/losses to outreach. Each row: `{"contactId":789,"enrollments":[{"sequenceName":"Q4 Outbound","state":"FINISHED","enrolledAt":"...","currentStepOrder":5,"totalSteps":6}]}`. Join it to a deal's associated contacts for a "was this deal worked through a sequence?" view. See `hubspot sequences enrollments --help`.

## Known limitations

- Won/lost stages are identifiable from `hubspot pipelines stages`: each stage's `metadata` carries `isClosed`/`probability` (e.g. `jq -r 'select(.metadata.probability=="1.0") | .id'`). `hs_is_closed_won` on the deal itself also works.
- No team object — group by `hubspot_owner_id` and resolve names from `hubspot owners list` client-side.
- `hubspot pipelines` is app-token-only and 403s under user OAuth. `hubspot owners list` works under user OAuth. Keep raw IDs + warn; do not fail the report when pipelines is unavailable.
- Numeric CRM properties can be `null` or `""`; always guard `tonumber` with `select(. != null and . != "")`.
