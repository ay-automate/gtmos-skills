---
name: mcp
description: Use when the GTM engineer wants GTM OS to use tools from an MCP (Model Context Protocol) server -- the organization's own servers, added per org in Integrations > Connections > MCP servers (mcp_servers.*), with no restart.
---

# mcp with GTM OS

## When to use this skill

Use when the GTM engineer wants GTM OS to use tools from an MCP (Model Context Protocol) server -- the organization's own servers, added per org in Integrations > Connections > MCP servers (mcp_servers.*), with no restart.

## What GTM OS uses it for

Extends GTM OS's integrations with ANY streamable-HTTP MCP server, per organization. A server's tools become capability backends: a definition.binding with backend `mcp` and op `mcp:<server>:<tool>` runs the tool for the org through capability.acquire. The instance-wide MCP_SERVER_URL is only the fallback for other op ids.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- `mcp_servers.add {name, url, authHeader?, authValue?}` registers a server (owner/admin; the URL, auth header and effects are sealed in a Connection of provider `mcp`; the auth value is never returned).
- `mcp_servers.test {name}` runs a LIVE initialize + tools/list, stores the tool catalog and marks the server connected (or failed with the reason).
- `mcp_servers.set_tool_effects {name, effects: {tool: read|write|null}}` declares what each tool may do; `mcp_servers.list`, `mcp_servers.remove`.
- Packages call the typed entry point `executeMcpTool(prisma, {organizationId, serverName, tool, args})` from @gtmos/connector-mcp.
- This is NOT the GTM OS MCP server the agent talks to (`gtm_*` tools; see `.claude/MCP-SETUP.md`).

## Connect it

Console: Integrations > Connections > **MCP servers** -> name + URL (`https://.../mcp`) + optional auth header (e.g. `Authorization: Bearer ...` or `x-api-key: ...`) -> **Add and test** -> mark each tool Read or Write. Agent: `gtm_act mcp_servers.add` then `mcp_servers.test` -- a human owner/admin must do the add (humanOnly). Then publish a binding, e.g. `{capability: "notes.search", backend: "mcp", opId: "mcp:notes:search_notes", maxUnitCostUsd: 0.01}`. No env change, no restart.

The server's own auth (a bearer token or API-key header) is whatever that server requires; GTM OS seals it per org and sends it on every request. Put credentials in the auth header, never in the URL (`user:pass@` is refused; query values are redacted in every listing). Cloud metadata hosts are refused.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Tool results come back as the tool's JSON payload (`{ result: ... }` when the tool returns plain text) and are tainted `external` like every backend output.
- No canonical `gtm.*` mapping is implied: map fields explicitly (definition source_mapping / play steps).
- `instance.readiness` shows `backend.mcp` plus one `backend.mcp.<name>` item per server.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

The effect of a tool is DECLARED by an owner/admin, never taken from the (untrusted) server: undeclared tools are unusable; `read` runs through capability.acquire; `write` runs ONLY when the binding is `riskClass: "high_risk"`, the org accepted it (`broker.accept_high_risk`) and a different human approved the acquire through the frozen gate (`runtime.approve_action` + `runtime.execute_action`) -- the same rule as Composio write tools. Org isolation: `mcp:<server>:<tool>` always resolves the CALLING org's server.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- NOT_CONFIGURED `MCP server "x" is not registered for this organization`: add it (or fix the server name in the binding).
- FORBIDDEN `no declared effect`: mark the tool Read/Write. FORBIDDEN `declared WRITE`: bind it high_risk and approve through the gate.
- UNAUTHORIZED / `could not reach <host>` on Test: wrong auth header or URL -- remove and add the server again, then Test.
- An `initialize failed ... did not answer with a JSON-RPC result`: the URL is not a streamable-HTTP MCP endpoint (often missing the `/mcp` path).

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

https://modelcontextprotocol.io/docs

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
