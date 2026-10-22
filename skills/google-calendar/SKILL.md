---
name: google-calendar
description: Use when reading supported Google Calendar events or auto-logging meetings with known GTM OS contacts.
---

# google-calendar with GTM OS

## When to use this skill

Use when reading supported Google Calendar events or auto-logging meetings with known GTM OS contacts.

## What GTM OS uses it for

Calendar event read and CRM meeting auto-logging for started meetings with known contacts.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `crm.read_calendar_events` and `crm.autolog_calendar`.
- Auto-logged meetings become `gtm.activity` with kind `meeting` and are associated only when a known contact matches.

## Connect it

Connect Google Calendar in console Connections; connector can fall back to the Gmail Google grant. `.env.example` Google client ID/secret configure the OAuth application. Google or Microsoft sign-in to GTM OS authenticates a GTM OS user and is separate from the calendar data grant. A missing live grant can leave the adapter on fixtures.

Use the calendar read scopes presented by GTM OS's Google OAuth flow. Calendar auto-logging should use the least-privilege event access supported by the connector; inspect the installed scope declaration and consent screen rather than inventing a scope.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads calendar events.
- Writes only the declared CRM timeline projection, `gtm.activity` (meeting).
- Matching is to known contacts; do not create a new contact solely from an attendee string unless another approved ingest operation handles it.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Meeting logging is not permission to email invitees. Honor contact privacy and opt-outs. Any follow-up message is a distinct E-class operation requiring approval; do not auto-send based on an event.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Permission denied: reconnect and confirm event-read scope.
- Event absent: check calendar selection, date window, and whether the meeting has started.
- Unknown attendee: leave unmatched; do not guess which person record is intended.
- Duplicate event: use stable event identity and connector deduplication.

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

https://developers.google.com/calendar/api

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
