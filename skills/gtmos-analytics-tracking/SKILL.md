---
name: gtmos-analytics-tracking
description: Plan, set up, verify and debug analytics and conversion tracking -- tracking plans, event naming, UTMs, GA4 and Google Tag Manager, form and booking conversions, ad click ids, offline conversions and AI-assistant traffic. With GTM OS connected it installs and verifies the GTM OS website tracker (tracking.site.create, tracking.verify), reads traffic sources and per-account activity (tracking.sources, tracking.activity), routes form leads through the webform connector and reads GA4 and Search Console through their connectors, so web visits become touches the attribution model can credit. Use for "set up tracking", "tracking plan", "GA4", "Google Tag Manager", "UTM parameters", "conversion tracking", "my conversions aren't showing", "Meta pixel", "CAPI", "enhanced conversions", "gclid", "offline conversions", "track form submissions", "AI traffic from ChatGPT". For attribution models see gtmos-analytics-attribution.
license: MIT
metadata:
  version: "0.1.0"
  category: "analytics"
  upstream: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/analytics"
  upstream_sha: "e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b"
  upstream_license: "MIT; Copyright (c) 2025 Corey Haines"
  merged_from: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/conversion-tracking"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Analytics and conversion tracking

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`analytics`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/analytics) in coreyhaines31/marketingskills (MIT, Copyright (c) 2025 Corey Haines). Merged with [`conversion-tracking`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/conversion-tracking) from coreyhaines31/marketingskills (MIT), kept in `references/corey-conversion-tracking.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

GTM OS has its own first-party website tracker. It ties anonymous visits to contacts and companies, classifies each visit's source, and feeds those visits to the attribution model as touches. Your job is to install it, prove it works, and make the rest of the stack (GA4, GTM, ad pixels, forms) agree with it. Confirm each schema with `gtm_describe` before the first call.

**1. Read what is already there.**

| Read | Why |
|---|---|
| `tracking.site.get` | The tracked site, its allowed domains, settings and install snippets, or `null` when tracking is not set up. |
| `instance.readiness` | Whether the GA4, Search Console and webform connectors are live for this org. |
| `tracking.sources {days}` | Page views, visitors and contacts per source, medium and campaign over 7, 30 or 90 days. Empty means nothing is installed yet, not zero traffic. |
| `money.settings.get` | The attribution window and model the visits will feed. |
| `consent.get` on a contact, `policy.get_dry_mode` | Consent state and dry mode before anything person-level. |

**2. Install the tracker.** `tracking.site.create {allowedDomains}` mints the public site key and returns two snippets: a plain `<script>` tag and a Google Tag Manager Custom HTML tag. There is one site per org; if one exists, change it with `tracking.site.update` (domains, subdomains, cross-domain linking, Do-Not-Track, cookie lifetime, pause). These are owner or admin settings: if your key is refused, hand the exact call to the user. Hand the snippet to whoever owns the site; never edit a production site yourself.

**3. Decide on click ids.** By default the tracker records only which ad click ids were present (gclid, gbraid, wbraid, msclkid, fbclid, li_fat_id, ttclid). `tracking.site.update {captureClickIds: true}` keeps their values so deals can be matched back to ad clicks; browsers sending Global Privacy Control never send values. This is a privacy decision: name it as one and let a human make it.

**4. Verify the install.** `tracking.verify {url}` fetches the page server-side and reports `{installed, via: script|gtm|null, detail}`, reading GTM containers too. Run it on each key template (home, pricing, a form page). A rotated key reports as not installed. If a snippet was copied somewhere it should not be, `tracking.site.rotate_key` is the kill switch; the old key stops at once and the snippet must be re-installed.

**5. Wire conversions.** Form leads enter through the `webform` connector (HMAC-verified webhook into `gtm.contact`, `gtm.account` and `gtm.signal`); read the `webform` skill to connect it. GA4 and Search Console data come through the `ga4` and `gsc` connector skills. Ad-platform conversion setup (pixels, Conversions API, enhanced conversions, offline imports) still happens in the ad platforms: follow `references/corey-conversion-tracking.md`, then confirm each conversion arrives.

**6. Check the result.** `tracking.activity {subject: {objectType, id}}` shows one contact's or company's page views, first and last seen, top pages and first and last touch; a touch carries only which click ids were present, never their values. Re-read `tracking.sources` after a day of traffic. Visits from ChatGPT, Perplexity, Gemini, Copilot and Claude referrers are classified as the `ai_answer` medium and credited to SEO & GEO in `money.attribution`; treat that number as a floor, as the method below explains.

Report what you verified and how (`tracking.verify` result, a test conversion seen in the platform), and name anything you could not check. "Installed" without a verification is not done.

## Without GTM OS

Follow the method below with GA4, Google Tag Manager and the ad platforms' own tools: write the tracking plan, install and test in GTM Preview and GA4 DebugView, then fire a real test conversion and confirm it arrives in each destination. Say plainly which parts stayed unverified.

---

You are an expert in analytics implementation and measurement. Your goal is to help set up tracking that provides actionable insights for marketing and product decisions.

## Initial Assessment

**Check for context first:**
With GTM OS connected, read the org definitions named in *With GTM OS connected* above before asking anything. Without it, read `.agents/product-marketing.md` (or `.claude/product-marketing.md`) if it exists; `gtmos-marketing-positioning` writes that file. Ask only for what neither covers.

Before implementing tracking, understand:

1. **Business Context** - What decisions will this data inform? What are key conversions?
2. **Current State** - What tracking exists? What tools are in use?
3. **Technical Context** - What's the tech stack? Any privacy/compliance requirements?

---

## Core Principles

### 1. Track for Decisions, Not Data
- Every event should inform a decision
- Avoid vanity metrics
- Quality > quantity of events

### 2. Start with the Questions
- What do you need to know?
- What actions will you take based on this data?
- Work backwards to what you need to track

### 3. Name Things Consistently
- Naming conventions matter
- Establish patterns before implementing
- Document everything

### 4. Maintain Data Quality
- Validate implementation
- Monitor for issues
- Clean data > more data

### 5. Compute, Don't Eyeball
- Derive every total, rate, and delta from row-level data with a script or
  spreadsheet — never by scanning rows and summing mentally. One silently
  dropped row corrupts every figure downstream of it.
- Cross-check each headline figure a second, independent way (a
  reconciliation total, a recomputation from a different grouping) before
  reporting it, and chase any mismatch to the exact row.
- When a claim is about one segment — a single campaign, ad set, channel, or
  week — report that segment's own numbers. Never fold it into a neighboring
  group and let the group's total speak for it.

### 6. Match Observation Windows
- A rate or efficiency metric divides a numerator and denominator that cover
  the same closed observation window. Never divide a full period's spend by a
  partial period's conversions or revenue — restate both over the weeks that
  actually have data, and say which weeks those are.
- Cohort rates use only cohorts whose observation window has ended. A trial
  or signup still inside its window is pending, not failed — exclude it from
  the denominator and label it as pending rather than counting it against
  the rate.

### 7. Recommend Against the Stated Goal
- Analysis ends in a recommendation, and the recommendation must be argued
  from the goal the brief states — the launch target, audience, revenue, or
  positioning objective — not only from what is operationally easiest.
  Name which stated goal each option serves and what it trades away.

---

## Tracking Plan Framework

### Structure

```
Event Name | Category | Properties | Trigger | Notes
---------- | -------- | ---------- | ------- | -----
```

### Event Types

| Type | Examples |
|------|----------|
| Pageviews | Automatic, enhanced with metadata |
| User Actions | Button clicks, form submissions, feature usage |
| System Events | Signup completed, purchase, subscription changed |
| Custom Conversions | Goal completions, funnel stages |

**For comprehensive event lists**: See [references/event-library.md](references/event-library.md)

---

## Event Naming Conventions

### Recommended Format: Object-Action

```
signup_completed
button_clicked
form_submitted
article_read
checkout_payment_completed
```

### Best Practices
- Lowercase with underscores
- Be specific: `cta_hero_clicked` vs. `button_clicked`
- Include context in properties, not event name
- Avoid spaces and special characters
- Document decisions
- Keep provider-defined names when using automatic or recommended events (e.g. GA4 `click`, `view_search_results`, `purchase`). Map internal business names explicitly; naming a custom event does not make the provider collect it automatically.

---

## Essential Events

### Marketing Site

| Event | Properties |
|-------|------------|
| cta_clicked | button_text, location |
| form_submitted | form_type |
| signup_completed | method, source |
| demo_requested | - |

### Product/App

| Event | Properties |
|-------|------------|
| onboarding_step_completed | step_number, step_name |
| feature_used | feature_name |
| purchase_completed | plan, value |
| subscription_cancelled | reason |

**For full event library by business type**: See [references/event-library.md](references/event-library.md)

---

## Event Properties

### Standard Properties

| Category | Properties |
|----------|------------|
| Page | page_title, page_location, page_referrer |
| User | user_id, user_type, account_id, plan_type |
| Campaign | source, medium, campaign, content, term |
| Product | product_id, product_name, category, price |

### Best Practices
- Use consistent property names
- Include relevant context
- Don't duplicate automatic properties
- Avoid PII in properties

---

## GA4 Implementation

### Quick Setup

1. Create GA4 property and data stream
2. Install gtag.js or GTM
3. Enable enhanced measurement
4. Configure custom events
5. Mark conversions in Admin

### Custom Event Example

```javascript
gtag('event', 'signup_completed', {
  'method': 'email',
  'plan': 'free'
});
```

**For detailed GA4 implementation**: See [references/ga4-implementation.md](references/ga4-implementation.md)

---

## Google Tag Manager

### Container Structure

| Component | Purpose |
|-----------|---------|
| Tags | Code that executes (GA4, pixels) |
| Triggers | When tags fire (page view, click) |
| Variables | Dynamic values (click text, data layer) |

### Data Layer Pattern

```javascript
dataLayer.push({
  'event': 'form_submitted',
  'form_name': 'contact',
  'form_location': 'footer'
});
```

**For detailed GTM implementation**: See [references/gtm-implementation.md](references/gtm-implementation.md)

---

## UTM Parameter Strategy

### Standard Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| utm_source | Traffic source | google, newsletter |
| utm_medium | Marketing medium | cpc, email, social |
| utm_campaign | Campaign name | spring-sale |
| utm_content | Differentiate versions | hero-cta |
| utm_term | Paid search keywords | running-shoes |

### Naming Conventions
- **Lowercase everything.** GA4 treats `LinkedIn` and `linkedin` as two sources, and the split never merges back.
- **Hyphens between words.** No spaces, underscores, or `+`. Pick one separator for the whole company; this skill uses hyphens.
- **One spelling per source.** `linkedin`, never also `li` or `linkedin.com`. Keep the allowed values in a shared sheet and build links from it.
- **No personal data.** Never put emails, names, phone numbers, or user IDs in a UTM. They land in analytics reports and in referrer logs, and Google's terms prohibit sending PII to GA4.
- **Specific but short:** `blog-footer-cta`, not `cta1`.
- **Test the final URL.** Shorteners and redirects can drop or double parameters. Click the live link and check the landing URL before the campaign ships.

### UTM Patterns by Partner Type

Partner links break most often because each deal gets named on the spot. Fix the pattern per partner type once: `utm_medium` names the kind of deal, `utm_source` names who sent the traffic.

| Partner type | utm_source | utm_medium | utm_campaign | utm_content |
|---|---|---|---|---|
| Newsletter | `{partner}` (one per partner, across all their publications) | `newsletter` | `{partner}-{publication}-{yyyy}-{mm}` | `{placement}-{yyyy-mm-dd}` |
| Creator (YouTube, LinkedIn, TikTok) | `{platform}` | `creator` | `{creator}` | `{post-date}` or the video ID |
| Podcast | `{podcast}` | `podcast` | `{podcast}-{yyyy}-{mm}` | `{spot}-{yyyy-mm-dd}` (pre-roll, mid-roll) |
| Affiliate | `{partner}` | `affiliate` | `{partner}-affiliate` | placement, if they have several |
| Community | `{community}` | `community` | `{community}-{program}` | the channel or post, if known |

- **Use `creator` as the medium for paid creator deals**, not `social` (which mixes them with your organic posts) or `video` (which mixes them with paid video ads). The platform goes in `utm_source`.
- **One link per placement.** A newsletter that runs you on two dates gets two links, so each date's clicks stay separate. The monthly `utm_campaign` rolls them up.
- **Add a custom channel group in GA4.** GA4's default grouping sends mediums like `newsletter`, `creator`, `podcast`, and `community` to Unassigned (only `affiliate` and `email` map to a default channel). Create a channel group with a rule per medium so partner traffic shows up as its own channels.
- Podcast and video links often aren't clickable, so pair the UTM link with a promo code or vanity URL.

*The partner-type pattern is adapted from Wispr Flow's link-creator skill (MIT), published in the skills.marketing library.*

### Traffic From AI Assistants

You can't tag links that ChatGPT, Claude, Perplexity, Gemini, or Copilot put in their answers. Some of those visits arrive with a referrer (`chatgpt.com`, `perplexity.ai`) or an assistant-added `utm_source`; many arrive as direct, or come later through a branded search.

- Add a GA4 channel group rule that matches known assistant referrers and sources into an "AI assistants" channel, and update the list as new assistants appear.
- Treat that channel as the floor. Assistant-driven visits that show up as direct or branded search can be most of the effect, and they won't carry the referrer.
- For measuring the full effect (exposure, delayed visits, and longer attribution windows), see **gtmos-seo-geo**. For reconciling it with other sources, see **gtmos-analytics-attribution**.

---

## Debugging and Validation

### Testing Tools

| Tool | Use For |
|------|---------|
| GA4 DebugView | Real-time event monitoring |
| GTM Preview Mode | Test triggers before publish |
| Browser Extensions | Tag Assistant, dataLayer Inspector |

### Validation Checklist

- [ ] Events firing on correct triggers
- [ ] Property values populating correctly
- [ ] No duplicate events
- [ ] Works across browsers and mobile
- [ ] Conversions recorded correctly
- [ ] No PII leaking

### Common Issues

| Issue | Check |
|-------|-------|
| Events not firing | Trigger config, GTM loaded |
| Wrong values | Variable path, data layer structure |
| Duplicate events | Multiple containers, trigger firing twice |

---

## Privacy and Compliance

### Considerations
- Cookie consent required in EU/UK/CA
- No PII in analytics properties
- Data retention settings
- User deletion capabilities

### Implementation
- Use consent mode (wait for consent)
- IP anonymization
- Only collect what you need
- Integrate with consent management platform

---

## Output Format

### Tracking Plan Document

```markdown
# [Site/Product] Tracking Plan

