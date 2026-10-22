---
name: gtmos-seo-competitor-pages
description: "Build competitor comparison and alternative pages that rank and survive the competitor reading them: \"[Competitor] alternative\", \"alternatives to [Competitor]\", \"you vs [Competitor]\", \"[A] vs [B]\", feature and pricing tables, migration sections. With GTM OS connected it gathers dated, sourced competitor facts through the governed looot capabilities (research.extract_page, research.web_search, seo.serp_organic), takes every claim about your own product from the approved proof library, gates copy with brand.check_text, tracks the page in the SEO & GEO engine and proposes changes for a human to approve. Use for \"alternative page\", \"vs page\", \"competitor comparison\", \"comparison page\", \"[product] vs [product]\", \"switch from\", \"competitive landing pages\". For internal battle cards see gtmos-research-competitor."
license: MIT
metadata:
  version: "0.1.0"
  category: "seo"
  upstream: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/competitors"
  upstream_sha: "e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b"
  upstream_license: "MIT; Copyright (c) 2025 Corey Haines"
  merged_from: "https://github.com/AgriciDaniel/claude-seo/tree/6be93f45064ffbadced572b5d5c95f55fd263af0/skills/seo-competitor-pages"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Competitor and alternative pages

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`competitors`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/competitors) in coreyhaines31/marketingskills (MIT, Copyright (c) 2025 Corey Haines). Merged with [`seo-competitor-pages`](https://github.com/AgriciDaniel/claude-seo/tree/6be93f45064ffbadced572b5d5c95f55fd263af0/skills/seo-competitor-pages) from AgriciDaniel/claude-seo (MIT), kept in `references/seo-seo-competitor-pages.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md).

## With GTM OS connected

Comparison pages are public claims, so GTM OS treats them in two halves: facts about the competitor need a source and a date, and claims about you need approved proof. The page itself is tracked and improved by the **SEO & GEO engine**, which needs Google Search Console (check `instance.readiness` and `seo_geo.gsc_properties`). Confirm each schema with `gtm_describe` before the first call.

**1. Read before you write.**

| Read | Why |
|---|---|
| `policy.get_dry_mode`, `policy.engine_modes.get` | In dry mode a publish stays a proposal. Say so up front. |
| `brand.get` | Voice, avoided words and forbidden claims (comparative claims are often listed here). |
| `definition.persona`, `definition.segment` | Who the page is for, so "who it's for" sections match the real ICP. |
| `proof.list` (when available) | The only allowed source for your results, customer names, migration stories and metrics. Active proof only. |
| `voice.customer_language.list` (when available) | The words switchers use for their pain with the competitor. |
| `seo_geo.keyword_opportunities` | Whether "[competitor] alternative" or "vs" queries already earn impressions. |

**2. Gather competitor facts with sources.** Quote cost first with `capability.quote`, then use the governed capabilities through `capability.acquire`: `research.extract_page` for the competitor's pricing and feature pages, `research.web_search` and `research.news` for changes, `seo.serp_organic` for who ranks today. Within budget the data comes back directly; over a ceiling the call returns a proposal for a human. Record each fact with its URL and the date you read it. If the competitor is an account in the CRM, `research.request {subject: {objectType: "gtm.account", id}, kinds: ["company_profile"]}` queues the research agent instead. Ad-hoc exploration may use the `looot` skills directly.

**3. Draft with the method below.** Keep competitor facts, your interpretation and your recommendation in separate places, as the evidence rules say. Run `brand.check_text` on the page copy and fix every violation. A claim about your product with no active proof is cut or marked `[proof needed]`.

**4. Publish through approvals.** `seo_geo.create_tracked_page {url, targetKeywords}` tracks the live page and queues its audit. Title, meta, JSON-LD and body changes go through `seo_geo.publish_content_change` (E); a different person approves (`seo_geo.publish_queue`, `runtime.list_approvals`). Creating the page in the CMS is a manual step today.

**5. Keep it current.** Competitor pricing changes. `seo_geo.refresh_calendar` shows when the page is due for a re-audit; re-check every dated fact before you approve a republish.

## Without GTM OS

Follow the method below. Ask the user for the competitor (never guess it), their honest strengths and weaknesses, and their real proof. Read the competitor's own pages yourself and put an "as of" date and a source URL next to every fact. Leave unproven claims about your product as marked placeholders.

---

You are an expert in creating competitor comparison and alternative pages. Your goal is to build pages that rank for competitive search terms, provide genuine value to evaluators, and position your product effectively.

## Initial Assessment

**Check for context first:**
With GTM OS connected, read the org definitions named in *With GTM OS connected* above before asking anything. Without it, read `.agents/product-marketing.md` (or `.claude/product-marketing.md`) if it exists; `gtmos-marketing-positioning` writes that file. Ask only for what neither covers.

**Never guess the competitor.** If the request doesn't name one and the context file doesn't identify it, ask, and stop there. Don't draft a polished page around the most likely candidate.

Before creating competitor pages, understand:

1. **Your Product**
   - Core value proposition
   - Key differentiators
   - Ideal customer profile
   - Pricing model
   - Strengths and honest weaknesses

2. **Competitive Landscape**
   - Direct competitors
   - Indirect/adjacent competitors
   - Market positioning of each
   - Search volume for competitor terms

3. **Goals**
   - SEO traffic capture
   - Sales enablement
   - Conversion from competitor users
   - Brand positioning

---

## Core Principles

### 1. Honesty Builds Trust
- Acknowledge competitor strengths
- Be accurate about your limitations
- Don't misrepresent competitor features
- Readers are comparing—they'll verify claims

### 2. Depth Over Surface
- Go beyond feature checklists
- Explain *why* differences matter
- Include use cases and scenarios
- Show, don't just tell

### 3. Help Them Decide
- Different tools fit different needs
- Be clear about who you're best for
- Be clear about who competitor is best for
- Reduce evaluation friction

### 4. Modular Content Architecture
- Competitor data should be centralized
- Updates propagate to all pages
- Single source of truth per competitor

### 5. Evidence Discipline
Comparison pages are public claims about another company. Every one should survive the competitor's own team reading it.
- **"Not observed" is not "doesn't have."** A pricing page that doesn't list SSO is evidence about the page, not the product. Write "not listed on their pricing page (as of Mar 2026)" or drop the row. Use ✗ or "not available" only when their docs or a hands-on trial confirm the absence.
- **Date competitor facts.** Pricing and features change. Put an "as of" date on pricing tables and in the competitor data file, and re-verify before republishing.
- **One look is a snapshot.** A single visit can't support "they haven't changed pricing in years" or "no new features since 2024." That needs dated history (changelog, archived pages).
- **State what changed, not why.** "They moved SSO to the Enterprise tier" is a fact. "Because they're squeezing upmarket" is a guess. Leave motive out unless they've said it publicly.
- **Separate fact from interpretation.** Keep what their site says apart from what you think it means for the buyer, and keep both apart from what you recommend.

---

## Page Formats

### Format 1: [Competitor] Alternative (Singular)

**Search intent**: User is actively looking to switch from a specific competitor

**URL pattern**: `/alternatives/[competitor]` or `/[competitor]-alternative`

**Target keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

**Page structure**:
1. Why people look for alternatives (validate their pain)
2. Summary: You as the alternative (quick positioning)
3. Detailed comparison (features, service, pricing)
4. Who should switch (and who shouldn't)
5. Migration path
6. Social proof from switchers
7. CTA

---

### Format 2: [Competitor] Alternatives (Plural)

**Search intent**: User is researching options, earlier in journey

**URL pattern**: `/alternatives/[competitor]-alternatives`

**Target keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

**Page structure**:
1. Why people look for alternatives (common pain points)
2. What to look for in an alternative (criteria framework)
3. List of alternatives (you first, but include real options)
4. Comparison table (summary)
5. Detailed breakdown of each alternative
6. Recommendation by use case
7. CTA

**Important**: Include 4-7 real alternatives. Being genuinely helpful builds trust and ranks better.

**AI-answer expectations by stage**: these pages often earn *citations* in AI answers, but whether AI *recommends* your brand from them depends on offsite consensus (reviews, forums, analysts) — for emerging brands, a self-ranked list can surface the competitors in the AI answer while you get only the citation. Still publish for search intent and category framing, but set expectations accordingly — see ai-seo's citations-vs-recommendations reference for the data.

---

### Format 3: You vs [Competitor]

**Search intent**: User is directly comparing you to a specific competitor

**URL pattern**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`

**Target keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

**Page structure**:
1. TL;DR summary (key differences in 2-3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (testimonials from switchers)
7. Migration support
8. CTA

---

### Format 4: [Competitor A] vs [Competitor B]

**Search intent**: User comparing two competitors (not you directly)

**URL pattern**: `/compare/[competitor-a]-vs-[competitor-b]`

**Page structure**:
1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

**Why this works**: Captures search traffic for competitor terms, positions you as knowledgeable.

---

## Essential Sections

### TL;DR Summary
Start every page with a quick summary for scanners—key differences in 2-3 sentences.

### Paragraph Comparisons
Go beyond tables. For each dimension, write a paragraph explaining the differences and when each matters.

### Feature Comparison
For each category: describe how each handles it, list strengths and limitations, give bottom line recommendation.

### Pricing Comparison
Include tier-by-tier comparison, what's included, hidden costs, and total cost calculation for sample team size.

### Who It's For
Be explicit about ideal customer for each option. Honest recommendations build trust.

### Migration Section
Cover what transfers, what needs reconfiguration, support offered, and quotes from customers who switched.

**For detailed templates**: See [references/templates.md](references/templates.md)

---

## Content Architecture

### Centralized Competitor Data
Create a single source of truth for each competitor with:
- Positioning and target audience
- Pricing (all tiers)
- Feature ratings
- Strengths and weaknesses
- Best for / not ideal for
- Common complaints (from reviews)
- Migration notes

**For data structure and examples**: See [references/content-architecture.md](references/content-architecture.md)

---

## Research Process

### Deep Competitor Research

For each competitor, gather:

1. **Product research**: Sign up, use it, document features/UX/limitations
2. **Pricing research**: Current pricing, what's included, hidden costs
3. **Review mining**: G2, Capterra, TrustRadius for common praise/complaint themes
4. **Customer feedback**: Talk to customers who switched (both directions)
5. **Content research**: Their positioning, their comparison pages, their changelog

### Ongoing Updates

- **Quarterly**: Verify pricing, check for major feature changes
- **When notified**: Customer mentions competitor change
- **Annually**: Full refresh of all competitor data

### Competitive Asset Audit

When asked to check existing competitive content for stale or risky claims, audit every asset that makes claims about competitors: vs and alternative pages, battle cards, talk tracks, objection docs, and comparison tables in decks.

1. **List each claim** about a competitor, with the asset and line it lives in.
2. **Re-verify each claim** against the competitor's current site, docs, or changelog, and note the date you checked. If you can't browse, mark claims unchecked and list what to verify. Never mark one Current without a check date.
3. **Mark each one**:
   - **Current**: still true, source and date updated
   - **Changed**: now wrong, with what it says now
   - **Unverifiable**: had a source once, but nothing current confirms or rules it out. Soften to "not listed (as of date)" or remove
   - **Overclaimed**: stated as fact with no source behind it (an unconfirmed ✗, a guessed motive, a "why we win" with no evidence). Rewrite to what the evidence supports or remove
4. **Prioritize fixes**: public pages first (buyers and competitors read them), then anything reps say on calls, then internal docs.
5. **Report**: assets audited, claims checked, counts by status, and a fix list with the replacement wording.

Apply the Evidence Discipline rules above to every claim, including those in internal sales assets. Where several assets repeat one fact, fix it in the centralized competitor data so the fix carries through.

---

## SEO Considerations

### Keyword Targeting

| Format | Primary Keywords |
|--------|-----------------|
| Alternative (singular) | [Competitor] alternative, alternative to [Competitor] |
| Alternatives (plural) | [Competitor] alternatives, best [Competitor] alternatives |
| You vs Competitor | [You] vs [Competitor], [Competitor] vs [You] |
| Competitor vs Competitor | [A] vs [B], [B] vs [A] |

### Internal Linking
- Link between related competitor pages
- Link from feature pages to relevant comparisons
- Create hub page linking to all competitor content

### Schema Markup
Consider FAQ schema for common questions like "What is the best alternative to [Competitor]?"

---

## Output Format

### Competitor Data File
Complete competitor profile in YAML format for use across all comparison pages.

### Page Content
For each page: URL, meta tags, full page copy organized by section, comparison tables, CTAs.

### Page Set Plan
Recommended pages to create with priority order based on search volume.

### Asset Audit Report
Claims checked per asset, status counts (current / changed / unverifiable / overclaimed), and a prioritized fix list with replacement wording.

---

## Task-Specific Questions

1. What are common reasons people switch to you?
2. Do you have customer quotes about switching?
3. What's your pricing vs. competitors?
4. Do you offer migration support?

---

## Related Skills

- **gtmos-seo-programmatic**: For building competitor pages at scale
- **gtmos-content-copywriting**: For writing compelling comparison copy
- **gtmos-seo-audit**: For optimizing competitor pages
- **gtmos-seo-schema**: For FAQ and comparison schema
- **gtmos-sales-enablement**: For battle cards and internal sales collateral, decks, and objection docs
- **gtmos-research-competitor**: For the sourced competitor profile behind the page

The claude-seo version of this skill, with its page-type layouts and quality gates, is kept in [references/seo-seo-competitor-pages.md](references/seo-seo-competitor-pages.md).
