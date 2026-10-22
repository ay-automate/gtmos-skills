---
name: gtmos-source-mapping
description: Use when the GTM engineer wants data from ANY app connected through Composio (Close, Typeform, Stripe, Intercom, Airtable, a niche CRM...) to land in GTM OS -- as accounts, contacts, deals, signals, activities or a custom object. Covers the definition.source_mapping spec, the preview -> suggest -> define -> publish -> sign -> sync path over MCP/CLI and the console wizard, transforms, pagination, match keys, schedules, write-back, and errors.
---

# Map any app into the GTM OS ontology (definition.source_mapping)

**What it is.** A source mapping says: run this app's LIST tool (through the org's own Composio
connected account), page through it, and write each item into an ontology object -- a canon
`gtm.account` / `gtm.contact` / `gtm.deal` / `gtm.signal`, `gtm.activity`, or a custom object
(`custom.<key>`). It is a governed **definition** (`definition.source_mapping`): validated against
the org's live ontology, published through an approval, **signed by a human**; only a signed
version ever syncs. The five built-in CRMs (HubSpot, Salesforce, Pipedrive, Attio, Zoho) keep their
code-defined path (CRM of record + `crm.sync`); everything else uses a source mapping. Both share
one page walker and one canon writer.

Prerequisite: the app is connected and ACTIVE (Integrations > Connections > Composio, `composio.status`).
Data you must BUY (enrichment, emails, intent) is looot's job, not a source mapping.

## The path (MCP tools; every step is also in the console)

1. **Pick the list tool** -- `gtm_query source.list_tools { toolkit: "close", search: "leads" }`
   (read tools first; with a Composio Connect credential the catalog is not available: use the slug
   from docs.composio.dev/toolkits/<toolkit>). A list tool must be a READ (list/get/search).
2. **Preview** -- `gtm_query source.preview { toolkit: "close", listTool: "CLOSE_LIST_LEADS", args: { _limit: 25 } }`
   runs the tool ONCE, live, no writes. Read `itemsPath` (where the items are), `fields` (every path
   with type / example / presence), `suggestedIdField` and `paginationHints` (next cursor, has_more,
   page_count...).
