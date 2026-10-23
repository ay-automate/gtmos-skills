#!/usr/bin/env node
// GTM OS Skills: lint and build. No dependencies; Node 20+.
//
//   node scripts/skills.mjs lint     check frontmatter, names, catalog, links, notices, content rules (skills and
//                                    agents), and that the generated files are current
//   node scripts/skills.mjs build    regenerate the README index, .claude-plugin/marketplace.json and manifest.json
//   node scripts/skills.mjs upstream <list|check|diff|import|refresh|scan> ...
//                                    pinned upstream sources (upstreams.json): see scripts/upstream.mjs and CONTRIBUTING.md
//
// manifest.json lists every file `gtm init` installs (skills/**, agents/**, THIRD-PARTY-NOTICES.md, licenses/**)
// with its sha-256. The CLI pins the manifest's own sha-256 and refuses any file that does not match it.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkUpstreams, diffUpstream, importUpstream, lintUpstreams, loadUpstreams, refreshUpstream, scanAdapted } from "./upstream.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = join(ROOT, "catalog.json");
const NOTICES = "THIRD-PARTY-NOTICES.md";
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_DESCRIPTION = 1024;

const read = (p) => readFileSync(p, "utf8");
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const rel = (p) => relative(ROOT, p).split("\\").join("/");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir).sort()) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

/** Minimal YAML frontmatter reader for the subset skills use: scalars, quoted strings, folded/literal blocks, one level of nesting. */
export function parseFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(md);
  if (!m) return undefined;
  const lines = m[1].split("\n");
  const data = {};
  let parent;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    const kv = /^( *)([A-Za-z0-9_-]+):(?: (.*))?$/.exec(line);
    if (!kv) throw new Error(`frontmatter line not understood: ${JSON.stringify(line)}`);
    const [, indent, key, raw = ""] = kv;
    let value = raw.trim();
    if (value === ">" || value === "|" || value === ">-" || value === "|-") {
      const block = [];
      while (i + 1 < lines.length && (lines[i + 1].startsWith(indent + "  ") || !lines[i + 1].trim())) block.push(lines[++i].trim());
      value = value.startsWith(">") ? block.join(" ").replace(/\s+/g, " ").trim() : block.join("\n");
    } else if (value.startsWith('"')) {
      value = JSON.parse(value);
    } else if (value.startsWith("'")) {
      value = value.slice(1, -1).replace(/''/g, "'");
    }
    if (indent.length === 0) {
      if (raw.trim() === "") {
        data[key] = {};
        parent = key;
      } else {
        data[key] = value;
        parent = undefined;
      }
    } else if (parent) {
      data[parent][key] = value;
    } else {
      throw new Error(`indented key without a parent: ${key}`);
    }
  }
  return data;
}

function loadCatalog() {
  return JSON.parse(read(CATALOG_PATH));
}

/** 0.3.0: the subagents, one markdown file per agent under agents/. */
const agentFiles = () =>
  existsSync(join(ROOT, "agents"))
    ? readdirSync(join(ROOT, "agents"))
        .filter((f) => f.endsWith(".md"))
        .sort()
    : [];

const skillDirs = () =>
  readdirSync(join(ROOT, "skills"))
    .filter((d) => statSync(join(ROOT, "skills", d)).isDirectory())
    .sort();

/** Files `gtm init` installs, in a stable order. */
function installedFiles() {
  const agents = existsSync(join(ROOT, "agents")) ? walk(join(ROOT, "agents")) : [];
  return [...walk(join(ROOT, "skills")), ...agents, join(ROOT, NOTICES), ...walk(join(ROOT, "licenses"))].map(rel).sort();
}

function repoOf(url) {
  return /^https:\/\/github\.com\/([^/]+\/[^/]+)\//.exec(url)?.[1];
}

// ---------- generated files ----------

