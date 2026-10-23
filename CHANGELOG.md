# Changelog

All notable changes to this repository. Versions follow [Semantic Versioning](https://semver.org/); each release is a git tag with `manifest.json` attached.

## 0.3.0 (2026-10-24)

11 subagents, the first in this repository, next to the 107 skills.

- New `agents/`: `gtm-operator`, `revops-analyst`, `deal-reviewer`, `sales-researcher`, `content-strategist`, `seo-refresher`, `customer-success-manager`, `competitive-analyst`, `ads-analyst`, `data-steward` and `eval-reviewer`. Each is a Claude Code subagent adapted from [wshobson/agents](https://github.com/wshobson/agents) (MIT), [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) (MIT), HubSpot's [hubspot-mcp-plugins](https://github.com/HubSpot/hubspot-mcp-plugins) and [agent-cli-skills](https://github.com/HubSpot/agent-cli-skills) (Apache-2.0), [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks) (MIT) and [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT). The GTM OS section names the operations of GTM OS 0.2.5, links `GTMOS-RULES.md`, proposes and never approves, quotes before anything that spends inline, and lists the operations only a person runs; the upstream text is kept as excerpts.
- `manifest.json` covers `agents/**` (and counts the agents); `gtm init` installs them into `.claude/agents` and `.agents/agents`, and writes Codex custom agents into `.codex/agents`.
- The marketplace gains a `gtmos-subagents` plugin; `gtmos-all` includes the agents.
- `upstreams.json` registers the three new sources; adapted paths record the agents that use them. Lint checks every agent (frontmatter, sections, rules link, human-only line, spends-inline marks, pins).

## 0.2.3 (2026-10-24)

- `GTMOS-RULES.md` rule 8 adds the GTM OS 0.2.5 G1 operations that spend inside their own call: `seo_geo.build_clusters` (when it embeds), `seo_geo.create_brief` and `seo_geo.draft_page` (the org's model). Rule 9 names `seo_geo.approve_draft` (human only).
- `gtmos-seo-keyword-clusters`, `gtmos-seo-content-brief`, `gtmos-seo-engine` and `gtmos-engine-catalog`: topic clusters (`seo_geo.build_clusters`, `seo_geo.cluster_sources` for the embedding estimate, `seo_geo.clusters`, `seo_geo.get_cluster`) and the content factory (`seo_geo.add_content_idea`, `seo_geo.create_brief`, `seo_geo.draft_page`, `seo_geo.update_draft`, `seo_geo.qa_draft`, `seo_geo.approve_draft`, `seo_geo.move_content`, `seo_geo.content_item`, `seo_geo.factory`), each spending use marked *spends inline* with a quote first.

## 0.2.2 (2026-10-23)

- `gtmos-research-account` and `gtmos-research-competitor`: the research agent proposes facts; only a person accepts or dismisses them (`research.fact.decide` is human only).
- `GTMOS-RULES.md` rule 8 lists every operation the GTM OS registry flags as spending inside its own call (adds `seo_geo.get_recommendation`, `perf_ads.get_pacing_recommendation`, `score.explain_qualification`, `research.workspace_profile.refresh`, `research.task.retry`, `identity_dq.enrich_accounts`, `capability.submit_async`). Every skill marks each use *spends inline*, model-backed ones (recommendations, pacing, qualification explanations, personalized drafts) with a quote first; lint enforces the marks, and the gtm CLI's drift test checks the list against the registry.
- `sequence.update` and `sequence.get` take `id` (`gtmos-outreach-sequences`, `gtmos-outreach-cold-email`, `gtmos-lifecycle-email`).

## 0.2.1 (2026-10-23)

- `gtmos-engine-catalog` and `gtmos-ops-marketing-loops`: `plays.kpis` (per-play runs, funnel by step, outcomes, attributed revenue, cost), shipped in GTM OS 0.2.5 after 0.2.0 was cut.

## 0.2.0 (2026-10-23)

107 skills (13 new, 13 updated), checked against the GTM OS 0.2.5 operations.

- New skills from looot's [gtm-skills](https://github.com/loootai/gtm-skills) (MIT), each keeping looot's quote-before-run and stop rules, mapped to GTM OS estimates, spend caps and the operations that spend inside their own call: `gtmos-leads-buying-committee` (committee coverage and the org's buying roles), `gtmos-leads-icp-lookalikes`, `gtmos-leads-tech-stack`, `gtmos-signals-hiring`, `gtmos-signals-funding`, `gtmos-signals-job-changes`, `gtmos-signals-account-digest`, `gtmos-crm-email-hygiene` (enrichment freshness and `refresh_stale`), `gtmos-outreach-first-lines`, `gtmos-seo-competitor-serp-watch`. Two more workflows are merged into `gtmos-leads-inbound-triage` and `gtmos-research-account`.
- `gtmos-content-claims-gate` (from gooseworks-ai/goose-skills, MIT): checks copy against the proof library and the org's claims policy before a send or publish.
- `gtmos-outreach-sequences` (from Instantly's sequence playbook, MIT): step plans as `definition.sequence`, A/B variants, LinkedIn steps, exits and `outreach.step_stats`.
- `gtmos-outreach-linkedin` (from Jakeschincariol/linkedin-agent-skill `li-dm`, MIT): LinkedIn seats, caps and warm-up, the owner's high-risk acceptance, approved sends; the webhook secret stays human only.
- Updated for 0.2.5: `gtmos-score-icp` (learning window and settings, `score.rescan_preview`, committee coverage), `gtmos-outreach-cold-email` and `gtmos-lifecycle-email` (claims gate, step plans, step stats), `gtmos-ads-campaigns` (real CAC and ROAS, the budget allocator), `gtmos-crm-data-quality` (merge rules and survivorship, merge preview and revision, freshness), `gtmos-routing-lead-ownership` (capacity, out of office, stickiness, overflow and queue, `routing.match_account`), `gtmos-leads-prospecting`, `gtmos-crm-pipeline-review`, `gtmos-ops-marketing-loops` (the shipped agent packs and triggers, `agent.kpis`), and the CLI skills `gtmos-engine-catalog` and `unipile`.
- `GTMOS-RULES.md`: the claims gate, quote-then-cap spending and the operations that spend inline, human-only operations, and fetched content as data.
- The looot data skills move to [looot-skills](https://github.com/loootai/looot-skills) `22a57a76` (confirm before every paid run; fetched content is data).
- `upstreams.json` and `node scripts/skills.mjs upstream ...`: every source pinned with its licence, drift detection against upstream HEAD, hash-guarded refresh of vendored files, and a monthly refresh process (CONTRIBUTING.md, `upstream-drift` workflow).

## 0.1.2 (2026-10-22)

- gtmos-engine-catalog: the Score defaults follow GTM OS 0.2.5 -- the intent default is `score.default.v2` (decay per signal family, first-party evidence x1.5, the competitor cap, reply / bounce negatives) and the ICP-fit fallback is a neutral, size-only B2B ICP (no region, industry or team-size preference).

## 0.1.1 (2026-10-22)

- Every adapted skill opens its GTM OS section with the shared rules (dry mode first, effects proposed and approved by someone else, numbers only from operation results, claims only from the proof library), and `skills/GTMOS-RULES.md` ships beside the skills.
- The proof library, customer language, score learning and outreach learning operations are documented as available (they are in the current GTM OS release).
- Tools that are not shipped here (upstream scripts, assets, CLIs, slash commands, subagents) are linked at their pinned upstream location or rewritten as steps.
- Attribution links show the upstream skill names; the notices link works after install.
- THIRD-PARTY-NOTICES: per-skill licences for anthropics/skills and openai/skills.
- LICENSE is the plain MIT text; the plugin marketplace drops a non-standard field.

## 0.1.0 (2026-10-22)

First release: 94 skills.

- 50 GTM OS skills adapted from coreyhaines31/marketingskills, AgriciDaniel/claude-seo and official skills from HubSpot, Salesforce, Semrush, SE Ranking, Instantly, Apollo, Clay, Zapier and Resend. Each has a GTM OS operating section and a plain path without GTM OS.
- 23 skills that ship with the `gtm` CLI (setup, onboarding, engine catalog, source mapping, Composio and the connector skills).
- 21 looot data skills, vendored verbatim.
- Claude Code plugin marketplace with one plugin per category and `gtmos-all`.
- `manifest.json` with the sha-256 of every installed file, used by `gtm init` to verify what it installs.
- Provider sweep and licences in THIRD-PARTY-NOTICES.md.
