---
name: gsc
description: Use when reading Search Console analytics or submitting a sitemap through the GTM OS SEO connector.
---

# gsc with GTM OS

## When to use this skill

Use when reading Search Console analytics or submitting a sitemap through the GTM OS SEO connector.

## What GTM OS uses it for

SEO/GEO connector for search analytics and sitemap submission.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `seo.read_search_analytics` reads performance data.
- `seo.submit_sitemap` submits a sitemap; inspect its effect class and approval status before using.
- Connector host is Search Console API; unset access token uses fixtures except crawl audit.

## Connect it

Connect Search Console with a site URL/property and OAuth access token. `.env.example` lists `GSC_ACCESS_TOKEN` and `GSC_SITE_URL`; production should use the org connection. Select the exact verified site property in console Connections.

Use the Search Console authorization scope shown by the configured OAuth flow, limited to the selected verified property. The package manifest does not publish a literal scope list; do not invent one.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Reads search analytics rows for the configured property.
- Sitemap submit is a property-level external action.
- No direct CRM person write is declared; preserve report dimensions and date bounds instead of assigning search queries to people.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Treat sitemap submission as a consequential external write and use the registered approval path if gated. Keep property ownership explicit. Do not use aggregate query data to infer personal identity or ignore user-level privacy choices.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Fixture data: token/site URL is missing; don't describe fixtures as live.
- 403: verify property ownership and granted Search Console access.
- Invalid site URL: use the exact property URL/prefix.
- Quota/empty response: narrow date range and inspect supported dimensions.

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

https://developers.google.com/webmaster-tools

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
