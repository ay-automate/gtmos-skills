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

### Subagents

A subagent is one file, `agents/<name>.md`, listed under `agents` in `catalog.json`. Copy it from a licence-checked upstream agent (never write one from scratch) and keep the upstream text as excerpts at the end. Lint checks that it has:

- the Claude Code frontmatter (`name` equal to the file name, `description`, `tools` with the GTM OS MCP tools, `model`), plus `license` and `metadata.upstream`, `upstream_sha`, `upstream_license`, `modified` (and `merged_from` for more than one source), each repository recorded in THIRD-PARTY-NOTICES.md and `upstreams.json` at the same commit;
- the attribution line, the *With GTM OS connected* and *Without GTM OS* sections and the link to `../skills/GTMOS-RULES.md`;
- a `**Human-only.**` line naming the operations only a person runs, and the rule that it never approves;
- *spends inline* on every line naming an operation from rule 8.

`gtm init` installs the same file into `.claude/agents/` and `.agents/agents/`, and writes a Codex custom agent (`.codex/agents/<name>.toml`) from it.

## Upstream sources

`upstreams.json` records every repository a skill here comes from, pinned to one commit, with its licence file and the paths used. Two kinds:

- **vendored**: files copied verbatim (the `looot-*` skills). Each file's sha-256 is recorded; lint fails if one is edited here. Put a change in a `gtmos-*` skill instead.
- **adapted**: the upstream paths a `gtmos-*` skill or a subagent was adapted from, with their git object id at the pin (and which skills and agents use each). The skill's or agent's own frontmatter must name the same commit.

The commands (git is the only network tool they use; temp folders are always removed):

```bash
node scripts/skills.mjs upstream list                      # every source, mode, pin and licence
node scripts/skills.mjs upstream check [id]                # pin vs upstream HEAD: changed paths, licence changes, local edits; exits 1 on drift
node scripts/skills.mjs upstream diff <id> [--sha <commit>] # the upstream diff of the paths we use
node scripts/skills.mjs upstream import <id> --repo owner/name --sha <commit> --mode vendored|adapted --paths a,b [--to dir] [--license MIT]
node scripts/skills.mjs upstream refresh <id> [--sha <commit>] [--reviewed]
node scripts/skills.mjs upstream scan                      # (re)register adapted sources from the skills' frontmatter
```

`import` and `refresh` refuse a source without a root licence file or with a licence other than MIT, Apache-2.0, CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0, and `refresh` refuses when the upstream licence file changed since the pin, or when a vendored file was edited here. A vendored refresh rewrites the files, their hashes and every reference to the old commit in `catalog.json` and `THIRD-PARTY-NOTICES.md`. An adapted refresh needs `--reviewed`: it moves the pin and the commit in the skills' frontmatter and attribution lines, so run it only after the `gtmos-*` skill was checked against the new upstream text.

### Monthly refresh

On the first working day of each month (the `upstream-drift` workflow runs `upstream check` on the 1st and shows the result in its summary):

1. `node scripts/skills.mjs upstream check`. Sources marked `current` or `moved, our paths unchanged` need nothing; a moved pin with unchanged paths can still be bumped to keep links fresh.
2. For each **vendored** source with drift: `upstream diff <id>`, read it (a change to how a skill spends money or treats fetched content matters most), then `upstream refresh <id>`.
3. For each **adapted** source with changed paths: `upstream diff <id>`, carry what improves the method into the `gtmos-*` skill (never weaken a GTM OS rule), then `upstream refresh <id> --reviewed`.
4. A `LICENCE CHANGED` source is not refreshed: read the new licence; if it no longer allows copying, open an issue to replace or remove the skills that use it.
5. `node scripts/skills.mjs build`, `node scripts/skills.mjs lint`, a CHANGELOG entry per source bumped, one pull request. Release as usual; the `gtm` CLI picks the release up when its pin moves.

## Releases

A maintainer bumps `catalog.json` `version`, adds a CHANGELOG entry, runs `build`, tags `vX.Y.Z` and attaches `manifest.json` to the GitHub release. The `gtm` CLI pins a release tag and the manifest's sha-256.
