---
name: gtmos-outreach-cold-email
description: Write and run B2B cold outbound that gets replies -- first-touch emails, follow-ups, multichannel cadences with LinkedIn and calls, deliverability, and reply handling. With GTM OS connected it drafts through the Outreach engine (outreach.draft_personalized_message), grounds every claim in the approved proof library, checks copy with brand.check_text and proposes sends for a human to approve; dry mode ends at the draft. Use for "cold email", "outbound sequence", "SDR emails", "follow-up sequence", "nobody's replying", "deliverability", "sending domains", "warm up inboxes", "LinkedIn outreach", "multichannel cadence", "handle replies", "AI SDR". For building the list see gtmos-leads-prospecting; for lifecycle email see gtmos-lifecycle-email.
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/cold-email"
  upstream_sha: "e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b"
  upstream_license: "MIT; Copyright (c) 2025 Corey Haines"
  merged_from: "https://github.com/Instantly-ai/instantly-skills/tree/ae104f34af8a70225a6474c3b89b26ce785a6b61/skills/instantly-gtm/modules/sequence-writer"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers); 2026-10-23: claims gate, step plans (definition.sequence), step stats, LinkedIn seats"
---

# Cold email and multichannel outbound

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`cold-email`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/cold-email) in coreyhaines31/marketingskills (MIT, Copyright (c) 2025 Corey Haines). Merged with [`sequence-writer`](https://github.com/Instantly-ai/instantly-skills/tree/ae104f34af8a70225a6474c3b89b26ce785a6b61/skills/instantly-gtm/modules/sequence-writer) from Instantly-ai/instantly-skills (MIT), kept in `references/instantly-sequence-writer.md`. Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

GTM OS runs outbound through the **Outreach engine**. You write and refine; the engine drafts, checks and queues; a person approves every send. Confirm each schema with `gtm_describe` before the first call.

**1. Read before you write.** Nothing here needs the user to re-type what the org already defined.

| Read | Why |
|---|---|
| `policy.get_dry_mode`, `policy.engine_modes.get` | In dry mode a send ends as a draft. Say so up front. |
| `brand.get` (`definition.brand_voice`) | Tone, preferred and avoided words, forbidden claims, voice samples. |
| `definition.persona`, `definition.segment`, `definition.scoring_model` | Who this is for and why they qualify. |
| `score.explain_subject` on the contact or account | The verified reasons (signals, fit) behind the touch. These are your research signals. |
| `signals.list` for the account | Funding, hiring, job changes, page changes, each with its source. |
| `proof.list` | The only allowed source for results, metrics, logos and quotes. Use *active* proof only. |
| `voice.customer_language.list` | The customer's own words for pains and outcomes. |
| `outreach.learning_report` | Which angles, proof and steps actually win replies here. |
| `definition.lane`, `outreach.sending_mailboxes` | Which channel and mailbox the send can run on, with caps and warm-up. |

**2. Draft through the engine.** `outreach.draft_personalized_message {contactId, channel, goal}` (*spends inline*: it calls the org's model, so quote the cost to the user and get a yes first) retrieves the indexed context (and the approved proof and customer language) and drafts toward the goal. If no model provider is configured it returns a plain templated draft and says `reasoningMode: "unavailable"`; report that, do not dress it up. For a hand-written message use `outreach.draft_message`. Then apply the method below to edit the draft.

**3. Gate the copy.** Run `brand.check_text` on the subject and body. Fix every `forbidden_claim` and `avoid_word` before going on. Every number, customer name or result in the copy must trace to an active proof item; if it does not, cut it or ask for proof. Never invent a case study, a metric or a "companies like yours" claim. The send itself passes the claims gate (`policy.claims.get`): in `block` mode an unbacked claim refuses the proposal, in `route_to_approver` mode the approver must acknowledge each flagged claim. Use `gtmos-content-claims-gate` to check the copy before you propose.

**4. Sequence it.** For a cadence, `sequence.create {name, goal, lane, stepsKey?}` creates it in draft; `sequence.enroll {sequenceId, contactIds}` adds people; `sequence.update {id, status: "active"}` starts it, and the cadence engine drafts each member's steps for approval. Without `stepsKey` a sequence runs the classic cadence (a step every 3 days); with one it follows the org's signed `definition.sequence` (steps, waits, send windows, A/B variants, LinkedIn steps, exits). Design that step plan with `gtmos-outreach-sequences`. Enrollment skips anyone suppressed, not contactable or without an email, and says why; pass the skip list back to the user instead of retrying.

**5. Propose the send.** `outreach.send_message {messageId, laneKey, environmentId, mailbox}` checks contactability and suppression, then **proposes**. A different person approves it under *Needs a human* (`runtime.list_approvals`). You never approve, and you never resend a rejected message unchanged. A send whose outcome was uncertain is resolved by a person (`sequence.message.resolve_uncertain`), never by resending. LinkedIn steps run on the org's LinkedIn seats with caps and warm-up, and only after an owner accepted LinkedIn's risk; see `gtmos-outreach-linkedin`.

**6. Replies and learning.** `replies.list` and `sequence.replies` show what came back; labels come from `definition.reply_labels`. A reply stops every channel for that person. Read `outreach.kpis` for reply and bounce rates, `outreach.step_stats` for each sequence step and A/B variant, and `outreach.learning_report` for what wins by angle, proof, persona and subject style. Rates are null under 30 sends: say "not enough data yet" rather than quoting a rate.

## Without GTM OS

Follow the method below as written. Ask the user for the ICP, the offer, real proof and any research signals, and say which inputs are missing. Use whatever sending tool they have (Gmail, Instantly, lemlist, Outreach); the deliverability, cadence and reply rules in the references still apply. Do not fill gaps with invented proof: leave a marked placeholder such as `[proof: customer result needed]`.

---

You are an expert in cold outbound. Your goal is to write emails that sound like they came from a sharp, thoughtful human — not a sales machine following a template — and to make sure they reach the inbox, work alongside the other channels, and turn replies into meetings.

## Before Writing

**Check for context first:**
With GTM OS connected, read the org definitions named in *With GTM OS connected* above before asking anything. Without it, read `.agents/product-marketing.md` (or `.claude/product-marketing.md`) if it exists; `gtmos-marketing-positioning` writes that file. Ask only for what neither covers.

Understand the situation (ask if not provided):

1. **Who are you writing to?** — Role, company, why them specifically
2. **What do you want?** — The outcome (meeting, reply, intro, demo)
3. **What's the value?** — The specific problem you solve for people like them
4. **What's your proof?** — A result, case study, or credibility signal
5. **Any research signals?** — Funding, hiring, LinkedIn posts, company news, tech stack changes

Work with whatever the user gives you. If they have a strong signal and a clear value prop, that's enough to write. Don't block on missing inputs — use what you have and note what would make it stronger.

---

## Writing Principles

### Write like a peer, not a vendor

The email should read like it came from someone who understands their world and isn't trying to sell them something. Use contractions. Read it aloud. If it sounds like marketing copy, rewrite it.

### Every sentence must earn its place

Cold email is ruthlessly short. If a sentence doesn't move the reader toward replying, cut it. The best cold emails feel like they could have been shorter, not longer.

### Personalization must connect to the problem

If you remove the personalized opening and the email still makes sense, the personalization isn't working. The observation should naturally lead into why you're reaching out.

See [personalization.md](references/personalization.md) for the 4-level system and research signals.

### Lead with their world, not yours

The reader should see their own situation reflected back. "You/your" should dominate over "I/we." Don't open with who you are or what your company does.

### One ask, low friction

Interest-based CTAs ("Worth exploring?" / "Would this be useful?") beat meeting requests. One CTA per email. Make it easy to say yes with a one-line reply.

---

## Voice & Tone

**The target voice:** A smart colleague who noticed something relevant and is sharing it. Conversational but not sloppy. Confident but not pushy.

**Calibrate to the audience:**

- C-suite: ultra-brief, peer-level, understated
- Mid-level: more specific value, slightly more detail
- Technical: precise, no fluff, respect their intelligence

**What it should NOT sound like:**

- A template with fields swapped in
- A pitch deck compressed into paragraph form
- A LinkedIn DM from someone you've never met
- An AI-generated email (avoid the telltale patterns: "I hope this email finds you well," "I came across your profile," "leverage," "synergy," "best-in-class")

---

## Structure

There's no single right structure. Choose a framework that fits the situation, or write freeform if the email flows naturally without one.

**Common shapes that work:**

- **Observation → Problem → Proof → Ask** — You noticed X, which usually means Y challenge. We helped Z with that. Interested?
- **Question → Value → Ask** — Struggling with X? We do Y. Company Z saw [result]. Worth a look?
- **Trigger → Insight → Ask** — Congrats on X. That usually creates Y challenge. We've helped similar companies with that. Curious?
- **Story → Bridge → Ask** — [Similar company] had [problem]. They [solved it this way]. Relevant to you?

For the full catalog of frameworks with examples, see [frameworks.md](references/frameworks.md).

---

## Subject Lines

Short, boring, internal-looking. The subject line's only job is to get the email opened.

- 2-4 words, lowercase, no punctuation tricks
- Should look like it came from a colleague ("reply rates," "hiring ops," "Q2 forecast")
- No product pitches, no urgency, no emojis, no prospect's first name

See [subject-lines.md](references/subject-lines.md) for the full data.

---

## Follow-Up Sequences

Each follow-up should add something new — a different angle, fresh proof, a useful resource. "Just checking in" gives the reader no reason to respond.

- 3-5 total emails, increasing gaps between them
- Each email should stand alone (they may not have read the previous ones)
- The breakup email is your last touch — honor it

See [follow-up-sequences.md](references/follow-up-sequences.md) for cadence, angle rotation, and breakup email templates.

---

## Before You Send

Copy only matters if it reaches the inbox. Before the first send:
- Send from **secondary domains**, never your primary one, with SPF, DKIM, and DMARC set up and mailboxes warmed for 3–4 weeks.
- **Verify every list** right before upload and keep bounces under 2%.
- **Turn off open and click tracking.** Measure replies.
- Include a plain-text **opt-out line and your postal address** in every email.

Domain and mailbox math, the Google, Yahoo, and Microsoft rules, monitoring, and stop-loss thresholds are in [deliverability.md](references/deliverability.md).

---

## Beyond Email

Most outbound that works in 2026 runs on more than one channel:
- **LinkedIn**: profile, limits, the engage-then-connect sequence, message copy, and the automation decision. See [linkedin-outreach.md](references/linkedin-outreach.md).
- **Cadence**: how email, LinkedIn, calls, video, and ads fit together by tier, and the rule that a reply on any channel stops all of them. See [multichannel-cadence.md](references/multichannel-cadence.md). Call scripts are in the `gtmos-sales-enablement` skill.
- **Plays**: value-first teardowns for services, product-led outbound for self-serve SaaS, problem-led outbound with a free sample, and founder-led outreach. See [outbound-plays.md](references/outbound-plays.md).

## When They Reply

Classify every reply (positive, information request, objection, not now, referral, out of office, unsubscribe), answer positive replies within minutes, and book with two proposed times plus a link. What an agent can handle alone and what needs a human is in [reply-handling.md](references/reply-handling.md).

---

## Quality Check

Before presenting, gut-check:

- Does it sound like a human wrote it? (Read it aloud, and check for the AI tells below)
- Would YOU reply to this if you received it?
- Does every sentence serve the reader, not the sender?
- Is the personalization connected to the problem?
- Is there one clear, low-friction ask?

---

## What to Avoid

- Opening with "I hope this email finds you well" or "My name is X and I work at Y"
- Jargon: "synergy," "leverage," "circle back," "best-in-class," "leading provider"
- Feature dumps. One proof point beats ten features
- AI tells, which prospects spot in the first line and delete:
  - Contrast reveals ("It's not about X, it's about Y") and "no X, no Y, no Z" lists
  - A claim followed by a comma and more restating clauses
  - Self-answered questions ("The result? 40% more meetings.") and colon reveals. A real question you want them to answer is fine
  - Stock phrases: "Here's the thing," "I'll be honest," "Quick question" as an opener, "Say goodbye to," "Unlock," "Take it to the next level"
  - Em dashes
  - For the full blacklist, use the **gtmos-content-copywriting** skill's AI-tells reference
- HTML, images, or multiple links
- Fake "Re:" or "Fwd:" subject lines
- Identical templates with only {{FirstName}} swapped
- Asking for 30-minute calls in first touch
- "Just checking in" follow-ups

---

## Data & Benchmarks

The references contain performance data if you need to make informed choices:

- [benchmarks.md](references/benchmarks.md) — Reply rates, conversion funnels, expert methods, common mistakes
- [deliverability.md](references/deliverability.md) — Sending domains, mailboxes, mailbox-provider rules, warmup, monitoring, stop-loss rules
- [linkedin-outreach.md](references/linkedin-outreach.md) — LinkedIn profile, limits, sequence, copy, automation risk
- [multichannel-cadence.md](references/multichannel-cadence.md) — Cadences by tier, cross-channel rules, calls, video, direct mail, ads
- [outbound-plays.md](references/outbound-plays.md) — Value-first teardown, product-led, problem-led, and founder-led plays
- [reply-handling.md](references/reply-handling.md) — Reply types, speed, booking, early objections, agent permissions
- [personalization.md](references/personalization.md) — 4-level personalization system, research signals
- [subject-lines.md](references/subject-lines.md) — Subject line data and optimization
- [follow-up-sequences.md](references/follow-up-sequences.md) — Cadence, angles, breakup emails
- [frameworks.md](references/frameworks.md) — All copywriting frameworks with examples

Use this data to inform your writing — not as a checklist to satisfy.

---

## Tools

With GTM OS connected, run this work through the connectors and operations in *With GTM OS connected*; they keep approvals, dry mode, spend caps and provenance in force. Without GTM OS, the upstream [tools registry](https://github.com/coreyhaines31/marketingskills/blob/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/tools/REGISTRY.md) lists setup guides for common tools.

---

## Related Skills

- **gtmos-leads-prospecting**: For building and qualifying the prospect list, signals, enrichment, verification, and account research — the natural upstream step before cold-email
- **gtmos-content-copywriting**: For landing pages and web copy
- **gtmos-lifecycle-email**: For lifecycle/nurture email sequences (not cold outreach)
- **gtmos-content-social**: For LinkedIn and social posts
- **gtmos-marketing-positioning**: For establishing foundational positioning
- **gtmos-revops-lifecycle**: For lead scoring, routing, pipeline management, and the outbound stage model
- **gtmos-sales-enablement**: For cold call scripts, voicemails, and deal-stage objections
- **gtmos-ops-marketing-loops**: For running outbound on a schedule (signal sweeps, reply triage, domain health, sequence reviews)
