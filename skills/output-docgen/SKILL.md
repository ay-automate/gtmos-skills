---
name: output-docgen
description: Use when a GTM OS operation needs to render a DOCX or PDF deliverable through the output-docgen package.
---

# output-docgen with GTM OS

## When to use this skill

Use when a GTM OS operation needs to render a DOCX or PDF deliverable through the output-docgen package.

## What GTM OS uses it for

Local document rendering backend for generated DOCX/PDF deliverables; not a third-party SaaS connector.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- Declares output capability keys `output.docx` and `output.pdf`.
- Renders DOCX and PDF behind the docgen backend.
- It does not send documents to a recipient by itself.

## Connect it

No vendor OAuth or API key is required by the package. Use the operation that requests a deliverable and the configured server renderer. Do not invent a `gtm connect` provider for this local backend.

There are no external OAuth scopes declared for the local renderer. Access is governed by the invoking GTM OS operation and its organization authorization.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Renders output bytes from the operation's supplied document model.
- The package declares `output.docx` and `output.pdf`, not a canonical CRM record mapping.
- Storage/attachment writes are determined by the calling operation, not the renderer alone.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Generating a document does not authorize sharing it. Any customer-facing delivery is a separate effect requiring approval. Ensure source records are authorized and avoid placing suppressed personal data in a deliverable.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Unsupported document input: compare with the renderer's declared model.
- PDF/DOCX render failure: inspect server logs without printing confidential document content.
- Missing output attachment: inspect the invoking operation and storage path.
- Do not retry external delivery as a substitute for local render recovery.

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

https://github.com/gtmos/gtmos (GTM OS package documentation; no external vendor API is used).

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
