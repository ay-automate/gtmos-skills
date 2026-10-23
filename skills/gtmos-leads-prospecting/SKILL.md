---
name: gtmos-leads-prospecting
description: Build a verified, scored prospect list from an ICP across B2B SaaS, general B2B, local small business and early demand-signal motions. With GTM OS connected it reads the org's personas, segments and scoring model, quotes the cost first (capability.quote, enrichment estimate), sources companies and people through the governed looot capabilities (find.companies, find.people, find.lookalikes), fills gaps with the empty-only enrichment waterfall, skips suppressed and existing records, and ranks the result with score.list_ranked. Use for "build a prospect list", "find leads", "lead list", "who should we target", "lookalike accounts", "TAM list", "find decision makers", "local business leads", "first customers", "design partners". For writing the outreach see gtmos-outreach-cold-email; for the ICP model itself see gtmos-score-icp.
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/prospecting"
  upstream_sha: "e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b"
  upstream_license: "MIT; Copyright (c) 2025 Corey Haines"
  merged_from: "https://github.com/apolloio/apollo-mcp-plugin/tree/bd0513c961f02105492fcff0d7d29c9cccf1ed23/skills/prospect"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers); 2026-10-23: quote-then-cap runs, freshness, the gtm-skills workflows"
---

# Prospecting and list building

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`prospecting`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/prospecting) in coreyhaines31/marketingskills (MIT, Copyright (c) 2025 Corey Haines). Merged with [`prospect`](https://github.com/apolloio/apollo-mcp-plugin/tree/bd0513c961f02105492fcff0d7d29c9cccf1ed23/skills/prospect) from apolloio/apollo-mcp-plugin (MIT), kept in `references/apollo-prospect.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

GTM OS sources lists through its **data-acquisition layer** (looot capabilities behind a governed, metered broker) and scores them with the **Score engine**. Data lands as `gtm.*` records with provenance, so the list you build is the list outreach and routing use. Confirm each schema with `gtm_describe` before the first call.

**1. Read the ICP the org already signed.** Do not re-interview the user for what is defined.

| Read | Why |
|---|---|
| `definition.persona`, `definition.segment`, `definition.customer_type` (`config.get`) | Who to target, in the org's own words. Phase 1 below starts from these. |
| `definition.scoring_model` keys `icp_fit` and `default` | The firmographic fit rules and the intent rules a "Hot" lead must meet. |
| `definition.suppression_rule` | Who must never be added or contacted. |
| `score.list_ranked {subjectType: "gtm.account"}` | Accounts already in GTM OS and how they rank: start here before buying new data. |
| `policy.guardrails.get`, `capability.list` | Spend caps, and which capabilities (`find.*`, `enrich.*`) this org has bound. |

**2. Quote before you buy.** `capability.quote {capability: "find.companies", args: {...}}` returns the estimate and whether it sits inside the per-unit ceiling. Show the user the price before any batch and run only after a yes for that batch. For enrichment use `enrichment.enrich_accounts {estimate: true}` (*spends inline*: quote it first) and `enrichment.enrich_contacts {estimate: true}`: no acquire, no spend. The enrichment runs spend inside their own call, so GTM OS pack agents never get them: a person runs them, or you quote and hand the run over.

**3. Source candidates.** Acquire through the broker with `capability.acquire` (*spends inline*: quote it first):
- `find.companies` (filters), `find.lookalikes` (seed domains of best customers), `find.people` (titles, seniority, company), `find.person_linkedin`.
- Hiring, news and funding triggers come through `research.jobs`, `research.news` and the Signals engine (`signals.list`, `signals.surge_report`); every signal keeps its evidence link.
- Within budget the broker returns data. Over a per-unit ceiling or a scope budget it returns a **proposal** that a different person approves; stop and report the approval id. Pass an `idempotencyKey` so a retry never pays twice.

**4. Fill the gaps, empty-only.** `enrichment.enrich_accounts {ids}` (*spends inline*: quote it first) and `enrichment.enrich_contacts {ids}` walk the provider waterfall (email, phone, verification, firmographics) and never overwrite a value. A looot "miss" means *not found*: record it as unknown, never guess an email. Read `enrichment.coverage_report` afterwards and report fill rates as returned.

**5. Dedupe and respect suppression.** Search before creating (`records.search` by domain or email). `identity_dq.scan_duplicates` catches pairs you missed; merging is a separate, approved step (see `gtmos-crm-data-quality`). Anyone matching a suppression rule stays off the sheet.

**6. Score and rank.** `score.score_account` / `score.score_contact` score new records against the signed model; `score.rescan_organization` re-scores in bulk. `score.list_ranked` gives band, segment, coverage and top reasons; `score.explain_subject` gives the evidence per lead. Use the engine's band as the Hot/Warm/Cold column, and quote its reasons rather than writing your own.

**7. Hand off.** The ranked list feeds `gtmos-outreach-cold-email` (drafts and approved sends) and `gtmos-routing-lead-ownership` (owners). Building the list writes data (D-class) and needs no approval; contacting anyone does. For a specific list job use the matching workflow: `gtmos-leads-icp-lookalikes` (from seed customers), `gtmos-leads-tech-stack` (by detected tools), `gtmos-leads-buying-committee` (people per role), `gtmos-signals-hiring`, `gtmos-signals-funding` and `gtmos-signals-job-changes` (trigger lists). Values you filled go stale: `enrichment.freshness` and `enrichment.refresh_stale` (*spends inline*: quote it first) (see `gtmos-crm-data-quality`).

## Without GTM OS

Follow the method below as written. Ask for the ICP, target count, geography and the tools the user has (Apollo, Clay, ZoomInfo, a browser). Keep a source URL and date for every lead, verify every email before it goes on the sheet, and mark anything you could not confirm as "unverified" rather than filling it in. `references/apollo-prospect.md` shows the same flow on Apollo's own tools.

---

You are an expert at building qualified prospect lists across four motions: B2B SaaS, general B2B, local small businesses, and early-stage demand-signal discovery (finding your first customers from public pain signals). Your goal is to turn an ICP definition into a verified, scored, ready-to-outreach lead sheet — using the right data sources, qualification signals, and compliance posture for each motion.

## Before Starting

**Check for context first:**
With GTM OS connected, read the org definitions named in *With GTM OS connected* above before asking anything. Without it, read `.agents/product-marketing.md` (or `.claude/product-marketing.md`) if it exists; `gtmos-marketing-positioning` writes that file. Ask only for what neither covers.

## Pick the Branch

Prospecting motions differ enough that the workflow forks at intake. Pick **one** branch based on who the user is selling to:

| Branch | Sell to | What "qualified" looks like | Primary sources |
|--------|---------|----------------------------|----------------|
| **SaaS** | Other SaaS companies / digital businesses | ICP fit + tech stack match + growth signals (funding, hiring, product velocity) | LinkedIn, BuiltWith, Crunchbase, Apollo, Clay, ProductHunt |
| **B2B** | Non-SaaS B2B (services, manufacturers, enterprises, mid-market) | Industry + size + geographic fit + buying signals (trigger events, vendor changes) | Apollo, ZoomInfo, Clay, LinkedIn Sales Nav, industry directories |
| **Local SMB** | Local small businesses (shops, gyms, restaurants, clinics, salons, services) | Active business + website status + proximity + decision-maker access | Google Maps, Yelp, local directories, Facebook, business websites |
| **Demand-signal** | Early-stage: your first customers, design partners, or beta users | Evidence of the exact pain/demand/timing signal — a cited public source, not just firmographic fit | Forums, communities, reviews, GitHub issues, job posts, launch announcements (via last30days, social-fetch, scraping) |

If the user describes a hybrid motion (e.g., "SMBs that are also SaaS"), pick the dominant branch and pull in qualification signals from the other. If the user is early-stage and needs their *first* customers or design partners — evidence of demand over list coverage — use the **Demand-signal** branch.

For the branch-specific deep dives:
- **SaaS** → see [references/saas-prospecting.md](references/saas-prospecting.md)
- **B2B** → see [references/b2b-prospecting.md](references/b2b-prospecting.md)
- **Local SMB** → see [references/local-prospecting.md](references/local-prospecting.md)
- **Demand-signal** (find your first customers) → see [references/demand-signals.md](references/demand-signals.md)

---

## Shared Framework (all branches)

Every prospecting engagement follows the same five phases. Tools and qualification signals change per branch; the phases don't.

### Phase 1 — Define the ICP

With GTM OS connected, start from the signed personas, segments and `icp_fit` scoring model. Otherwise pull from `product-marketing.md` if available, or gather:

1. **Firmographic fit** — industry, company size, revenue band, geography, business model
2. **Technographic fit** (SaaS branch) — what tools they already use, what they're missing
3. **Buying signal** — why now? (trigger event, funding, hiring, new initiative, dissatisfaction with current vendor, recent move/expansion)
4. **Decision-maker profile** — role, seniority, what they care about
5. **Disqualifiers** — what makes a prospect a clear "skip"

Output the ICP as a one-paragraph statement plus a checklist of pass/fail criteria. Don't move to discovery without this.

### Phase 2 — Build the candidate list (discovery)

Source 2–3× more candidates than the user wants in the final list — qualification will cull aggressively.

- **SaaS / B2B**: combine 2–3 sources for cross-verification. Apollo or ZoomInfo for firmographics; Clay or a waterfall aggregator (FullEnrich, LeadMagic) for enrichment; LinkedIn Sales Nav for decision-maker mapping.
- **Local SMB**: browser-assisted research starting with Google Maps for the target category in the target area; cross-check with Yelp, the business website, social pages, and public directories.

If the user's list quality bar is high, smaller is better. 25 verified leads beats 250 mostly-junk ones.

For LinkedIn audiences, define the filters in Sales Navigator and pull the contacts from a licensed database. For legitimate non-LinkedIn sources, AI list builders, lookalikes, and the enrichment waterfall, see [references/sourcing-and-enrichment.md](references/sourcing-and-enrichment.md). To find accounts by what just happened to them (hiring, job changes, product usage, funding), see [references/signal-plays.md](references/signal-plays.md).

### Phase 3 — Qualify each candidate

Score every candidate against the ICP checklist. Add **evidence** (a source URL or two) for each qualification — never assert without backing.

**Confidence levels** (used across all branches):
- **High**: confirmed by at least two independent sources or official business page
- **Medium**: one credible source plus consistent search evidence
- **Low**: incomplete or ambiguous evidence — flag what remains uncertain

For email contacts (B2B / SaaS branches), **always verify deliverability before adding to the final list**, and again within 7 days of sending if the list sat. Catch-all domains need a set policy. See [references/sourcing-and-enrichment.md](references/sourcing-and-enrichment.md) for the verification actions, catch-all handling, and the suppression list. Don't ship leads with invalid or risky emails.

### Phase 4 — Score and prioritize

Apply this rubric for the **SaaS, B2B, and Local SMB** branches. The **Demand-signal** branch scores differently — 0–100 demand-fit, not Hot/Warm/Cold — see [references/demand-signals.md](references/demand-signals.md).

| Score | Definition |
|-------|------------|
| **Hot** | Strong ICP fit + clear buying signal + decision-maker accessible + verified contact |
| **Warm** | ICP fit + softer or older signal + contact verifiable |
| **Cold** | Loose ICP fit OR no clear signal OR contact unverified |
| **Skip** | Disqualifier hit (out of ICP, closed business, duplicate, irrelevant, low confidence) |

Branch-specific signals refine the scoring — see each reference file. Default ratio target: ~20% Hot, ~30% Warm, rest Cold/Skip.

Then assign an **account tier**, which sets how much research and how many channels each account gets: Tier 1 (1:1, the top 25–50), Tier 2 (1:few, segments of 20–200 sharing one pain), Tier 3 (1:many). Tier 1 accounts get a sourced research brief before any outreach. See [references/signal-plays.md](references/signal-plays.md) for tiers and [references/account-research.md](references/account-research.md) for the brief and the rules for agent research.

### Phase 5 — Output the lead sheet

(SaaS / B2B / Local SMB. The **Demand-signal** branch ships an evidence report instead — see [references/demand-signals.md](references/demand-signals.md).)

Default to a markdown table in chat. Switch to CSV when the list is >25 rows or the user explicitly asks for a file.

After the table, always add **"Top outreach targets"** — the top 3–5 hot leads with one sentence each on why this lead should be reached out to first.

Columns vary by branch (see reference files), but every lead sheet includes:
- score, business/company name, contact (where applicable), why-it's-a-prospect, source(s), confidence, last verified date

---

## Compliance Guardrails

These apply to every branch. **Read first, every engagement.**

1. **No bulk scraping** of LinkedIn, Google Maps, paywalled sites, or rate-limited APIs. Browser is an assisted research tool, not a scraper.
2. **No CAPTCHA, login wall, or bot protection bypass.** If a site requires it, work with what's publicly visible.
3. **Public business contact channels only.** Use info@, hello@, contact@, and named-role emails (founder, owner) where they're published on the business's own site. Personal/private emails require a lawful basis (existing relationship, opt-in, etc.).
4. **GDPR / CAN-SPAM / CASL aware.** Capture and retain the source URL and date for every contact you add to a list — required for downstream outreach compliance.
5. **No reselling extracted data** from Google Maps, LinkedIn, or any platform whose terms prohibit it. List building for the user's own outreach is fine; productizing the list to sell is not.
6. **Rate limit yourself.** Even on public sources, space requests. Don't fingerprint as a bot.
7. **No breached, leaked, or unprovenanced data.** Don't source prospects from breached datasets, scraped-contact marketplaces, or list brokers with no source lineage. Licensed B2B data providers (Apollo, ZoomInfo, Clay, and similar) are fine when used within their ToS and with a lawful basis — the ban is on illicit/unprovenanced data, not on legitimate enrichment vendors.
8. **Never target or infer sensitive traits.** Don't qualify, segment, or personalize on health, financial hardship, political belief, sexuality, religion, or other protected/sensitive attributes — even when a public post reveals them.

For the full compliance reference (GDPR, CAN-SPAM, CASL, LinkedIn ToS, Google Maps ToS, Clay/Apollo/ZoomInfo use restrictions): see [references/compliance.md](references/compliance.md).

---

## Inputs to Collect

If missing, ask once, then infer reasonable defaults and continue:

- **Branch** (SaaS / B2B / Local SMB / Demand-signal) — usually inferable from context; pick Demand-signal for early-stage first-customer discovery
- **ICP description** — the org's personas and scoring model (GTM OS), or `product-marketing.md` if present
- **Target count** — default 25 for SaaS / B2B, 15 for Local SMB
- **Geography** (essential for Local SMB; useful for B2B; less critical for SaaS)
- **Tools the user has access to** — Apollo? Clay? ZoomInfo? Hunter? Truelist? Defaults to what's free + browser
- **Output format** — chat table (default) or CSV
- **Buying signal preference** — what triggers should they prioritize? (funding rounds, hiring, recent move, etc.)

---

## Enrichment Workflows

For multi-provider lookups, cache reuse, and per-credit budgets, load [the enrichment playbook](references/enrichment-playbook.md). Define accepted results first, stop the waterfall when satisfied, and keep lookup errors distinct from no-match records.

---

## Tool Selection Quick Picks

Full breakdown in [references/data-sources.md](references/data-sources.md). Quick picks:

| If the user has access to... | Use it for |
|------------------------------|------------|
| **Apollo** | B2B / SaaS firmographic + contact discovery |
| **Clay** | Multi-source enrichment, waterfall lookups, custom scoring |
| **FullEnrich or LeadMagic** | Waterfall email and phone enrichment through one API |
| **TheirStack** | Hiring signals and tech stacks from job posts |
| **ZoomInfo** | Enterprise B2B contact + intent data |
| **Hunter or Snov** | Email pattern guessing and verification |
| **Truelist** | Email deliverability validation (before adding to outreach list) |
| **LinkedIn Sales Navigator** | Decision-maker mapping (manual, no scraping) |
| **BuiltWith / Wappalyzer** | Tech stack qualification (SaaS branch) |
| **Crunchbase** | Funding signals (SaaS branch) |
| **GitHub** | Stargazers / forks of competitor or adjacent repos (dev-tool SaaS branch) |
| **Google Maps + browser** | Local SMB discovery |
| **Firecrawl / Browserbase** | Programmatic extraction from individual prospect websites — never from platforms |

**If the user has no enrichment tools**: lean on browser-assisted research with public sources — company website, About page, LinkedIn company page, news mentions. Slower but works.

---

## Output Formats

### Default — chat table

For SaaS / B2B (≤25 rows):

```
| Score | Company | Industry | Size | Signal | Contact | Email status | Source | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

For Local SMB (≤15 rows) — port from the local-prospector reference:

```
| Score | Business | Category | Area | Website status | Website/Social | Phone | Why it's a prospect | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
```

### CSV — when >25 rows or user requests a file

SaaS / B2B columns:

```csv
score,company,domain,industry,size_band,country,signal,contact_name,contact_title,contact_email,email_status,linkedin,source_urls,why_prospect,confidence,verified_date,notes
```

Local SMB columns:

```csv
score,business,category,area,distance_km,website_status,website_url,social_urls,phone,email,source_urls,why_prospect,confidence,verified_date,notes
```

### Always include after the table

- **Top outreach targets**: top 3–5 hot leads with one-sentence outreach rationale each
- **Search parameters**: branch, ICP, location/radius, target count, date generated
- **Open questions**: anything you couldn't verify and the user should look at

---

## Quality Checks (before finalizing)

- [ ] Remove duplicates (by domain for SaaS/B2B, by business + address for Local SMB)
- [ ] Every "Hot" lead has a verified contact + at least one source URL
- [ ] No lead has an email that failed Truelist (or your validator) verification — move to a separate "invalid" bucket and flag for the user
- [ ] No lead labeled "Hot" lacks a clear buying signal
- [ ] Confidence levels honest — "High" requires 2 independent sources, not just two of your own searches
- [ ] No leads sourced from prohibited scraping (LinkedIn at scale, Google Maps bulk extract, etc.)
- [ ] Source URL + date captured for every contact (GDPR / CAN-SPAM lineage)
- [ ] Final count matches user's request, or you've explained why it's smaller (quality bar)

---

## Common Mistakes

1. **Starting discovery without an ICP**. Build candidates against vague criteria and you'll qualify the wrong things.
2. **Treating data sources as authoritative without cross-checks**. Apollo and ZoomInfo are out of date often; verify before scoring as "Hot."
3. **Adding contacts without email verification**. Cold email reputation tanks fast with bounces — always validate.
4. **Bulk scraping LinkedIn or Google Maps**. Real risk: account suspension + ToS violation. Browser as an assisted tool only.
5. **Mixing branches**. Don't apply Local SMB scoring (website status) to a B2B SaaS prospect, or vice versa.
6. **"Hot" labels without buying signals**. ICP fit alone is not enough — the signal is what makes the timing right.
7. **No source URLs**. Every claim should be traceable to a public source. Future outreach depends on this lineage.
8. **Ignoring quiet hours / time zone** when scheduling the downstream outreach (handoff to gtmos-outreach-cold-email).
9. **Forgetting to retain consent / lineage records**. Required for GDPR DSARs and CAN-SPAM audits.

---

## Task-Specific Questions

1. Which branch — SaaS, B2B, Local SMB, or Demand-signal (early-stage, finding your first customers)?
2. What's your ICP? (Or: should I read it from GTM OS or your product-marketing context?)
3. How many qualified leads do you want?
4. What tools do you have access to (Apollo / Clay / ZoomInfo / Hunter / Truelist / browser only)?
5. What's the triggering buying signal you care most about?
6. Geography or radius (Local SMB / B2B)?
7. Chat table or CSV?

---

## Tools

With GTM OS connected, run this work through the connectors and operations in *With GTM OS connected*; they keep approvals, dry mode, spend caps and provenance in force. Without GTM OS, the upstream [tools registry](https://github.com/coreyhaines31/marketingskills/blob/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/tools/REGISTRY.md) lists setup guides for common tools.

---

## Related Skills

- **gtmos-outreach-cold-email**: For writing outbound sequences against the qualified list (the natural next step after prospecting)
- **gtmos-research-customer**: For understanding why current customers buy — informs the ICP definition
- **gtmos-research-competitor**: For researching competitors. Research on accounts you're selling to lives here, in [references/account-research.md](references/account-research.md)
- **gtmos-revops-lifecycle**: For lead routing, lifecycle, and CRM handoff after prospecting
- **gtmos-sales-enablement**: For battle cards and one-pagers used in the outreach
- **gtmos-marketing-positioning**: For the ICP definition that anchors every prospecting engagement
- **gtmos-score-icp**: For turning the ICP into the scoring model GTM OS ranks every lead with
- **gtmos-research-account**: For the sourced one-page brief on Tier 1 accounts
- **gtmos-routing-lead-ownership**: For giving each new lead an owner
