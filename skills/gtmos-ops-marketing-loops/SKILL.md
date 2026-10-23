---
name: gtmos-ops-marketing-loops
description: "Turn recurring GTM work into loops that run on a schedule or a trigger -- signal sweeps, reply triage, content refresh, pacing checks, weekly reports -- as GTM OS plays and agent triggers that propose work and wait for a person. With GTM OS connected it builds definition.play automations (event, schedule, segment, metric or webhook triggers), simulates them with play.simulate before anything runs, and lists the approvals they create. Use for \"marketing loop\", \"automate this weekly\", \"recurring workflow\", \"run this every day\", \"agent on a schedule\", \"trigger when\", \"always-on outbound\", \"play\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "agents"
  upstream: "https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/marketing-loops"
  upstream_sha: "e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b"
  upstream_license: "MIT; Copyright (c) 2025 Corey Haines"
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers); 2026-10-23: shipped agent packs and triggers, agent KPIs"
---

# Recurring GTM loops as plays

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`marketing-loops`](https://github.com/coreyhaines31/marketingskills/tree/e85f3cbc2e4a79bf33b2a12e9bdd9087d414735b/skills/marketing-loops) in coreyhaines31/marketingskills (MIT, Copyright (c) 2025 Corey Haines). Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

**1. See what exists.** `plays.catalog` Q (installed plays and their state), `plays.explain` Q (what one does), `agent.trigger.list` Q, `agent.run_list` Q.

**2. Design the loop as a play.** A `definition.play` has a trigger (`manual`, `event`, `schedule`, `metric`, `webhook`, `segment`), a filter, steps (operations, waits, branches) and guardrails. Steps that are E-class propose; the loop never approves its own work. Draft it and propose it with `config.propose_changeset` M; a person signs it.

**3. Simulate first.** `play.simulate` Q runs it with zero writes and shows who it would touch. Only then may a person enable it; `play.trigger` T runs it once on demand.

**4. Agents.** Check the shipped agents before building one. `packages.agents` Q lists every pack that ships agents (`stdlib/pack.core-agents`, `crm-agents`, `data-agents`, `growth-agents`, `ops-agents`, `revenue-agents`), its install state and, per agent, its bounds (steps, cost, deadline), skills, scopes, shipped triggers and the principal registered for this workspace. Enabling a pack is `packages.enable` M, approved by a person. The packs cover signal-led first touches and research briefs, inbound replies, meeting prep, call follow-ups, the weekly pipeline review, deal desk checks, enrichment gaps, the nightly duplicate sweep, the daily SEO and GEO watch, setup and the ops brief, the signal digest, the routing steward, the scoring steward and reply triage. Pack agents propose; they never approve, and they are never granted an operation that spends inside its own call.

A custom trigger uses `agent.trigger.create {agentPrincipalId, type: "manual" | "schedule" | "event", scheduleCron?, eventObjectType?, eventKind?}` D: a schedule takes a 5-field cron (`*` or a fixed number per field), an event takes an object type and an event kind. A trigger only chooses when a run starts; it can never raise the agent's bounds. Event triggers skip bulk writers (imports, CRM sync, enrichment) unless told otherwise, and fires are capped per hour. Pause with `agent.trigger.update`, stop an agent at once with `agent.kill` M. Proposals land in `runtime.list_approvals` Q for a person.

**5. Watch it.** Dry mode (`policy.get_dry_mode`) stops every effect at a draft. Report each loop's results from its operations, and pause loops that produce nothing useful. `agent.kpis {windowDays}` Q gives runs, success rate, approvals proposed vs approved, actions executed, cost and eval pass rate per agent; a rate is null with a reason under its minimum sample, and runs decided by the demo model are excluded. `policy.shadow_report` Q shows what each engine drafted while dry.

## Without GTM OS

Follow the method below with whatever scheduler the user has (cron, Zapier, n8n), and keep a person approving anything that reaches a customer.

---

You help set up **marketing loops** — repeatable marketing workflows an AI agent runs on a cadence, each with a defined trigger, a bounded set of steps, a self-check, and an explicit stopping condition. A loop turns a marketing task you'd otherwise do manually (and forget) into an always-on system: the weekly SEO opportunity scan, the ad-fatigue refresh, the churn-signal watch.

This is the operational cousin of `marketing-ideas`. Ideas tell you *what to try once*. Loops tell you *what to keep doing on a schedule* — and wire the other marketing skills together to do it.

## How to Use This Skill

**Check for product marketing context first:** if `.agents/product-marketing.md` exists (or `.claude/product-marketing.md`, or the legacy `product-marketing-context.md`), read it before asking questions. Use that context and only ask for what's missing.

Then:
1. **Clarify the job.** What outcome should this loop protect or grow? (rankings, ad efficiency, activation, retention, revenue, referrals)
2. **Pick a loop** from the catalog in `references/loop-catalog.md` — or adapt the closest one.
3. **Tune the cadence** to how fast the underlying signal actually changes (see the cadence rule below).
4. **Confirm the human checkpoint.** Decide what the loop does autonomously vs. what it stages for human approval before publishing or spending — see `references/loop-guardrails.md`.
5. **Schedule it** (see "Scheduling a loop" below).

Building more than one loop, or a whole marketing operating system? See `references/loop-orchestration.md` for how loops compose and the order to adopt them (start with tracking + a weekly review; don't build them all at once).

## Anatomy of a Marketing Loop

Every loop in the catalog has these nine parts. When you author or adapt one, fill all of them — a loop missing a stop condition, a self-check, or its state handling is a liability, not an asset.

| Part | What it defines |
|------|-----------------|
| **Check cadence** | How often the loop *looks* (weekly / daily / on-trigger). Match it to signal speed. |
| **Acts when** | The action condition — what must be true to actually *do* something, vs. just check and skip. Most runs of a good loop are "checked, nothing to do." |
| **Purpose** | The one outcome this loop exists to move. |
| **Skills used** | Which marketing skills the loop orchestrates each iteration. |
| **Loop body** | The ordered steps run each iteration. |
| **Self-check** | The verification done *before* acting — so the loop doesn't act on noise, seasonality, or a tracking bug. |
| **State / idempotency** | What the loop remembers between runs: last-run marker, dedupe key, cooldown window, "already handled" set. Without this, loops double-act, re-nag the same people, or re-alert the same thing. Non-negotiable for anything scheduled — see `references/loop-state.md` for where state lives and the idempotency patterns. |
| **Stop / bail-out** | When the loop skips, halts, escalates to a human, or disables itself — plus what it does on error. Every loop needs one, including heartbeat loops (their stop is "manual disable + error-halt," never "n/a"). |
| **Output** | Where results go: a file, a PR, a staged draft, a notification, a report. |

The **Check cadence / Acts when** split matters: a churn-signal loop might *check* daily but only *act* when an account crosses a risk threshold it hasn't been contacted about inside the cooldown window. Conflating the two produces loops that either miss the window or spam.

## The cadence rule

Match cadence to how fast the signal actually changes — not to how often you'd *like* an update.

| Signal | Realistic cadence | Why |
|--------|-------------------|-----|
| Rankings, backlinks, domain authority | Weekly | Move slowly; daily checks are noise |
| Ad creative fatigue, CPA drift | Every 2–3 days | Meta/Google feedback loops are days, not hours |
| Activation / onboarding funnel | Weekly | Needs enough signups to be significant |
| Churn signals | Daily or on-trigger | Early intervention window is short |
| Content / copy decay | Monthly | Traffic erosion is gradual |
| Competitor changes | Weekly | Pricing/positioning shifts are infrequent but matter |
| Social listening / mentions | Daily | Engagement windows close fast |

Over-frequent loops are the most common failure mode: they generate busywork, burn budget, and train you to ignore the output.

## When NOT to loop

Not everything should be automated on a cadence. Skip a loop — or add a mandatory human checkpoint — when:

- **Strategy or creative direction is the real work.** Loops maintain and optimize; they don't set positioning, invent campaigns, or make brand calls.
- **The action publishes or spends without review.** Auto-*drafting* an ad, email, or post is fine. Auto-*publishing* or auto-*shifting budget* needs a human checkpoint unless the user has explicitly authorized autonomous action and set guardrails (caps, allowlists).
- **The signal is too sparse to be significant.** A weekly conversion-rate loop on 40 visitors/week is measuring noise.
- **It's a vanity loop.** If nobody acts on the output, delete the loop. A loop that emails a dashboard nobody reads is worse than nothing.

For any loop that sends, spends, publishes, or touches personal data, apply `references/loop-guardrails.md` — the two-tier action model (autonomous-safe vs. gated), spend/send caps, CAN-SPAM/GDPR/FTC/ToS rules, the always-escalate list, and a required kill switch.

## Scheduling a loop

These loops are agent-agnostic — the *body* works in any agent. The *scheduling* depends on your environment:

- **Claude Code** — native options: `/loop` (self-paced, until a condition), `ScheduleWakeup` (dynamic pacing that reacts to state), and `CronCreate` (fixed cron schedule). If you have a loop-mechanics skill such as `loopify` installed, use it to choose between them and tune delays; otherwise the guidance below is enough.
- **Any agent + cron** — wrap the loop body as a scheduled prompt/script (`0 9 * * 1` for Mondays 9am, etc.).
- **Manual cadence** — for high-judgment loops, "run this skill every Monday" is a perfectly good loop. The value is the repeatable *body*, not the automation.

Default to time-of-day cron for review-style loops (weekly review, ranking watch) and dynamic pacing for monitor-until-threshold loops (churn watch, launch-day tracking).

## The Catalog

`references/loop-catalog.md` holds the full library — 58 marketing loops with thorough funnel coverage: SEO & Content, Paid, Earned/Social/Partnerships, Outbound, Activation, Retention, Revenue, Referral & Advocacy, and Ongoing Ops. Each is a complete, adaptable spec. Start there, pick the closest match, and tune it to the user's product, stage, and tooling.

## Running a whole channel: the SEO operator

When the user wants an agent to own SEO for a site rather than run one loop, use `references/seo-operator.md`. It bundles the SEO loops (site health, claim drift, striking-distance push, AI-answer check, keyword gap, content decay, competitor watch, and more) into one schedule with shared memory in `.agents/seo/`, a first-run checklist, operating rules, a writing gate, and a one-screen weekly report.

## Running outbound: the outbound operator

For an agent running day-to-day outbound (signal sweeps, staged outreach, reply triage, sending-domain health, weekly sequence retros), use `references/outbound-operator.md`. It sets the brief, approved claims, approval rules by tier, shared memory in `.agents/outbound/`, and a weekly report.

## Authoring a new loop

When nothing in the catalog fits, author a new loop from `references/loop-template.md` — a copy-paste template with fill-in prompts, a worked before/after example, and a ship checklist. Fill all nine anatomy parts; if you can't answer the self-check, state/idempotency, and stop/bail-out concretely, the loop isn't ready to run.

## Anti-patterns

- Looping without a stop condition → runaway spend or infinite churn.
- Same cadence for every loop → most run too often and get ignored.
- No self-check → the loop acts on noise, seasonality, or a tracking bug.
- No human checkpoint on spend/publish actions.
- Building 10 loops at once → start with one, prove it earns its keep, then add the next.

## Banned vocabulary

Avoid: "set it and forget it," "fully autonomous marketing," "AI does everything," "10x on autopilot," "growth hacking machine." Loops are disciplined systems with checkpoints, not magic. Describe them honestly.

## Related Skills

- **gtmos-analytics-experiments** — the experimentation loop specifically (hypothesis → test → promote winner → repeat).
- **gtmos-analytics-tracking** — most loops read from analytics to decide whether to act.
- Individual channel skills (`ads`, `seo-audit`, `emails`, `social`, `churn-prevention`, `pricing`, `referrals`) — the loop bodies orchestrate these.
