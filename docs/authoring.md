# Writing a GTM OS skill

This is the house format. `node scripts/skills.mjs lint` checks the mechanical parts; reviewers check the rest.

## Folder and name

- One folder per skill: `skills/<name>/SKILL.md`, plus an optional `references/` folder for long material the skill links to.
- Adapted and new skills are named `gtmos-<area>-<job>`: lowercase, hyphens, at most 64 characters. Areas in use: `marketing`, `research`, `seo`, `outreach`, `leads`, `score`, `routing`, `ads`, `revops`, `crm`, `sales`, `lifecycle`, `analytics`, `content`, `ops`, `signals`.
- The connector skills that ship with the `gtm` CLI (`hubspot`, `gsc`, `composio`, `gtmos-setup` and so on) and the vendored `looot-*` skills keep their names, because existing workspaces already refer to them.
- Register the skill in `catalog.json` with its category. The README index and the plugin marketplace are generated from that file.

## Frontmatter

```yaml
---
name: gtmos-outreach-cold-email
description: What it does, what it uses in GTM OS, and the phrases that should trigger it. At most 1024 characters.
license: MIT
metadata:
  version: "0.1.0"
  category: "outbound"
  upstream: "https://github.com/<owner>/<repo>/tree/<sha>/<path>"
  upstream_sha: "<sha>"
  upstream_license: "MIT; Copyright (c) <year> <holder>"
  merged_from: "<url> | <url>"
  modified: "<date>: what changed"
---
```

`upstream`, `upstream_sha`, `upstream_license` and `modified` are required for any skill copied or adapted from another repository; `merged_from` lists every other source folded into it. A skill written from scratch for GTM OS has no `upstream` keys. Metadata values are strings.

## Body

1. An H1 title, then one attribution line naming the upstream skill, its repository, licence and copyright, and what changed.
2. `## With GTM OS connected`: the operating section. It names the definitions to read first, the operations to call in order with their class, where approvals happen, what dry mode does, and which numbers come from which operation. Operations from releases that are not out yet are marked "(when available)".
3. `## Without GTM OS`: the plain path, so the skill is useful to anyone.
4. A rule (`---`), then the method: the upstream skill's content, refined. Cross-references point at the skills in this repository; tool pointers go through GTM OS connectors first.

## Rules

- Never invent data. Results, metrics, logos and quotes come from the proof library (`proof.list`, active items only). A missing input becomes a marked placeholder, not a guess.
- E-class operations propose; a different person approves. A skill never tells the agent to approve, and never retries a rejected effect.
- Dry mode is respected: in dry mode the skill stops at the draft and says so.
- Quote cost before buying data.
- Register the source in `upstreams.json` (`node scripts/skills.mjs upstream scan` for an adapted skill, `upstream import` for a verbatim copy); lint fails on a source that is not registered or is pinned at another commit.
- Keep upstream copyright and licence notices. Rebranding is fine; removing attribution is not. Apache-2.0 sources also need the change stated and their NOTICE carried (see `licenses/`).
- Only copy from sources under MIT, Apache-2.0 or a Creative Commons licence that allows it. Anything else is reference only: link to it, do not copy it.
- No secrets, internal hostnames, local paths or GTM OS source code.

## Checking your work

```bash
node scripts/skills.mjs lint       # frontmatter, names, links, notices
node scripts/skills.mjs build      # regenerate catalog-derived files and manifest.json
```
