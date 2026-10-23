---
name: gtmos-engine-catalog
description: The GTM OS engine catalog -- for each engine its purpose, the connections it needs, the definitions it reads, the built-in defaults, the customisation knobs, the live verification step and the gotchas. Read before explaining, building or verifying any engine (Score, Enrichment, Signals x Intent, Outreach, SEO & GEO, Performance Ads, Identity & data quality) and for routing, plays, research and CRM sync.
---

# GTM OS engine catalog

Seven engines ship and are installed + enabled for every org (packages `stdlib/engine.<name>`).
Each engine runs on the org's **signed** definition in the call's environment; with none signed it
uses the stdlib default below (unsigned drafts are ignored). Confirm exact input schemas with
`gtm_describe <operation>` -- this catalog is a guide, the live registry is the authority.

Rule for every engine: verify live with its own check AND `gtm_query instance.readiness`.

## Score (qualification) -- `stdlib/engine.score`
- **Purpose:** rule-based account scoring from signals (intent) and firmographic ICP fit; also hosts CRM sync / write-back.
- **Operations:** `score.score_account`, `score.explain_qualification`, `score.rescan_organization`, `score.ingest_market_signals` (D); `query.list_qualifications`, `query.get_qualification` (Q).
- **Connections:** a model provider for explanations; signals arrive from the Signals engine / looot.
- **Definitions:** `definition.scoring_model` key `default` (intent) and key `icp_fit` (firmographic); `definition.committee_model` key `default` (ABM blueprints).
- **Defaults:** `score.default.v2` -- qualified >= 60, review >= 30; weights e.g. funding 30, hiring 25, acquisition/expansion 20, exec change 15, headcount growth 15, product launch 12, pricing/product visits 10, negative -40; decay per signal family (buying 45d, intent 14d), first-party x1.5, competitor cap 0, reply / bounce negatives. ICP-fit default: a neutral size-only B2B ICP (50-5,000 employees = 100), threshold 70 -- sign the org's own.
- **Knobs:** thresholds, per-signal weights, ICP regions/size/industries, committee personas (ABM).
- **Verify live:** `gtm_act score.score_account {accountId}` on a real account; the result's policy version reads `definition.scoring_model:default:vN` when YOUR signed model is used (`score.default.v2` means the default is still in force).
- **Gotchas:** the environment decides which model runs -- a model signed in dev is not used by prod calls until promoted.

## Enrichment -- `stdlib/engine.enrichment`
- **Purpose:** multi-provider waterfall that fills EMPTY fields only (never overwrites) on accounts and contacts.
- **Operations:** `enrichment.enrich_accounts`, `enrichment.enrich_contacts` (D; `maxEntities` default 25, max 500; `estimate: true` = cost preview, no run), `enrichment.coverage_report` (Q).
- **Connections:** **looot** (required) -- the only third-party data provider.
- **Definitions:** `definition.binding` (e.g. `enrich.find_email` -> looot job, with a per-call price cap).
- **Defaults:** blueprints seed an `enrich.find_email` binding on looot with max $0.05/call.
- **Knobs:** which capabilities run (company, find_email, verify_email, find_phone, technographics, headcount), price caps, batch size.
- **Verify live:** `enrichment.enrich_accounts {estimate: true}` (price) then a small real run, then `enrichment.coverage_report`.
- **Gotchas:** always estimate first; spend is real.

