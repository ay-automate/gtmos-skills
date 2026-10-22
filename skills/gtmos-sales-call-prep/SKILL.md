---
name: gtmos-sales-call-prep
description: Prepare a one-page brief before a sales call -- who they are, where the deal stands, what was said last, open blockers, fresh company news, buying-committee gaps and three talking points with a next step. With GTM OS connected it reads the meeting, CRM record, relationship history, call transcripts, verified signals, score reasons and the research agent's brief, cites only approved proof, and saves the brief as a timeline note or delivers it to Slack for approval. Use for "prep me for my call", "call prep", "meeting prep", "brief me on [name]", "who am I meeting", "get me ready for the demo", "QBR prep", "what do I need to know before talking to [company]". For the follow-up after the call see gtmos-sales-follow-up.
license: Apache-2.0
metadata:
  version: "0.1.0"
  category: "crm"
  upstream: "https://github.com/HubSpot/hubspot-mcp-plugins/tree/032d294bc91577cb1b9c4a61372567266ca8524e/HubSpot-Sales/skills/call-prep"
  upstream_sha: "032d294bc91577cb1b9c4a61372567266ca8524e"
  upstream_license: "Apache-2.0; HubSpot, Inc."
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Call prep

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`call-prep`](https://github.com/HubSpot/hubspot-mcp-plugins/tree/032d294bc91577cb1b9c4a61372567266ca8524e/HubSpot-Sales/skills/call-prep) in HubSpot/hubspot-mcp-plugins (Apache-2.0, HubSpot, Inc.). Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

GTM OS already holds the meeting, the people on it, the deal, every synced email and call, and the research agent's brief. The job is to read it in the right order and write a brief a rep can scan in two minutes. Everything in this skill is a read, except saving or delivering the brief. Confirm each schema with `gtm_describe` before the first call.

**1. Find the call and the people.**

| Read | Why |
|---|---|
| `meeting.get {id}` or `{activityExternalId}` | Title, time, status, account and attendees, each with a `contactId` when matched. |
| `records.list {objectType: "gtm.contact", search}` | When the user gives only a name or email. Several matches: list them and wait. |
| `records.get` on the contact, the account and the open deal | Role, stage, value, expected close, owner. |
| `records.list {objectType: "gtm.deal", filter: {accountId, status: "open"}}` | Open deals on the account (confirm field names with `gtm_describe`). |

**2. Read the history.**

| Read | Why |
|---|---|
| `contact.relationship {contactId}`, `account.relationship {accountId}` | Email and meeting counts, last email, last reply, next meeting. |
| `activity.list {subject, view: "all", includeRelated: true, includeTasks: true}` | Recent notes, calls, emails and open tasks. |
| `transcripts.list {dealId}` or `{contactId}`, then `transcripts.get {id}` | What was said on earlier calls: summary, action items, objections. Quote, do not paraphrase into new claims. |
| `replies.list {contactId}` | Recent replies and their labels (objection, not now, referral). |

**3. Read why they matter now.**

| Read | Why |
|---|---|
| `score.explain_subject {subjectType, subjectId}` | The band and the verified reasons behind it. |
| `signals.list {subjectKind: "gtm.account", subjectId}` | Funding, hiring, job changes, page changes, each with its evidence. Default `view: "seller"` shows only verified signals. |
| `research.subject.get {subject}` | The research agent's brief and source URLs. If it is missing or stale, `research.request {subject, kinds: ["meeting_prep"]}` queues fresh research; it lands later, so say so. |
| `buying_roles.list` and `definition.committee_model` | Which committee roles the motion expects, so the brief can name who is missing from the call. |
| `proof.list` | The only source for a customer result or metric worth mentioning. Active proof only. |

**4. Write the brief** in the format under *Format the brief* below. Every fact carries where it came from (a transcript date, an email date, a signal's source). A section with no data is left out, never filled.

**5. Save or deliver it.** Saving the brief on the record is an internal write: `activity.log {subject: {objectType: "gtm.deal", id}, kind: "note", summary}` (or on the contact). Pushing it to the rep's Slack is `channel.deliver {channel: "slack", audience, item}`, a class E effect: it is proposed and a person approves it. In dry mode, or when the user only asked to see it, show the brief in chat and stop.

Nothing in this skill changes a deal stage, sends a message or writes to the CRM of record.

## Without GTM OS

Follow the method below. On HubSpot, the HubSpot MCP tool names in each phase work as written; on another CRM, use its equivalent search and record reads, plus the user's calendar and email connectors. With no CRM at all, ask who the call is with, what it is for and what a good outcome looks like, then research the company on the web. Mark anything you could not verify, and never write a deal value, a blocker or a customer result you did not read somewhere.

---

> **Tool names** in the phases below are the HubSpot MCP connector's (the upstream skill). With GTM OS connected, use the reads in *With GTM OS connected* instead: `records.list` / `records.get` for the contact and deal, `meeting.get` for the calendar, `activity.list`, `contact.relationship` and `transcripts.list` for the history, `research.subject.get` and `signals.list` for company context.

## Phase 0 — Check for a name

If the user gave no name or company at all, ask only:

> "Who's the call with?"

Do not ask for anything else yet. Once you have a name, proceed.

---

## Phase 1 — Find the contact

Run simultaneously:
- `get_organization_details` → store `portalId`, `uiDomain`
- `search_crm_objects`: objectType: contacts, query: name or email, properties: firstname, lastname, email, jobtitle, hs_lead_status, associatedcompanyid, notes_last_contacted, hs_email_last_send_date, createdate

Multiple matches → show disambiguation list, wait for confirmation. Store `contactId`, `companyId`. Then search deals filtered by associations.contact = contactId → store `dealId`.

**If not found in HubSpot**, search available connectors simultaneously:
- **Calendar**: search upcoming events for the name. Extract email, company from attendee/organiser fields.
- **Email**: search threads for the name. Extract email, company from domain or signature.

If found in a connector, store as `externalContact: true`. Proceed with available data — Phase 2A will be skipped.

If no connector finds the contact either, stop: "I couldn't find [name] in HubSpot or your connected apps. Double-check the name or add them to HubSpot first."

---

## Phase 2 — Parallel research

Run simultaneously:

### A. CRM history (skip if `externalContact: true`)
`get_crm_objects` contacts, objectId: contactId, associations: deals, notes, tasks. Retrieve:
- **Open deals**: stage, amount, close date, deal name
- **Recent notes**: last 5 by hs_timestamp descending
- **Open tasks**: hs_task_status = NOT_STARTED or IN_PROGRESS
- **Timeline signals**: notes_last_contacted, hs_email_last_send_date, createdate

### B. Email history (if email connector available)
Search threads for contact's email, last 3–5. Note: last reply direction, tone, unanswered questions, subject context.

### C. Calendar (if calendar connector available)
Find meeting in next 7 days with contact's email as attendee. Extract: time, attendees, agenda.

### D. Company research (web)
Using an available web search tool, search `"[company name] news [current year]"` and `"[company name]"`. Capture 3–4 concrete findings. Skip silently if no web search tool is available.

---

## Phase 3 — Fill context gaps (if needed)

After research, check what's missing from the user's original message:

| Missing | Ask |
|---|---|
| Call type | "What type of call is this — discovery, demo, follow-up, QBR?" |
| Purpose / what they want to cover | "What are you trying to cover on this call?" |
| Desired outcome | "What would a good outcome look like?" |

Ask only for what's genuinely missing and useful for the brief. If CRM context makes the call type obvious (e.g. deal is at Demo stage), infer it — don't ask. If research is rich enough to write a strong brief, skip this phase entirely and proceed.

If you do ask, do it in one message, conversationally — not as a form. Reference what you found:

> "Found [Name] — they're at [stage] with an open deal worth [amount], last contacted [X days ago]. Before I write up the brief:
> - What type of call is this?
> - What are you hoping to walk away with?"

Store responses as: `callType`, `purpose`, `desiredOutcome`.

---

## Phase 4 — Analyse

| Signal | Sentiment |
|---|---|
| Recent reply, deal advancing, active engagement | Positive |
| Some activity, no clear momentum | Neutral |
| No reply 3+ weeks, deal stuck 30+ days, disengaged tone | At-risk |

**Blockers** — concrete deal-stoppers from notes, tasks, email  
**Hurdles** — softer friction (evaluation pending, champion change, timing)  
**Deal context** — stage, value, close date, next committed action

---

## Phase 5 — Format the brief

Tailor talking points and next step to `callType` and `desiredOutcome` if provided.

```
## Call Prep: [First Last] @ [Company]
[Date] · [Call type] · Goal: [desiredOutcome]

### Quick snapshot
- Role: [Job title]
- Deal: [Deal name] · [Stage] · [Value] · closes [Close date]
- Sentiment: [Positive / Neutral / At-risk] — [one sentence reason]
- Last contact: [X days ago via email/call/meeting — topic]

### Open items
- [Blocker or outstanding question]
- [Any commitment not yet closed out]

### Company context
- [Specific news item — source and date]
- [Second relevant finding]

### Talking points
1. [Personal opener — reference a specific email, news item, or note]
2. [Address the main blocker or open item]
3. [Named next step with a timeframe]

### Suggested next step
[One specific actionable close — tied to desiredOutcome]
```

Omit sections cleanly if data is missing — no placeholders.

---

## Phase 6 — Save the brief

With GTM OS connected: `activity.log` with `kind: "note"` on the deal (or the contact), as in step 5 above. The rest of this phase is the HubSpot path.

Skip if `externalContact: true` — go to Phase 7.

`manage_crm_objects`: objectType: notes, createRequest:
- properties: hs_note_body: [full brief text], hs_timestamp: [current ISO timestamp]
- associations: contact → contactId, deal → dealId (if present)

Confirm: "Call prep saved. View contact: https://[uiDomain]/contacts/[portalId]/contact/[contactId]"

---

## Phase 7 — Add a missing contact (external contacts only)

With GTM OS connected, people arrive through the CRM sync and the email and calendar sync, so this skill does not create contacts. Tell the user the person is not in GTM OS yet, suggest adding them in the CRM of record or the console, and note that the next `crm.sync` brings them in. The HubSpot path:

If `externalContact: true`, after the brief:

> **[Name] isn't in HubSpot yet.** Want me to add them? I'll create a contact with their name, email, and company.
> `Yes, add to HubSpot` · `Not now`

On "Yes": `manage_crm_objects` createRequest, objectType: contacts, with fields from Phase 1. Confirm with a link to the new record.

---

## Error handling

- **No name given**: Phase 0 — ask only for who before doing anything.
- **Contact not found anywhere**: Stop with a clear message.
- **Found externally, connectors partial**: Build from available data, note skipped sources.
- **No deal**: Omit deal fields, note "No open deal on record".
- **No email history**: Base sentiment on CRM activity and notes only.
- **Note save fails**: Show the brief in chat and report the error.
