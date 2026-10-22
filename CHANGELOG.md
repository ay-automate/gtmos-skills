# Changelog

All notable changes to this repository. Versions follow [Semantic Versioning](https://semver.org/); each release is a git tag with `manifest.json` attached.

## 0.1.0 (2026-10-22)

First release: 94 skills.

- 50 GTM OS skills adapted from coreyhaines31/marketingskills, AgriciDaniel/claude-seo and official skills from HubSpot, Salesforce, Semrush, SE Ranking, Instantly, Apollo, Clay, Zapier and Resend. Each has a GTM OS operating section and a plain path without GTM OS.
- 23 skills that ship with the `gtm` CLI (setup, onboarding, engine catalog, source mapping, Composio and the connector skills).
- 21 looot data skills, vendored verbatim.
- Claude Code plugin marketplace with one plugin per category and `gtmos-all`.
- `manifest.json` with the sha-256 of every installed file, used by `gtm init` to verify what it installs.
- Provider sweep and licences in THIRD-PARTY-NOTICES.md.
