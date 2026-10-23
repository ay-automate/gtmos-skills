---
name: gtmos-signals-job-changes
description: "Check which past champions, customers or contacts changed jobs and get a verified work email at their new company, for movers only. With GTM OS connected it takes the list from won deals and their committee contacts, runs quoted research.job_changes lookups through the governed broker, records each move as a job_change signal, and fills the new email with enrichment.enrich_contacts after an estimate. Use for \"which of my champions changed jobs\", \"job changes in my CRM\", \"track former customers who moved\", \"who left their company\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-job-change-check"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (contacts from closed-won deals, research.job_changes through the broker, job_change signals, enrichment for movers only, cross-references)"
---

# Job change check

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-job-change-check`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-job-change-check) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (champions from won deals, quoted job-change lookups, job_change signals, enrichment for movers only), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Who to check.** Champions and buyers from won deals: `records.list {objectType: "gtm.deal", ...}` filtered to won, their contacts, and the champion role from `buying_roles.list` Q. `research.subject.get {subject: {objectType: "gtm.contact", id}}` Q shows what the research agent already knows about a person, including job changes it found.

**2. Quote, then look up.** `capability.quote {capability: "research.job_changes", args}` per contact (or `find.person_linkedin` for rows with no LinkedIn URL); show the total and on a yes run `capability.acquire` (*spends inline*) with an `idempotencyKey` per row. Classify moved, promoted, stayed or unknown with the method below; a private or missing profile is unknown, never a guess.

**3. Record the move.** `signals.record` D with `kind: "job_change"` on the contact (summary: from and to company, title, start month; `dedupeKey` per person and new company; `evidence.sourceUrl` = the profile). Do not overwrite the old employment by hand: find the new company with `records.search` (or create it with `canon.edit`, proposed for a person when you are an agent), and let a person confirm the move.

**4. Movers only.** For each mover, `enrichment.enrich_contacts {ids, estimate: true}` previews the new email; run it on a yes (*spends inline*). Keep `catch_all` and `risky` emails flagged. A first touch to a mover goes through `gtmos-outreach-cold-email` and is approved by a person.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-job-change-check` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

People who bought from you before buy again at their next company. This skill takes a list of contacts with the company you last knew them at, reads each current LinkedIn profile, flags who moved, and finds a verified work email at the new company for the movers only.


## Ask for these inputs

- A list (CSV or pasted) with at least: name, last known company or domain, LinkedIn URL. Rows without a LinkedIn URL go through step 1b.
- Whether to find emails for movers (default yes).

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `linkedin.person.profile` | `linkedin_url` | from $0.0012 per call |
| 1b | `people.enrich` (rows with no LinkedIn URL) | `first_name`, `last_name`, `company` or `domain` | from $0.0029 per call |
| 2 | `company.enrich` (movers only) | the new company name, to get its `domain` | from $0.0019 per call |
| 3 | `people.email.find` (movers only) | `first_name`, `last_name`, new `domain` | from $0.0036 per call |
| 4 | `people.email.verify` (movers only) | `email` | from $0.00145 per call |

Single-call job-change feeds also exist in the catalog: `people.job-change` (from $0.065 per call) and `people.job.changes` (from $0.108 per call). They cost 50 to 90 times more than one profile read, so use them only when the user wants a market-wide feed, not a check of their own list.

Expected total for 200 contacts with 10% movers: 200 × $0.0012 + 20 × ($0.0019 + $0.0036 + $0.00145) ≈ $0.38.

## Quote before you run

1. Count rows with and without a LinkedIn URL, multiply by the step 1 and 1b prices. Add an estimate for movers at 10% of rows times steps 2 to 4.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes.
3. Cap every run with `fallback.maxCostUsd` (0.02 covers steps 1 to 4).

## Run it

```tool
run {"endpointId": "job:linkedin.person.profile", "input": {"linkedin_url": "https://www.linkedin.com/in/janedoe"}, "idempotencyKey": "jc-<list>-<row>-profile", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.02}}
```

Decide "moved" from the current position in the profile (the experience entry with no end date):

- Current company differs from the last known company, after normalising case, suffixes (Inc, Ltd, GmbH) and known rebrands: `moved`.
- Same company, new title: `promoted` (worth a note, no email needed).
- Same company and title: `stayed`.
- Profile not found or private: `unknown`. Do not guess.

Then for each `moved` row run steps 2 to 4, keyed `jc-<list>-<row>-find` and `jc-<list>-<row>-verify`.

## Output format

```csv
name,linkedin_url,last_known_company,status,current_company,current_title,started,new_domain,new_email,email_status
Jane Doe,https://www.linkedin.com/in/janedoe,Acme,moved,Example Org,VP Sales,2026-08,example.org,jane@example.org,valid
```

Then a summary: rows checked, moved, promoted, stayed, unknown, emails found and verified, total `actualCost`. List the movers first, newest start date on top.

## Cost and stop rules

- Steps 2 to 4 run only for `moved` rows.
- Keep `catch_all` and `risky` emails flagged, never mark them valid.
- Two failures in a row on step 1 with different profiles: stop and report, the provider may be down.

## When not to use this skill

- Finding new contacts at an account: `gtmos-leads-buying-committee`.
- A single email lookup: `looot-find-professional-emails`.
