<!-- Source: https://github.com/salesforce/salesforce-skills/blob/6b989d6490589647c4c164f7f55c2797cf322f04/salesforce-for-sales/skills/handle-objection/SKILL.md
     License: Apache-2.0 (Copyright (c) 2026 Salesforce, Inc.); full text in licenses/Apache-2.0-salesforce-salesforce-skills.txt of this repository. Modified: the YAML frontmatter and the Salesforce connector bootstrap block were removed; the text below is otherwise unchanged. -->

# Reference: `handle-objection` from salesforce/salesforce-skills

Merged into `gtmos-sales-enablement`. Read it for the upstream method; run the work the GTM OS way described in `../SKILL.md`.

> The upstream skill opens with a Salesforce connector bootstrap (connectivity checks and global rules for the Salesforce Headless 360 MCP server). It is not carried here, because it applies only to that connector.


# Handle Objection

A grounded response, not a script: what the objection means, how deals like it went, and your own customers' evidence that answers it. Inputs: **the objection** (their words / email / transcript) and **the deal** (opp for context). Common objections/competitors/differentiators are external — infer from org data or ask once; never invent.

## 1. Classify what's really being said

Map to type: price/value · timing/priority · competitive · risk/trust · authority ("check with…") · status quo. Distinguish an **objection** (reason not to buy) from a **negotiation move** (reason to buy cheaper) — the response differs.

## 2. Pull your own evidence (fire in parallel)

- **Win/loss** (`win-loss-review`): how deals with this objection ended; what wins did differently.
- **Customer voice** (`customer-voice`): verbatim quotes speaking to this exact concern.
- **Docs**: case studies, ROI, security/compliance already cleared for external use.
- **The deal itself**: what this customer already told you (their stated pain/metrics are the best rebuttal).

## 3. Build the response

```
# Objection: "<their words>"
## What's underneath it
<1–2 sentences: the real concern; objection vs negotiation>
## The response
<talk track in your voice, 3–5 sentences: acknowledge → answer with their own stated goals + one proof point → question that moves it forward>
## Proof points to have ready
- <customer quote / case study / metric — with source>
## If it's <competitor>
- Where they're strong (be honest) + where this customer's needs don't match it; the trap question that surfaces the difference
## What history says
<from win/loss: how often this objection appears in wins vs losses, and what winning reps did next>
## Don't
- <the response that historically loses this — overdiscounting, feature-dumping, arguing>
```

Objection arrived in writing? Offer to draft the reply via `draft-outreach`.
