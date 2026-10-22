---
name: resend
description: Use when GTM OS sends a transactional or outreach email through the registered Resend email capability.
---

# resend with GTM OS

## When to use this skill

Use when GTM OS sends a transactional or outreach email through the registered Resend email capability.

## What GTM OS uses it for

Core transactional email sender and email-send backend for the outreach capability.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- Serves `outreach.send_email`.
- Uses Resend's email API; without credentials GTM OS uses a fixture send adapter and does not send real email.

## Connect it

Set `RESEND_API_KEY` and `RESEND_FROM_ADDRESS` in the server environment as documented in `.env.example`, or configure the org connection if enabled. Verify the sending domain and from-address before live use.

Resend API keys are permissioned credentials rather than OAuth scopes in this adapter. Create the least-privilege key supported by the Resend account and keep it server-side; do not place it in a generated harness folder.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- This connector sends email; it is not itself a CRM sync.
- Activity/message logging is handled by the registered operation and CRM logging path where configured; inspect the live schema before assuming a `gtm.activity` write.
- Preserve provider message IDs for delivery evidence.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Every customer-facing send is an E-class proposal and requires a different human approver. Check suppression, consent, unsubscribe, bounce, and recipient identity before proposing. Respect sending budgets/rate limits; do not send batches to unverified recipients.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Fixture success: no API key is present and no email was sent.
- 401: check API key and server environment.
- Sender/domain rejected: verify `RESEND_FROM_ADDRESS` and domain status.
- Suppressed/bounced recipient: do not retry or switch provider to evade suppression.

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

https://resend.com/docs

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
