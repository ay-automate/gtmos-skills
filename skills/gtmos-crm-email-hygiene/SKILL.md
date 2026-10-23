---
name: gtmos-crm-email-hygiene
description: "Clean an email list before it is sent to: remove duplicates and bad syntax for free, verify the rest, and split it into send, review and drop. With GTM OS connected it runs the free checks in the Identity and data quality engine (identity_dq.validate_records, scan_duplicates), re-checks stale verified emails with enrichment.refresh_stale (estimate first), respects suppression and consent, and reports from enrichment.freshness. Use for \"clean this list\", \"verify these emails\", \"reduce bounces\", \"list hygiene before a campaign\", \"which emails are stale\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "crm"
  upstream: "https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-email-list-hygiene"
  upstream_sha: "1cb22eede6829b8f9fa87a78e6957a97e4032bd5"
  upstream_license: "MIT; Copyright (c) 2026 looot"
  modified: "2026-10-23: rebranded and adapted for GTM OS (validation and duplicates in the Identity and data quality engine, verification through the enrichment waterfall, freshness and refresh_stale, suppression, cross-references)"
---

# Email list hygiene

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`gtm-email-list-hygiene`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5/skills/gtm-email-list-hygiene) in loootai/gtm-skills (MIT, Copyright (c) 2026 looot). Changed for GTM OS: the operating section below (free checks in the Identity and data quality engine, verification through the enrichment waterfall with an estimate first, freshness, suppression), rewritten cross-references. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

> **Spend.** Quote first (`capability.quote`, or `estimate: true`), show the user the total, and run only after a yes that covers exactly that run; pass the quoted amount as the run's cap. The operations marked *spends inline* below are never granted to GTM OS pack agents: a person runs them, or you quote and hand the run over.

**1. Free checks first.** `identity_dq.validate_records {objectType: "gtm.contact"}` Q finds invalid emails and domains; `identity_dq.scan_duplicates {objectType: "gtm.contact"}` Q finds duplicates (merging is a separate, approved step: `gtmos-crm-data-quality`). `consent.get` Q and `definition.suppression_rule` decide who must never be emailed: they go straight to drop, whatever the verifier says.

**2. How fresh is what we have.** `enrichment.freshness` Q reports, per field, the share of enriched values within their TTL (email status defaults to 90 days), the stale count and the average confidence. `enrichment.record_freshness {objectType: "gtm.contact", id}` Q shows one contact's email: who set it, when it was verified, its confidence. A value a person typed is never re-checked by enrichment.

**3. Verify, quoted.** Missing emails and verification: `enrichment.enrich_contacts {ids, estimate: true}`. Stale ones: `enrichment.refresh_stale {objectType: "gtm.contact", fields: ["email", "emailStatus"], ids, estimate: true}` returns the stale count, the expected cost and what needs an approval. Show the total, and on a yes run it with `maxUsd` set to the preview's `maxUsd` (*spends inline*). In dry mode the run returns the estimate only.

**4. Split and report.** Map each result to send, review or drop with the method below and report the counts from the operation results. Bounce and complaint thresholds on a sending lane (`definition.lane`) pause it automatically; a clean list keeps it running.

## Without GTM OS

Run the workflow below on looot directly: connect the looot MCP server (`https://api.looot.ai/mcp`) or use the `looot` skill in this repository. Searching and inspecting are free; runs are paid from the prepaid looot balance. Show the user the endpoint and its price, and run only after a yes.

---

The method below is looot's `gtm-email-list-hygiene` workflow. Job ids are looot's; prices are the cheapest live provider in the public looot catalog on 2026-10-08 and the live price wins. With GTM OS connected, run the same steps through the operations above.

A bounce rate above 2 to 3 percent hurts a sending domain. This skill takes a list, removes what can be removed for free (duplicates, bad syntax, role and disposable addresses if the user wants), verifies the rest, and returns the list split into send, review and drop.


## Ask for these inputs

- The list: a CSV with an email column (keep every other column as is).
- Whether to drop role addresses (`info@`, `sales@`, `support@`), default: keep but flag.
- What to do with catch-all domains, default: put them in review.

## Steps and prices

Prices are the cheapest live provider in the public looot catalog on 2026-10-08. `inspect` shows the live price.

| # | Job id | Input | Price on 2026-10-08 |
|---|---|---|---|
| 0 | none, local | lowercase, trim, dedupe, syntax check (one `@`, a dot in the domain, no spaces) | free |
| 1 | `people.email.disposable-check` | `email` (one per domain is enough) | $0 per call |
| 2 | `people.email.verify` | `email` | from $0.00145 per call |
| 2 (bulk) | `people.email.verify.batch` | a list of emails | from $0.004 per result; use for 1,000+ rows only after comparing prices |

Expected total: 1,000 unique valid-syntax addresses × $0.00145 ≈ $1.45.

## Quote before you run

1. Do step 0 first and report what it removed. Count what is left: that is the number of paid verifications.
2. Remaining × $0.00145 (or `costPerSuccessUsd` from `search_catalog`). Tell the user the total and the `balance`; wait for a yes. This skill almost always crosses 100 runs, so the yes must be explicit.
3. Cap each run with `fallback.maxCostUsd` (0.01).

## Run it

```tool
run {"endpointId": "job:people.email.verify", "input": {"email": "jane@example.com"}, "idempotencyKey": "hyg-<list>-jane@example.com", "fallback": {"maxAttempts": 2, "maxCostUsd": 0.01}}
```

Run 5 to 10 at a time. Read `normalized` when present (`status`, `deliverable`), else the provider's `result`. Map every answer to one of: `valid`, `catch_all`, `risky`, `invalid`, `unknown`.

## Output format

Three CSVs with the user's original columns plus `email_status` and `reason`:

- `send.csv`: `valid`
- `review.csv`: `catch_all`, `risky`, `unknown`, role addresses
- `drop.csv`: `invalid`, bad syntax, duplicates, disposable

Summary table:

```markdown
| Step | Rows | Note |
|---|---|---|
| Input | 2,140 | |
| Duplicates removed | 96 | free |
| Bad syntax | 12 | free |
| Disposable | 18 | free |
| Verified | 2,014 | $2.92 |
| Send | 1,702 | 84.5% |
| Review | 241 | catch-all 198, risky 31, unknown 12 |
| Drop | 71 | invalid |
```

## Cost and stop rules

- Never verify the same address twice in a session.
- An `unknown` answer is not a reason to retry on another provider more than once.
- Two failures in a row with different addresses: pause and report.

## When not to use this skill

- One address: `looot-email-verification`.
