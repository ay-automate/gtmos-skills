---
name: slack
description: Use when connecting or operating the GTM OS Slack workspace integration, including channel settings and member matching.
---

# slack with GTM OS

## When to use this skill

Use when connecting or operating the GTM OS Slack workspace integration, including channel settings and member matching.

## What GTM OS uses it for

Slack OAuth and channel integration. Kernel auth owns connection validation and scopes; Slack connector/tool capabilities may be separately brokered through Composio.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- The Slack workspace connection is managed by GTM OS sign-in (console Slack settings).
- The native Slack channel surface and Composio `comms.chat.post` are distinct; check the selected operation before acting.
- The GTM OS console Slack settings page manages status, channels, and people matching.

## Connect it

Connect Slack from the organization Settings > Slack page. The installed OAuth plugin validates the workspace and stores the per-org Slack connection. Configure the Slack app's redirect URL from the deployed auth URL; do not paste tokens into a message.

Bot scopes GTM OS requests: `users:read`, `users:read.email`, `channels:read`, `groups:read`, `channels:history`, `groups:history`, `chat:write`, `chat:write.public`, `im:write`, `channels:join`, `channels:manage`, `groups:write`, `channels:write.invites`, `groups:write.invites`, `conversations.connect:write`, `links:write`. User token includes channel/group read/write and user/email read scopes for principal matching.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Slack connection, channels, and people matches are integration state; do not assume a canonical `gtm.*` object mapping.
- The Composio typed chat capability may return its own declared output.
- Verify the selected operation schema before creating a CRM activity.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Slack posts and interactive approvals are external writes, requiring proposal/approval via the operation path. Match Slack users to org principals carefully; never infer identity from display name. Respect workspace/channel restrictions and any user suppression state.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- Missing scopes: reconnect the workspace and review the scope list above.
- User not matched: verify email/principal membership; don't bind by name alone.
- Channel inaccessible: invite/join only through an authorized settings action.
- Disconnected workspace: reconnect; don't reuse a token from another org.

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

https://api.slack.com/docs

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
