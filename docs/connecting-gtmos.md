# How the skills use GTM OS

Every skill in this repository works on its own. When [GTM OS](https://ay-automate.github.io/gtmos-releases/) is connected, the same skill runs on your organization's real data, definitions and approval rules instead of on whatever you paste into the chat. This page explains that connection: how an agent reaches GTM OS, the rules every skill follows, and the operations each area uses.

## Connecting

There are two ways in, and both reach the same operation registry:

| Route | Read | Write or propose | Discover |
|---|---|---|---|
| MCP (Claude Code, Codex, any MCP client) | `gtm_query {"name":"<op>","input":{...}}` | `gtm_act {"name":"<op>","input":{...}}` | `gtm_describe {"name":"<op>"}` |
| The `gtm` CLI and the REST API | `GET /v1/operations/<op>?input=<json>` | `POST /v1/operations/<op>` | `gtm describe <op>` |

`gtm init` writes the MCP wiring (`.mcp.json`), installs these skills under `.claude/skills`, `.codex/skills` and `.agents/skills`, and drops the operation reference at `docs/gtmos/reference/`. The agent key lives in the `GTMOS_AGENT_TOKEN` environment variable, never in a file.

A skill decides it is connected when `gtm_describe` answers (or `gtm describe` runs against an instance). If neither works, the skill follows its **Without GTM OS** path.

## The rules every skill follows

1. **Read the schema before the call.** Run `gtm_describe` on an operation before the first call in a session. Operation names in these skills are checked against GTM OS 0.2.5, but the live registry wins if it differs.
2. **Definitions before questions.** The org's signed definitions already hold the ICP, personas, brand voice, money settings and more. A skill reads them first and asks the user only for what is missing.
3. **Classes tell you what happens.** Q reads. D writes data. T moves a stage. E is a customer-facing effect (a send, a publish, a campaign change, a CRM write-back, a merge): the call **proposes**, and a different human approves it under *Needs a human*. M changes configuration and is usually human-only. An agent never approves its own proposal.
4. **Dry mode holds.** Read `policy.get_dry_mode` and `policy.engine_modes.get` first. In dry mode every E path ends at a draft or a proposal; the skill says so and stops there.
5. **No invented data.** Numbers come from an operation result, quoted with the operation that produced it. When a KPI has too little data, say "not enough data yet" and why. Proof, logos, metrics and customer quotes come from the proof library only (`proof.list`, when available). Customer words come from `voice.customer_language.list` (when available). Anything else is labelled as a hypothesis.
6. **Brand gate before anything leaves.** Run copy through `brand.check_text` before proposing a send or a publish. A violating draft is blocked at send time anyway.
7. **Spend is real.** Quote before buying data (`capability.quote`, or `estimate: true` on enrichment) and stay inside the org's caps (`policy.guardrails.get`).

## Org definitions the skills read

| Definition | What it holds | Typical reader |
|---|---|---|
| `definition.scoring_model` | ICP fit (`icp_fit`), intent (`default`) and signal (`signals`) scoring rules and thresholds | Score, prospecting, inbound triage |
| `definition.persona`, `definition.segment`, `definition.customer_type` | Who you sell to, in your own words | Prospecting, outreach, ads audiences |
| `definition.committee_model` | Buying-committee roles and champion | Account research, ABM, call prep |
| `definition.brand_voice` | Tone, preferred and avoided words, forbidden claims, voice samples | Every copy skill |
| `definition.lane`, `definition.suppression_rule`, `definition.compliance_policy` | Sending channels, caps, who must never be contacted | Outreach |
| `definition.reply_labels` | Reply categories and their effects | Reply handling |
| `definition.money`, `definition.unit_economics` | Revenue truth, attribution window, FX, margins and CAC targets | Attribution, ads pacing, reporting |
| `definition.journey`, `definition.stage_map`, `definition.stage_machine`, `definition.deal_taxonomy` | Lifecycle stages and deal types | RevOps, pipeline review, lifecycle |
| `definition.identity_rule`, `definition.data_monitor` | Matching, survivorship, data checks | Data quality |
| `definition.play`, `definition.predicate` | Automations and reusable conditions | Marketing loops, plays |
| `definition.metric` | Derived KPIs | Reporting |

Read one with `gtm_query config.get {"kind":"definition.brand_voice","key":"default","env":"prod"}`, or `onboarding.get` during setup. Some areas have a dedicated read that is easier to use, such as `brand.get` for the brand voice and `money.settings.get` for money. New or changed definitions are drafted and proposed (`config.propose_changeset`); a human signs them.

## Operations by area

The class follows each name. Treat this as a map; `gtm_describe` is the authority.

**Records and CRM.** `records.search` Q, `records.get` Q, `records.list` Q, `records.aggregate` Q, `records.provenance` Q, `records.create` D, `records.update` D, `account.relationship` Q, `contact.relationship` Q, `crm.dashboard` Q, `crm.sync_status` Q, `crm.update_record` E, `deal.advance_stage` T, `deal.move_stage` D, `deal.close` D, `pipeline.list` Q, `task.create` D, `task.list` Q, `activity.list` Q, `activity.log` D, `meeting.get` Q, `transcripts.list` Q, `transcripts.get` Q, `journey.funnel` Q, `journey.position` Q, `buying_roles.list` Q.

**Score.** `score.score_account` D, `score.score_contact` D, `score.list_ranked` Q, `score.account_tiers` Q, `score.explain_subject` Q, `score.explain_qualification` D, `score.rescan_organization` D, `score.kpis` Q. When available (0.2.5 learning loop): `score.learn` D, `score.learning_report` Q, `score.feedback` D.

**Signals and research.** `signals.list` Q, `signals.feed` Q, `signals.score` Q, `signals.surge_report` Q, `signals.review_queue` Q, `signals.record` D, `signals.verify` D, `signals.scan_now` D, `research.request` D, `research.queue` Q, `research.subject.get` Q, `research.fact.decide` D.

**Enrichment and data quality.** `capability.quote` Q, `enrichment.enrich_accounts` D, `enrichment.enrich_contacts` D, `enrichment.coverage_report` Q, `identity_dq.scan_duplicates` Q, `identity_dq.validate_records` Q, `identity_dq.quality_report` Q, `identity_dq.flag_invalid_records` D, `identity_dq.normalize_records` D, `identity_dq.undo_normalization` D, `identity_dq.merge_records` E, `identity_dq.unmerge_records` E.

**Routing.** `routing.assign` D, `routing.reconcile` D, `territory.match` Q, `territory.upsert` D.

**Outreach.** `outreach.draft_message` D, `outreach.draft_personalized_message` D, `outreach.send_message` E, `outreach.undo_send_message` D, `outreach.sending_mailboxes` Q, `outreach.kpis` Q, `sequence.create` D, `sequence.enroll` D, `sequence.list` Q, `sequence.messages` Q, `sequence.replies` Q, `replies.list` Q, `replies.classify` D, `reply_labels.get` Q, `brand.get` Q, `brand.check_text` Q, `consent.get` Q. When available: `outreach.learning_report` Q (what is working).

**Proof and customer language (when available, 0.2.5).** `proof.list` Q, `proof.get` Q, `proof.create` D, `proof.extract_from_document` D, `proof.propose_activation` M, `voice.customer_language.list` Q, `voice.customer_language.mine` D. Only *active* proof may back a claim.

**SEO and GEO.** Google Search Console is required for this engine. `seo_geo.create_tracked_page` D, `seo_geo.audit_page` D, `seo_geo.run_audit` D, `seo_geo.scan_all_pages` D, `seo_geo.get_recommendation` Q, `seo_geo.get_readiness_view` Q, `seo_geo.get_page_performance` Q, `seo_geo.fix_queue` Q, `seo_geo.keyword_opportunities` Q, `seo_geo.refresh_keyword_data` D, `seo_geo.run_visibility` D, `seo_geo.get_visibility` Q, `seo_geo.create_tracked_prompt` D, `seo_geo.list_visibility_alerts` Q, `seo_geo.publish_queue` Q, `seo_geo.refresh_calendar` Q, `seo_geo.gsc_properties` Q, `seo_geo.kpis` Q, `seo_geo.publish_content_change` E, `seo_geo.undo_content_change` E. Keyword, SERP and AI-answer data come through the looot capabilities (`seo.keyword_data`, `seo.serp_organic`, `geo.answer_*`).

**Performance Ads.** `perf_ads.sync_performance` D, `perf_ads.get_campaign_performance` Q, `perf_ads.get_pacing_recommendation` Q, `perf_ads.scan_campaign` D, `perf_ads.scan_all_campaigns` D, `perf_ads.kpis` Q, `perf_ads.update_campaign` E, `perf_ads.undo_campaign_change` E.

**Money, tracking and reporting.** `money.settings.get` Q, `money.attribution` Q, `money.revenue` Q, `money.reconcile` Q, `tracking.sources` Q, `tracking.activity` Q, `tracking.site.get` Q, `product_analytics.sync` D, `query.engine_kpis` Q, `metric.evaluate` Q, `actions.kpis` Q, `sync.health` Q, `sync.completeness` Q.

**Plays, agents and approvals.** `plays.catalog` Q, `plays.explain` Q, `play.simulate` Q (zero writes, always first), `play.trigger` T, `agent.trigger.list` Q, `agent.run_list` Q, `runtime.list_approvals` Q, `runtime.get_approval` Q, `policy.get_dry_mode` Q, `policy.engine_modes.get` Q, `policy.guardrails.get` Q, `instance.readiness` Q, `channel.deliver` E.

## When a step needs a human

The skill says it plainly and stops: what it proposed, the approval id from the result, and where the approver finds it (*Needs a human* in the console, or `runtime.list_approvals`). It never retries an E-class call to get around a rejection.
