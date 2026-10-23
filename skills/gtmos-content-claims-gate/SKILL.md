---
name: gtmos-content-claims-gate
description: "Check every claim in a piece of copy -- emails, sequence steps, LinkedIn messages, ads, pages, scripts, one-pagers -- against approved proof: keep, rewrite or cut each line, and list the proof that would bring a cut line back. With GTM OS connected it reads the proof library (proof.list, usable items only) and the org's claims policy (policy.claims.get), mirrors the claims gate every send and publish passes, and turns missing proof into a draft proof source a person activates. Use for \"check the claims\", \"can we say this\", \"is this claim backed\", \"fact-check this copy\", \"why was my send blocked\", \"claims gate\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "content"
  upstream: "https://github.com/gooseworks-ai/goose-skills/tree/6d5d5f160c623613d7eb682b6a467beb165cc2a4/marketing-agent/skills/claims-gate"
  upstream_sha: "6d5d5f160c623613d7eb682b6a467beb165cc2a4"
  upstream_license: "MIT; Copyright (c) 2026 GooseWorks"
  modified: "2026-10-23: rebranded and adapted for GTM OS (the proof library and the org's claims policy replace the GooseWorks brand record; scoped sign-off becomes proof activation by a person; tool steps removed; claim types kept in references/)"
---

