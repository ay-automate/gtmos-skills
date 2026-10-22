---
name: nango
description: Use when configuring or reviewing the recognized Nango managed-OAuth backend vocabulary; this package is not currently registered as a live capability backend.
---

# nango with GTM OS

## When to use this skill

Use when configuring or reviewing the recognized Nango managed-OAuth backend vocabulary; this package is not currently registered as a live capability backend.

## What GTM OS uses it for

Managed OAuth transport/backend package exists, but COVERAGE.md says Nango is recognized and not registered in the kernel CapabilityBackendRegistry yet.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- Package exports `registerNangoCapabilityBackend` and transport helpers.
- The CLI recognizes `nango` as a BindingBackendKind, but discover reports it as not registered (kernel K8 pending).
- Do not promise a usable provider capability today.

## Connect it

No supported end-user Nango connect flow is established by the current coverage map. Do not add Nango credentials or claim the console can connect it. For current integrations, use a registered native connector or Composio where supported.

Nango provider scopes are configured per integration in Nango, but this GTM OS package does not currently register a live backend. No GTM OS scope set is declared; do not fabricate one or request credentials for this path.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- No active `gtm.*` object mapping is declared for this backend.
- Do not assume a successful Nango-side sync reaches canonical GTM OS data.
- Use registered operation schemas to determine any alternative path.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

A future Nango write must still use GTM OS's capability broker and approval gates. Until backend registration exists, do not execute external writes through Nango or bypass GTM OS policies.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Capability backend unavailable/not registered: expected current limitation; stop and report it.
- Do not retry with guessed config or raw Nango API calls.
- If registration has landed in a newer build, re-check COVERAGE.md and live `gtm describe` before proceeding.

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

https://nango.dev/docs

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
