---
name: ads
description: Use when reading Google Ads or Meta Ads campaign performance, or proposing a supported campaign update through GTM OS.
---

# ads with GTM OS

## When to use this skill

Use when reading Google Ads or Meta Ads campaign performance, or proposing a supported campaign update through GTM OS.

## What GTM OS uses it for

Core paid-media read and update connector for Google Ads and Meta Ads.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `ads.read_campaign_performance` reads performance.
- `ads.update_campaign` updates campaign settings when enabled.
- Supports Google Ads and Meta Ads provider bindings; inspect the live operation schema for exact fields.

## Connect it

For Google Ads configure `GOOGLE_ADS_ACCESS_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, and `GOOGLE_ADS_DEVELOPER_TOKEN` as shown in `.env.example`, or use an org connection. For Meta configure `META_ADS_ACCESS_TOKEN`. Bind the correct ad account in console Connections.

Grant the provider's account-level ads read/manage permission only as needed. Google Ads requires its developer token plus OAuth access; Meta uses an access token. The connection flow is authoritative for the exact grant; do not broaden account access.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads campaign performance aggregates.
- Campaign updates target external provider campaign records; don't map them to `gtm.deal` or another CRM object absent an explicit operation mapping.
- Preserve provider account and campaign identifiers.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Campaign updates are spend-affecting external writes: propose them for human approval, apply configured spend caps, and verify the target account/campaign. Never increase budget or launch ads automatically. Respect audience suppression and opt-outs when targeting people.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Fixtures: credentials are unset; do not report them as live.
- Google auth errors: verify access token, customer ID, developer token, and account access.
- Meta auth errors: refresh token and confirm ad account permission.
- Invalid campaign state: fetch current state, review the operation schema, and ask for approval before retry.

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

Google Ads: https://developers.google.com/google-ads/api/docs/start ; Meta: https://developers.facebook.com/docs/marketing-apis/

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
