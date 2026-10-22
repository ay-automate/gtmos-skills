---
name: gtmos-looot
description: Read FIRST for any looot work inside GTM OS. Use whenever a GTM task needs live outside data -- find or verify an email or phone, enrich a company or person, build a company or people list, find lookalikes, search the web or news, pull job postings, social posts, technographics, headcount, SEO keyword data, or extract a web page. looot is GTM OS's data-acquisition layer (one prepaid account, ~80 providers). Read this before calling any looot capability, the looot MCP server or the looot CLI; it decides when the upstream looot-* skills apply.
---

# looot in GTM OS

looot (https://looot.ai) is one gateway to ~80 live data providers and 2,300+ endpoints, with one
prepaid balance and one run contract. In GTM OS it is the **data-acquisition layer** (Composio is the
action layer): the `looot` connector package exposes looot as typed GTM OS **capabilities**, so data
lands in the gtm.* graph with provenance, under spend caps and approvals.

**Rule one: go through GTM OS, not around it.** Anything that should end up in the CRM (an email, an
enriched company, a people list) runs through a GTM OS capability or engine (enrichment waterfall,
qualification, signals), never through a raw looot call you then paste into records. Raw looot (MCP /
CLI) is for exploring and pricing data before you wire it into a play.

## The looot skills you have, and which one wins

This scaffold ships three layers of looot skills. Read them in this order:

1. **`gtmos-looot` (this file)**: how GTM OS governs looot. It always wins on anything that writes
   to the CRM, spends money in bulk, or touches a person.
2. **`looot`** (official upstream base skill, vendored verbatim from
   https://github.com/loootai/looot-skills, MIT): connect the looot MCP server, sign in, search the
   catalog, inspect prices, run endpoints with fallback. Use it to explore and price data.
3. **`looot-<job>`** (20 official single-job skills, same source): one recipe per data job. Use one
   to learn which looot job/endpoints fit, the inputs and the price, then do the work the GTM OS way:

| Upstream skill | GTM OS path for CRM data |
|---|---|
| `looot-enrich-a-company`, `looot-enrich-a-person` | enrichment waterfall / `enrich.company`, `enrich.person` |
| `looot-find-professional-emails`, `looot-email-verification`, `looot-company-email-format`, `looot-find-phone-numbers` | enrichment waterfall: `enrich.find_email` (verified before any send), `enrich.find_phone` |
| `looot-company-list-builder`, `looot-local-business-search` | `find.companies` / `find.people` / `find.lookalikes`, written as gtm.* records |
| `looot-job-postings`, `looot-reddit-search`, `looot-tiktok-search`, `looot-meta-ads-library`, `looot-youtube-transcript` | Signals engine via `research.jobs` / `research.social_posts` / `research.news` (signal.observed on the account), research agent |
| `looot-google-serp`, `looot-domain-keywords`, `looot-keyword-volume`, `looot-backlink-checker`, `looot-ai-search-visibility` | SEO & GEO engine via `seo.keyword_data` / `research.web_search` (the engine itself requires Google Search Console) |
| `looot-google-maps-reviews`, `looot-amazon-product` | `research.reviews` / `research.extract_page`, qualification evidence |

Ad-hoc questions that do not end up in records ("what ranks for X?", "price a 500-row enrichment")
may use the upstream skill directly through the looot MCP server. Anything that should land in the CRM
goes through GTM OS. For SDKs, recipes and integrations beyond these skills, see `looot-resources`.

## The capabilities GTM OS exposes (the looot connector)

| GTM OS capability | looot job it routes to | Typical use |
|---|---|---|
| `enrich.company` | `company.enrich` | firmographics from a domain |
| `enrich.find_email` | `people.email.find` | work email from name + company domain |
| `enrich.find_phone` | `people.phone.find` | direct dial / mobile |
| `enrich.technographics` | `company.technographics` | tech stack of a domain |
| `enrich.headcount` | `company.employees.count` | employee count / growth |
| `enrich.personality` | `people.analysis` | person profile analysis |
| `enrich.person` | `people.enrich` | a person's current role, company and LinkedIn from name + company |
| `enrich.person_photo` | `people.photo` | a person's profile picture from their LinkedIn URL (temporary URL) |
| `find.companies` | `company.search` | build an account list from filters |
| `find.people` | `people.search` | build a contact list (titles, seniority, company) |
| `find.person_linkedin` | `people.linkedin.find` | a person's LinkedIn profile URL from name + company |
| `find.lookalikes` | `company.lookalike` | companies similar to your best customers |
| `ip.reverse_ip_company` | `ip.enrich` | which company owns an IP |
| `intent.visitor_identification` | `ip.enrich` | de-anonymise website visitors (pairs with website tracking) |
| `intent.topic_surge`, `intent.review_site_intent` | discovered at run time | third-party intent |
| `research.web_search` | `web.search` | ranked web results |
| `research.news` | `news.search` | company news / trigger events |
| `research.jobs` | `jobs.search` | hiring signals |
| `research.social_posts` | `social.company.posts` | company social activity |
| `research.person_posts` | `social.person.posts` | a person's recent LinkedIn posts |
| `research.job_changes` | `people.job.changes` | people who changed jobs (USD 0.108 a call: raise `LOOOT_MAX_COST_USD` above the 0.05 default) |
| `research.reviews` | discovered at run time | review-site research |
| `research.extract_page` | `web.extract` | a page as structured data |
| `seo.keyword_data` | `keywords.domain.overview` | keyword / domain SEO data |
| `geo.answer_chatgpt`, `geo.answer_perplexity`, `geo.answer_gemini`, `geo.answer_copilot` | pinned endpoints `searchapi-io-chatgpt` / `-perplexity` / `-gemini` / `-bing-copilot` | an AI assistant's answer + cited sources for a prompt (GEO visibility) |
| `geo.answer_google_ai_overview`, `geo.answer_google_ai_overview_page` | pinned `searchapi-io-google` (+ `searchapi-io-google-ai-overview` for an async overview's page_token) | Google's AI Overview + sources for a query |
| `seo.serp_organic` | pinned `searchapi-io-google` | Google's first results page for a keyword (rank tracking) |

When a capability runs, GTM OS sends looot a **job** (`endpointId: "job:<job>"`) with
`fallback: true`, so looot tries the next provider for the same job if one misses, all under one hold
capped by the capability's cost cap. Pin a specific provider endpoint only when you must, with the
capability's env var (for example `LOOOT_FIND_EMAIL_ENDPOINT=hunter-email-finder`).

Find the live list and schemas with `gtm describe` (look for the capability keys above) and in
`.claude/gtm-context.md`.

## Pinning a provider endpoint (and mapping its args)

A capability speaks ONE generic arg vocabulary (`intent.topic_surge` takes `topics`, `country`,
`limit`). A pinned provider endpoint speaks its own and **rejects unknown fields**
(`validation_error: Unrecognized field (topics) is not allowed here`). Pinning an endpoint is
therefore two steps: pin it, then map its args in the same binding.

1. Find and price candidates, then pin one (writes `definition.binding` into `bindings.yaml`):
   ```
   gtm capabilities discover intent.topic_surge --backend looot --pin theirstack-companies-buying-intents
   ```
2. Read the endpoint's input fields (free) and the gap against the capability's args:
   ```
   gtm capabilities inspect theirstack-companies-buying-intents --capability intent.topic_surge
   ```
   When the endpoint does not accept the capability's arg names, `discover --pin` already wrote a
   **commented `args:` stub** under the binding listing both sides (required fields marked `*`,
   numeric bounds shown). Never guess a field: map only to fields the inspect output lists.
3. Complete the mapping, uncomment it, commit, `gtm apply --env <env>`:
   ```yaml
   kind: definition.binding
   key: intent.topic_surge
   spec:
     capability: intent.topic_surge
     backend: looot
     opId: theirstack-companies-buying-intents
     args:
       rename:    { topics: keyword_slug_or, country: company_country_code_or }
       transform: { keyword_slug_or: slugify }
       clamp:     { limit: { max: 25 } }
   ```
   The broker applies `args` right before every quote and run (and `capability.quote` prices the
   mapped args), in this order: `drop` (caller keys to remove) -> `rename` (caller key -> endpoint
   field) -> `static` (endpoint constants; the caller wins unless `override: true`) -> `transform`
   (`slugify`, `lowercase`, `join_csv`, `first`, or a list of them) -> `clamp` (`{ min, max }`).
   A fallback takes its own `args` block; it never inherits the primary's.
4. Prove it with one call before any batch: `capability.quote`, then a single acquire (for intent:
   `signals.ingest_intent` with a small `limit`). A refused run now comes back with
   `fetchError: { code, message }` naming the field the endpoint rejected.

## Connect looot to a GTM OS instance (one time, by the operator)

1. Create an account at https://looot.ai/auth/sign-up (this creates the looot organization).
2. Top up: a new workspace starts at **$0** and paid runs fail with `402 insufficient_balance` until
   you do. The minimum is shown by the balance call (`topUpLink.minimumUsd`, currently $5). Pay at
   https://looot.ai/usage. The agent never pays: it hands the human the checkout link.
3. In looot Settings > **Agent tokens** > Create agent token with scopes `catalog.read`,
   `runs.read`, `runs.execute` (add `usage.read` for balance). Copy the `cs_ms_...` secret (shown once).
4. Put it in the GTM OS instance env (the `.env` written by `gtm up` / `gtm setup`), never in code or git:
   ```
   LOOOT_TOKEN=cs_ms_...          # older installs used LOOOT_API_KEY; both are read
   LOOOT_MAX_COST_USD=0.05        # per-call cap; a run estimated above it needs approval
   ```
   Optional: `LOOOT_BASE_URL` (default https://api.looot.ai) and per-capability endpoint pins
   (`LOOOT_<CAPABILITY>_ENDPOINT`).
5. Restart the stack (`docker compose up -d` in the instance folder). Without a token the connector
   runs on **fixtures** (deterministic fake data, marked as such): fine for demos, never for real
   prospects.

## How a run works (and what it costs)

- **Free:** catalog search, discover, inspect (price + input schema), balance, run status, receipts.
- **Paid:** `run`. looot quotes the price before running, **holds** the estimate, then settles the
  real cost. Refused runs (bad input, no balance, rate limit) charge nothing. A provider error
  settles at $0 unless the provider itself billed. A "not found" is free unless that provider bills
  for misses (the run's `outcome` says which: hit, weak, miss, error, rejected, skipped, pending).
- With `fallback`, every attempt is listed in the run's `route`, and only attempts that ran are charged.
- Every charge has a receipt: `GET /v1/runs/{runId}/attempts` (MCP `runs_evidence`). GTM OS stamps
  `looot:<capability>:<runId>` provenance on what it writes, so you can trace any field back to its receipt.
- GTM OS also keeps its **own** budget (`looot_budget` / `looot_spend_entry`): a per-call cap
  (`LOOOT_MAX_COST_USD`) plus an org budget. Above the cap, the capability raises
  `APPROVAL_REQUIRED` and the run waits in the console Approvals queue; it never spends silently.

## Errors you will see

| Signal | Meaning | What to do |
|---|---|---|
| `402 insufficient_balance` | looot balance is empty | give the human `topUp.checkoutUrl`; do not retry |
| `APPROVAL_REQUIRED` (GTM OS) | estimate is above the per-call cap or the budget | approve in the console, or raise the cap deliberately |
| `429 too_many_inflight_runs` / `rate_limit_exceeded` | too much in parallel | back off per `retry-after`, lower concurrency |
| `503` (catalog_loading, storage_busy, ...) | transient | retry after `retry-after` |
| `409 idempotency_conflict` | same idempotency key, different input | new logical call means a new key |
| run `status: failed` with HTTP 201 | refused before dispatch | read `error.code` / `retryable` / `retryHint` |
| `outcome: miss` | no provider found the data | treat as empty, not as an error; do not loop |
| endpoint `access: coming_soon` | listed, not callable yet | pick another endpoint or job |
| endpoint `access: needs_your_account` | runs on the customer's own provider account | connect that account in looot first |

## Exploring with the looot MCP server or CLI (optional, for the engineer)

Use this to see what data exists and what it costs **before** you design a play. It spends the same
prepaid balance, so keep it to inspection and single test calls.

```
claude mcp add looot https://api.looot.ai/mcp --transport http      # then /mcp > looot > Authenticate
npm install -g looot && looot login                                 # CLI alternative
looot search "find a work email from name and domain"               # free
looot inspect people.email.find  /  looot inspect <endpoint-id>      # free: inputs + price
looot run job:people.email.verify --input '{"email":"jane@acme.com"}' --wait   # paid
looot balance                                                       # free
```

MCP tools (16): `search_catalog`, `search`, `discover`, `discover_smart` (paid), `catalog_overview`,
`inspect`, `run`, `runs_get`, `runs_list`, `runs_cancel`, `runs_evidence`, `media_link`, `balance`,
`top_up`, `capability_request`, `my_tools`. Per-tool docs: https://docs.looot.ai/mcp-tools/<tool-name>.md.

Once you know which job and inputs you need, wire it through the GTM OS capability (or ask for a new
capability), not through the raw call.

## Do

- Search and inspect before you run; never guess an endpoint's input fields.
- Check what GTM OS already stored before paying for the same field again (`records.search`, the
  company / contact record and its provenance). Never pay twice for the same row.
- Run **one** call, check the output shape, then run the batch.
- Before more than ~100 paid calls, tell the human the estimated total and wait for a yes.
- Prefer jobs + fallback over a pinned provider; set a cost cap on bulk work.
- Respect suppression and opt-outs: never enrich or look up a person who is suppressed in GTM OS.

## Don't

- Don't print, log or commit the token. Don't put it in `.mcp.json` or the repo.
- Don't pay or enter card details; hand the human the top-up link.
- Don't bypass GTM OS by writing looot results straight into records: you lose provenance, budget
  and approvals.
- Don't treat a `miss` as a failure to retry forever.
- Don't use `coming_soon` endpoints; check `access` first.

## References

- looot contract (no token needed): https://api.looot.ai/llms.txt, https://api.looot.ai/llms-full.txt,
  https://api.looot.ai/openapi.json, official agent skill https://api.looot.ai/skill.md
- Docs: https://docs.looot.ai (client setup: https://docs.looot.ai/connect)
- Provider cards: https://api.looot.ai/catalog/<endpointId>.md
- GTM OS connector reference: `docs/gtmos/reference/connections.md` (installed by `gtm init`)
