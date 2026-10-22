---
name: ga4
description: Use when querying Google Analytics 4 reports for GTM OS attribution and landing-page analysis.
---

# ga4 with GTM OS

## When to use this skill

Use when querying Google Analytics 4 reports for GTM OS attribution and landing-page analysis.

## What GTM OS uses it for

Read GA4 landing-page metrics for the H3 pilot and map outcomes into the GTM OS reporting flow.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `ga4.read_report` is the package capability.
- Provider kind is `google_analytics` (CLI accepts `ga4` as an alias per COVERAGE.md).
- This is a reporting read, not a campaign mutation.

## Connect it

Connect the Google Analytics account/property in console Connections using the `google_analytics` provider. The connector expects the Analytics Data API host. `.env.example` does not list a GA4 platform token; use the org-scoped connection.

Use the Analytics read scope requested by the installed auth flow and grant access only to the intended GA4 property. Confirm the selected property ID via the connection page; the package manifest does not define an OAuth scope list.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads aggregated GA4 report rows through `ga4.read_report`.
- Supports outcome/attribution analysis; do not claim raw event-level data is written to a specific `gtm.*` object unless the operation schema says so.
- Keep property and date range in report provenance.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Use read-only reporting unless another declared operation exists. Avoid exporting person-level analytics or joining identities without authorization. Ads spend caps apply to paid-media actions, not this read, but never use an analytics report to bypass consent or suppression controls.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- 403: confirm account has Analytics Data API access and property permission.
- Invalid property: verify the selected GA4 property ID.
- Empty report: check dimensions, metrics, and date range in the live schema.
- Quota: reduce request frequency and date-range fanout.

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

https://developers.google.com/analytics/devguides/reporting/data/v1

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