# Claims gate

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`claims-gate`](https://github.com/gooseworks-ai/goose-skills/tree/6d5d5f160c623613d7eb682b6a467beb165cc2a4/marketing-agent/skills/claims-gate) in gooseworks-ai/goose-skills (MIT, Copyright (c) 2026 GooseWorks). Changed for GTM OS: the operating section below (the proof library, its usage and the org's claims policy), the GooseWorks brand-record and brain steps replaced by proof activation by a person, the claim-types table kept in `references/claim-types.md`. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

GTM OS enforces this gate itself: every proposed email, LinkedIn message, sequence step, page publish and meeting invite is checked against the proof library when it is proposed and again right before it runs. This skill runs the same check earlier, while the copy can still change.

**1. Read the contract.** `policy.claims.get` Q returns the mode (`block`: a claim with no approved proof refuses the proposal; `route_to_approver`: the approver acknowledges each flagged claim with `runtime.acknowledge_claim`) and the `needsReviewThreshold`. `proof.list` Q is the library: only items with `usable: true` (approved, not expired, not internal only) back a claim, each with its claims, numbers, permission and expiry. `voice.customer_language.list` Q gives approved customer phrases. `brand.get` gives forbidden claims and avoid words.

**2. Check the spans.** Use the method below. A claim is usable only when an active proof claim says the same thing with the same numbers, in scope; a close match with the same numbers reads `needs_review`; anything else is unsubstantiated. "40%" never backs "4x".

**3. Act and report.** Keep, rewrite to a usable claim or plain fact, or cut. Each cut lists the line, where it was, why, and the proof that would restore it. Then `brand.check_text` Q on the result.

**4. Missing proof.** You cannot approve a claim. Turn the evidence the user has into a draft proof source: `proof.extract_from_document` D (reads a PDF, Word, Excel, CSV or pasted text and proposes claims quoted verbatim, through the org's model) or `proof.create` D. A person then proposes it (`proof.propose_activation`, human only) and a different person approves it. Until then the line stays out of anything sent or published. `proof.usage` Q shows where a claim was already used.

**5. Blocked sends.** When a proposal was refused or flagged, the refusal names the claims; `runtime.get_approval` Q reads the proposal and its history, and `proof.usage` Q the verdicts recorded per proof claim. Rewrite the copy and propose again; never retry it unchanged. Changing the policy (`policy.claims.set`) is human only.

## Without GTM OS

Ask the user for their approved claims list (with the proof behind each claim, its scope and its date) and check the copy against it with the method below. Anything not on the list is cut or marked `[proof needed]`, with what would restore it. This is not legal advice.

---

One contract for every skill that writes copy, scripts, briefs, emails, posts, pages or captions. Only approved proof makes a claim usable; this check never approves one. The calling skill keeps its own extract step (on-image text, video scenes, page sections) and hands this check the spans.

Say it to the human in plain words ("two lines need proof before I use them"), never as tool or skill names.

## 1. Load the contract (once per job)

1. **The approved claims.** With GTM OS: the usable items of the proof library and their claims, each one verbatim, within its scope (customer, industry, persona), before its expiry, with its permission. Without GTM OS: the approved claims list the user gave you, read the same way.
2. **Never approved, whatever the label:** marketing copy on the live site, a description or value proposition in a kit, search snippets, press quotes, reviews or testimonials not on the list, and a yes in chat that did not go through §4 below.
3. **Always apply** every forbidden claim, avoid word and required qualifier in the brand voice.
4. **Plain product facts** are always usable: product name, price, features, integrations, how to use it, current policies. Never benefit or outcome wording.
5. **Current offers and prices** count as plain facts only when the human confirms in this job that they are live (offers carry their end date). Nothing else about an offer ("best price ever", "limited") is a plain fact.

## 2. Check the spans

For each claim-like span (copy, headline, on-image text, badge, script line, subject line, caption, page sentence, and what a picture implies):

1. **Puffery or claim?** If a test could prove it false, it is a claim ("cuts onboarding to a week", "2x faster"). Feel words that promise no outcome are puffery ("a calmer inbox").
2. **Type and risk** from [`references/claim-types.md`](references/claim-types.md). Regulated categories (health, beauty, supplements, food, finance, kids) are verbatim only.
3. **Quoted claims are the brand's claims:** a press quote, review or testimonial reused in copy must pass for the claim inside it.
4. **Implied claims count:** a before/after, a "certified" badge, a product name stretched into a promise.
5. **Named customers, logos and backers.** A named customer, logo, customer result or case study is usable only when it is approved proof with permission to name the customer, never from the site or a search hit alone. A plainly test-named company ("Test Co", "Demo Brand", "Acme" in real copy) is never offered. "Backed by <investor>", "funded by" and "used by <company>" need a dated public source before §4 may offer them; without one, cut.
6. **Numbers must match.** A claim's numbers must appear in the proof claim that backs it. "40%" never backs "4x"; a range never backs its upper bound alone.

## 3. Act and report

- **Keep**: the span is a usable claim (verbatim, in scope, in date, qualifier attached and legible) or a plain product fact.
- **Rewrite**: to a usable claim, a plain product fact or puffery. Never strengthen.
- **Cut**: anything else. Each cut is listed as `line -> where it was -> why -> the proof that would restore it` (for example "'cut ramp time in half' -> email 2, line 1 -> outcome claim with no proof -> a case study with the before and after ramp time, and permission to name the customer").
- **Forbidden**: cut, and say plainly it is a legal, platform or brand rule, not a matter of taste.

Give the result in one short line per asset in chat; the cut list goes in the output.

## 4. Missing proof (when the job needs a line nobody has backed)

Run it when a line the job depends on is not usable under §1. It never makes a line usable by itself.

1. **Pick the 3 to 5 load-bearing lines**: the benefit line, the hook's promise, the offer. Not everything the job could say.
2. **Ask for the evidence, not for a yes.** For each line: the exact wording, what kind of claim it is, the proof on file or "no proof on file", and your recommendation (add proof / add this qualifier / reword to ... / leave it out). Say once that this is not legal advice. High-risk lines (efficacy, comparative, testimonials implying results, security or compliance attestations) need a document behind them; a person's word is enough only for a verifiable fact about the business.
3. **Turn the evidence into proof.** With GTM OS, the evidence becomes a draft proof source, and a person activates it (§ "With GTM OS connected", step 4). Without GTM OS, the user adds the line to their approved list with its source, scope and review date.
4. **Until then, leave it out.** Ship the job with the usable claims and plain product facts, and say which lines were left out and what would restore them. A draft may show a waiting line labelled "needs proof", never as approved.

## Review dates

When the user records a new approved claim, suggest a review date: offers end on their end date; ratings, review counts and prices after 90 days; certifications at their expiry; awards two years after the award year; everything else after one year.
