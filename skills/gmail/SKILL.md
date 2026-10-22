---
name: gmail
description: Use when ingesting Gmail replies, reading supported email replies, or recording Gmail email activity through GTM OS.
---

# gmail with GTM OS

## When to use this skill

Use when ingesting Gmail replies, reading supported email replies, or recording Gmail email activity through GTM OS.

## What GTM OS uses it for

Native Gmail inbound/reply ingestion, send backend, and CRM email auto-logging.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `outreach.read_email_replies` and `outreach.ingest_gmail_replies` cover reply retrieval/ingest.
- Adapter mappings include `gtm.message`, `gtm.contact`, `gtm.account`, `gtm.campaign_member`, `gtm.activity`, and `gtm.signal`.
- Outbound email uses the registered `outreach.send_email` backend where configured.

## Connect it

Connect Google/Gmail for the organization via console Connections; auth may use a Google OAuth grant. `.env.example` names `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth application configuration, not a user's mailbox token. Google or Microsoft sign-in to GTM OS authenticates a GTM OS user and does not itself grant mailbox access. Gmail with no live connection may use fixtures.

Request only the Gmail scopes declared by the installed Google auth/connector flow for reply read/ingest and any explicitly enabled send feature. Check the displayed OAuth consent scopes; do not reuse calendar scopes or request full mailbox access by assumption.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Inbound messages and matched people/company data map to the declared `gtm.*` types above.
- CRM autologging stores email as `gtm.activity`; reply ingest can update `gtm.campaign_member` / emit `gtm.signal`.
- Match by verified sender identity; never merge on a guessed email.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Sending is an external effect and follows the approval gate. Check unsubscribe, suppression, bounce, and consent state before outreach. Inbound messages do not override opt-outs. Never treat a reply as permission to add unrelated recipients.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- OAuth denied/expired: reconnect Gmail and inspect consent scopes.
- No matching contact: keep the message and surface an unmatched result instead of guessing.
- Duplicate delivery: use provider message/thread IDs and connector idempotency.
- Send rejected: inspect approval and suppression state before retrying.

- Check the connection state and provider health before retrying; use the connector's fixture mode only for development.
- Read the operation error and lineage/receipt before changing inputs or repeating a write.
- If the provider is not registered, stop and report that limitation; do not call the vendor directly as a workaround.

## Do

- Read the connector entry in `docs/gtmos/reference/connections.md` and the current `gtm describe` schema before a new integration action.
- Start with a read or one narrowly scoped test, confirm provenance, then scale within the approved budget.
- Ask a human to resolve missing consent, expired credentials, or approval-required actions.

## Don't

- Don't invent endpoints, scopes, operation names, or object fields.
- Don't bypass GTM OS governance with direct vendor writes or direct database edits.
- Don't send messages, change campaigns, or publish content without the operation's approval path.

## Official vendor documentation

https://developers.google.com/gmail/api

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
