---
name: gtmos-score-icp
description: Turn an ICP into a visible, tunable account scoring model and tier a book of accounts with it -- weighted dimensions, renormalized over what was actually observed, a minimum-observability gate, tier cuts the user can move, and evidence for every judgment. With GTM OS connected it reads the signed definition.scoring_model (icp_fit for firmographic fit, default for intent, signals for signal strength), drafts changes as a ChangeSet for a human to sign, and checks the result with score.account_tiers, score.explain_subject and score.kpis. Use for "define our ICP", "ICP scoring", "account tiering", "tier our accounts", "lead scoring model", "fit score", "which accounts are tier 1", "tune the scoring weights", "why is this account tier 2", "is the score working". For building a list to score see gtmos-leads-prospecting.
license: MIT
metadata:
  version: "0.1.0"
  category: "outbound"
  upstream: "https://github.com/clay-run/clay-skill-creator/tree/fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf/skills/clay/account-tier-scoring"
  upstream_sha: "fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf"
  upstream_license: "MIT; Copyright (c) 2026 Clay"
  merged_from: "https://github.com/clay-run/clay-skill-creator/tree/fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf/skills/clay/icp-matrix-builder"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# ICP and account tier scoring

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`account-tier-scoring`](https://github.com/clay-run/clay-skill-creator/tree/fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf/skills/clay/account-tier-scoring) in clay-run/clay-skill-creator (MIT, Copyright (c) 2026 Clay). Merged with [`icp-matrix-builder`](https://github.com/clay-run/clay-skill-creator/tree/fbb9149b7f0ba42db65cf5d6d540fb3ec9afd7bf/skills/clay/icp-matrix-builder) from clay-run/clay-skill-creator (MIT), kept in `references/clay-icp-matrix-builder.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

In GTM OS the ICP is not a spreadsheet; it is the org's **signed scoring model**, and the **Score engine** applies it to every account and contact. This skill designs or tunes that model with the method below, proposes it, and reads back what it does. It never signs a model: a person does. Confirm each schema with `gtm_describe` before the first call.

**1. Read the model the org runs today.**

| Read | Why |
|---|---|
| `config.get {kind: "definition.scoring_model", key: "icp_fit", env: "prod"}` | The firmographic fit model: segments, weighted signals (`segmented.signals[]` with their `ladder`), bands. |
| the same with `key: "default"` | The intent model: rules over signal kinds, qualified and needs-review thresholds, the `composite` (fit and intent weights, `tiers[]` with `minScore`). |
| the same with `key: "signals"` | Signal strength: default weight, half-life, disputed multiplier, signal classes. |
| `definition.persona`, `definition.segment`, `definition.customer_type`, `definition.committee_model` | The vocabulary the dimensions must use. |
| `score.account_tiers` | Accounts per tier now, with each account's composite, fit and intent scores. |
| `score.kpis {windowDays: 56}` | Accounts scored, tier distribution, hot now, next-move acceptance and score-vs-deal correlation. Each block carries a `reason` when the sample is too small: report it as "not enough data yet". |

**2. Map the method onto the model.** The weight table below becomes the model's parts: each dimension is a `segmented.signals[]` entry (`part: "fit"` or `"intent"`, a `feature` such as `account_field` or `signal_count`, and a `ladder` of steps). The weights are `segmented.segments[].weights`; tier cuts are `composite.tiers[].minScore` and `segmented.bands[].minScore`. The model's `ladder.missing` is where "unobserved is not zero" lives: never set a missing dimension to score as a fail. Use only fields the live schema lists.

**3. Explain before you change.** For "why is this account tier 2?", call `score.explain_subject {subjectType: "gtm.account", subjectId}`: factors with points and maximum, greyed signals (data source not wired, never imputed), top signals, reasons. Quote those, not a recomputation.

**4. Propose the change.** Draft the new spec and submit it with `config.propose_changeset` (then `config.validate_changeset` and `config.compute_impact` to show what moves). Submit the published version for sign-off with `definition.propose_for_signing`. A different person signs it (`definition.sign`, human only); signing triggers a re-score of every stale account. Tell the user what will change and that it waits for their sign-off.

**5. Learn from outcomes.** `score.learning_report` shows lift per criterion, calibration by tier and rep feedback; `score.learn` proposes a bounded, evidenced new version from real outcomes (positive replies, meetings, opportunities, won deals) and never signs it; `score.feedback` records a rep's "too high / too low / wrong reason". Prefer these over hand-tuning once they exist.

**6. Verify.** After signing, `score.rescan_organization` (or wait for the automatic re-score), then `score.account_tiers` for the new distribution. A distribution with most accounts in tier 1 means the weights need work, not that the book is great.

Never write a tier into the CRM from this skill. A CRM field update goes through `crm.update_record` (E), which proposes and waits for approval.

## Without GTM OS

Run the method below as written on the user's CSV or CRM export: interview for the dimensions and tier semantics, compute the weighted, renormalized composite deterministically, and ship the weight table, the gate and the cuts with every tiered row. Ask before paying for any enrichment. `references/clay-icp-matrix-builder.md` covers translating ICP words into a provider's closed taxonomy, which matters when the filters run on Clay or a similar database.

---

The insight: **a tier is a budget-allocation decision the user will need to re-tune, so
the deliverable is a visible weight table, not a number.** The most common scoring
antipattern is picking the wrong engine: prompting an AI to do weighted arithmetic (pay
per row for worse-than-formula math, byte-inexact, untunable), or cramming meaning-level
judgment ("is this really our vertical?") into brittle keyword terms. The split that
works: **deterministic math for everything countable, judgment only where meaning
lives** — and every judgment call writes down what it saw. The second antipattern is
scoring rows the data can't support: a missing dimension silently scored as 0 craters
good accounts for being under-enriched. Sparse rows get renormalized over the weights
actually observed; rows below the observability gate return "cannot tier," never a
confident middle grade.

## Declared inputs

**Nothing here ships with a value.** Each one is the installer's, not the author's: ask for it, never
substitute a plausible default, and where an answer does not exist say which step becomes unavailable
rather than guessing. Where a default IS defensible it is named below, and using it means saying so in
the output.

| Input | What the installer supplies | If it is missing |
|---|---|---|
| **The book** | CSV, table or Audience of accounts, minimum one domain column | no default — there is nothing to score |
| **ICP dimensions** | what makes an account tier-1 for *them*: industry, size band, geography, tech signals, funding stage, persona presence | propose the starting weight table below and get approval; if they cannot rank dimensions, **that conversation is the deliverable** |
| **Tier semantics** | how many tiers, and what each one UNLOCKS | ask — tiers that gate no action are decoration |
| **Hierarchy treatment** | whether subsidiaries of one parent are one decision or several | ask before deduping on domain, because it changes the row count |
| **Budget ceiling** | credits available for paid fills | state rows × fills × declared cost and get approval before any paid call |

**If an answer sheet is present beside this skill, load it and ask only for what it does not cover.**
A partial sheet is normal; a value it is missing gets asked for on its own rather than restarting the
interview. **Say which values came from the sheet** before using them — a sheet applied silently is a
wrong field nobody catches. **If there is no sheet, say nothing about sheets** — the check is a file
lookup, not a question, so run the interview as though the feature did not exist rather than reporting
an absence. At delivery, offer to save the answers back (identifiers only — never a token or a
password), private and never published — and phrase the offer so it explains itself: *"want me to save
your answers to a file, so the next person on your team doesn't have to answer these again?"*

## What this skill touches

- **Reads** — your book of accounts and the ICP dimensions you define, plus the enrichment it runs per account.
- **Writes** — nothing directly. With GTM OS, a changed model is a proposed ChangeSet that a person signs.
- **Never** — writes a tier back to a CRM, signs a model, or tiers on enrichment presence alone when liveness is in doubt.

## Step 0 — Know where the work runs

**Where the work runs decides what it costs**, so state it up front. With GTM OS, the Score engine applies the signed model to every record at no per-row model cost, and paid fills go through the enrichment waterfall with an estimate first (`enrichment.enrich_accounts {estimate: true}`). Without GTM OS, the arithmetic and the judgment overlay run in this agent; on Clay (the upstream setup), verify the workspace with `clay whoami`, and read each managed function's declared cost (`clay routines get`, `estimatedCreditCost`) before promising fills. An AI column that runs per row bills per row: price it before switching.

## Step 1 — Collect the scoring definition (interview; do not guess)

1. **The book** — CSV, table, or Audience of accounts; minimum one domain column.
   Dedupe on normalized domain first (subsidiaries of one parent are ONE decision —
   ask how they want hierarchies treated).
2. **ICP dimensions and weights** — what makes an account tier-1 for THEM: industry /
   vertical, size band, geography, tech signals, funding stage, persona presence.
   Take their words, then propose a starting weight table (below) they approve. If they
   can't rank dimensions by importance, that conversation IS the deliverable — do it
   before any scoring.
3. **Tier semantics** — how many tiers, and what each UNLOCKS (tier 1 = named-account
   outbound; tier 2 = pooled; tier 3 = nurture; tier 4 = suppress). Tiers that don't
   gate an action are decoration; say so.
4. **Field inventory** — which scoring inputs already exist per row vs need enrichment.
   This drives Step 3's cost gate.

## Step 2 — Choose the engine (decision, stated to the user)

- **Weight-table formula (default)**: a sum of weighted terms over row fields,
  thresholded into tiers. Same input, same output, zero credits, and the user can
  re-tune any weight without you. Use when dimensions are countable facts (size band
  in range, geo match, signal present).
- **Judgment overlay (only where meaning lives)**: industry/vertical fit from a
  description, non-standard dimensions no provider measures (multi-brand status,
  regulatory exposure), tier-adjustment rules ("recent M&A bumps a letter"). Each
  judgment emits a score AND the evidence phrase it read. Never let judgment do the
  arithmetic — the weighted sum is the formula's job, byte-exact and free.
- **Hybrid (the production shape)**: formula makes the rough cut on the whole book;
  judgment refines only the top cohort. State the split ("formula on all N, judgment
  on the ~20% that clears tier-2") so cost and effort stay proportional. Three rules
  make the staging unambiguous:
  - The **rough cut is triage, not a delivered tier**. It ranks on the formula
    dimensions alone, purely to pick the judgment cohort; the observability gate and
    the final tier are NOT applied at this stage.
  - A judgment dimension whose sub-score was **never computed for a given row is
    UNOBSERVED for that row** — its weight leaves both sums and it appears in
    fields-missing. The input being present (the description exists) is not enough;
    only a computed sub-score counts as observed.
  - Therefore **hybrid is only available when the formula dimensions alone clear the
    gate** — `Σ(formula wᵢ) / Σ(all wᵢ) ≥ 0.50` — because non-cohort rows are tiered
    on those dimensions only. If judgment carries more than half the table's weight,
    say so and pick one: run judgment on every row, reweight, or lower the gate. Never
    silently deliver a book whose non-cohort rows are all cannot-tier.

## Step 3 — Pre-score gate, then fill only what's worth filling

Compute a **free pre-score from the fields already present** (domain exists and isn't a
free-mail provider; size band known; geo known). Only rows above the pre-score floor
earn paid enrichment for missing dimensions — this is the canonical credit-protection
move; state the arithmetic (rows × fills × declared cost) and get approval before any
paid call. Enrichment discipline for fills: gate on returned VALUES, not run status
(complete-with-empty is a miss, not data); size/revenue arrive as BAND STRINGS — compare
as bands, never parse to integers; enrichment presence is not liveness — a dead or
acquired company enriches fine on last-known data, so flag liveness doubts rather than
tiering them as healthy.

## Step 4 — Score with the weight table

Weight table (weights are the user's; these are the starting proposal, and they need
not sum to 100 once re-tuned):

```
dimension            weight wᵢ
  industry_fit          25   (judgment: description vs ICP verticals, evidence quoted)
  size_band_in_range    20   (compare the BAND field as a band — see below)
  geo_match             15
  tech_signal           15   (each corroborated signal counts once)
  funding_stage         10
  persona_presence      15   (target-function people found at the account)
```

Each dimension gets a sub-score **sᵢ on 0–1** (0 = fails the dimension, 1 = fully
satisfies it, fractions allowed for judgment terms). The composite is on **0–100**:

```
composite = 100 × Σ(wᵢ × sᵢ) / Σ(observed wᵢ)
```

Both sums run over OBSERVED dimensions only — the same set, so a fully-observed row's
composite equals its plain weighted sum. Rules, all mandatory:

- **"Observed" is a definition, not a judgment call.** A dimension is observed when its
  input is present: **not null/undefined, not an empty or whitespace-only string, and
  not a value outside the dimension's declared enum** (an unparseable size band is NOT
  an observed size). Critically, **`0`, `false`, `"0"`, and `"false"` ARE observed** —
  they are evidence the dimension FAILS, and they belong in both sums with sᵢ = 0.
  Never test presence by truthiness: that scores a row's failures as absences and
  inflates its composite.
- **Number-coerce every sᵢ and wᵢ before arithmetic** — CSV fields that look numeric
  are often strings; some engines concatenate instead of adding, others raise. Coerce
  first, and coerce only AFTER the observed test above (so `"0"` survives as observed).
- **Band-vs-number is per FIELD, not a blanket rule** (live-verified): enrichment
  payloads return `size` and revenue as BAND STRINGS ("10,001+ employees",
  "100B-1T") — compare those as bands, never parse them to integers. The SAME payload
  may also carry an exact integer headcount field; when it is present, use it for a
  numeric size test and say which field you used. Never invent a number from a band,
  and never discard an exact count because a sibling field is a band.
- **Sparse rows renormalize, they do not crater.** An unobserved dimension leaves BOTH
  sums; one missing dimension must not crater the composite.
- **Credibility guard** — a judgment sub-score of `cannot determine` means the
  dimension is **NOT observed**: its weight is removed from BOTH the numerator and the
  denominator before renormalization (identical treatment to an absent input), and it
  is listed in fields-missing. It is never scored as 0. If the judgment cannot assess
  the ENTITY at all, the row goes to cannot-tier regardless of the other dimensions.
- **Minimum-observability gate (weight-based, strict).** Let
  `observability = Σ(observed wᵢ) / Σ(all wᵢ in the approved table)`. When
  `observability < 0.50` the row is **"cannot tier — under-enriched"**: no composite,
  no tier, listed separately with its fields-missing. At exactly 0.50 the row IS
  tiered. The test is on WEIGHT only — never on how many dimensions are missing, and
  never approximate. **The gate and the tier are computed ONCE per row, at delivery,
  over the dimensions observed for THAT row** — after any judgment overlay has run on
  the rows it runs on (Step 2). A hybrid rough cut never produces a gate verdict.
- **Rounding.** Thresholds are exact cuts, so fix the precision: round each component
  and the composite to ONE decimal, half-up, and compare the rounded composite against
  the thresholds. (A 0.33 sub-score on a weight-15 dimension is 4.95 → 5.0, and a
  composite of 86.95 → 87.0.)
- **Thresholds are conventions** — propose (≥80 → T1, ≥50 → T2, ≥25 → T3, else T4),
  show the score distribution, let the user move the cuts. A distribution with 60% in
  tier 1 means weights need re-tuning, not that the book is great.
- **Thin rows carry their thinness.** Renormalization has no upper penalty, so a row
  observed at 55% weight that passes what it shows can outrank a fully-observed row
  that fails one dimension. Every delivered row therefore ships its `observability`
  and fields-missing next to the tier (Step 5) — a T1 off 60% of the weight table is
  a T1 with a caveat, and the user may raise the gate above 0.50 if they want the
  bar higher.

## Step 5 — Deliver the tunable artifact

Per account: `domain · tier · composite score · observability (observed weight / table
total) · every component score · evidence phrase for each judgment term · fields-missing
list · flags (cannot-tier / liveness-doubt / hierarchy-collapsed)`. Plus the weight
table itself, the observability gate, and the tier thresholds, stated so
the user can re-cut without you. Plus the distribution (accounts per tier) and the drop
ledger (dedupes, cannot-tiers, suppressed). Offer the standing version: re-score on a
cadence, and note that scores go stale — a tier computed before a funding round or
acquisition is the OLD company's tier.

## What this skill does not claim

- Per-run token and latency cost are unmeasured, so no figure is given.
- The proposed tier cut-offs are exhaustive and disjoint over the full score range, but they ship as editable proposals and nothing re-checks a cut-off the user re-tunes.

## What good looks like

- The user can answer "why is this account tier 2?" from the row itself — component
  scores + evidence, no black box.
- Re-tuning is a weight edit, not a rebuild.
- "Cannot tier" rows are visible and counted — a book with zero of them usually means
  missing dimensions were silently zeroed or invented.
- The common mistake: one mega-judgment that outputs a letter grade per account with a
  paragraph of reasoning and no decomposition — unauditable, untunable, and it costs
  per row what the formula does for free.

## Rules

- MUST decompose every tier into visible component scores and ship the weight table;
  NEVER deliver a bare tier.
- MUST renormalize over observed weights on the stated 0–100 scale and route rows below
  the 0.50 observability gate to "cannot tier"; NEVER score an unobserved dimension as
  zero, and NEVER treat an observed `0`/`false` as unobserved.
- MUST keep arithmetic deterministic — judgment produces component scores and evidence,
  never the weighted sum.
- MUST gate paid fills behind the free pre-score and explicit cost approval; band
  strings compare as bands.
- NEVER tier on enrichment presence alone when liveness is in doubt, and NEVER write
  tiers into a CRM or trigger outreach — the tiered book is the deliverable.

## Worked example

Ask: "Tier our 400 target accounts; we sell compliance software to US fintech and
healthtech, 100–2,000 employees." Interview yields the weight table above with
persona_presence swapped for a compliance-team dimension. Dedupe: 400 → 371 unique
(29 subsidiary rows collapsed, per their parent-level decision). Pre-score on existing
fields: 84 rows below floor (no domain / consumer domains / geo mismatch) — excluded
from paid fills, listed. Fills approved for 61 rows missing size band (1 credit each,
stated, approved). Scoring: formula on 371; judgment overlay (industry fit + compliance
signals, evidence quoted) on the 112 that cleared tier-2. Distribution: 38 T1 / 74 T2 /
151 T3 / 89 T4 / 19 cannot-tier (under-enriched, listed with missing fields).

Three rows, arithmetic shown (weights: industry 25, size 20, geo 15, tech 15,
funding 10, compliance 15; table total 100):

- **Fully observed** — `meridianpay.example · T1 · 87 · observability 1.00 · industry
  25 (s=1.0, "payments infrastructure for banks") · size 20 (s=1.0, 201-500) · geo 15
  (s=1.0) · tech 12 (s=0.8) · funding 10 (s=1.0) · compliance 5 (s=0.33) · missing:
  none` → 100 × 87/100 = **87**.
- **Sparse, with an observed failure** — `kirivale.example · T2 · 58.3 ·
  observability 0.60 · industry 15 (s=0.6) · size 20 (s=1.0) · geo 0 (s=0.0 — US-only
  ICP, HQ is EU: observed and failing, so its 15 stays in BOTH sums) · missing: tech,
  funding, compliance` → 100 × 35/60 = **58.3**. Had geo been scored as absent instead
  of failing, this row would read 100 × 35/45 = 77.8 and land T2-high — the exact
  inflation the observed-definition prevents.
- **Judgment abstained** — `northfield.example · T1 · 83.3 · observability 0.60 ·
  industry — (cannot determine: description too thin; weight removed from both sums) ·
  size 20 (s=1.0) · geo 15 (s=1.0) · tech 15 (s=1.0) · funding 0 (s=0.0) · missing:
  industry_fit, compliance` → 100 × 50/60 = **83.3**.
- **Under-enriched** — a row observing only geo + funding has observability 0.25 <
  0.50 → **cannot tier**, no composite, listed with its missing fields.

User moves the T2 cut from 50 to 55 after seeing the distribution — a one-line change,
re-delivered in minutes.
