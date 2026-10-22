---
name: webform
description: Use when receiving and verifying GTM OS website form submissions or Horizon-Scan webhook events.
---

# webform with GTM OS

## When to use this skill

Use when receiving and verifying GTM OS website form submissions or Horizon-Scan webhook events.

## What GTM OS uses it for

Inbound webform webhook verification and lead ingest; not a general website builder or form sender.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `webform.ingest_form_webhook` verifies and ingests supported form events.
- Maps supported fields to `gtm.contact`, `gtm.account`, and `gtm.signal`.

## Connect it

Create an org-scoped `webform` connection with an inbound webhook signing secret. Configure the website to post to the deployment's documented webhook URL and store the same secret in the server connection. The webhook is HMAC-verified.

No OAuth scopes are required for inbound HMAC verification. Use a unique, high-entropy signing secret per org/form endpoint and rotate it through the connection flow if exposed.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Ingest can resolve/create `gtm.contact` and `gtm.account` and emit `gtm.signal`.
- Do not assume arbitrary submitted fields map to canonical fields.
- Preserve submission source, timestamp, and verification evidence.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

A form submission is not blanket marketing consent. Record consent only when the form contract supplies it; enforce opt-outs and suppression before follow-up. Ingesting a lead must never auto-trigger an unapproved email or LinkedIn send.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Signature invalid: compare raw-body signature algorithm and secret; never disable verification to accept traffic.
- Duplicate submission: use the connector's event identity/idempotency.
- Invalid fields: inspect the schema and preserve unknown data only as permitted.
- No contact match: don't merge by name alone.

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

https://developer.mozilla.org/en-US/docs/Web/HTTP (webhook signature mechanics are defined by the GTM OS endpoint contract; configure the form vendor using its own webhook documentation).

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
