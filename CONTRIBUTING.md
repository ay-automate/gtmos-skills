# Contributing

Thanks for helping. This repository holds Markdown skills and the files they reference, plus one lint script. It holds no application code.

## Ways to help

- Report a skill that gives wrong or outdated advice, or that names a GTM OS operation that does not exist: open an issue with the skill name and what you saw.
- Propose a new skill: open a "New skill" issue first, with the job it does and the source you want to adapt.
- Improve a skill: open a pull request.

## Rules for a pull request

1. Follow [docs/authoring.md](docs/authoring.md): folder and name, frontmatter, the two operating sections, attribution.
2. Copy only from sources under MIT, Apache-2.0 or a Creative Commons licence that allows it. Record the source, the pinned commit and the licence in the skill's frontmatter and in THIRD-PARTY-NOTICES.md, and add the licence text to `licenses/`. Never remove an upstream copyright notice.
3. Never invent data in examples. Use clearly fake placeholders (`Acme`, `[proof needed]`).
4. No secrets, internal hostnames, local paths or application source code.
5. Register the skill in `catalog.json`, then run:

```bash
node scripts/skills.mjs build
node scripts/skills.mjs lint
```

CI runs the same lint on every pull request.

## Releases

A maintainer bumps `catalog.json` `version`, adds a CHANGELOG entry, runs `build`, tags `vX.Y.Z` and attaches `manifest.json` to the GitHub release. The `gtm` CLI pins a release tag and the manifest's sha-256.
