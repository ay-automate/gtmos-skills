# Third-party notices

GTM OS Skills is MIT-licensed (see [LICENSE](LICENSE)) for the content written by AY Automate. Many skills are adapted from, or copy, skills published by others. Their licences and copyright notices are kept here and in [licenses/](licenses/), and every adapted skill names its source, the pinned commit and its licence in its frontmatter (`metadata.upstream`, `metadata.upstream_sha`, `metadata.upstream_license`) and in its attribution line.

- **MIT** sources: the copyright notice and permission notice are reproduced in `licenses/`. Adapted skills state what changed.
- **Apache-2.0** sources: the licence text is in `licenses/`, any NOTICE file is carried (`licenses/NOTICE-*.txt`), and each adapted file states that it was modified. Files under a skill's `references/` that come from an Apache-2.0 source are unchanged apart from the removed frontmatter, which their header states.
- Sources without a licence, or with a licence that does not allow copying, are **reference only**: they are linked here and were not copied.

Every repository below was checked on 2026-10-22 with the GitHub API (licence as reported by GitHub, default-branch commit at that time).

## Provider sweep

| Group | Provider | Repository | Commit | Licence | Verdict | Notes |
|---|---|---|---|---|---|---|
| Named sources | Corey Haines (marketing) | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | [`e85f3cbc`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b) | MIT | included | 31 upstream skills adapted into 29 GTM OS skills |
|  | AgriciDaniel (SEO) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | [`6be93f45`](https://github.com/AgriciDaniel/claude-seo/tree/6be93f45064ffbadced572b5d5c95f55fd263af0) | MIT | included | 16 upstream skills adapted into 14 GTM OS skills; its Python scripts and extensions are not copied |
| Data and agent layer | looot | [loootai/looot-skills](https://github.com/loootai/looot-skills) | [`895723ab`](https://github.com/loootai/looot-skills/tree/895723ab082be3e36d19754872c204a5a2f4a5ec) | MIT | included | 21 skills vendored verbatim, pinned at 895723ab (upstream HEAD has moved; the bump is a later release) |
|  | looot | [loootai/gtm-skills](https://github.com/loootai/gtm-skills) | [`1cb22eed`](https://github.com/loootai/gtm-skills/tree/1cb22eede6829b8f9fa87a78e6957a97e4032bd5) | MIT | reference only | 15 GTM workflows, scheduled for the next vendoring round |
|  | Composio | [ComposioHQ/composio](https://github.com/ComposioHQ/composio) | [`e0c6cd2b`](https://github.com/ComposioHQ/composio/tree/e0c6cd2be76e998fdb6b504420d721b7c98f3d7c) | MIT | reference only | `skills/composio` overlaps GTM OS's own `composio` skill, which covers the GTM OS rails |
|  | Composio | [ComposioHQ/composio-mcp-plugin](https://github.com/ComposioHQ/composio-mcp-plugin) | [`bbcb9ccc`](https://github.com/ComposioHQ/composio-mcp-plugin/tree/bbcb9ccce59090642ca6dad5d6f0fa485c303539) | MIT | reference only | MCP plugin wrapper, no GTM job |
| CRMs | HubSpot | [HubSpot/agent-cli-skills](https://github.com/HubSpot/agent-cli-skills) | [`a015a489`](https://github.com/HubSpot/agent-cli-skills/tree/a015a48982b922279d8521677b7c72b0acfb9506) | Apache-2.0 | included | crm-data-quality, bulk-operations, sales-reporting, team-ownership |
|  | HubSpot | [HubSpot/hubspot-mcp-plugins](https://github.com/HubSpot/hubspot-mcp-plugins) | [`032d294b`](https://github.com/HubSpot/hubspot-mcp-plugins/tree/032d294bc91577cb1b9c4a61372567266ca8524e) | Apache-2.0 | included | call-prep, follow-up, pipeline-pulse, renewal-radar |
|  | Salesforce | [salesforce/salesforce-skills](https://github.com/salesforce/salesforce-skills) | [`6b989d64`](https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04) | Apache-2.0 | included | lead-triage, win-loss-review, pipeline-review, forecast-narrative, handle-objection |
|  | Salesforce | [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) | [`e44b5001`](https://github.com/forcedotcom/sf-skills/tree/e44b5001dbd6faf912387e8633a192b764d77fed) | Apache-2.0 | reference only | developer, DevOps and Agentforce tooling, not GTM jobs |
|  | Pipedrive | [pipedrive/pipedrive-skills](https://github.com/pipedrive/pipedrive-skills) | [`31eb297e`](https://github.com/pipedrive/pipedrive-skills/tree/31eb297ecf3ba325676b442264b76743ede00667) | Apache-2.0 | reference only | forecast and deal-triage are driven by bundled Python scripts and a local config; the method is covered by the Salesforce and HubSpot sources |
|  | Attio | [attio/skills](https://github.com/attio/skills) | [`07b30d4c`](https://github.com/attio/skills/tree/07b30d4c0e60fe80253cb9f73249729304168276) | none | reference only | no licence published |
|  | Zoho | [zoho/crm-skills](https://github.com/zoho/crm-skills) | [`72dc3fb0`](https://github.com/zoho/crm-skills/tree/72dc3fb0d98c7e2b12fd3ad99758ad9b8684426c) | none | reference only | no licence published |
| Google | Google Ads, GA4 | [google/skills](https://github.com/google/skills) | [`2826afea`](https://github.com/google/skills/tree/2826afea139f84afdc99dab8e69f555c775e1ac5) | Apache-2.0 | reference only | API developer skills (Google Ads API, GA4 Data and Admin API); GTM OS reaches these through its connectors |
|  | Google Ads, GA4 | [googleanalytics/google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp) | [`ce84226b`](https://github.com/googleanalytics/google-analytics-mcp/tree/ce84226bf4cedea7f2910f5afb07a6b9138f6553) | Apache-2.0 | reference only | an MCP server, no skills |
|  | Google Ads, GA4 | [googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp) | [`9a78cbdc`](https://github.com/googleads/google-ads-mcp/tree/9a78cbdceebae71a6bc8483bdec333695834ef9c) | Apache-2.0 | reference only | an MCP server, no skills |
|  | Search Console, Gmail, Calendar | none | | | none found | no official skills published |
| Ads | Meta | [facebook/agentic-tools](https://github.com/facebook/agentic-tools) | [`bd75b27f`](https://github.com/facebook/agentic-tools/tree/bd75b27f355dad8a2ade908239b82d6250ce2aab) | MIT | reference only | developer tools (webhooks, tokens, app review), no ads skills |
|  | LinkedIn | none | | | none found | no official skills published |
|  | TikTok | none | | | none found | only small community repos; not used |
| SEO | Ahrefs | [ahrefs/ahrefs-api-skills](https://github.com/ahrefs/ahrefs-api-skills) | [`7e777771`](https://github.com/ahrefs/ahrefs-api-skills/tree/7e777771deefe378d3e0967c4ccd8b41dd07920c) | Apache-2.0 | reference only | Python API client usage; GTM OS reaches Ahrefs through Composio |
|  | Ahrefs | [ahrefs/ahrefs-mcp-server](https://github.com/ahrefs/ahrefs-mcp-server) | [`ca0e1e99`](https://github.com/ahrefs/ahrefs-mcp-server/tree/ca0e1e9996739f690287c396a5ad6e92255aec22) | none | reference only | no licence published |
|  | Semrush | [semrush/skills](https://github.com/semrush/skills) | [`019ab369`](https://github.com/semrush/skills/tree/019ab369403c0e816707edae6194fa3bb47dfcd0) | Apache-2.0 | included | keyword-research, technical-seo-audit, content-brief, schema-markup, backlink-audit, internal-link-audit |
|  | SE Ranking | [seranking/seo-skills](https://github.com/seranking/seo-skills) | [`fd6d1408`](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba) | MIT | included | seo-ai-search-share-of-voice, seo-keyword-cluster |
| Email and outreach | Resend | [resend/resend-skills](https://github.com/resend/resend-skills) | [`b2ae7b17`](https://github.com/resend/resend-skills/tree/b2ae7b1798b70134faf679f35fc05b4331462988) | MIT | included | email-best-practices |
|  | Instantly | [Instantly-ai/instantly-skills](https://github.com/Instantly-ai/instantly-skills) | [`ae104f34`](https://github.com/Instantly-ai/instantly-skills/tree/ae104f34af8a70225a6474c3b89b26ce785a6b61) | MIT | included | sequence-writer |
|  | Apollo | [apolloio/apollo-mcp-plugin](https://github.com/apolloio/apollo-mcp-plugin) | [`bd0513c9`](https://github.com/apolloio/apollo-mcp-plugin/tree/bd0513c961f02105492fcff0d7d29c9cccf1ed23) | MIT | included | prospect |
|  | Unipile | none | | | none found | no official skills published |
|  | lemlist | none | | | none found | no official skills published |
|  | Smartlead | none | | | none found | no official skills; a small community repo exists and is not used |
| Messaging and Microsoft | Slack | [slackapi/slack-skills-plugin](https://github.com/slackapi/slack-skills-plugin) | [`9aa77f18`](https://github.com/slackapi/slack-skills-plugin/tree/9aa77f187c355f0caad9fea19a5667fbbeae59f0) | MIT | reference only | Slack app development; GTM OS's `slack` skill covers its integration |
|  | Microsoft Graph and Teams | [microsoft/skills](https://github.com/microsoft/skills) | [`a779d00c`](https://github.com/microsoft/skills/tree/a779d00cf3749577a7777422ab6dee9e66dcb2e2) | MIT | reference only | Azure and SDK skills, no Graph or Teams GTM jobs |
|  | Microsoft Graph and Teams | [MicrosoftDocs/Agent-Skills](https://github.com/MicrosoftDocs/Agent-Skills) | [`33e96303`](https://github.com/MicrosoftDocs/Agent-Skills/tree/33e9630334bdbf0a7919ea7ce7af7a73e0a0e396) | CC-BY-4.0 | reference only | Azure documentation skills |
| Billing and analytics | Stripe | [stripe/ai](https://github.com/stripe/ai) | [`326ea8b5`](https://github.com/stripe/ai/tree/326ea8b521de0ce42e69d43451ef47a6e87206ef) | MIT | reference only | payments integration skills |
|  | PostHog | [PostHog/skills](https://github.com/PostHog/skills) | [`e170b274`](https://github.com/PostHog/skills/tree/e170b274dcaf13d3fe614c907a8fd36b86fac85f) | MIT | reference only | product analytics setup; GTM OS reads usage through `product_analytics.sync` |
|  | Mixpanel | [mixpanel/ai-plugins](https://github.com/mixpanel/ai-plugins) | [`dad3c11d`](https://github.com/mixpanel/ai-plugins/tree/dad3c11dbd2b4e2cc2c521efd6e81ae7c2f1bd57) | Apache-2.0 | reference only | Mixpanel workspace skills |
|  | Amplitude | [amplitude/mcp-marketplace](https://github.com/amplitude/mcp-marketplace) | [`5b688be4`](https://github.com/amplitude/mcp-marketplace/tree/5b688be467553f38edb79b89f24d0ac8109c9f27) | MIT | reference only | Amplitude workspace skills |
|  | Amplitude | [amplitude/builder-skills](https://github.com/amplitude/builder-skills) | [`51838c2d`](https://github.com/amplitude/builder-skills/tree/51838c2d85560466d1bbc174ea0e645bb9c44ea9) | none | reference only | no licence published |
| Calls | Gong | [gong-io/call-playbook](https://github.com/gong-io/call-playbook) | [`7fd1d6e4`](https://github.com/gong-io/call-playbook/tree/7fd1d6e42ca90035fc720ed3d1ba130934ff2a34) | MIT | reference only | a research dataset on call segments, not skills |
|  | Fireflies | none | | | none found | no official skills published |
|  | Fathom | none | | | none found | no official skills published |
|  | Zoom | [zoom/skills](https://github.com/zoom/skills) | [`9a18f14b`](https://github.com/zoom/skills/tree/9a18f14b5cebd3aa022ef1565e1dbdc5d315b193) | MIT | reference only | Zoom SDK and API developer skills |
| CMS | Webflow | [webflow/webflow-skills](https://github.com/webflow/webflow-skills) | [`75af2b73`](https://github.com/webflow/webflow-skills/tree/75af2b737f58ceeb290dfe72703045c312cf0b94) | MIT | reference only | CMS and site skills; candidates once GTM OS publishes to Webflow |
|  | WordPress | [WordPress/agent-skills](https://github.com/WordPress/agent-skills) | [`eff3785f`](https://github.com/WordPress/agent-skills/tree/eff3785fc28c4380d172094518c66a6a997c95d4) | NOASSERTION | reference only | licence not asserted (NOASSERTION) |
| Models and workflow tools | Anthropic | [anthropics/skills](https://github.com/anthropics/skills) | [`dbd4588f`](https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44) | none | reference only | no repository licence; used as the skill format reference |
|  | OpenAI | [openai/skills](https://github.com/openai/skills) | [`49f948fa`](https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431) | none | reference only | no licence published |
|  | OpenRouter | [OpenRouterTeam/skills](https://github.com/OpenRouterTeam/skills) | [`33597a44`](https://github.com/OpenRouterTeam/skills/tree/33597a44e38b0cdc38ea1256ef8bcf50c2704e3d) | none | reference only | no licence published |
|  | Clay | [clay-run/clay-skill-creator](https://github.com/clay-run/clay-skill-creator) | [`fbb9149b`](https://github.com/clay-run/clay-skill-creator/tree/fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf) | MIT | included | account-tier-scoring, icp-matrix-builder, company-research-brief |
|  | Clay | [clay-run/agent-plugins](https://github.com/clay-run/agent-plugins) | [`b9952b68`](https://github.com/clay-run/agent-plugins/tree/b9952b68b24f592bfc3b50b3b6e4ec4e7949467d) | none | reference only | no licence published |
|  | Zapier | [zapier/gtm-cheat-codes](https://github.com/zapier/gtm-cheat-codes) | [`022a2884`](https://github.com/zapier/gtm-cheat-codes/tree/022a2884f40316ef22269e29fd61b8a0f0c4cb4a) | MIT | included | find-lead-account-owner, no-lead-left-behind-lead-treatment-audit, brand-guidelines-builder, campaign-postmortem |
|  | Zapier | [zapier/agent-skills](https://github.com/zapier/agent-skills) | [`bc159bc5`](https://github.com/zapier/agent-skills/tree/bc159bc55f967ffe232180bf14da748444aea3f4) | MIT | reference only | Zapier workflow management |
|  | n8n | [n8n-io/skills](https://github.com/n8n-io/skills) | [`27b6b9f4`](https://github.com/n8n-io/skills/tree/27b6b9f429ac0be90cae764512dbc579d7107e95) | Apache-2.0 | reference only | n8n workflow building; GTM OS plays are the workflow layer |

## Included sources

### coreyhaines31/marketingskills

- Upstream: https://github.com/coreyhaines31/marketingskills at [`e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b)
- Licence: MIT. Copyright (c) 2025 Corey Haines. Full text: [licenses/MIT-coreyhaines31-marketingskills.txt](licenses/MIT-coreyhaines31-marketingskills.txt)
- Used: `product-marketing` → `gtmos-marketing-positioning`; `marketing-plan` → `gtmos-marketing-plan`; `launch` → `gtmos-marketing-launch`; `lead-magnets` → `gtmos-marketing-lead-magnets`; `cro` → `gtmos-marketing-cro`; `customer-research` → `gtmos-research-customer`; `seo-audit` → `gtmos-seo-audit`; `ai-seo` → `gtmos-seo-geo`; `schema` → `gtmos-seo-schema`; `programmatic-seo` → `gtmos-seo-programmatic`; `competitors` → `gtmos-seo-competitor-pages`; `link-building` → `gtmos-seo-backlinks`; `site-architecture` → `gtmos-seo-site-architecture`; `cold-email` → `gtmos-outreach-cold-email`; `prospecting` → `gtmos-leads-prospecting`; `ads` → `gtmos-ads-campaigns`; `ad-creative` → `gtmos-ads-creative`; `revops` → `gtmos-revops-lifecycle`; `sales-enablement` → `gtmos-sales-enablement`; `competitor-profiling` → `gtmos-research-competitor`; `churn-prevention` → `gtmos-lifecycle-churn`; `emails` → `gtmos-lifecycle-email`; `analytics` → `gtmos-analytics-tracking`; `conversion-tracking` → `gtmos-analytics-tracking`; `attribution` → `gtmos-analytics-attribution`; `ab-testing` → `gtmos-analytics-experiments`; `content-strategy` → `gtmos-content-strategy`; `copywriting` → `gtmos-content-copywriting`; `copy-editing` → `gtmos-content-copywriting`; `social` → `gtmos-content-social`; `marketing-loops` → `gtmos-ops-marketing-loops`

### AgriciDaniel/claude-seo

- Upstream: https://github.com/AgriciDaniel/claude-seo at [`6be93f45064ffbadced572b5d5c95f55fd263af0`](https://github.com/AgriciDaniel/claude-seo/tree/6be93f45064ffbadced572b5d5c95f55fd263af0)
- Licence: MIT. Copyright (c) 2026 agricidaniel. Full text: [licenses/MIT-AgriciDaniel-claude-seo.txt](licenses/MIT-AgriciDaniel-claude-seo.txt)
- Used: `seo` → `gtmos-seo-engine`; `seo-audit` → `gtmos-seo-audit`; `seo-technical` → `gtmos-seo-audit`; `seo-page` → `gtmos-seo-page`; `seo-content` → `gtmos-seo-page`; `seo-geo` → `gtmos-seo-geo`; `seo-cluster` → `gtmos-seo-keyword-clusters`; `seo-content-brief` → `gtmos-seo-content-brief`; `seo-schema` → `gtmos-seo-schema`; `seo-programmatic` → `gtmos-seo-programmatic`; `seo-competitor-pages` → `gtmos-seo-competitor-pages`; `seo-backlinks` → `gtmos-seo-backlinks`; `seo-drift` → `gtmos-seo-drift`; `seo-google` → `gtmos-seo-search-console`; `seo-sitemap` → `gtmos-seo-site-architecture`; `seo-plan` → `gtmos-seo-plan`

### HubSpot/agent-cli-skills

- Upstream: https://github.com/HubSpot/agent-cli-skills at [`a015a48982b922279d8521677b7c72b0acfb9506`](https://github.com/HubSpot/agent-cli-skills/tree/a015a48982b922279d8521677b7c72b0acfb9506)
- Licence: Apache-2.0. HubSpot, Inc (repository owner; the licence file has no copyright line). Full text: [licenses/Apache-2.0-HubSpot-agent-cli-skills.txt](licenses/Apache-2.0-HubSpot-agent-cli-skills.txt)
- Used: `team-ownership` → `gtmos-routing-lead-ownership`; `crm-data-quality` → `gtmos-crm-data-quality`; `bulk-operations` → `gtmos-crm-data-quality`; `sales-reporting` → `gtmos-analytics-gtm-report`

### HubSpot/hubspot-mcp-plugins

- Upstream: https://github.com/HubSpot/hubspot-mcp-plugins at [`032d294bc91577cb1b9c4a61372567266ca8524e`](https://github.com/HubSpot/hubspot-mcp-plugins/tree/032d294bc91577cb1b9c4a61372567266ca8524e)
- Licence: Apache-2.0. HubSpot, Inc (repository owner; the licence file has no copyright line). Full text: [licenses/Apache-2.0-HubSpot-hubspot-mcp-plugins.txt](licenses/Apache-2.0-HubSpot-hubspot-mcp-plugins.txt)
- Used: `pipeline-pulse` → `gtmos-crm-pipeline-review`; `call-prep` → `gtmos-sales-call-prep`; `follow-up` → `gtmos-sales-follow-up`; `renewal-radar` → `gtmos-lifecycle-renewal-radar`

### salesforce/salesforce-skills

- Upstream: https://github.com/salesforce/salesforce-skills at [`6b989d6490589647c4c164f7f55c2797cf322f04`](https://github.com/salesforce/salesforce-skills/tree/6b989d6490589647c4c164f7f55c2797cf322f04)
- Licence: Apache-2.0. Copyright (c) 2026 Salesforce, Inc.. Full text: [licenses/Apache-2.0-salesforce-salesforce-skills.txt](licenses/Apache-2.0-salesforce-salesforce-skills.txt)
- Used: `lead-triage` → `gtmos-leads-inbound-triage`; `pipeline-review` → `gtmos-crm-pipeline-review`; `forecast-narrative` → `gtmos-crm-forecast`; `handle-objection` → `gtmos-sales-enablement`; `win-loss-review` → `gtmos-sales-win-loss`

### semrush/skills

- Upstream: https://github.com/semrush/skills at [`019ab369403c0e816707edae6194fa3bb47dfcd0`](https://github.com/semrush/skills/tree/019ab369403c0e816707edae6194fa3bb47dfcd0)
- Licence: Apache-2.0. Copyright 2026 Semrush Inc.. Full text: [licenses/Apache-2.0-semrush-skills.txt](licenses/Apache-2.0-semrush-skills.txt), [licenses/NOTICE-semrush-skills.txt](licenses/NOTICE-semrush-skills.txt)
- Used: `technical-seo-audit` → `gtmos-seo-audit`; `keyword-research` → `gtmos-seo-keyword-research`; `content-brief` → `gtmos-seo-content-brief`; `schema-markup` → `gtmos-seo-schema`; `backlink-audit` → `gtmos-seo-backlinks`; `internal-link-audit` → `gtmos-seo-site-architecture`

### seranking/seo-skills

- Upstream: https://github.com/seranking/seo-skills at [`fd6d1408f2e6a06454d81c07c29e0f04342eb9ba`](https://github.com/seranking/seo-skills/tree/fd6d1408f2e6a06454d81c07c29e0f04342eb9ba)
- Licence: MIT. Copyright (c) 2026 SE Ranking. Full text: [licenses/MIT-seranking-seo-skills.txt](licenses/MIT-seranking-seo-skills.txt)
- Used: `seo-ai-search-share-of-voice` → `gtmos-seo-geo`; `seo-keyword-cluster` → `gtmos-seo-keyword-clusters`

### Instantly-ai/instantly-skills

- Upstream: https://github.com/Instantly-ai/instantly-skills at [`ae104f34af8a70225a6474c3b89b26ce785a6b61`](https://github.com/Instantly-ai/instantly-skills/tree/ae104f34af8a70225a6474c3b89b26ce785a6b61)
- Licence: MIT. Copyright (c) 2026 Instantly.ai. Full text: [licenses/MIT-Instantly-ai-instantly-skills.txt](licenses/MIT-Instantly-ai-instantly-skills.txt)
- Used: `sequence-writer` → `gtmos-outreach-cold-email`

### apolloio/apollo-mcp-plugin

- Upstream: https://github.com/apolloio/apollo-mcp-plugin at [`bd0513c961f02105492fcff0d7d29c9cccf1ed23`](https://github.com/apolloio/apollo-mcp-plugin/tree/bd0513c961f02105492fcff0d7d29c9cccf1ed23)
- Licence: MIT. Copyright (c) 2025 Apollo.io. Full text: [licenses/MIT-apolloio-apollo-mcp-plugin.txt](licenses/MIT-apolloio-apollo-mcp-plugin.txt)
- Used: `prospect` → `gtmos-leads-prospecting`

### zapier/gtm-cheat-codes

- Upstream: https://github.com/zapier/gtm-cheat-codes at [`022a2884f40316ef22269e29fd61b8a0f0c4cb4a`](https://github.com/zapier/gtm-cheat-codes/tree/022a2884f40316ef22269e29fd61b8a0f0c4cb4a)
- Licence: MIT. Copyright (c) Zapier, Inc.. Full text: [licenses/MIT-zapier-gtm-cheat-codes.txt](licenses/MIT-zapier-gtm-cheat-codes.txt)
- Used: `find-lead-account-owner` → `gtmos-routing-lead-ownership`; `no-lead-left-behind-lead-treatment-audit` → `gtmos-routing-lead-ownership`; `campaign-postmortem` → `gtmos-analytics-gtm-report`; `brand-guidelines-builder` → `gtmos-content-brand-voice`

### clay-run/clay-skill-creator

- Upstream: https://github.com/clay-run/clay-skill-creator at [`fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf`](https://github.com/clay-run/clay-skill-creator/tree/fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf)
- Licence: MIT. Copyright (c) 2026 Clay. Full text: [licenses/MIT-clay-run-clay-skill-creator.txt](licenses/MIT-clay-run-clay-skill-creator.txt), [licenses/NOTICE-clay-run-clay-skill-creator.txt](licenses/NOTICE-clay-run-clay-skill-creator.txt)
- Used: `account-tier-scoring` → `gtmos-score-icp`; `icp-matrix-builder` → `gtmos-score-icp`; `company-research-brief` → `gtmos-research-account`

### resend/resend-skills

- Upstream: https://github.com/resend/resend-skills at [`b2ae7b1798b70134faf679f35fc05b4331462988`](https://github.com/resend/resend-skills/tree/b2ae7b1798b70134faf679f35fc05b4331462988)
- Licence: MIT. Copyright (c) 2026 Resend. Full text: [licenses/MIT-resend-resend-skills.txt](licenses/MIT-resend-resend-skills.txt)
- Used: `email-best-practices` → `gtmos-lifecycle-email`

### loootai/looot-skills

- Upstream: https://github.com/loootai/looot-skills at [`895723ab082be3e36d19754872c204a5a2f4a5ec`](https://github.com/loootai/looot-skills/tree/895723ab082be3e36d19754872c204a5a2f4a5ec)
- Licence: MIT. Copyright (c) 2026 looot. Full text: [licenses/MIT-loootai-looot-skills.txt](licenses/MIT-loootai-looot-skills.txt)
- Used: the `looot` skill and the 20 `looot-*` skills, copied verbatim (unmodified).

## Trademarks

Product names (HubSpot, Salesforce, Pipedrive, Semrush, SE Ranking, Instantly, Apollo, Clay, Zapier, Resend, Google, looot and others) are trademarks of their owners. Their use here describes compatibility and origin; it does not imply endorsement.