## Signals x Intent -- `stdlib/engine.signals`
- **Purpose:** ingest signals, decay-weighted scoring, intent surge reports.
- **Operations:** `signals.list`, `signals.score`, `signals.surge_report`, `signals.feed`, `signals.review_queue`, `signals.settings.get` (Q); `signals.record` (D, 1-1000), `signals.ingest_intent`, `signals.retract_signals`, `signals.undo_retraction` (D); `signals.verify` (D, humans only, bulk verify / dispute), `signals.settings.set` (D, owner/admin).
- **Verification gate (0.2.5):** per org `off` | `seller_surfaces` | `strict` (`signals.settings.get/set`). Under a gate, unverified signals never reach a seller (hot list, lead queue, drafts, routing / alerts, plays, agent memory); under `strict` they also do not count toward scores. Existing orgs stay `off`; new orgs start `strict`. Review with `signals.review_queue` then `signals.verify`.
- **Connections:** **looot** for `intent.*` capabilities.
- **Definitions:** `definition.scoring_model` key `signals` (weights, half-life, plus `signalStrength.classes` and `signalStrength.autoVerify` rules; default: first-party signals auto-verify).
- **Defaults:** half-life 30 days; >= 60 hot, >= 30 warm.
- **Knobs:** half-life, hot/warm thresholds, which signal kinds count.
- **Verify live:** `signals.ingest_intent` then `signals.surge_report` returns real accounts.
- **Scan on demand:** `gtm_act signals.scan_now {maxCostUsd?, accountIds?}` (owner/admin) runs the daily looot signal scan now -- the same `score.signal_scan` job, capped per run at min(maxCostUsd, `signals.scan.perRunCapUsd`, $1); one scan in flight per org (a second call returns the running job); refused in Dry Mode (`status: dry_mode`). Read the outcome with `gtm_query signals.scan_status` (last runs: status ok / budget_stopped / skipped, signals created, spend vs cap; in-flight job; last failure).
- **Gotchas:** never `docker exec` into the worker to trigger a scan -- use `signals.scan_now`.

## Outreach -- `stdlib/engine.outreach`
- **Purpose:** draft, personalise, sequence and send -- every send is an approval-gated effect.
- **Operations:** `outreach.draft_message`, `outreach.draft_personalized_message`, `outreach.rescan_cadences`, `outreach.advance_cadence` (D); `outreach.send_message` (E); `sequence.create/update/enroll/set_member_status` (D); `sequence.list/get/members/messages/replies` (Q); `lane.activate` (T).
- **Connections:** a sender -- Gmail or Microsoft 365 connected account (Settings > Connected accounts; preferred over Resend) or Resend; a model provider for personalised drafts; Unipile for LinkedIn lanes.
- **Definitions:** `definition.lane` (channel, purpose, dailyCap, recentTouchWindowHours, openDealPolicy, senderPhysicalAddress, envelopeBudgetEur, bounce/complaint pause thresholds, sendingDomain), `definition.brand_voice` key `default`.
- **Defaults:** blueprints seed an email lane (e.g. `primary-email`) and a first-touch play.
- **Knobs:** daily cap, touch window, open-deal policy, brand voice, sequence steps.
- **Verify live:** lane activated (`gtm lane activate <laneKey> --env <envId>` -> a different human approves) + sender live in `instance.readiness`; draft a message and propose ONE send to an internal address; a human approves.
- **Gotchas:** an un-laned send fails `lane_required`; in live mode the fixture sender refuses; a lane with `sendingDomain` is refused in a prod-class env unless SPF/DKIM/DMARC verify; pre-send checks enforce suppression, consent, mailbox health, caps.

## SEO & GEO (Search) -- `stdlib/engine.search`
- **Purpose:** audit tracked pages, recommend and propose content changes, track rank + AI-search (GEO) readiness.
- **Operations:** `seo_geo.create_tracked_page`, `seo_geo.run_audit`, `seo_geo.audit_page`, `seo_geo.scan_all_pages` (D); `seo_geo.get_recommendation`, `seo_geo.get_readiness_view`, `seo_geo.get_page_performance` (Q); `seo_geo.publish_content_change`, `seo_geo.undo_content_change` (E).
- **Connections:** **Google Search Console REQUIRED** (Settings > Connected accounts) + the property (`connections.set_provider_setting` `gsc/site_url`, or `gtm apply --gsc-property`); GA4 optional; looot for keyword data.
- **Defaults:** the `seo` / `full-gtm` blueprints seed a daily audit play (`seo_geo.scan_all_pages`) and search metrics.
- **Verify live:** `gtm doctor` GSC line OK; `seo_geo.create_tracked_page` + `seo_geo.audit_page` on a real URL.
- **Gotchas:** `blueprint.apply` / `gtm apply --from <file>` hold back `seo_geo` plays until GSC is live. GSC is needed only by orgs that use SEO.

