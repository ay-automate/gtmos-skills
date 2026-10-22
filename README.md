# GTM OS Skills

**Agent skills for marketing, SEO and GEO, outbound, leads, ads, CRM and RevOps, for Claude Code, Codex and any agent that reads `SKILL.md`.**

[![Skills](https://img.shields.io/badge/skills-94-0f766e)](#skills-index)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin%20marketplace-d97757)](#install)
[![Codex](https://img.shields.io/badge/Codex-.agents%2Fskills-111827)](#install)
[![CI](https://github.com/ay-automate/gtmos-skills/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

<!-- skills-count -->94<!-- /skills-count --> skills that teach an agent how go-to-market work is done well: cold outbound that gets replies, SEO audits with a fix queue, AI-search visibility, ICP scoring, pipeline reviews, forecasts, attribution, lifecycle email and more.

Each skill works on its own. An agent that loads one follows a tested method and asks for the inputs it lacks. It never invents a number or a customer quote. Connect [GTM OS](https://ay-automate.github.io/gtmos-releases/) and the same skill runs on your real data: your ICP, your brand voice, your proof library, your CRM, with every send, publish and budget change waiting for a person to approve it.

## Why these skills

- Many are adapted from the most used open marketing and SEO skills and from official skills published by HubSpot, Salesforce, Semrush, SE Ranking, Instantly, Apollo, Clay, Zapier and Resend. Every source, commit and licence is recorded in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
- Where two sources covered the same job, they were merged into one skill and the second source is kept as a reference.
- Proof, metrics and customer words come from a source you can check. Small samples are called small, and a missing input becomes a marked placeholder instead of a guess.
- Anything that reaches a customer or spends money is proposed, and a different person approves it.

## Categories

| Category | What is in it |
|---|---|
| Marketing | Positioning and product context, marketing plans, launches, lead magnets, CRO, customer research |
| SEO and GEO | Site and page audits, keyword research and clusters, content briefs, schema, programmatic SEO, competitor pages, backlinks, drift, Search Console, AI-search visibility |
| Outbound and leads | Cold email and multichannel outbound, prospecting, inbound triage, ICP scoring, lead routing, account research, the looot data skills |
| Ads | Paid campaigns, pacing against unit economics, ad creative |
| CRM and RevOps | Lifecycle and stages, data quality, pipeline review, forecast, call prep, follow-up, enablement, win-loss, battle cards, renewals, churn, lifecycle email |
| Analytics | Tracking, attribution, experiments, GTM reports |
| Content | Content strategy, copywriting, social, brand voice |
| Agents and ops | GTM OS setup and onboarding, the engine catalog, plays and recurring loops, connectors |

## Install

**With GTM OS (recommended).** `gtm init` installs every skill into `.claude/skills`, `.codex/skills` and `.agents/skills`, from a pinned release of this repository. It checks each file against the release manifest's sha-256 and falls back to the copy bundled with the CLI when you are offline.

```bash
npm install -g @gtmos/cli
gtm init
```

**Claude Code plugin marketplace.**

```text
/plugin marketplace add ay-automate/gtmos-skills
/plugin install gtmos-all@gtmos-skills
```

Install one category instead with `gtmos-marketing`, `gtmos-seo`, `gtmos-outbound`, `gtmos-ads`, `gtmos-crm`, `gtmos-analytics`, `gtmos-content` or `gtmos-agents`.

**Codex and other agents.** Copy the skills into the folder your agent reads:

```bash
git clone https://github.com/ay-automate/gtmos-skills.git
cp -r gtmos-skills/skills/* .agents/skills/     # Codex and agents that read .agents/skills
cp -r gtmos-skills/skills/* ~/.codex/skills/    # Codex, user-wide
```

**Manual.** Copy any single folder from `skills/` into `.claude/skills/` (project) or `~/.claude/skills/` (user). Keep `THIRD-PARTY-NOTICES.md` and `licenses/` with the skills you redistribute.

## How skills connect to GTM OS

Every adapted skill has two operating sections:

- *With GTM OS connected* lists the definitions to read first (ICP and scoring model, personas, brand voice, money settings, lanes), the operations to call in order with their class, where approvals happen and what dry mode does.
- *Without GTM OS* gives a plain path that works with whatever tools you have.

An agent reaches GTM OS through MCP (`gtm_describe`, `gtm_query`, `gtm_act`) or the `gtm` CLI. [docs/connecting-gtmos.md](docs/connecting-gtmos.md) lists the rules every skill follows and the operations per area.

## Skills index

<!-- skills-index:start -->

### Marketing (6)

Positioning, plans, launches, lead magnets, conversion and customer research.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-marketing-positioning`](skills/gtmos-marketing-positioning/SKILL.md) | Positioning and the product marketing context every other skill reads; drafts brand voice, personas and segments. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-marketing-plan`](skills/gtmos-marketing-plan/SKILL.md) | A full marketing or GTM plan grounded in the org's definitions and real KPIs. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-marketing-launch`](skills/gtmos-marketing-launch/SKILL.md) | Plan a product or feature launch across channels, with approval-gated sends. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-marketing-lead-magnets`](skills/gtmos-marketing-lead-magnets/SKILL.md) | Design lead magnets and wire their capture into tracking, forms and signals. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-marketing-cro`](skills/gtmos-marketing-cro/SKILL.md) | Raise conversion on pages and forms, measured with site tracking. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-research-customer`](skills/gtmos-research-customer/SKILL.md) | Customer research from calls, replies and deal notes, kept as the customer's own words. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |

### SEO and GEO (21)

Audits, keywords, content briefs, schema, links and AI-search visibility, run on the SEO and GEO engine.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-seo-engine`](skills/gtmos-seo-engine/SKILL.md) | Start here for SEO and GEO: engine readiness, Search Console, and which SEO skill fits the job. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gtmos-seo-audit`](skills/gtmos-seo-audit/SKILL.md) | Full-site technical and on-page SEO audit with a scored, prioritized fix queue. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [semrush/skills](https://github.com/semrush/skills) |
| [`gtmos-seo-page`](skills/gtmos-seo-page/SKILL.md) | Audit one page: on-page SEO, content quality, E-E-A-T and AI citation readiness. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gtmos-seo-geo`](skills/gtmos-seo-geo/SKILL.md) | GEO: get cited in ChatGPT, Perplexity, Gemini and AI Overviews, tracked with prompts and share of voice. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [seranking/seo-skills](https://github.com/seranking/seo-skills) |
| [`gtmos-seo-keyword-research`](skills/gtmos-seo-keyword-research/SKILL.md) | Keyword research and opportunity sizing from real keyword data and Search Console. | [semrush/skills](https://github.com/semrush/skills) |
| [`gtmos-seo-keyword-clusters`](skills/gtmos-seo-keyword-clusters/SKILL.md) | Cluster keywords by SERP overlap into hub-and-spoke topics with internal links. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [seranking/seo-skills](https://github.com/seranking/seo-skills) |
| [`gtmos-seo-content-brief`](skills/gtmos-seo-content-brief/SKILL.md) | Competitive content briefs for new and existing pages. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [semrush/skills](https://github.com/semrush/skills) |
| [`gtmos-seo-schema`](skills/gtmos-seo-schema/SKILL.md) | Detect, validate and generate Schema.org JSON-LD. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [semrush/skills](https://github.com/semrush/skills) |
| [`gtmos-seo-programmatic`](skills/gtmos-seo-programmatic/SKILL.md) | Programmatic SEO pages at scale without thin content or index bloat. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gtmos-seo-competitor-pages`](skills/gtmos-seo-competitor-pages/SKILL.md) | Comparison and alternative pages with sourced competitor claims and approved proof. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gtmos-seo-backlinks`](skills/gtmos-seo-backlinks/SKILL.md) | Backlink profile audit, gaps and link building that lifts rankings and AI citations. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [semrush/skills](https://github.com/semrush/skills) |
| [`gtmos-seo-drift`](skills/gtmos-seo-drift/SKILL.md) | Baseline SEO-critical elements and catch regressions before rankings drop. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gtmos-seo-search-console`](skills/gtmos-seo-search-console/SKILL.md) | Search Console, indexation and Core Web Vitals data for SEO decisions. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gtmos-seo-site-architecture`](skills/gtmos-seo-site-architecture/SKILL.md) | Site structure, URL hierarchy, sitemaps and internal linking. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo), [semrush/skills](https://github.com/semrush/skills) |
| [`gtmos-seo-plan`](skills/gtmos-seo-plan/SKILL.md) | An SEO strategy and roadmap from competitive analysis and the content calendar. | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) |
| [`gsc`](skills/gsc/SKILL.md) | Google Search Console in GTM OS (required for the SEO and GEO engine). | GTM OS |
| [`looot-google-serp`](skills/looot-google-serp/SKILL.md) | Read a Google results page. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-domain-keywords`](skills/looot-domain-keywords/SKILL.md) | The keywords a domain ranks for. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-keyword-volume`](skills/looot-keyword-volume/SKILL.md) | Search volume for keywords. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-backlink-checker`](skills/looot-backlink-checker/SKILL.md) | Check a domain's backlinks. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-ai-search-visibility`](skills/looot-ai-search-visibility/SKILL.md) | How a brand shows up in AI answers. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |

### Outbound and leads (28)

Cold outreach, prospecting, inbound triage, ICP scoring, routing, account research and the data layer.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-outreach-cold-email`](skills/gtmos-outreach-cold-email/SKILL.md) | Cold email and multichannel outbound drafted on the Outreach engine; every send approved by a person. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [Instantly-ai/instantly-skills](https://github.com/Instantly-ai/instantly-skills) |
| [`gtmos-leads-prospecting`](skills/gtmos-leads-prospecting/SKILL.md) | Build and qualify prospect lists with quoted, verified data and ICP scoring. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [apolloio/apollo-mcp-plugin](https://github.com/apolloio/apollo-mcp-plugin) |
| [`gtmos-leads-inbound-triage`](skills/gtmos-leads-inbound-triage/SKILL.md) | Score, route and answer inbound leads inside the SLA. | [salesforce/salesforce-skills](https://github.com/salesforce/salesforce-skills) |
| [`gtmos-score-icp`](skills/gtmos-score-icp/SKILL.md) | Define the ICP and account tiers as a signed scoring model, explained per account. | [clay-run/clay-skill-creator](https://github.com/clay-run/clay-skill-creator) |
| [`gtmos-routing-lead-ownership`](skills/gtmos-routing-lead-ownership/SKILL.md) | Find the right owner for every lead and audit that no lead is left behind. | [zapier/gtm-cheat-codes](https://github.com/zapier/gtm-cheat-codes), [HubSpot/agent-cli-skills](https://github.com/HubSpot/agent-cli-skills) |
| [`gtmos-research-account`](skills/gtmos-research-account/SKILL.md) | A one-page account brief where every fact has a source. | [clay-run/clay-skill-creator](https://github.com/clay-run/clay-skill-creator) |
| [`gmail`](skills/gmail/SKILL.md) | Gmail sending and reply ingestion in GTM OS. | GTM OS |
| [`resend`](skills/resend/SKILL.md) | Resend as a GTM OS sender. | GTM OS |
| [`unipile`](skills/unipile/SKILL.md) | LinkedIn steps through Unipile in GTM OS (human-only sends). | GTM OS |
| [`cal-com`](skills/cal-com/SKILL.md) | Cal.com booking in GTM OS. | GTM OS |
| [`webform`](skills/webform/SKILL.md) | Inbound web forms into GTM OS. | GTM OS |
| [`gtmos-looot`](skills/gtmos-looot/SKILL.md) | Read first for any looot work in GTM OS: the governed data-acquisition layer. | GTM OS |
| [`looot-resources`](skills/looot-resources/SKILL.md) | Where the rest of looot lives: docs, SDKs, MCP installs and recipes. | GTM OS |
| [`looot`](skills/looot/SKILL.md) | looot base skill: one sign-in to 2,500+ data endpoints, priced before every run. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-enrich-a-company`](skills/looot-enrich-a-company/SKILL.md) | Enrich a company from its domain. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-enrich-a-person`](skills/looot-enrich-a-person/SKILL.md) | Enrich a person from name and company. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-find-professional-emails`](skills/looot-find-professional-emails/SKILL.md) | Find a work email. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-email-verification`](skills/looot-email-verification/SKILL.md) | Verify an email before sending. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-company-email-format`](skills/looot-company-email-format/SKILL.md) | Find a company's email format. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-find-phone-numbers`](skills/looot-find-phone-numbers/SKILL.md) | Find a direct dial or mobile number. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-company-list-builder`](skills/looot-company-list-builder/SKILL.md) | Build a company list from filters. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-local-business-search`](skills/looot-local-business-search/SKILL.md) | Search local businesses. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-job-postings`](skills/looot-job-postings/SKILL.md) | Pull job postings as hiring signals. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-reddit-search`](skills/looot-reddit-search/SKILL.md) | Search Reddit posts and comments. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-tiktok-search`](skills/looot-tiktok-search/SKILL.md) | Search TikTok content. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-youtube-transcript`](skills/looot-youtube-transcript/SKILL.md) | Get a YouTube video's transcript. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-google-maps-reviews`](skills/looot-google-maps-reviews/SKILL.md) | Read Google Maps reviews. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |
| [`looot-amazon-product`](skills/looot-amazon-product/SKILL.md) | Read an Amazon product page. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |

### Ads (4)

Paid campaigns and creative, with spend changes that a person approves.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-ads-campaigns`](skills/gtmos-ads-campaigns/SKILL.md) | Plan, audit and pace Google, Meta and LinkedIn campaigns against real unit economics. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-ads-creative`](skills/gtmos-ads-creative/SKILL.md) | Ad creative at scale: hooks, variants and tests, with claims checked against approved proof. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`ads`](skills/ads/SKILL.md) | Google Ads and Meta Ads connectors in GTM OS. | GTM OS |
| [`looot-meta-ads-library`](skills/looot-meta-ads-library/SKILL.md) | Read the Meta Ads Library for competitor ads. | [loootai/looot-skills](https://github.com/loootai/looot-skills) (verbatim) |

### CRM and RevOps (16)

Lifecycle, data quality, pipeline, forecast, call prep, follow-up, win-loss, renewals and churn.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-revops-lifecycle`](skills/gtmos-revops-lifecycle/SKILL.md) | Lead lifecycle, stages, handoffs and the RevOps model behind them. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-crm-data-quality`](skills/gtmos-crm-data-quality/SKILL.md) | Find duplicates and bad data, normalize, and propose reversible merges. | [HubSpot/agent-cli-skills](https://github.com/HubSpot/agent-cli-skills) |
| [`gtmos-crm-pipeline-review`](skills/gtmos-crm-pipeline-review/SKILL.md) | Pipeline review: stuck deals, missing next steps, slipped dates and single-threaded deals. | [HubSpot/hubspot-mcp-plugins](https://github.com/HubSpot/hubspot-mcp-plugins), [salesforce/salesforce-skills](https://github.com/salesforce/salesforce-skills) |
| [`gtmos-crm-forecast`](skills/gtmos-crm-forecast/SKILL.md) | A forecast built from real deal data, with every number traced to its source. | [salesforce/salesforce-skills](https://github.com/salesforce/salesforce-skills) |
| [`gtmos-sales-call-prep`](skills/gtmos-sales-call-prep/SKILL.md) | Brief a rep before a meeting from the account's history, signals and committee. | [HubSpot/hubspot-mcp-plugins](https://github.com/HubSpot/hubspot-mcp-plugins) |
| [`gtmos-sales-follow-up`](skills/gtmos-sales-follow-up/SKILL.md) | After a call: next steps, a follow-up draft and proposed CRM updates. | [HubSpot/hubspot-mcp-plugins](https://github.com/HubSpot/hubspot-mcp-plugins) |
| [`gtmos-sales-enablement`](skills/gtmos-sales-enablement/SKILL.md) | Decks, one-pagers, demo scripts and objection handling built on approved proof. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [salesforce/salesforce-skills](https://github.com/salesforce/salesforce-skills) |
| [`gtmos-sales-win-loss`](skills/gtmos-sales-win-loss/SKILL.md) | Win-loss review from closed deals, calls and replies, honest about sample size. | [salesforce/salesforce-skills](https://github.com/salesforce/salesforce-skills) |
| [`gtmos-research-competitor`](skills/gtmos-research-competitor/SKILL.md) | Competitor profiles and battle cards where every claim has a source and a date. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-lifecycle-renewal-radar`](skills/gtmos-lifecycle-renewal-radar/SKILL.md) | Renewal runway, account health and save or expand plays. | [HubSpot/hubspot-mcp-plugins](https://github.com/HubSpot/hubspot-mcp-plugins) |
| [`gtmos-lifecycle-churn`](skills/gtmos-lifecycle-churn/SKILL.md) | Reduce churn with cancel flows, save offers and health signals. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-lifecycle-email`](skills/gtmos-lifecycle-email/SKILL.md) | Lifecycle and nurture email sequences on an approved sending lane. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills), [resend/resend-skills](https://github.com/resend/resend-skills) |
| [`gtmos-source-mapping`](skills/gtmos-source-mapping/SKILL.md) | Map any connected app's records into the GTM OS ontology. | GTM OS |
| [`hubspot`](skills/hubspot/SKILL.md) | HubSpot through the GTM OS connector. | GTM OS |
| [`salesforce`](skills/salesforce/SKILL.md) | Salesforce through the GTM OS connector. | GTM OS |
| [`google-calendar`](skills/google-calendar/SKILL.md) | Google Calendar meetings in GTM OS. | GTM OS |

### Analytics (5)

Tracking, attribution, experiments and GTM reporting where every number names its source.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-analytics-tracking`](skills/gtmos-analytics-tracking/SKILL.md) | Site tracking, events, UTMs and conversions that reach the ad platforms. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-analytics-attribution`](skills/gtmos-analytics-attribution/SKILL.md) | Attribution models and reconciling conflicting numbers, without pretending a model is causal. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-analytics-experiments`](skills/gtmos-analytics-experiments/SKILL.md) | Design A/B tests and growth experiments with sample sizes that hold up. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-analytics-gtm-report`](skills/gtmos-analytics-gtm-report/SKILL.md) | Weekly GTM and pipeline reports where every figure names the operation behind it. | [HubSpot/agent-cli-skills](https://github.com/HubSpot/agent-cli-skills), [zapier/gtm-cheat-codes](https://github.com/zapier/gtm-cheat-codes) |
| [`ga4`](skills/ga4/SKILL.md) | Google Analytics 4 in GTM OS. | GTM OS |

### Content (4)

Content strategy, copywriting, social and the brand voice gate.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-content-strategy`](skills/gtmos-content-strategy/SKILL.md) | Decide what content to make and why, from search data and customer language. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-content-copywriting`](skills/gtmos-content-copywriting/SKILL.md) | Write and edit marketing copy in the brand voice, with claims backed by proof. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-content-social`](skills/gtmos-content-social/SKILL.md) | LinkedIn and social content, scheduling and engagement triage. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-content-brand-voice`](skills/gtmos-content-brand-voice/SKILL.md) | Codify the brand voice as a signed definition and check copy against it. | [zapier/gtm-cheat-codes](https://github.com/zapier/gtm-cheat-codes) |

### Agents and ops (10)

Setup, onboarding, the engine catalog, plays and loops, and the connectors agents run on.

| Skill | What it does | Source |
|---|---|---|
| [`gtmos-ops-marketing-loops`](skills/gtmos-ops-marketing-loops/SKILL.md) | Turn recurring GTM work into plays and agent triggers that propose and wait for a person. | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) |
| [`gtmos-setup`](skills/gtmos-setup/SKILL.md) | Install, connect and configure GTM OS from an empty folder. | GTM OS |
| [`gtmos-onboarding`](skills/gtmos-onboarding/SKILL.md) | Guide one organization through the GTM OS setup wizard over MCP. | GTM OS |
| [`gtmos-engine-catalog`](skills/gtmos-engine-catalog/SKILL.md) | The GTM OS engines, what each reads and how to verify it live. | GTM OS |
| [`composio`](skills/composio/SKILL.md) | Composio in GTM OS: connected apps, CRM of record, data sources and outbound rails. | GTM OS |
| [`mcp`](skills/mcp/SKILL.md) | Use any MCP server's tools as GTM OS capability backends. | GTM OS |
| [`nango`](skills/nango/SKILL.md) | Nango-backed connections in GTM OS. | GTM OS |
| [`model-providers`](skills/model-providers/SKILL.md) | Anthropic, OpenAI and Gemini as GTM OS model providers. | GTM OS |
| [`output-docgen`](skills/output-docgen/SKILL.md) | Generate DOCX and PDF documents through GTM OS. | GTM OS |
| [`slack`](skills/slack/SKILL.md) | Slack in GTM OS: workspace connection, channels, people matching and approvals. | GTM OS |

<!-- skills-index:end -->

## Powered by GTM OS

GTM OS is a self-hosted go-to-market system: one ontology for accounts, people, deals and signals, and engines for scoring, enrichment, signals, outreach, SEO and GEO, paid ads and data quality. Agents work on it through MCP with your definitions and your approval rules. These skills are how an agent knows what good work looks like; GTM OS is where that work runs on real data.

- Releases and install: [github.com/ay-automate/gtmos-releases](https://github.com/ay-automate/gtmos-releases)
- Documentation: [ay-automate.github.io/gtmos-releases](https://ay-automate.github.io/gtmos-releases/)

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/authoring.md](docs/authoring.md), then run `node scripts/skills.mjs lint` before you open a pull request.

## License

MIT for the content written for this repository ([LICENSE](LICENSE)). Adapted and vendored skills keep their upstream licences (MIT or Apache-2.0); see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and [licenses/](licenses/).
