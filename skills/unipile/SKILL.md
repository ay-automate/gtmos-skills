---
name: unipile
description: Use when a GTM workflow needs LinkedIn profile, inbox, connection, or outreach capabilities through the GTM OS Unipile connector.
---

# unipile with GTM OS

## When to use this skill

Use when a GTM workflow needs LinkedIn profile, inbox, connection, or outreach capabilities through the GTM OS Unipile connector.

## What GTM OS uses it for

LinkedIn channel adapter for profile/inbox/first-degree reads, connection requests, messages, and weekly connection refresh.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `outreach.linkedin_read_profile`, `outreach.linkedin_read_inbox`, `outreach.linkedin_read_connections`.
- `outreach.linkedin_send_connection_request` and `outreach.linkedin_send_message`.
- `outreach.refresh_first_degree_connections` maintains `unipile_first_degree_connection` for suppression.

## Connect it

Configure the per-org Unipile connection with API key, DSN/base host, and connected LinkedIn account ID. `.env.example` names `UNIPILE_API_KEY` and `UNIPILE_DSN` for platform configuration; both unset means fixtures. Use the console Connections flow to bind a customer account.

Unipile connection authorization is account-based; use the exact permissions shown by the Unipile account connection flow. The GTM OS connector declares the required API host and account binding, not an OAuth scope string. Do not request unrelated account access.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads LinkedIn profiles, inbox, connections.
- Refreshes org-scoped `unipile_first_degree_connection`, used as a suppression source.
- Connector declarations include outreach capabilities; do not claim arbitrary LinkedIn profile data is stored in another `gtm.*` object without checking the operation output.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

LinkedIn sends are high-risk, OFF by default, and human-send only per the coverage map. Never bulk send, evade platform limits, or target a suppressed/opted-out person. The first-degree snapshot exists specifically to prevent connection requests to existing connections.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Fixture response: credentials or connected account are absent; don't mistake it for live data.
- 401: verify API key and DSN host.
- Account not found: reconnect the LinkedIn account and verify its account ID.
- Send disabled/rejected: keep the safety default; do not enable or retry without explicit human authorization.

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

https://docs.unipile.com/

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
