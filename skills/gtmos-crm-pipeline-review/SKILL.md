---
name: gtmos-crm-pipeline-review
description: "Review the pipeline deal by deal -- stuck stages, no next step, slipped close dates, single-threaded deals, missing amounts -- and turn findings into tasks and proposed updates. With GTM OS connected it reads crm.dashboard, open deals with records.list (closing overdue or this month, activity windows), relationship history and the committee, and proposes stage moves and CRM write-backs for approval. Use for \"pipeline review\", \"pipeline pulse\", \"deal review\", \"which deals are stuck\", \"deal risks\", \"weekly pipeline meeting\", \"clean up my pipeline\"."
license: Apache-2.0
metadata:
  version: "0.2.0"
  category: "crm"
  upstream: "https://github.com/HubSpot/hubspot-mcp-plugins/tree/032d294bc91577cb1b9c4a61372567266ca8524e/HubSpot-Sales/skills/pipeline-pulse"
  upstream_sha: "032d294bc91577cb1b9c4a61372567266ca8524e"
  upstream_license: "Apache-2.0; HubSpot, Inc."
  merged_from: "https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/pipeline-review"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers); 2026-10-23: committee coverage, the pipeline review agent"
---

# Pipeline review

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`pipeline-pulse`](https://github.com/HubSpot/hubspot-mcp-plugins/tree/032d294bc91577cb1b9c4a61372567266ca8524e/HubSpot-Sales/skills/pipeline-pulse) in HubSpot/hubspot-mcp-plugins (Apache-2.0, HubSpot, Inc.). Merged with [`pipeline-review`](https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/pipeline-review) from salesforce/salesforce-skills (Apache-2.0), kept in `references/salesforce-pipeline-review.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

**1. The picture.** `crm.dashboard {scope}` Q: open pipeline, win rate, pipeline by stage, largest open deals, overdue tasks. Quote its numbers as "from crm.dashboard".

**2. The deals.** `records.list {objectType: "gtm.deal", closing: "overdue" | "this_month", activityWithinDays, sort}` Q for the review set; `records.aggregate` Q for exact totals by stage. Per deal: `account.relationship` Q (last email, reply, meeting), `task.list` Q (next step), `score.committee_coverage {accountId}` Q (required roles identified, engaged and recently touched on the largest open deal, champion gate, multithread risk; `computed: false` with a reason when there is no open deal or no committee contact), `transcripts.list` Q (recent calls). Role names come from `buying_roles.list` Q.

**3. Flag with evidence.** Apply the checks below. Each flag cites the field or record behind it (for example "no activity since 2026-09-30, from account.relationship").

**4. Act through approvals.** `task.create` D for each next step. Stage changes: `deal.move_stage` D or `deal.advance_stage` T (guarded by the stage machine). Write-back to the CRM of record: `crm.update_record` E, approved by a different person. Never edit a forecast category or amount on your own.

**5. The weekly agent.** The `pipeline-review-agent` (pack `stdlib/pack.crm-agents`, every Monday at 07:00) runs this review and suggests one task per deal that needs attention. `packages.agents` Q shows whether the pack is installed and the agent registered; `agent.kpis` Q shows its runs and approval rate.

## Without GTM OS

Pull an open-deals report from the CRM with stage, amount, close date, last activity and next step, and run the checks below. The upstream HubSpot and Salesforce tool calls are the path on those CRMs; keep them read-only and ask the rep before changing a deal.

---

> The method below is the upstream HubSpot skill. Its HubSpot CLI and MCP calls are the path for a HubSpot portal without GTM OS; with GTM OS connected, run each data step through the operations in the section above instead.

> **Tool names** below are expected names for the HubSpot MCP connector. If a named tool isn't available, check for updates to the skill and/or alternates in the HubSpot toolset as available tools may change

## Phase 1 — Fetch data (parallel)

**A. Deals** — `search_crm_objects`:
- objectType: deals
- filter: dealstage not in [closedwon, closedlost]
- properties: dealname, dealstage, amount, closedate, pipeline, hs_lastmodifieddate, hs_next_step, hubspot_owner_id
- limit: 50

**B. Portal context** — `get_organization_details` → store portalId, uiDomain

**C. Tasks** — `search_crm_objects`:
- objectType: tasks
- filter: hs_task_status = NOT_STARTED, associations.deal IN [dealIds from A]
- properties: hs_task_subject, hs_task_status, hs_timestamp, associations
- Identifies which deals already have an open task

---

## Phase 2 — Enrich with contacts and connector signals

**A.** Batch-call `get_crm_objects` contacts for each deal's associated contactId → firstname, lastname, email. Store `contact` (display name) and `contactEmail` per deal.

**B.** For deals where `hs_lastmodifieddate` is 21+ days ago or `hs_next_step` is empty, silently check available connectors:
- **Calendar**: upcoming meetings with associated contact email
- **Email**: recent unread threads from associated contact email

Store per deal: `upcomingMeeting` (date string), `unrepliedEmail` (subject). Skip if connectors unavailable.

---

## Phase 3 — Classify each deal

For each deal compute:
- `lastModified`: `hs_lastmodifieddate`
- `daysAgo`: today − lastModified
- `daysToClose`: closeDate − today (negative = overdue)
- `stalled`: daysAgo ≥ 21
- `overdue`: closeDate has passed
- `closingSoon`: closes within 14 days
- `hasNextStep`: hs_next_step is non-empty
- `hasOpenTask`: deal appears in Phase 1C results
- `needsAttention`: stalled OR overdue OR no next step

---

## Phase 4 — Generate suggested tasks

For deals where `hasOpenTask` is false, generate a suggested follow-up task. Do not ask — surface them proactively in the output.

**Task generation rules:**

| Deal state | Suggested task subject | Due |
|---|---|---|
| Stalled + upcoming meeting | "Prep call with [Contact] — [Deal Name]" | Day of meeting |
| Stalled + unreplied email | "Reply to [Contact] re: [Deal Name]" | Today |
| Stalled, no signals | "Re-engage [Contact] on [Deal Name]" | Today |
| No next step, closing ≤ 14d | "Set next step — [Deal Name] closing [date]" | Today |
| No next step, any stage | "Follow up with [Contact] — [Deal Name]" | Today |

Each suggested task object: `{ id, subject, context, due, dealId, contactId, dealName, contactName }`

---

## Phase 5 — Format the pulse

Output as plain text in this structure. Group deals by attention status: needs-attention deals first, then healthy. Omit sections with no items.

```
PIPELINE PULSE — [Day, Month D]
[N] open deals · [total value] · [N] need attention

━━ NEEDS ATTENTION
• [Deal name] with [Contact] — [stage] · [amount] · closes [date]
  [stalled X days / overdue / no next step] · [upcoming meeting or unreplied email if any]
  Next step: [hs_next_step or "—"]

━━ ON TRACK
• [Deal name] with [Contact] — [stage] · [amount] · closes [date]
  Next step: [hs_next_step]

━━ SUGGESTED TASKS
• [Task subject] — [signal context]
• [Task subject] — [signal context]

Reply "add all" to create all suggested tasks in HubSpot, or name specific ones.
Say "call prep for [name]" or "follow up with [name]" to act on a deal.
```

Link each deal and contact name to their HubSpot record using `portalId` and `uiDomain`.

---

## Phase 6 — Add suggested tasks to HubSpot

When the user replies "add all" or names specific tasks, for each selected task call `manage_crm_objects` createRequest, objectType: tasks:
- `hs_task_subject`: task subject
- `hs_task_type`: CALL or EMAIL (infer — "Reply" → EMAIL, others → CALL)
- `hs_task_status`: NOT_STARTED
- `hs_task_priority`: HIGH if deal closing ≤ 14d, else MEDIUM
- `hs_timestamp`: task due date ISO
- `hs_task_body`: signal context
- associations: deal → dealId, contact → contactId

Run creates in parallel. Confirm: "Created [N] tasks in HubSpot."

**Add next step**: when the user says "add next step to [Deal Name]", update via `manage_crm_objects` deals, updateRequest: `hs_next_step`.

---

## Error handling

- **No open deals**: "No open deals right now. Want me to add one?"
- **Deal fetch fails**: Report the error and suggest checking the HubSpot connection.
- **Connectors unavailable**: Run with HubSpot data only — omit connector-based signals silently.
