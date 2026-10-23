---
name: gtmos-leads-buying-committee
description: "Map the buying committee at a target account (economic buyer, champion, user, technical evaluator, or the org's own roles), see who is missing, and add verified contacts for the gaps. With GTM OS connected it reads score.committee_coverage and buying_roles.list, sources people with find.people through the governed broker (quoted first), creates and links the people to the open deal (canon.edit, approved by a person when an agent proposes it) and fills emails with enrichment.enrich_contacts (estimate first). Use for \"who should I contact at acme.com\", \"map the buying committee\", \"multi-thread this deal\", \"find the decision makers\", \"who signs off on this\", \"we are single-threaded\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-buying-committee-map"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (committee coverage and the org's buying roles, enrichment through the governed broker, cross-references)"
---

# Buying committee map

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-buying-committee-map`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-buying-committee-map) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (committee coverage, the org's buying roles, quoted enrichment), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. See what the account already covers.** `buying_roles.list` Q is the org's role vocabulary (the defaults plus its own roles from `definition.committee_model`) and the champion role. `score.committee_coverage {accountId}` Q reports, for the largest open deal: required roles identified, engaged and recently touched, coverage (capped at 50% without a champion), the gaps and the multithread risk. `computed: false` with a reason means no open deal or no committee contacts: say so, never a 0. Start from `gaps`, not from a blank map.

**2. Know who you already have.** `records.search` on `gtm.contact` at the account, `account.relationship {accountId}` Q for who has emailed or met, `signals.list` Q for recent changes. Never buy a person the account already holds.

**3. Source the missing roles.** Quote with `capability.quote {capability: "find.people", args: {domain, titles}}`, show the user the total, and on a yes acquire with `capability.acquire` (*spends inline*; pass an `idempotencyKey` per account and role, so a retry never pays twice). Over a per-unit ceiling or a budget the broker returns a proposal for a person instead: report the approval id and stop. Pick people with the method below and drop anyone whose current company is not the account.

**4. Create, then enrich.** Search before you create (`records.search` by name and domain), then create the people you picked with `canon.edit {objectType: "gtm.contact", values}` D and link each to the open deal with its role (`canon.edit {objectType: "gtm.deal_contact", values}`). Identity resolution matches a person who already exists instead of duplicating them; from an agent key each create is a proposal a person approves. `enrichment.enrich_contacts {ids, estimate: true}` previews email and phone fills; on a yes run it with the same ids (*spends inline*). It fills empty fields only; a miss is "not found", never a guessed address.

**5. Re-check coverage.** `score.committee_coverage` again; report the before and after from the two results. Outreach to the new people goes through `gtmos-outreach-cold-email` and is approved by a person. To change the org's roles, draft them for an owner or admin: `buying_roles.set` is human only.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-buying-committee-map` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

Deals with one contact stall. This skill finds the people behind each role in a purchase (economic buyer, champion, user, technical evaluator) at an account, and returns them with verified emails and a short note on why each one is on the map.


## Ask for these inputs

- Account domains (1 to 50).
- What the user sells, so the roles fit. Example for a sales tool: economic buyer = VP Sales or CRO, champion = Sales Ops or RevOps lead, user = SDR or AE manager, technical = Sales Systems or IT.
- How many people per role (default 1, max 3).

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 1 | `people.search` | `domain` plus a `query` per role (`"VP Sales"`) | $0 per call, from $0.00036 per result |
| 2 | `people.email.find` | `first_name`, `last_name`, `domain`, `linkedin_url` when known | from $0.0036 per call |
| 3 | `people.email.verify` | `email` | from $0.00145 per call |
| 4 (optional) | `linkedin.person.profile` | `linkedin_url`, to confirm the current title | from $0.0012 per call |

Expected total per account with 4 roles × 1 person: about $0.005 search + 4 × $0.005 emails ≈ $0.025; with profile checks ≈ $0.03.

## Quote before you run

1. Accounts × roles × people per role × (steps 2 + 3), plus the searches.
2. Tell the user the total and the `balance`; wait for a yes. More than 100 runs: an explicit yes.
3. Cap each run with `fallback.maxCostUsd` (0.03).

## Run it

```tool
run {"endpointId": "job:people.search", "input": {"domain": "acme.com", "query": "VP Sales"}, "idempotencyKey": "bcm-acme.com-economic", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.03}}
```

Pick per role: current title matches the role words, most senior first for the economic buyer, most specific title first for the champion. Drop people whose current company is not the account. Then find and verify emails only for the people you picked:

```tool
run {"endpointId": "job:people.email.find", "input": {"first_name": "Jane", "last_name": "Doe", "domain": "acme.com"}, "idempotencyKey": "bcm-acme.com-jane-doe-find", "fallback": {"maxAttempts": 3, "maxCostUsd": 0.03}}
```

## Output format

```markdown
## Example Inc (example.com), cost $0.027
| Role | Name | Title | LinkedIn | Email | Status | Why |
|---|---|---|---|---|---|---|
| Economic buyer | Jane Doe | VP Sales | https://... | jane@example.com | valid | owns the sales budget |
| Champion | Sam Lee | RevOps Manager | https://... | sam@example.com | catch_all | runs the tools the product replaces |
| User | | | | | | not found |
```

Plus one CSV with all rows for import. Empty roles stay in the table as "not found".

## Cost and stop rules

- Never find emails for people you did not pick.
- A role with no match: do not widen to unrelated titles without asking.
- Two failures in a row on step 1: stop and report.

## When not to use this skill

- One person's email: `looot-find-professional-emails`. Everyone at a domain: `looot-enrich-a-company` or `people.domain.search`.
