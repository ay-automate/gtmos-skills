---
name: gtmos-seo-programmatic
description: "Plan and run programmatic SEO: pages at scale from templates and data (templates, comparisons, integrations, personas, locations, glossary, directories) without thin content or index bloat. With GTM OS connected it validates demand from Search Console striking-distance queries and looot keyword data (seo_geo.keyword_opportunities, seo_geo.refresh_keyword_data), uses the org definitions and CRM data as the proprietary inputs, tracks and audits the launched pages, and proposes fixes through approval-gated publishes. Use for \"programmatic SEO\", \"pSEO\", \"pages at scale\", \"template pages\", \"location pages\", \"integration pages\", \"comparison pages at scale\", \"directory pages\", \"glossary pages\". For single comparison pages see gtmos-seo-competitor-pages."
license: MIT
metadata:
  version: "0.1.0"
  category: "seo"
  upstream: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/programmatic-seo"
  upstream_sha: "e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b"
  upstream_license: "MIT; Copyright (c) 2025 Corey Haines"
  merged_from: "https://github.com/AgriciDaniel/claude-seo/tree/6be93f45064ffbadced572b5d5c95f55fd263af0/skills/seo-programmatic"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Programmatic SEO

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`programmatic-seo`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/programmatic-seo) in coreyhaines31/marketingskills (MIT, Copyright (c) 2025 Corey Haines). Merged with [`seo-programmatic`](https://github.com/AgriciDaniel/claude-seo/tree/6be93f45064ffbadced572b5d5c95f55fd263af0/skills/seo-programmatic) from AgriciDaniel/claude-seo (MIT), kept in `references/seo-seo-programmatic.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md).

## With GTM OS connected

Programmatic pages are planned here and measured by the **SEO & GEO engine**. GTM OS does not generate or host pages: the pages are built in your CMS, then tracked, audited and improved through the engine. Google Search Console is required for this engine; check `instance.readiness` and `seo_geo.gsc_properties` first. Confirm each schema with `gtm_describe` before the first call.

**1. Validate demand with real data.**

| Read or run | Why |
|---|---|
| `seo_geo.keyword_opportunities {days, minImpressions, limit}` | Search Console queries in striking distance, with looot volume and Ahrefs rows when present. Shows which patterns already earn impressions. |
| `seo_geo.refresh_keyword_data {keywords, limit, locale}` | Pulls volume, difficulty and CPC for the pattern's head terms. It spends looot credit through the org's budget guard; a call over the ceiling returns `APPROVAL_REQUIRED` and buys nothing. Run `capability.quote {capability: "seo.keyword_data", args}` first for a large list. |
| `seo_geo.get_visibility` | The site's Search Console totals, top pages, Ahrefs metrics and competitors, if `seo_geo.run_visibility` has run. |
| `definition.persona`, `definition.segment`, `definition.customer_type` | The real segments for persona or industry playbooks ("[product] for [audience]"). Do not invent audiences the org does not sell to. |
| `brand.get` | Voice and forbidden claims for every template string. |
| `proof.list` (when available) | Any per-page stat, logo or result must be an active proof item. |

**2. Design the template with the method below.** Proprietary data beats public data: CRM aggregates (`records.aggregate`), product data the org owns and approved proof are the defensible inputs. Never pad a page with generated "facts".

**3. Track what you launch.** For each live page, `seo_geo.create_tracked_page {url, targetKeywords}` records it and queues its first audit. For a large set, track the hub pages and a representative sample per template, then `seo_geo.scan_all_pages` audits every tracked page in one batch.

**4. Fix through approvals.** `seo_geo.fix_queue` lists crawl, index and on-page issues per page; titles, meta descriptions, JSON-LD and body edits go through `seo_geo.publish_content_change` (E), which a different person approves (`seo_geo.publish_queue`, `runtime.list_approvals`). Bulk page creation in the CMS is not a GTM OS operation yet; publishing new pages through a CMS connection is planned (when available). In dry mode every publish stays a proposal.

**5. Measure.** `seo_geo.kpis {windowDays}` gives indexed share, clicks and impressions with a reason when a value is null; `seo_geo.get_page_performance` gives one page's history; `seo_geo.refresh_calendar` shows which pages are due for a re-audit. Report "not enough data yet" for pages younger than a few weeks.

## Without GTM OS

Use the method below with the user's own data: a keyword export (Search Console, Semrush, Ahrefs), the data source that fills the template, and their CMS. Check thin-content risk with the uniqueness gates in [references/seo-seo-programmatic.md](references/seo-seo-programmatic.md). Ship a small batch first, watch indexation in Search Console, then scale.

---

You are an expert in programmatic SEO—building SEO-optimized pages at scale using templates and data. Your goal is to create pages that rank, provide value, and avoid thin content penalties.

## Initial Assessment

**Check for context first:**
With GTM OS connected, read the org definitions named in *With GTM OS connected* above before asking anything. Without it, read `.agents/product-marketing.md` (or `.claude/product-marketing.md`) if it exists; `gtmos-marketing-positioning` writes that file. Ask only for what neither covers.

Before designing a programmatic SEO strategy, understand:

1. **Business Context**
   - What's the product/service?
   - Who is the target audience?
   - What's the conversion goal for these pages?

2. **Opportunity Assessment**
   - What search patterns exist?
   - How many potential pages?
   - What's the search volume distribution?

3. **Competitive Landscape**
   - Who ranks for these terms now?
   - What do their pages look like?
   - Can you realistically compete?

---

## Core Principles

### 1. Unique Value Per Page
- Every page must provide value specific to that page
- Not just swapped variables in a template
- Maximize unique content—the more differentiated, the better

### 2. Proprietary Data Wins
Hierarchy of data defensibility:
1. Proprietary (you created it)
2. Product-derived (from your users)
3. User-generated (your community)
4. Licensed (exclusive access)
5. Public (anyone can use—weakest)

### 3. Clean URL Structure
**Use subfolders, not subdomains** — subfolders consolidate domain authority while subdomains split it:
- Good: `yoursite.com/templates/resume/`
- Bad: `templates.yoursite.com/resume/`

### 4. Genuine Search Intent Match
Pages must actually answer what people are searching for.

### 5. Quality Over Quantity
Better to have 100 great pages than 10,000 thin ones.

### 6. Avoid Google Penalties
- No doorway pages
- No keyword stuffing
- No duplicate content
- Genuine utility for users

---

## The 12 Playbooks (Overview)

| Playbook | Pattern | Example |
|----------|---------|---------|
| Templates | "[Type] template" | "resume template" |
| Curation | "best [category]" | "best website builders" |
| Conversions | "[X] to [Y]" | "$10 USD to GBP" |
| Comparisons | "[X] vs [Y]" | "webflow vs wordpress" |
| Examples | "[type] examples" | "landing page examples" |
| Locations | "[service] in [location]" | "dentists in austin" |
| Personas | "[product] for [audience]" | "crm for real estate" |
| Integrations | "[product A] [product B] integration" | "slack asana integration" |
| Glossary | "what is [term]" | "what is pSEO" |
| Translations | Content in multiple languages | Localized content |
| Directory | "[category] tools" | "ai copywriting tools" |
| Profiles | "[entity name]" | "stripe ceo" |

**For detailed playbook implementation**: See [references/playbooks.md](references/playbooks.md). For uniqueness and index-bloat gates, see [references/seo-seo-programmatic.md](references/seo-seo-programmatic.md).

---

## Choosing Your Playbook

| If you have... | Consider... |
|----------------|-------------|
| Proprietary data | Directories, Profiles |
| Product with integrations | Integrations |
| Design/creative product | Templates, Examples |
| Multi-segment audience | Personas |
| Local presence | Locations |
| Tool or utility product | Conversions |
| Content/expertise | Glossary, Curation |
| Competitor landscape | Comparisons |

You can layer multiple playbooks (e.g., "Best coworking spaces in San Diego").

---

## Implementation Framework

### 1. Keyword Pattern Research

**Identify the pattern:**
- What's the repeating structure?
- What are the variables?
- How many unique combinations exist?

**Validate demand:**
- Aggregate search volume
- Volume distribution (head vs. long tail)
- Trend direction

### 2. Data Requirements

**Identify data sources:**
- What data populates each page?
- Is it first-party, scraped, licensed, public?
- How is it updated?

### 3. Template Design

**Page structure:**
- Header with target keyword
- Unique intro (not just variables swapped)
- Data-driven sections
- Related pages / internal links
- CTAs appropriate to intent

**Ensuring uniqueness:**
- Each page needs unique value
- Conditional content based on data
- Original insights/analysis per page

### 4. Internal Linking Architecture

**Hub and spoke model:**
- Hub: Main category page
- Spokes: Individual programmatic pages
- Cross-links between related spokes

**Avoid orphan pages:**
- Every page reachable from main site
- XML sitemap for all pages
- Breadcrumbs with structured data

### 5. Indexation Strategy

- Prioritize high-volume patterns
- Noindex very thin variations
- Manage crawl budget thoughtfully
- Separate sitemaps by page type

### 6. Choose the Build Platform

Check that the platform can hold the page count, refresh the data, render server-side HTML, branch on data for conditional sections, and control indexation per page. Prefer the existing site's CMS if it can; otherwise serve the set on a subpath of the main domain. Options and tradeoffs: [references/implementation-platforms.md](references/implementation-platforms.md).

---

## Quality Checks

### Pre-Launch Checklist

**Content quality:**
- [ ] Each page provides unique value
- [ ] Answers search intent
- [ ] Readable and useful

**Technical SEO:**
- [ ] Unique titles and meta descriptions
- [ ] Proper heading structure
- [ ] Schema markup implemented
- [ ] Page speed acceptable

**Internal linking:**
- [ ] Connected to site architecture
- [ ] Related pages linked
- [ ] No orphan pages

**Indexation:**
- [ ] In XML sitemap
- [ ] Crawlable
- [ ] No conflicting noindex

### Post-Launch Monitoring

Track: Indexation rate, Rankings, Traffic, Engagement, Conversion

Watch for: Thin content warnings, Ranking drops, Manual actions, Crawl errors

---

## Common Mistakes

- **Thin content**: Just swapping city names in identical content
- **Keyword cannibalization**: Multiple pages targeting same keyword
- **Over-generation**: Creating pages with no search demand
- **Poor data quality**: Outdated or incorrect information
- **Ignoring UX**: Pages exist for Google, not users

---

## Output Format

### Strategy Document
- Opportunity analysis
- Implementation plan
- Content guidelines

### Page Template
- URL structure
- Title/meta templates
- Content outline
- Schema markup

---

## Task-Specific Questions

1. What keyword patterns are you targeting?
2. What data do you have (or can acquire)?
3. How many pages are you planning?
4. What does your site authority look like?
5. Who currently ranks for these terms?
6. What's your technical stack?

---

## Related Skills

- **gtmos-seo-audit**: For auditing programmatic pages after launch
- **gtmos-seo-schema**: For adding structured data
- **gtmos-seo-site-architecture**: For page hierarchy, URL structure, and internal linking
- **gtmos-seo-competitor-pages**: For comparison page frameworks
