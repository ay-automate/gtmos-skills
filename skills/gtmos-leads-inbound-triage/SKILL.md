---
name: gtmos-leads-inbound-triage
description: Triage new inbound leads (demo requests, form fills, signups, referrals) by ICP fit and intent, give each a priority (P0, P1, P2 or DQ), route it to an owner and set the first touch and response SLA. With GTM OS connected it scores through the Score engine (score.score_contact, score.explain_subject), reads the lead's signals, customer type and existing relationship, previews and makes the assignment with territory.match and routing.assign, and opens a follow-up task; it never sends anything itself. Use for "triage these leads", "new inbound leads", "who should take this lead", "is this lead any good", "prioritize the lead queue", "speed to lead", "route inbound", "MQL review". For the ownership audit across the whole book see gtmos-routing-lead-ownership.
license: Apache-2.0
metadata:
  version: "0.1.0"
  category: "outbound"
  upstream: "https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/lead-triage"
  upstream_sha: "6b989d6490589647c4c164f7f55c2797cf322f04"
  upstream_license: "Apache-2.0; Copyright (c) 2026 Salesforce, Inc."
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Inbound lead triage

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`lead-triage`](https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/lead-triage) in salesforce/salesforce-skills (Apache-2.0, Copyright (c) 2026 Salesforce, Inc.). Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md).

## With GTM OS connected

Inbound triage in GTM OS is three engines working one record: **Score** decides fit and intent, **Routing** gives it an owner, **Outreach** drafts the first touch for a person to approve. You read, decide and write internal records; nothing customer-facing leaves without approval. Confirm each schema with `gtm_describe` before the first call.

**1. Find the lead and what GTM OS already knows.**

| Read | Why |
|---|---|
| `records.search` (email, name, domain), `records.get` | The contact and its current company. A lead from a form or signup is already a `gtm.contact`. |
| `customer_type.classify {subjectType, subjectId}` | Which kind of customer this is, in the org's words, and the journeys it follows. |
| `account.relationship {accountId}`, `contact.relationship` | "We know them": email and meeting history, next meeting. An existing relationship changes the routing. |
| `signals.list {subjectKind, subjectId}` | The form submission, visits and outside triggers, each with its evidence. |
| `journey.position` | Where the record already sits (new lead, open deal, customer). |
| Owner on the account | If the company already has an owner, the lead goes to them (coordinate, do not reassign). |

**2. Score it with the engine, not by hand.** `score.score_contact {contactId}` scores the lead against the org's signed model (fit inherited from its account, intent from its own signals). `score.explain_subject {subjectType: "gtm.contact", subjectId}` returns the band, the points per factor, the top signals and the greyed signals (sources not wired, never imputed). Use the band and reasons as the fit and intent tables below; a greyed signal is "no data", not "no intent". If the account is not scored yet, run `score.score_account` first.

**3. Set the priority.** Map the engine's band and the intent signals onto P0, P1, P2 or DQ with the rules below. A hard disqualifier from `definition.scoring_model` or a match on `definition.suppression_rule` is DQ, whatever the score.

**4. Route it.** Preview with `territory.match {subjectType: "gtm.contact", subjectId}`: the winning territory, its owner or rotation, and why. Then `routing.assign {subjectType, subjectId, ownerId | strategy: "territory" | "round_robin", rule, reason}` writes the owner and an auditable decision record. It is an internal write; say who got the lead and why. If the account is already owned, assign the lead to that owner and note "existing relationship".

**5. Set the first touch.** `task.create {title, subject, dueAt, assigneePrincipalId}` with the SLA as the due date (P0 same day, P1 within 48 hours, P2 this week). For the first message, hand off to `gtmos-outreach-cold-email`: it drafts through the Outreach engine and proposes the send for a person to approve. In dry mode (`policy.get_dry_mode`) the draft is where it stops.