## Performance Ads -- `stdlib/engine.performance-ads`
- **Purpose:** spend sync, pacing recommendations, gated budget changes (real money).
- **Operations:** `perf_ads.sync_performance`, `perf_ads.scan_campaign`, `perf_ads.scan_all_campaigns` (D); `perf_ads.get_pacing_recommendation`, `perf_ads.get_campaign_performance` (Q); `perf_ads.update_campaign`, `perf_ads.undo_campaign_change` (E).
- **Connections:** Google Ads and/or Meta Ads.
- **Definitions:** `definition.unit_economics` key `default` (gross margin, CAC targets -> spend ceiling).
- **Verify live:** `perf_ads.sync_performance` returns real spend; `get_pacing_recommendation` on a live campaign.
- **Gotchas:** every budget change is a proposal a human approves; set unit economics before trusting pacing.

## Identity & data quality -- `stdlib/engine.identity-dq`
- **Operations:** `identity_dq.scan_duplicates`, `identity_dq.validate_records`, `identity_dq.quality_report` (Q); `identity_dq.normalize_records`, `identity_dq.backfill_domains`, `identity_dq.flag_invalid_records`, `identity_dq.scan` (D); `identity_dq.merge_records`, `identity_dq.unmerge_records` (E).
- **Verify live:** `identity_dq.quality_report` before and after an import / CRM sync.

## Not engines, but you will use them
- **Routing:** `routing.assign` (D) -- assignment rules over accounts.
- **Plays:** `play.simulate` (Q, zero writes -- always first), `play.trigger` (T); `runs.list` / `runs.get`, `flow.cancel`.
- **Research agent:** `research.request`, `research.queue`, `research.settings.get/set`.
- **Search index (vector search):** `gtm_query search.index_status` -- per type records / indexed / with vector / pending, the embedding model in use, or "no embedding provider" (search is then full-text only: add an OpenAI or Gemini key). `gtm_act search.reindex_now {types?}` (owner/admin) runs the daily reindex job now (one in flight per org) -- e.g. after adding an embedding key or a big import. Never `docker exec` to reindex.
- **CRM of record (via Composio):** `crm.settings.get` / `crm.settings.set {crmOfRecord}` (hubspot, salesforce, pipedrive, attio, zoho), `crm.sync`, `crm.sync_status`, `crm.update_record` (E), `crm.undo_update_record`. See the `composio` skill.

## Blueprints (start from the closest, then customise)
`outbound`, `seo`, `full-gtm`, `b2b-saas-sales-led`, `b2b-saas-plg`, `enterprise-abm`, `agency-services`,
`b2b-marketplace`, `devtools`, `dtc-b2c`. `gtm_query blueprint.list` / `blueprint.get` show what each sets up.
An applied blueprint makes its declared connections REQUIRED in readiness.

## Environments + publishing
- Every org has `dev`, `staging`, `prod` (prod = default, where runtime reads). Definitions are seeded in dev (`blueprint.apply` default; `gtm apply` without `--env` says which env) and reach prod only by sign + promote. MCP calls take an `environment` arg or the `x-gtmos-environment` header; none = prod. `config.promotion_status` says what is in dev but not live.
- Definition lifecycle: ChangeSet approved -> `definition.propose_for_signing` -> a DIFFERENT human signs (`definition.sign` / `definition.sign_many`; console Environments > Go live > "Review & sign all proposed"; CLI `gtm definition sign-all --env dev`) -> `env.promote {sourceKey: "dev", targetKey: "prod"}` (ONE approval for all; console "Promote dev -> prod"; CLI `gtm promote --all dev prod`) or `config.promote` for one resource (prod needs a signed source).
- Proposer != approver, always; only owner/admin hold approval.
