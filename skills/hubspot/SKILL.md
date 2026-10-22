---
name: hubspot
description: Use when reading or syncing HubSpot CRM accounts through the GTM OS HubSpot connector; inspect the connector skill before changing CRM data.
---

# hubspot with GTM OS

## When to use this skill

Use when reading or syncing HubSpot CRM accounts through the GTM OS HubSpot connector; inspect the connector skill before changing CRM data.

## What GTM OS uses it for

Native CRM sync/read primitive, with a typed HubSpot adapter and writeback implementation.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `crm.read_accounts` reads account/company data.
- The package declares the `gtm.account` mapping; writeback is part of the connector (a governed, approval-gated write).
- It is a capability connector, not a promise that arbitrary HubSpot objects are mapped.

## Connect it

Create an org-scoped HubSpot connection in the console Connections settings (or the provider-specific `gtm connect` flow). The connector uses the HubSpot API host `api.hubapi.com`. The required credential is the sealed HubSpot connection; no platform HubSpot secret is listed in `.env.example`.

Use the exact scopes surfaced by the HubSpot OAuth/connection flow and connector configuration. The connector package does not declare a scope list in its manifest; do not copy scopes from another app or broaden grants speculatively.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads HubSpot companies/accounts through `crm.read_accounts`.
- Maps canonical output to `gtm.account`.
- Writeback is connector-specific; verify its current source and live operation schema before proposing a change.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Treat account writeback as a governed GTM OS write. Use registered operations so the approval gate, authorization, audit, and provenance remain in force. Respect opt-outs for contacts even when the immediate record is an account.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Authentication/401: refresh or reconnect the org's HubSpot connection.
- 403: check the installed grant scopes and HubSpot user permissions.
- Missing company fields: inspect adapter mapping and source payload; do not fabricate values.
- Rate limit: back off according to the provider response.

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

https://developers.hubspot.com/docs/api/overview

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
