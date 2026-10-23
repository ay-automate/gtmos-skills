# Changelog

All notable changes to this repository. Versions follow [Semantic Versioning](https://semver.org/); each release is a git tag with `manifest.json` attached.

## 0.1.2 (unreleased)

- gtmos-engine-catalog: the Score defaults follow GTM OS 0.2.5 S2 -- the intent default is `score.default.v2` (decay per signal family, first-party evidence x1.5, the competitor cap, reply / bounce negatives) and the ICP-fit fallback is a neutral, size-only B2B ICP (no region, industry or team-size preference).

## 0.1.1 (2026-10-22)

- Every adapted skill opens its GTM OS section with the shared rules (dry mode first, effects proposed and approved by someone else, numbers only from operation results, claims only from the proof library), and `skills/GTMOS-RULES.md` ships beside the skills.
- The proof library, customer language, score learning and outreach learning operations are documented as available (they are in the current GTM OS release).
- Tools that are not shipped here (upstream scripts, assets, CLIs, slash commands, subagents) are linked at their pinned upstream location or rewritten as steps.
- Attribution links show the upstream skill names; the notices link works after install.
- THIRD-PARTY-NOTICES: per-skill licences for anthropics/skills and openai/skills.
- LICENSE is the plain MIT text; the plugin marketplace drops a non-standard field.

## 0.1.0 (2026-10-22)

First release: 94 skills.

- 50 GTM OS skills adapted from coreyhaines31/marketingskills, AgriciDaniel/claude-seo and official skills from HubSpot, Salesforce, Semrush, SE Ranking, Instantly, Apollo, Clay, Zapier and Resend. Each has a GTM OS operating section and a plain path without GTM OS.
- 23 skills that ship with the `gtm` CLI (setup, onboarding, engine catalog, source mapping, Composio and the connector skills).
- 21 looot data skills, vendored verbatim.
- Claude Code plugin marketplace with one plugin per category and `gtmos-all`.
- `manifest.json` with the sha-256 of every installed file, used by `gtm init` to verify what it installs.
- Provider sweep and licences in THIRD-PARTY-NOTICES.md.