## Overview
- Tools: GA4, GTM
- Last updated: [Date]

## Events

| Event Name | Description | Properties | Trigger |
|------------|-------------|------------|---------|
| signup_completed | User completes signup | method, plan | Success page |

## Custom Dimensions

| Name | Scope | Parameter |
|------|-------|-----------|
| user_type | User | user_type |

## Conversions

| Conversion | Event | Counting |
|------------|-------|----------|
| Signup | signup_completed | Once per session |
```

---

## Task-Specific Questions

1. What tools are you using (GA4, Mixpanel, etc.)?
2. What key actions do you want to track?
3. What decisions will this data inform?
4. Who implements - dev team or marketing?
5. Are there privacy/consent requirements?
6. What's already tracked?

---

## Tools

With GTM OS connected, run this work through the connectors and operations in *With GTM OS connected*; they keep approvals, dry mode, spend caps and provenance in force. Without GTM OS, the upstream [tools registry](https://github.com/coreyhaines31/marketingskills/blob/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/tools/REGISTRY.md) lists setup guides for common tools.

---

## Related Skills

- **gtmos-analytics-experiments**: For experiment tracking
- [references/corey-conversion-tracking.md](references/corey-conversion-tracking.md): For getting conversions (including GA4 key events from forms and bookings) to ad platforms and GA4, and verifying they arrive
- **ga4**, **gsc**, **webform**: The GTM OS connector skills for Google Analytics, Search Console and inbound forms
- **gtmos-analytics-attribution**: For attribution models, multi-touch/MMM/incrementality, and reconciling conflicting numbers across tools (once tracking is live)
- **gtmos-seo-audit**: For organic traffic analysis
- **gtmos-marketing-cro**: For conversion optimization (uses this data)
- **gtmos-revops-lifecycle**: For pipeline metrics, CRM tracking, and revenue attribution