3. **Pick the target** -- `gtm_query source.targets` lists canon targets with their fields (plus the
   org's custom fields `custom.<slug>`) and the org's custom objects. Missing one? Create the custom
   field (`field.create`, Settings > Fields) or the custom object (`ontology.propose_changeset` with a
   `create_object`, the console Model page) FIRST -- the mapping is validated against them.
4. **Suggest** -- `gtm_query source.suggest_mapping { sample: <preview items>, target: "gtm.contact" }`:
   a deterministic heuristic (names, synonyms, value types; no model needed). It proposes
   `fields`, `idField`, `match`, `mode` and lists `unmappedRequired`. Review it -- it is a draft.
5. **Define** the spec (below) in the org repo's `sources.yaml` and `gtm plan` / `gtm apply
   --env dev`, or over MCP: `gtm_act config.propose_changeset` -> `gtm_query config.validate_changeset`
   -> `gtm_act config.apply`. Definitions never go straight into prod. `config.apply` is an
   **approval** a DIFFERENT member releases; validation issues (unknown field, missing custom object,
   bad path, unknown transform) come back before anything is applied.
6. **Sign** -- `gtm definition sign definition.source_mapping/<key> --env dev` (human only; an agent
   can never sign). Optionally `gtm promote` it to prod (again an approval).
7. **Sync** -- `gtm_act source.sync { mappingKey }` enqueues the job (one running per mapping);
   `gtm_query source.sync_status { mappingKey }` shows the signed version used, the schedule and each
   run's counts (created / updated / unchanged / skipped / invalid / unresolved), `truncated` and the
   first errors. `gtm_query source.mappings` lists them all.

Console: Integrations > Connections > Composio > a connected app > **Map to ontology** (the same six
steps), then the mappings list: Propose for signing, Sign, Promote, Sync now, last run.

## From an MCP server (backend "mcp")

Any of the org's own MCP servers (Integrations > Connections > MCP servers, `mcp_servers.*`) is a
source: `source: { backend: mcp, toolkit: <server name>, listTool: <tool name> }`. The list tool
must be declared **read** (`mcp_servers.set_tool_effects`); `source.list_tools {toolkit, backend:
"mcp"}` lists the server's stored catalog (read tools first) and `source.preview {..., backend:
"mcp"}` runs one page live. A write-back `updateTool` must be declared **write** and runs only
through the approval gate (`source.update_record`).

## The spec

```yaml
kind: definition.source_mapping
key: close-leads-to-contacts
spec:
  label: Close leads -> contacts
  source:
    backend: composio            # or "mcp": toolkit = your MCP server name, tools = its tool names
    toolkit: close
    listTool: CLOSE_LIST_LEADS
    args: { query: "status:active" }          # static, every page
    pagination: { kind: offset, offsetParam: _skip, pageSizeParam: _limit, pageSize: 100, hasMorePath: has_more }
    itemsPath: data
    maxRecords: 10000                          # cap per run -> truncated
    # count: { tool: <a READ tool of this toolkit that returns the total>, args: {...}, path: <path to the number> }
    #   optional (0.2.5): the source's row count for sync.completeness -- only a tool you verified in the toolkit docs
  target: { objectType: gtm.contact }
  idField: id
  fields:
    - { from: "contacts[0].name", to: displayName }
    - { from: "contacts[0].emails[0].email", to: primaryEmail, transform: [trim, lower] }
    - { from: url, to: accountDomain, transform: domain_from_url }   # employment link by domain
    - { from: custom.Tier, to: custom.tier }                         # an existing custom field
  match: [external_id, email]
  mode: mirror                 # mirror = create + update; append = create only
  schedule: { kind: interval, everyHours: 6 }   # or { kind: manual }
  writeBack:                   # optional: source.update_record (approval-gated)
    updateTool: CLOSE_UPDATE_LEAD
    idArg: lead_id
    fieldMap: { displayName: display_name }
    getTool: CLOSE_GET_LEAD    # snapshot -> undoable
    getIdArg: lead_id
```

- **Paths**: `a.b`, `a[0].b`, `a["key.with.dots"]`; `from` may list several paths (an array, then `join`).
- **Transforms** (chain left to right): `trim`, `lower`, `upper`, `number`, `boolean`, `date` (ISO /
  epoch s or ms), `domain_from_url` (also from an email), `first`, `{ split: "," }`, `{ join: " " }`,
  `{ const: value }` (no `from` needed), `{ map: { "Closed Won": won }, default: open }`.
- **Pagination**: `none`; `cursor` (cursorParam + nextCursorPath [+ pageSizeParam/pageSize]);
  `offset` (offsetParam + pageSizeParam + pageSize [+ hasMorePath]); `page` (pageParam [+ pageSize,
  firstPage 0|1, hasMorePath, totalPagesPath]). Argument names may be dotted (`paging.after`).
- **Targets and fields**: gtm.account (name, domain, website, industry, employeeCount, countryCode),
  gtm.contact (displayName, givenName, familyName, primaryEmail, phone, linkedinUrl, countryCode,
  accountExternalId, accountDomain), gtm.deal (name, valueAmount, valueCurrency, status open/won/lost,
  accountExternalId, accountDomain), gtm.signal (kind, summary, occurredAt, accountDomain, accountName,
  contactEmail; append only), plus `custom.<slug>` custom fields; a custom object or gtm.activity takes
  its own field keys (+ `subject.contactEmail` / `subject.accountDomain` to link a subject).
- **Match**: always the app's record id first (`custom.source = { mappingKey, toolkit, tool, recordId }`),
  then account: domain, name; contact: email; custom object: any mapped field.

## Examples

**Typeform responses -> gtm.signal** (append only; the funnel resolves the contact, never invents one):

```yaml
source: { backend: composio, toolkit: typeform, listTool: TYPEFORM_LIST_RESPONSES, args: { form_id: "abc123" },
          pagination: { kind: page, pageParam: page, pageSizeParam: page_size, pageSize: 100, totalPagesPath: page_count }, itemsPath: items }
target: { objectType: gtm.signal }
idField: token
fields:
  - { to: kind, transform: { const: form_submitted } }
  - { from: "answers[0].text", to: summary }
  - { from: submitted_at, to: occurredAt, transform: date }
  - { from: hidden.email, to: contactEmail, transform: lower }
mode: append
schedule: { kind: interval, everyHours: 1 }
```

**Stripe customers -> a custom `customer` object** (create `custom.customer` with email / name /
balance / created_at first):

```yaml
source: { backend: composio, toolkit: stripe, listTool: STRIPE_LIST_CUSTOMERS,
          pagination: { kind: cursor, cursorParam: starting_after, nextCursorPath: next_cursor, pageSizeParam: limit, pageSize: 100 }, itemsPath: data }
target: { objectType: custom.customer }
idField: id
fields:
  - { from: email, to: email, transform: lower }
  - { from: name, to: name }
  - { from: balance, to: balance, transform: number }
  - { from: created, to: created_at, transform: date }
match: [external_id, email]
mode: mirror
schedule: { kind: manual }
```

(Check the exact cursor field of the tool's response in `source.preview`'s paginationHints -- never guess it.)

## Governance you must respect

- Only a **signed** version syncs; editing the mapping makes a new draft that must be signed again.
- Canon writes respect the org's binding (mirror) mode: `federate` / `in_zone` materialise nothing;
  `soft_merge` / `sheet` never overwrite a human-set value. Every write carries provenance
  (`source:<toolkit>:<tool>`) and an observation of the raw item.
- Write-back is `gtm_act source.update_record { mappingKey, recordId, fields }` with TARGET field names
  from `writeBack.fieldMap`: a proposal a different human approves; `source.undo_update_record
  { approvalId }` restores the snapshot when the mapping has a `getTool`.

## Errors and recovery

- `NOT_CONFIGURED` "Connect <App>": the toolkit has no ACTIVE account -- connect it on the Composio card.
- `NOT_CONFIGURED` "no signed version": sign it (`gtm definition sign`), then sync.
- validation: "not a custom field" / "custom object does not exist" -> create it first; "not a known
  transform" / path errors -> fix the spec; "is a write tool" -> pick a list/get tool.
- A run with `invalid` rows: the target refused them (e.g. a required field missing) -- read
  `source.sync_status` errors, add a `const` or a better path. `unresolved` signals: the contact/company
  is not in GTM OS yet (sync contacts first).
- `truncated`: raise `source.maxRecords` (max 50,000) or narrow `source.args`.

## References

- The kind and its fields: `docs/gtmos/reference/definition-kinds.md` (`definition.source_mapping`); the ops: `docs/gtmos/reference/operations.md` (area `source`).
- Composio tools per app: https://docs.composio.dev/toolkits
