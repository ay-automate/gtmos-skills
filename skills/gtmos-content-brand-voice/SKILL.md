---
name: gtmos-content-brand-voice
description: "Codify the brand voice -- tone, preferred and avoided words, example phrases, voice samples and forbidden claims -- as a signed GTM OS definition, then check any copy against it. With GTM OS connected it reads the current voice (brand.get), drafts a definition.brand_voice from real samples, proposes it for a human to sign, and gates every draft with brand.check_text. Use for \"brand voice\", \"tone of voice\", \"brand guidelines\", \"style guide\", \"words to avoid\", \"forbidden claims\", \"does this sound like us\", \"check this copy against our brand\"."
license: MIT
metadata:
  version: "0.1.0"
  category: "content"
  upstream: "https://github.com/zapier/gtm-cheat-codes/tree/022a2884f40316ef22269e29fd61b8a0f0c4cb4a/skills/marketing/brand-guidelines-builder"
  upstream_sha: "022a2884f40316ef22269e29fd61b8a0f0c4cb4a"
  upstream_license: "MIT; Copyright (c) Zapier, Inc."
  modified: "2026-10-22: rebranded and adapted for GTM OS (GTM OS operating section, cross-references, tool pointers)"
---

# Brand voice

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`brand-guidelines-builder`](https://github.com/zapier/gtm-cheat-codes/tree/022a2884f40316ef22269e29fd61b8a0f0c4cb4a/skills/marketing/brand-guidelines-builder) in zapier/gtm-cheat-codes (MIT, Copyright (c) Zapier, Inc.). Changed for GTM OS: the operating section below, rewritten cross-references and tool pointers. Notices: [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md).

## With GTM OS connected

**1. Current state.** `brand.get` Q returns the signed voice, its version, forbidden claims, avoided words and voice samples. `voice: null` means none is signed yet.

**2. Draft from evidence.** Collect real samples (the site, sent emails that got replies from `sequence.messages`, approved posts) and customer phrases (`voice.customer_language.list`, when available). Build the spec: `label`, `tone[]`, `vocabulary.preferred[]`, `vocabulary.avoid[]`, `examplePhrases[]`, `voiceSamples[{title, text}]` (up to 20), `forbiddenClaims[{phrase, reason, match}]` (up to 200).

**3. Propose, never sign.** `config.propose_changeset` M with the `definition.brand_voice` (key `default`); a person reviews and signs it. Until it is signed, drafts are not checked against it.

**4. Check copy.** `brand.check_text` Q returns violations (`forbidden_claim`, `avoid_word`) with the phrase and excerpt. Every Outreach and SEO draft is checked the same way before send or publish.

## Without GTM OS

Write the guidelines as a document with the same fields (tone, preferred and avoided words, examples, forbidden claims), using the method below, and check copy against them by hand.

---

Use this skill to review creative assets, campaign ideas, or page concepts against a brand system.

## Workflow

1. Ask for the asset, brief, audience, and channel when missing.
2. Review color, typography, logo usage, imagery, layout, and tone.
3. Score alignment and explain issues in plain language.
4. Provide prioritized fixes and escalation guidance.

## Zapier MCP And SDK Role

- Use Zapier MCP to read approved brand docs, asset libraries, and design references.
- Use Zapier SDK only if the team wants a repeatable review intake queue or feedback log.
- Keep official guideline changes and final external use human-approved.

## Guardrails

- Do not invent brand rules.
- Link only to approved public or team-approved brand resources.
- Keep feedback practical and kind.
