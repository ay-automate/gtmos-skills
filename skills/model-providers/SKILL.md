---
name: model-providers
description: Use when selecting or configuring Anthropic, OpenAI, or Gemini as a GTM OS Model Gateway provider for reasoning or embeddings.
---

# model-providers with GTM OS

## When to use this skill

Use when selecting or configuring Anthropic, OpenAI, or Gemini as a GTM OS Model Gateway provider for reasoning or embeddings.

## What GTM OS uses it for

Native ModelBackend providers: Anthropic generate, OpenAI generate and embeddings, Gemini generate and embeddings. The gateway chooses a provider using model policy routes.

Capabilities and operation names are listed below as they appear in the connector package and
coverage map. Discover the live input and output schema with `gtm describe` before invocation;
the registry for the current organization is authoritative if it differs from this static guide.

- Providers register with the ModelProviderRegistry; do not invoke provider SDKs directly from agent workflow code.
- Anthropic is generate-only; OpenAI (`text-embedding-3-small`) and Gemini (`gemini-embedding-001`) serve generation and dimensions-aware embeddings -- whichever key the org has, or a `definition.model_policy` route for the `embedding` task class.
- Missing key degrades to the kernel fixture backend. Region-specific routing fails closed without a configured endpoint.

## Connect it

Configure org credentials through the model provider connection/credential flow, or operator env `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `OPENROUTER_API_KEY` (OpenAI-compatible, many vendors). Select a provider/model in model policy; the package source shows supported route keys. `.env.example` documents Anthropic/OpenAI; coverage documents Gemini.

These providers use API keys, not OAuth scopes in the GTM OS adapter. Use separate least-privilege project keys and keep them in sealed connections or server env. Region routing requires a matching configured regional endpoint or attestation; do not silently fall back across regions.

Use the console Connections/settings page for the provider when present. For CLI setup, inspect
`gtm connect --help` and use the provider name supported by the installed CLI; do not guess
flags or paste credentials into command history. Restart/reload the configured instance only
through its documented operator workflow.

## Canonical data

- Model calls return generated text or embeddings plus usage, cost, and provenance to the gateway.
- They do not directly read/write `gtm.*` records; the invoking operation determines object access.
- OpenAI and Gemini embeddings must respect requested dimensions.

Read and write records through registered operations and `gtm.*` objects only. A vendor-side
record is not automatically a canonical GTM OS record; use the connector's declared mapping and
retain source provenance. Do not infer fields from the vendor API.

## Governance and safety

Model spend is quoted/reserved/settled by the gateway; respect route budgets and token limits. Follow data privacy/ZDR policy: OpenAI uses request-level `store:false`; Anthropic and Gemini ZDR is operator/account attestation, not a per-request wire flag. Do not send suppressed personal data into prompts without authorization.

- E-class/customer-facing writes are proposed for approval; a different human approves them.
- Respect consent, suppression, unsubscribe, and do-not-contact state before any person-level action.
- Honor configured spend/budget caps. Do not retry a billable request blindly after timeout.
- Keep connection secrets in the sealed connection or server environment. Never print or commit them.

## Common errors and recovery

- No API key: fixture backend may answer; don't call it live provider output.
- Region unavailable: configure the correct regional endpoint; fail closed.
- 429/transport error: gateway may fail over according to policy; don't create a parallel raw SDK call.
- Wrong capability: embeddings come from OpenAI or Gemini; Anthropic has no embedding model (generate only). No OpenAI/Gemini key: semantic search is text-only.

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

Anthropic: https://docs.anthropic.com/ ; OpenAI: https://platform.openai.com/docs/ ; Gemini: https://ai.google.dev/gemini-api/docs

GTM OS reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`) and the live `gtm describe` schema.