**6. CRM of record.** Lead status or owner changes in HubSpot or Salesforce go through `crm.update_record` (E): it proposes, a different person approves. Never claim the CRM was updated before the approval executes.

Report numbers only from these results. If `score.kpis` shows too few scored leads to compare against, say so instead of quoting a calibration.

## Without GTM OS

Run the method below by hand. Ask for the lead (name, email, company, source, message) and the ICP once. Look the company up on its website and public sources, keep a source for every fit claim, and mark unknown dimensions as unknown. On Salesforce, read the Lead and the matching Account (by name or website) with the tools you have; on HubSpot, the contact and its company. Recommend the owner and the CRM field changes; let the user apply them.

---

## The triage method

Read the lead and its account, add what is public, score fit and intent, assign a priority, route, set the first touch. Work from the data you read; do not invent a size, a budget or an intent.

## 1. Read the lead and its account

- The lead: name, company, title, email, source, status, created date, the message or form answers, current owner.
- The matching account (by company name or domain): type, owner, segment, size, industry.
- If the account exists and has an owner, this is an existing relationship: routing is "coordinate with [owner]".
- Public context when tools allow it: company size, industry, funding, recent news. Prior email threads from the same domain when an inbox is connected.

## 2. Score ICP fit

Against the ICP (ask once if it is not in the org's definitions or context):

| Dimension | Fit | Evidence |
|---|---|---|
| Industry | ✅ / ⚠️ / ❌ | [from the account or a public source] |
| Size | ✅ / ⚠️ / ❌ | [from the account or a public source] |
| Persona (title) | ✅ / ⚠️ / ❌ | [from the lead's title] |
| Disqualifiers | ✅ none / ❌ [which] | [checked against the ICP] |

## 3. Score intent

| Signal | Strength |
|---|---|
| Source quality | High (demo request, referral) / Med (content, event) / Low (list, cold) |
| Message specificity | Specific use case / Generic interest / None |
| Prior engagement | Email thread / CRM history / None |
| Timing trigger | Recent funding, hiring, exec change / None |

## 4. Assign priority

Calibration: P0 about the top 20%, P1 the next 25%, P2 the rest.

- **P0:** strong ICP fit and high intent (specific ask, demo request, or a hot trigger)
- **P1:** strong fit with medium intent, or moderate fit with high intent
- **P2:** moderate fit with low intent, or fit unclear
- **DQ:** a hard disqualifier hit

Override: if the account exists with an owner, routing is "coordinate with [owner]".

## 5. Queue view (several leads)

When triaging a batch, add a short summary before the per-lead cards: leads by tier (hot, warm, nurture) with counts and shares, leads by source, and a table of the hot leads (lead, company, fit score, source, next step). One sentence on the single most important read of the queue. Quote blank fields as blank, and drop leads you have no data for.

## 6. Output (per lead)

```
# Lead triage: [Name] @ [Company]

**Priority: P[0/1/2/DQ]**
[One-sentence rationale]

## CRM status
[Net new | Account exists, owned by [Name]: coordinate first]

## ICP fit: [Strong / Moderate / Poor]
[fit table]

## Intent: [High / Medium / Low]
[intent table]

## Recommended action
- **Route to:** [self / named owner / DQ queue]
- **Response SLA:** [P0: same day / P1: 48h / P2: this week]
- **First touch:** [e.g. a drafted email with [hook], qualification questions, or a polite no]

## Suggested CRM updates
- Lead status -> [value]
- Lead owner -> [name]
- [Notes field] -> "[triage summary]"
```

If the lead goes to a teammate, offer to draft a handoff note for the team's lead channel (ask for the channel if it is not known).

## Upstream note

This method comes from Salesforce's `lead-triage` skill, which runs the same steps against Salesforce through the Headless 360 MCP server (GraphQL reads of Lead and Account) and renders a widget. On Salesforce without GTM OS, use that skill's documented queries for the reads; the scoring, priority and output above are unchanged.