function renderIndex(catalog) {
  const out = [];
  for (const cat of catalog.categories) {
    const skills = catalog.skills.filter((s) => s.category === cat.id);
    out.push(`### ${cat.label} (${skills.length})`, "", `${cat.blurb}`, "", "| Skill | What it does | Source |", "|---|---|---|");
    for (const s of skills) {
      const fm = parseFrontmatter(read(join(ROOT, "skills", s.name, "SKILL.md")));
      out.push(`| [\`${s.name}\`](skills/${s.name}/SKILL.md) | ${s.summary} | ${sourceLabel(s, fm)} |`);
    }
    out.push("");
  }
  const agents = catalog.agents ?? [];
  if (agents.length) {
    const label = new Map(catalog.categories.map((c) => [c.id, c.label]));
    out.push(
      `### Subagents (${agents.length})`,
      "",
      "Claude Code subagents (also installed as Codex custom agents) that run one GTM role on GTM OS. They propose and never approve, quote before they spend, and name the steps only a person may take.",
      "",
      "| Agent | What it does | Area | Source |",
      "|---|---|---|---|",
    );
    for (const a of agents) {
      const fm = parseFrontmatter(read(join(ROOT, "agents", `${a.name}.md`)));
      out.push(`| [\`${a.name}\`](agents/${a.name}.md) | ${a.summary} | ${label.get(a.category) ?? a.category} | ${sourceLabel(a, fm)} |`);
    }
    out.push("");
  }
  return out.join("\n").trim();
}

function sourceLabel(s, fm) {
  if (s.origin === "gtmos") return "GTM OS";
  if (s.origin === "vendored") return `[${repoOf(s.upstream)}](https://github.com/${repoOf(s.upstream)}) (verbatim)`;
  const repos = [fm.metadata.upstream, ...(fm.metadata.merged_from ? fm.metadata.merged_from.split(" | ") : [])].map(repoOf);
  return [...new Set(repos)].map((r) => `[${r}](https://github.com/${r})`).join(", ");
}

function renderMarketplace(catalog) {
  const plugins = catalog.categories.map((cat) => ({
    name: `gtmos-${cat.id}`,
    description: `GTM OS Skills: ${cat.label}. ${cat.blurb}`,
    source: "./",
    strict: false,
    skills: catalog.skills.filter((s) => s.category === cat.id).map((s) => `./skills/${s.name}`),
  }));
  const agents = (catalog.agents ?? []).map((a) => `./agents/${a.name}.md`);
  if (agents.length)
    plugins.push({
      name: "gtmos-subagents",
      description: "GTM OS subagents: GTM operator, RevOps analyst, deal reviewer, sales researcher, content strategist, SEO refresher, customer success manager, competitive analyst, ads analyst, data steward and eval reviewer.",
      source: "./",
      strict: false,
      agents,
    });
  plugins.unshift({
    name: "gtmos-all",
    description: "Every GTM OS skill and subagent: marketing, SEO and GEO, outbound and leads, ads, CRM and RevOps, analytics, content, agents and ops.",
    source: "./",
    strict: false,
    skills: catalog.skills.map((s) => `./skills/${s.name}`),
    ...(agents.length ? { agents } : {}),
  });
  return (
    JSON.stringify(
      {
        name: "gtmos-skills",
        owner: { name: "AY Automate", url: "https://github.com/ay-automate" },
        metadata: { description: catalog.description, version: catalog.version },
        plugins,
      },
      null,
      2,
    ) + "\n"
  );
}

function renderManifest(catalog) {
  const files = installedFiles().map((path) => {
    const buf = readFileSync(join(ROOT, path));
    return { path, sha256: sha256(buf), bytes: buf.length };
  });
  return JSON.stringify({ name: "gtmos-skills", version: catalog.version, repository: "https://github.com/ay-automate/gtmos-skills", skills: catalog.skills.length, agents: (catalog.agents ?? []).length, files }, null, 2) + "\n";
}

const INDEX_START = "<!-- skills-index:start -->";
const INDEX_END = "<!-- skills-index:end -->";

