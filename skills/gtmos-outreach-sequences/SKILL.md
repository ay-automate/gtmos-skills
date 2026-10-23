---
name: gtmos-outreach-sequences
description: "Design a multi-step outbound or nurture sequence: structure, waits, send windows, A/B variants, LinkedIn steps, exits, and how each step is measured. With GTM OS connected it writes the steps as the org's definition.sequence (signed by a person before it runs), binds sequences to it with stepsKey, and reads outreach.step_stats and outreach.learning_report to keep or kill steps and variants. Use for \"build a sequence\", \"design a cadence\", \"A/B test step 2\", \"add a LinkedIn step\", \"which step gets replies\", \"follow-up timing\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/Instantly-ai/instantly-skills/tree/ae104f34af8a70225a6474c3b89b26ce785a6b61/skills/instantly-gtm/references/sequence-playbook.md"
  upstream_sha: "ae104f34af8a70225a6474c3b89b26ce785a6b61"
  upstream_license: "MIT; Copyright (c) 2026 Instantly.ai"
  modified: "2026-10-23: rebranded and adapted for GTM OS (step plans as definition.sequence, A/B variants and LinkedIn steps, exits, step stats and the learning report; proof discipline tied to the proof library; Instantly payload shape removed)"
---

# Outreach sequences

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`sequence-playbook`](https://github.com/Instantly-ai/instantly-skills/tree/ae104f34af8a70225a6474c3b89b26ce785a6b61/skills/instantly-gtm/references/sequence-playbook.md) in Instantly-ai/instantly-skills (MIT, Copyright (c) 2026 Instantly.ai). Changed for GTM OS: the operating section below (step plans as `definition.sequence`, variants, LinkedIn steps, exits, step stats), the proof rule tied to the proof library, the Instantly payload shape removed. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

A sequence in GTM OS is a campaign whose steps follow the org's **step plan**, a `definition.sequence`. Without one it runs the classic cadence (a step every 3 days). Confirm the schema with `gtm_describe` and the kind reference before the first call.

**1. Read first.** `sequence.list` Q and `sequence.get {sequenceId}` Q (roster, sent and reply counts, and the step plan with `signed` and `reason`); `config.list {kind: "definition.sequence"}` for plans that exist; `definition.lane` and `lane.list` Q for the channels and caps; `outreach.learning_report` Q for angles and steps that already win here.

**2. Write the step plan.** A `definition.sequence` has a `label`, 1 to 20 `steps` and `exits`. Each step has a `key`, a `channel` (`email` or `linkedin`), a `wait` (`amount` in `days` or `business_days`), an optional `sendWindow` in the recipient's time (`start`, `end`, ISO `days`), a `template` or a `brief` for the drafting agent, and optional `variants` (2 to 5, weighted). A LinkedIn step sets `linkedin.action`: `message`, `connect`, `connect_then_message` (with a `note` and an `acceptWait` that moves on or exits) or `inmail`. Exits: reply, unsubscribe, bounce and manual stop are always on; meeting booked and a stage change are your choice.

**3. Propose it.** `config.propose_changeset` M with the spec, `config.validate_changeset` Q, then `definition.propose_for_signing`; a different person signs it, and it runs in prod once signed and promoted. Until then a bound sequence's members wait, with that reason.

**4. Bind and run.** `sequence.create {name, goal, lane, stepsKey}` D or `sequence.update {sequenceId, stepsKey}` D; members keep the steps already sent. Enrol with `sequence.enroll` D and activate with `sequence.update {status: "active"}` D once a person agrees. Every step's send is proposed and approved by a person, and passes the claims gate.

**5. Measure per step.** `outreach.step_stats {sequenceId?}` Q: per step and variant, sent, replied, positive replies, meetings and bounces, with rates once a step has 30 sends (null with a reason before). Meetings are null without a meeting source; bounces only where the provider reports them. Change one thing at a time, and never call a variant the winner on a null rate.

## Without GTM OS

Use the playbook below to draft the sequence in your sending tool. Keep one idea and one ask per step, put the waits and send windows next to each step, and decide up front which events end the sequence (a reply on any channel always does).

---

Goal: proven skeletons and copy rules so a sequence is good on the first pass. Pick a structure, personalize with what you actually know, keep it human. Copy for each step comes from `gtmos-outreach-cold-email`; this skill decides the shape.

## Structures (pick by goal)

**A. 3-step intro, bump, breakup** (default; fastest to ship)
1. Intro: one relevant reason you are reaching out and a soft single ask. (wait 3 days)
2. Bump: a new angle, shorter than step 1. (wait 3 to 4 days)
3. Breakup: "should I close the loop?" Clean, no guilt. (end)

**B. 4-step value ladder** (more considered buyers)
1. Problem: name the pain the persona feels. (3 days)
2. Proof: a specific result for a similar company, only from approved proof. (3 to 4 days)
3. New angle: a different pain, a different outcome, or a resource. (4 days)
4. Breakup. (end)

**C. Trigger-based** (highest reply rate when you have a signal)
Open with the trigger (funding, hiring, launch, news), tie it to the outcome you deliver, soft ask. Follow-ups as in A. Use it when the list was built from verified signals.

**D. Email plus LinkedIn**
1. Email intro. (2 business days)
2. LinkedIn connect, with a note that asks for nothing; wait up to a week for the accept, then move on. (`connect_then_message`)
3. LinkedIn message after the accept: two to four sentences, one small ask.
4. Email breakup.
A reply on either channel ends the sequence for that person.

## Personalization hierarchy (best to acceptable)

1. **Signal-based**: reference the actual trigger ("saw you are hiring 5 SDRs").
2. **Role-pain**: the persona's known pain, from the org's personas.
3. **Company-context**: industry and size framing.
4. **Generic-but-relevant**: never "I came across your website".

Put the sharpest hook in the first line. A per-lead first line comes from `gtmos-outreach-first-lines`; without one, fall back to role-pain.

## Copy rules (deliverability and replies)

- One idea and one ask per step. Short: step 1 under about 100 words.
- Plain-text feel; no links or images in step 1.
- Subjects: lowercase, specific, plain, not shouty. Under about 60 characters.
- Write like a person to a person: no hype, no "hope this finds you well".
- Ask a question the reader can answer in one line.
- The final step is a genuine breakup; it often gets the most replies.
- Clarity over cleverness: no spintax.

## Subject craft

Make the subject look like it is not marketing: lowercase, a 2 to 4 word fragment, no sales words (a first-name prefix like `{{firstName}} - quick one` reads personal). Follow-ups carry no subject, so they thread onto step 1. The subject's only job is to not look like an ad.

## Framework shapes (pick one)

| If the pain is... | Shape | The move |
|---|---|---|
| Quantifiable, ops buyer | Do the math | trigger, back-of-napkin cost, ask |
| You hold real intel | Permissionless value | hand over the intel, no pitch |
| Founder pitched constantly | Ask before pitch | the question is the ask |
| High-volume SMB | Short trigger | under about 30 words, soft close |
| Known industry-wide pain | Challenge of similar companies | "teams like yours hit X" (never a named customer without proof) |

## Cold ask ladder (interest before calendar)

At the cold stage, interest asks out-pull calendar asks, so climb instead of leading with a meeting:

| Touch | Job | Ask |
|---|---|---|
| 1 | the observation (most of the effort) | soft interest ("worth exploring?"), no link |
| 2 | a new angle question, not a bump | still interest |
| 3 | offer the asset (only now) | "want me to send it?" |
| 4 | first calendar ask, the link appears | the meeting (a real booking link, or "reply to this email") |
| 5 | binary breakup | "1, 2, or 3?" |

Cap at about 5 steps. Warm and reply stages can ask for the meeting first.

## A/B variants

- Test one thing per step: the subject, the opener, the ask. Two variants is enough; more splits the sample.
- Weight a new variant lower until it has sends.
- A rate under 30 sends is not a result. Keep both variants running until each has enough sends, then keep the one with the higher positive-reply or meeting rate, not the higher open or reply count.

## Proof discipline

Specificity is about their world, not your stats. Hold product proof for a later step, framed as a pattern ("what we see across teams"), never a promise, a competitor's name, or a claim that a named company is a customer unless approved proof names it. An honest limit reads more credibly than a guarantee ("nothing can guarantee X, here is what we do about it").

## Worked example 1: SaaS to a Series A fintech VP of Sales (3 steps)

- **Step 1** subject: `{{firstName}} - quick one`. "Hi {{firstName}}, noticed {{companyName}} just raised, which usually means reps get hired faster than they can ramp. Curious how you are handling that stretch, worth exploring?" (observation, no product claim; wait 3 days)
- **Step 2** no subject (threads). "Following on, the ramp gap tends to bite hardest in a new rep's first 60 days. How are you getting them productive today?" (new angle, still interest; wait 4 days)
- **Step 3** no subject. "Last note from me, {{firstName}}: is fixing rep ramp a this-quarter thing or not right now?" (clean binary breakup)

## Worked example 2: agency to an ecommerce founder (4-step ladder)

Step 1 observation (their CAC math, no product claim), step 2 a new-angle question, step 3 offer a short teardown ("want me to send it?"), step 4 a clean binary breakup. Interest first; a calendar link only once it reaches a meeting ask.

> These examples are patterns to adapt to the user's real offer and voice. Never send them verbatim.
