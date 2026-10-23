---
name: gtmos-leads-tech-stack
description: "Read the tech stack of every account on a list and sort them into segments: uses a competitor (displace), uses a complement (expand), uses a disqualifier, or none detected. With GTM OS connected it fills technographics through the governed enrichment waterfall (estimate first), reads tech_adoption and tech_churn signals, and drafts a definition.segment for the result. Use for \"which of these accounts use Intercom\", \"find Salesforce shops\", \"segment my list by tech stack\", \"technographic targeting\", \"who runs HubSpot\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-tech-stack-targeting"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (enrichment.enrich_accounts technographics with an estimate, tech_adoption signals, segments, cross-references)"
---

# Tech-stack targeting

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-tech-stack-targeting`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-tech-stack-targeting) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (technographics through the enrichment waterfall with an estimate first, results kept on the account), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Read what is known.** `records.get` on each account (technographics already filled), `enrichment.record_freshness {objectType: "gtm.account", id}` Q for whether that value is stale, and `signals.list` Q for `tech_adoption` / `tech_churn` signals the daily scan recorded.

**2. Fill the gaps, quoted.** `enrichment.enrich_accounts {ids, estimate: true}` previews the technographics fill (it walks `enrich.technographics` through the governed broker, empty fields only). Show the expected cost, and on a yes run it with the same ids (*spends inline*). Stale values go through `enrichment.refresh_stale {objectType: "gtm.account", fields, estimate: true}` first, then a run with `maxUsd` set to the preview.

**3. Segment.** Apply the method below. "Not detected" is not "not used": back-end tools such as a CRM leave no trace on a website. Keep that column honest in every output.

**4. Keep the segment.** To reuse it in plays and routing, draft a `definition.segment` and propose it with `config.propose_changeset` M; a person signs it. Outreach to a segment goes through `gtmos-outreach-cold-email`.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-tech-stack-targeting` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

Selling a HubSpot add-on to Salesforce shops wastes the whole sequence. This skill reads the tech stack of every account on a list, tags each one by the technologies the user cares about, and returns segments: uses the competitor, uses a complement, uses neither.


## Ask for these inputs

- The accounts: a list of domains.
- The technologies to look for, grouped as the user thinks of them: competitors (`Intercom`, `Drift`), complements (`Segment`), disqualifiers (`Salesforce` when the user only fits HubSpot shops).

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `company.technographics` | `domain` | from $0.01 per result (6 providers) |
| 1 (fallback) | `company.tech-stack` | `domain` | from $0.065 per call |
| 2 (optional) | `web.scrape.html` | `url` of the homepage, to confirm a tag in the page source | from $0.00044 per call |

Expected total for 100 domains: about $1 with `company.technographics`.

## Quote before you run

1. Domains × $0.01 (or `costPerSuccessUsd` from `search_catalog`). Per-result pricing can bill more than one result per domain on some providers, so read the price formula in `inspect` and quote the upper bound.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes.
3. Cap each run with `fallback.maxCostUsd` (0.05). `company.tech-stack` costs more than that on its own, so it only runs when the user raises the cap.

## Run it

```tool
run {"endpointId": "job:company.technographics", "input": {"domain": "acme.com"}, "idempotencyKey": "tech-<list>-acme.com", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.05}}
```

Match technology names case-insensitively and by family (`HubSpot CRM`, `HubSpot Marketing Hub` and `HubSpot` all count as HubSpot). A technology missing from the result means "not detected", not "not used": back-end tools such as a CRM often leave no trace on the website. Say this in the output.

## Output format

```csv
domain,segment,competitors_found,complements_found,disqualifiers_found,all_detected,provider
acme.com,displace,Intercom,Segment,,"Intercom;Segment;Google Analytics;Cloudflare",<provider>
```

Segments: `displace` (a competitor found), `expand` (complement found, no competitor), `disqualified`, `unknown` (nothing relevant detected). Then counts per segment and the total `actualCost`.

## Cost and stop rules

- One run per domain. Dedupe domains first (strip `www.` and paths).
- Two failures in a row on different domains: stop and report.

## When not to use this skill

- One company's stack: `looot-enrich-a-company` or `gtmos-research-account`.