function renderReadme(catalog, readme) {
  const a = readme.indexOf(INDEX_START);
  const b = readme.indexOf(INDEX_END);
  if (a < 0 || b < a) throw new Error("README.md is missing the skills-index markers");
  let out = readme.slice(0, a + INDEX_START.length) + "\n\n" + renderIndex(catalog) + "\n\n" + readme.slice(b);
  out = out.replace(/<!-- skills-count -->\d*<!-- \/skills-count -->/g, `<!-- skills-count -->${catalog.skills.length}<!-- /skills-count -->`);
  out = out.replace(/<!-- agents-count -->\d*<!-- \/agents-count -->/g, `<!-- agents-count -->${(catalog.agents ?? []).length}<!-- /agents-count -->`);
  return out;
}

function generated(catalog) {
  return {
    "README.md": renderReadme(catalog, read(join(ROOT, "README.md"))),
    ".claude-plugin/marketplace.json": renderMarketplace(catalog),
  };
}

// ---------- lint ----------

const FORBIDDEN = [
  [/\bsk-[A-Za-z0-9]{20,}/, "an API key"],
  [/\bghp_[A-Za-z0-9]{20,}/, "a GitHub token"],
  [/\bAKIA[0-9A-Z]{16}\b/, "an AWS key"],
  [/[A-Z]:\\(Users|Windows)\\/, "a local Windows path"],
  [/\/Users\/[a-z]+\//i, "a local macOS path"],
  [/\b(kernel|stdlib\/connectors|stdlib\/providers|stdlib\/qualification)\/[a-z]/, "a GTM OS source path"],
  [/\bapps\/(api|console|cli|worker|mcp)\//, "a GTM OS source path"],
  [/TODO\(/, "an unfinished TODO marker"],
  [/CLAUDE_PLUGIN_ROOT/, "a reference to another plugin's scripts"],
];

function lint() {
  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  const catalog = loadCatalog();
  const notices = read(join(ROOT, NOTICES));
  const cats = new Set(catalog.categories.map((c) => c.id));
  const listed = new Map(catalog.skills.map((s) => [s.name, s]));
  if (listed.size !== catalog.skills.length) err("catalog.json", "duplicate skill names");

  const dirs = skillDirs();
  for (const d of dirs) if (!listed.has(d)) err(`skills/${d}`, "not listed in catalog.json");
  for (const s of catalog.skills) {
    if (!dirs.includes(s.name)) err("catalog.json", `${s.name} has no skills/${s.name}/ folder`);
    if (!cats.has(s.category)) err("catalog.json", `${s.name}: unknown category ${s.category}`);
    if (!["gtmos", "adapted", "vendored"].includes(s.origin)) err("catalog.json", `${s.name}: unknown origin ${s.origin}`);
    if (!s.summary || s.summary.length > 140) err("catalog.json", `${s.name}: summary missing or longer than 140 characters`);
  }

  for (const d of dirs) {
    const where = `skills/${d}/SKILL.md`;
    const p = join(ROOT, "skills", d, "SKILL.md");
    if (!existsSync(p)) {
      err(`skills/${d}`, "no SKILL.md");
      continue;
    }
    const md = read(p);
    if (md.includes("\r")) err(where, "CRLF line endings (use LF)");
    let fm;
    try {
      fm = parseFrontmatter(md);
    } catch (e) {
      err(where, `frontmatter: ${e.message}`);
      continue;
    }
    if (!fm) {
      err(where, "no YAML frontmatter");
      continue;
    }
    if (fm.name !== d) err(where, `name "${fm.name}" does not match the folder`);
    if (!NAME_RE.test(d) || d.length > 64) err(where, "name must be lowercase words joined by hyphens, at most 64 characters");
    if (typeof fm.description !== "string" || !fm.description.trim()) err(where, "description missing");
    else if (fm.description.length > MAX_DESCRIPTION) err(where, `description is ${fm.description.length} characters (max ${MAX_DESCRIPTION})`);
    const entry = listed.get(d);
    if (entry?.origin === "adapted") {
      if (!d.startsWith("gtmos-")) err(where, "an adapted skill is named gtmos-<area>-<job>");
      const meta = fm.metadata ?? {};
      for (const k of ["upstream", "upstream_sha", "upstream_license", "modified"]) if (!meta[k]) err(where, `metadata.${k} is required for an adapted skill`);
      if (!fm.license) err(where, "license is required for an adapted skill");
      if (meta.category && meta.category !== entry.category) err(where, `metadata.category ${meta.category} differs from catalog.json (${entry.category})`);
      const urls = [meta.upstream, ...(meta.merged_from ? meta.merged_from.split(" | ") : [])].filter(Boolean);
      for (const u of urls) {
        const repo = repoOf(u);
        if (!repo) err(where, `upstream URL not understood: ${u}`);
        else if (!notices.includes(`https://github.com/${repo}`)) err(where, `${repo} is not recorded in ${NOTICES}`);
        if (meta.upstream_sha && u === meta.upstream && !u.includes(meta.upstream_sha)) err(where, "metadata.upstream must be pinned to metadata.upstream_sha");
      }
      if (!/Adapted from \[/.test(md)) err(where, "the attribution line (\"Adapted from [...]\") is missing");
      if (!/^## With GTM OS connected$/m.test(md)) err(where, "missing the \"## With GTM OS connected\" section");
      if (!/^## Without GTM OS$/m.test(md)) err(where, "missing the \"## Without GTM OS\" section");
      if (!md.includes("](../GTMOS-RULES.md)")) err(where, "the GTM OS section must link the shared rules (../GTMOS-RULES.md)");
      if (/when available/i.test(md.slice(md.indexOf("## With GTM OS connected"), md.indexOf("## Without GTM OS")))) err(where, "\"when available\" in the GTM OS section: every operation named must exist in the current release");
    }
    if (entry?.origin === "vendored") {
      const repo = repoOf(entry.upstream ?? "");
      if (!repo || !notices.includes(`https://github.com/${repo}`)) err(where, `vendored source ${entry.upstream} is not recorded in ${NOTICES}`);
    }
  }

  // 0.3.0: the subagents. Each is a Claude Code subagent file (name, description, tools, model) adapted from a
  // licence-checked upstream, with the GTM OS operating section, the shared rules link and its human-only operations.
  const agentsListed = new Map((catalog.agents ?? []).map((a) => [a.name, a]));
  if (agentsListed.size !== (catalog.agents ?? []).length) err("catalog.json", "duplicate agent names");
  const files = agentFiles();
  for (const f of files) if (!agentsListed.has(f.replace(/\.md$/, ""))) err(`agents/${f}`, "not listed in catalog.json (agents)");
  for (const a of catalog.agents ?? []) {
    if (!files.includes(`${a.name}.md`)) err("catalog.json", `agent ${a.name} has no agents/${a.name}.md`);
    if (!cats.has(a.category)) err("catalog.json", `agent ${a.name}: unknown category ${a.category}`);
    if (a.origin !== "adapted") err("catalog.json", `agent ${a.name}: agents are adapted from an upstream (origin "adapted")`);
    if (!a.summary || a.summary.length > 160) err("catalog.json", `agent ${a.name}: summary missing or longer than 160 characters`);
  }
  for (const f of files) {
    const where = `agents/${f}`;
    const md = read(join(ROOT, "agents", f));
    if (md.includes("\r")) err(where, "CRLF line endings (use LF)");
    let fm;
    try {
      fm = parseFrontmatter(md);
    } catch (e) {
      err(where, `frontmatter: ${e.message}`);
      continue;
    }
    if (!fm) {
      err(where, "no YAML frontmatter");
      continue;
    }
    const name = f.replace(/\.md$/, "");
    if (fm.name !== name) err(where, `name "${fm.name}" does not match the file name`);
    if (!NAME_RE.test(name) || name.length > 64) err(where, "name must be lowercase words joined by hyphens, at most 64 characters");
    if (dirs.includes(name)) err(where, `an agent and a skill share the name ${name}`);
    if (typeof fm.description !== "string" || !fm.description.trim()) err(where, "description missing");
    else if (fm.description.length > MAX_DESCRIPTION) err(where, `description is ${fm.description.length} characters (max ${MAX_DESCRIPTION})`);
    if (typeof fm.tools !== "string" || !fm.tools.includes("mcp__gtmos__gtm_describe")) err(where, "tools must list the GTM OS MCP tools (mcp__gtmos__gtm_describe, ...)");
    if (!fm.model) err(where, "model is required (inherit, sonnet, opus or haiku)");
    if (!fm.license) err(where, "license is required");
    const meta = fm.metadata ?? {};
    for (const k of ["upstream", "upstream_sha", "upstream_license", "modified"]) if (!meta[k]) err(where, `metadata.${k} is required for an agent`);
    if (meta.category && agentsListed.get(name) && meta.category !== agentsListed.get(name).category) err(where, `metadata.category ${meta.category} differs from catalog.json`);
    for (const u of [meta.upstream, ...(meta.merged_from ? meta.merged_from.split(" | ") : [])].filter(Boolean)) {
      const repo = repoOf(u);
      if (!repo) err(where, `upstream URL not understood: ${u}`);
      else if (!notices.includes(`https://github.com/${repo}`)) err(where, `${repo} is not recorded in ${NOTICES}`);
      if (meta.upstream_sha && u === meta.upstream && !u.includes(meta.upstream_sha)) err(where, "metadata.upstream must be pinned to metadata.upstream_sha");
    }
    if (!/Adapted from \[/.test(md)) err(where, "the attribution line (\"Adapted from [...]\") is missing");
    if (!/^## With GTM OS connected$/m.test(md)) err(where, "missing the \"## With GTM OS connected\" section");
    if (!/^## Without GTM OS$/m.test(md)) err(where, "missing the \"## Without GTM OS\" section");
    if (!md.includes("](../skills/GTMOS-RULES.md)")) err(where, "the GTM OS section must link the shared rules (../skills/GTMOS-RULES.md)");
    if (!/^\*\*Human-only\.\*\* .*`[a-z_]+\.[a-z_.]+`/m.test(md)) err(where, "name the human-only operations (a \"**Human-only.**\" line)");
    if (!/never approve/i.test(md)) err(where, "say that the agent never approves (propose, never self-approve)");
  }

  // Every markdown file: relative links resolve, and nothing forbidden.
  const mdFiles = walk(ROOT).filter((p) => p.endsWith(".md") && !rel(p).startsWith(".git/") && !rel(p).startsWith("node_modules/"));
  for (const p of mdFiles) {
    const text = read(p);
    const where = rel(p);
    for (const [re, what] of FORBIDDEN) if (re.test(text)) err(where, `contains ${what}`);
    const noCode = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
    for (const m of noCode.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/.test(target) || target.startsWith("<")) continue;
      const clean = decodeURI(target.split("#")[0]);
      if (!clean) continue;
      const abs = resolve(dirname(p), clean);
      if (!existsSync(abs)) err(where, `broken link ${target}`);
    }
  }

  // Upstreams: vendored files verbatim, every source registered at the commit the skills name, licences present.
  const skillMeta = new Map();
  for (const d of dirs) {
    try {
      const fm = parseFrontmatter(read(join(ROOT, "skills", d, "SKILL.md")));
      if (fm) skillMeta.set(d, fm.metadata ?? {});
    } catch {
      // reported above
    }
  }
  lintUpstreams(ROOT, catalog, skillMeta, err, agentMetaMap());

  // Spend inline: rule 8 of GTMOS-RULES.md lists the operations the GTM OS registry flags spendsInline (the gtm CLI's
  // drift test compares that list with the registry). Every line of a skill's GTM OS section that names one says so.
  const rules = read(join(ROOT, "skills", "GTMOS-RULES.md"));
  const spendList = /<!-- spends-inline:start -->([\s\S]*?)<!-- spends-inline:end -->/.exec(rules);
  if (!spendList) err("skills/GTMOS-RULES.md", "rule 8 is missing the spends-inline list markers");
  const spendOps = spendList ? [...spendList[1].matchAll(/`([a-z_]+(?:\.[a-z_]+)+)`/g)].map((m) => m[1]) : [];
  if (spendList && !spendOps.length) err("skills/GTMOS-RULES.md", "the spends-inline list is empty");
  for (const s of catalog.skills.filter((x) => x.origin === "adapted")) {
    const md = read(join(ROOT, "skills", s.name, "SKILL.md"));
    const a = md.indexOf("## With GTM OS connected");
    const b = md.indexOf("## Without GTM OS");
    if (a < 0 || b < a) continue;
    for (const line of md.slice(a, b).split("\n")) {
      if (line.startsWith("> **Rules") || line.startsWith("> **Spend")) continue;
      for (const op of spendOps) {
        if (new RegExp("`" + op.replace(/\./g, "\\.") + "(?![a-z_.])").test(line) && !/spends inline/i.test(line))
          err(`skills/${s.name}/SKILL.md`, `\`${op}\` spends inside its own call: mark the line *spends inline* (quote first)`);
      }
    }
  }
  // The same for every agent, over its whole GTM OS text (everything before the upstream excerpts).
  for (const f of files) {
    const md = read(join(ROOT, "agents", f));
    const a = md.indexOf("## With GTM OS connected");
    const b = md.indexOf("\n> The method below is upstream text");
    for (const line of md.slice(Math.max(a, 0), b > a ? b : md.length).split("\n")) {
      if (line.startsWith("> **Rules")) continue;
      for (const op of spendOps)
        if (new RegExp("`" + op.replace(/\./g, "\\.") + "(?![a-z_.])").test(line) && !/spends inline/i.test(line))
          err(`agents/${f}`, `\`${op}\` spends inside its own call: mark the line *spends inline* (quote first)`);
    }
  }
  for (const u of loadUpstreams(ROOT).upstreams) if (!notices.includes(`https://github.com/${u.repo}`)) err(NOTICES, `${u.repo} (upstreams.json) is not recorded`);

  // Notices: every licence file named in a notice exists.
  for (const m of notices.matchAll(/\(licenses\/([^)]+)\)/g)) if (!existsSync(join(ROOT, "licenses", m[1]))) err(NOTICES, `licenses/${m[1]} does not exist`);

  // Generated files are current.
  const gen = generated(catalog);
  for (const [path, content] of Object.entries(gen)) if (!existsSync(join(ROOT, path)) || read(join(ROOT, path)) !== content) err(path, "out of date: run `node scripts/skills.mjs build`");
  const manifestPath = join(ROOT, "manifest.json");
  if (!existsSync(manifestPath) || read(manifestPath) !== renderManifest(catalog)) err("manifest.json", "out of date: run `node scripts/skills.mjs build`");

  if (errors.length) {
    for (const e of errors) console.error(`x ${e}`);
    console.error(`\n${errors.length} problem(s).`);
    process.exit(1);
  }
  console.log(`ok: ${dirs.length} skills, ${files.length} agents, ${mdFiles.length} markdown files, ${installedFiles().length} installed files.`);
}

function build() {
  const catalog = loadCatalog();
  for (const [path, content] of Object.entries(generated(catalog))) writeFileSync(join(ROOT, path), content);
  // The manifest hashes the installed files, so it is written last.
  writeFileSync(join(ROOT, "manifest.json"), renderManifest(catalog));
  const m = JSON.parse(read(join(ROOT, "manifest.json")));
  console.log(`built: README index, marketplace (${JSON.parse(read(join(ROOT, ".claude-plugin", "marketplace.json"))).plugins.length} plugins), manifest (${m.files.length} files, sha256 ${sha256(readFileSync(join(ROOT, "manifest.json")))})`);
}

function flag(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

function skillMetaMap() {
  const m = new Map();
  for (const d of skillDirs()) {
    const fm = parseFrontmatter(read(join(ROOT, "skills", d, "SKILL.md")));
    if (fm) m.set(d, fm.metadata ?? {});
  }
  return m;
}

/** Each agent's frontmatter metadata (upstream, merged_from, ...), keyed by agent name. */
function agentMetaMap() {
  const m = new Map();
  for (const f of agentFiles()) {
    try {
      const fm = parseFrontmatter(read(join(ROOT, "agents", f)));
      if (fm) m.set(f.replace(/\.md$/, ""), fm.metadata ?? {});
    } catch {
      // reported by lint
    }
  }
  return m;
}

/** `upstream` subcommands. check exits 1 when a pin is behind HEAD or a vendored file was edited (for the monthly job). */
function upstream() {
  const sub = process.argv[3];
  const id = process.argv[4] && !process.argv[4].startsWith("--") ? process.argv[4] : undefined;
  if (sub === "list") {
    for (const u of loadUpstreams(ROOT).upstreams) console.log(`${u.id.padEnd(28)} ${u.mode.padEnd(9)} ${u.repo}@${u.sha.slice(0, 8)} ${u.license.spdx} (${u.paths.length} path(s))`);
  } else if (sub === "check") {
    let behind = 0;
    for (const r of checkUpstreams(ROOT, id)) {
      const state = r.localEdits.length ? "EDITED" : r.licenseChanged ? "LICENCE CHANGED" : r.moved ? (r.changed.length || r.removed.length ? "drift" : "moved, our paths unchanged") : "current";
      console.log(`${r.id.padEnd(28)} ${state.padEnd(28)} ${r.pinned.slice(0, 8)} -> ${r.head.slice(0, 8)}`);
      for (const p of r.changed) console.log(`    changed: ${p}`);
      for (const p of r.removed) console.log(`    removed: ${p}`);
      for (const p of r.localEdits) console.log(`    edited here: ${p}`);
      if (r.localEdits.length || r.licenseChanged || r.changed.length || r.removed.length) behind++;
    }
    if (behind) process.exitCode = 1;
  } else if (sub === "diff") {
    if (!id) throw new Error("usage: upstream diff <id> [--sha <commit>]");
    process.stdout.write(diffUpstream(ROOT, id, flag("sha")));
  } else if (sub === "import") {
    const e = importUpstream(ROOT, {
      id: id ?? flag("id"),
      repo: flag("repo"),
      sha: flag("sha"),
      mode: flag("mode"),
      paths: (flag("paths") ?? "").split(",").filter(Boolean),
      to: flag("to"),
      license: flag("license"),
      skills: (flag("skills") ?? "").split(","),
      force: process.argv.includes("--force"),
    });
    console.log(`registered ${e.id}: ${e.repo}@${e.sha.slice(0, 8)} (${e.license.spdx}), ${e.paths.length} path(s). Now: node scripts/skills.mjs build`);
  } else if (sub === "refresh") {
    if (!id) throw new Error("usage: upstream refresh <id> [--sha <commit>] [--reviewed]");
    const r = refreshUpstream(ROOT, id, { to: flag("sha"), reviewed: process.argv.includes("--reviewed") });
    if (r.unchanged) console.log(`${id} is already at that commit`);
    else console.log(`${id}: ${r.from.slice(0, 8)} -> ${r.to.slice(0, 8)}; touched ${r.touched.length} file(s):\n  ${r.touched.join("\n  ")}\nNow: update CHANGELOG.md, node scripts/skills.mjs build, node scripts/skills.mjs lint`);
  } else if (sub === "scan") {
    for (const line of scanAdapted(ROOT, skillMetaMap(), agentMetaMap())) console.log(line);
  } else {
    console.error("usage: node scripts/skills.mjs upstream <list|check [id]|diff <id>|import <id> --repo o/r --sha <commit> --mode vendored|adapted --paths a,b [--to dir] [--license SPDX] [--skills s1,s2]|refresh <id> [--sha <commit>] [--reviewed]|scan>");
    process.exit(2);
  }
}

const cmd = process.argv[2];
try {
  if (cmd === "lint") lint();
  else if (cmd === "build") build();
  else if (cmd === "upstream") upstream();
  else {
    console.error("usage: node scripts/skills.mjs <lint|build|upstream>");
    process.exit(2);
  }
} catch (e) {
  console.error(`x ${e.message}`);
  process.exit(1);
}

