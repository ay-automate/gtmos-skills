---
name: salesforce
description: Use when reading or syncing Salesforce CRM accounts through the GTM OS Salesforce adapter; read this before querying or writing Salesforce data.
---

# salesforce with GTM OS

## When to use this skill

Use when reading or syncing Salesforce CRM accounts through the GTM OS Salesforce adapter; read this before querying or writing Salesforce data.

## What GTM OS uses it for

Native CRM integration with a contract-verified SOQL REST read adapter and writeback package.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- Declares `crm.read_accounts` and canonical `gtm.account` mapping.
- Reads use the SOQL REST API; writeback is part of the connector (a governed, approval-gated write).
- The coverage map calls live certification dependent on a Salesforce sandbox.

## Connect it

Connect an org-scoped Salesforce credential and instance URL through console Connections or the CLI's documented connect flow. The adapter targets `*.salesforce.com`. No Salesforce platform key is defined in `.env.example`; keep the bearer credential sealed.

Use the OAuth scopes required by the configured Salesforce connected app and shown in its connection flow. The connector manifest does not publish an exact scope list; do not assume a broad `full` grant is required.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads Salesforce account data with the `crm.read_accounts` capability.
- Maps supported results to `gtm.account`.
- Other Salesforce objects are outside the declared mapping unless the live operation registry says otherwise.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Run reads and writeback through GTM OS capabilities/operations. A CRM write is subject to the operation's effect class and approval gate; do not use raw REST to skip policy. Preserve Salesforce IDs and provenance as the adapter specifies.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- 401/invalid session: reconnect and verify the token audience/instance URL.
- 403: check connected-app scopes and Salesforce object permissions.
- SOQL/query errors: inspect the adapter's supported query shape rather than improvising fields.
- Live behavior requires a sandbox; fixture tests are not live certification.

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

https://developer.salesforce.com/docs/

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
