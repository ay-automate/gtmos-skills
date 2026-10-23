// GTM OS Skills: pinned upstream sources (`node scripts/skills.mjs upstream ...`). No dependencies; Node 20+ and git.
//
// upstreams.json records every repository a skill here comes from, pinned to one commit:
//   - mode "vendored": files copied verbatim. Each file's sha-256 is recorded, so lint catches a local edit and
//     a refresh never overwrites one (hash-guarded).
//   - mode "adapted": the upstream paths our gtmos-* skills were adapted from, each with its git object id at the
//     pin, so `check` can say which adaptations an upstream change touches.
// Every entry also records the upstream licence (its SPDX id, the file in the upstream repo and its object id, and the
// copy in licenses/). A refresh refuses when the upstream licence file changed.
//
// Network access goes through git only (clone/fetch by commit), into a temp folder that is always removed.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

export const ALLOWED_LICENSES = ["MIT", "Apache-2.0", "CC-BY-4.0", "CC-BY-SA-4.0", "CC0-1.0"];
const LICENSE_FILES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "LICENCE.md", "COPYING"];
const SHA_RE = /^[0-9a-f]{40}$/;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** Guess the SPDX id of a licence text. Returns undefined when it is not one we accept. */
export function detectLicense(text) {
  const t = text.replace(/\s+/g, " ");
  if (/Permission is hereby granted, free of charge, to any person obtaining a copy/i.test(t)) return "MIT";
  if (/Apache License,? Version 2\.0/i.test(t)) return "Apache-2.0";
  if (/Attribution-ShareAlike 4\.0 International/i.test(t)) return "CC-BY-SA-4.0";
  if (/Attribution 4\.0 International/i.test(t)) return "CC-BY-4.0";
  if (/CC0 1\.0 Universal/i.test(t)) return "CC0-1.0";
  return undefined;
}

// ---------- git ----------

function git(cwd, args, opts = {}) {
  return execFileSync("git", ["-c", "core.autocrlf=false", "-c", "advice.detachedHead=false", ...args], { cwd, maxBuffer: 256 * 1024 * 1024, ...opts });
}

/** A bare-ish local repository with the given commits fetched (depth 1 each). Call `done()` to remove it. */
function fetchCommits(repo, commits) {
  const dir = mkdtempSync(join(tmpdir(), "gtmos-upstream-"));
  try {
    git(dir, ["init", "--quiet"]);
    git(dir, ["remote", "add", "origin", `https://github.com/${repo}.git`]);
    for (const c of commits) git(dir, ["fetch", "--quiet", "--depth", "1", "origin", c], { stdio: ["ignore", "ignore", "inherit"] });
  } catch (e) {
    rmSync(dir, { recursive: true, force: true });
    throw e;
  }
  return {
    dir,
    oid: (commit, path) => {
      try {
        return git(dir, ["rev-parse", "--verify", "--quiet", `${commit}:${path}`], { stdio: ["ignore", "pipe", "ignore"] }).toString("utf8").trim();
      } catch {
        return null;
      }
    },
    show: (commit, path) => git(dir, ["show", `${commit}:${path}`]),
    lsFiles: (commit, path) =>
      git(dir, ["ls-tree", "-r", "--name-only", commit, "--", path]).toString("utf8").split("\n").filter(Boolean),
    diff: (from, to, path) => git(dir, ["diff", "--stat", "--patch", from, to, "--", path]).toString("utf8"),
    done: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/** The commit a remote's default branch points at now. */
export function remoteHead(repo) {
  const out = execFileSync("git", ["ls-remote", `https://github.com/${repo}.git`, "HEAD"]).toString("utf8");
  const sha = out.split(/\s+/)[0];
  if (!SHA_RE.test(sha)) throw new Error(`could not read HEAD of ${repo}`);
  return sha;
}

// ---------- the registry ----------

export function loadUpstreams(root) {
  const p = join(root, "upstreams.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : { upstreams: [] };
}

export function saveUpstreams(root, data) {
  data.upstreams.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(join(root, "upstreams.json"), JSON.stringify(data, null, 2) + "\n");
}

const idOf = (repo) => repo.split("/")[1];

function findLicense(g, commit) {
  for (const f of LICENSE_FILES) {
    const oid = g.oid(commit, f);
    if (oid) return { path: f, oid, text: g.show(commit, f).toString("utf8") };
  }
  return undefined;
}

/** Local licence copy for a repository: licenses/<SPDX>-<owner>-<repo>.txt. */
const localLicenseName = (spdx, repo) => `${spdx}-${repo.replace("/", "-")}.txt`;

/**
 * Register a source (or re-pin it): fetch the commit, check the licence, record the paths.
 * vendored: copies every file under each path to `to` (default: the same path) and records its sha-256.
 * adapted: records each path's object id only; nothing is copied.
 */
export function importUpstream(root, { id, repo, sha, mode, paths, to, license, skills = [], force = false }) {
  if (!SHA_RE.test(sha ?? "")) throw new Error("--sha must be a full 40-character commit");
  if (!["vendored", "adapted"].includes(mode)) throw new Error("--mode must be vendored or adapted");
  const data = loadUpstreams(root);
  if (data.upstreams.some((u) => u.id === id) && !force) throw new Error(`${id} is already registered (use refresh to move its pin)`);
  const g = fetchCommits(repo, [sha]);
  try {
    const lic = findLicense(g, sha);
    if (!lic) throw new Error(`${repo}@${sha.slice(0, 8)} has no licence file at its root: reference only, do not copy`);
    const spdx = detectLicense(lic.text);
    if (!spdx || !ALLOWED_LICENSES.includes(spdx)) throw new Error(`${repo}: licence not recognised as one of ${ALLOWED_LICENSES.join(", ")}: reference only, do not copy`);
    if (license && license !== spdx) throw new Error(`${repo}: declared ${license}, the licence file reads ${spdx}`);
    const localName = localLicenseName(spdx, repo);
    const localPath = join(root, "licenses", localName);
    if (!existsSync(localPath)) writeFileSync(localPath, lic.text);
    const entry = { id, repo, sha, mode, license: { spdx, path: lic.path, oid: lic.oid, file: `licenses/${localName}` }, ...(mode === "vendored" ? { roots: paths.map((p) => ({ path: p, to: to ?? p })) } : {}), paths: [] };
    for (const p of paths) {
      if (mode === "adapted") {
        const oid = g.oid(sha, p);
        if (!oid) throw new Error(`${repo}@${sha.slice(0, 8)} has no ${p}`);
        entry.paths.push({ path: p, oid, skills: skills.filter(Boolean) });
        continue;
      }
      const files = g.lsFiles(sha, p);
      if (!files.length) throw new Error(`${repo}@${sha.slice(0, 8)} has no ${p}`);
      const target = to ?? p;
      for (const f of files) {
        const dest = target + f.slice(p.length);
        const buf = g.show(sha, f);
        const abs = join(root, ...dest.split("/"));
        if (existsSync(abs) && sha256(readFileSync(abs)) !== sha256(buf) && !force)
          throw new Error(`${dest} exists and differs from ${repo}@${sha.slice(0, 8)}:${f} (pass --force to overwrite)`);
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, buf);
        entry.paths.push({ path: f, to: dest, sha256: sha256(buf) });
      }
    }
    data.upstreams = data.upstreams.filter((u) => u.id !== id).concat(entry);
    saveUpstreams(root, data);
    return entry;
  } finally {
    g.done();
  }
}

/** Compare every pin (or one) with the upstream HEAD. Returns one report per source; never writes. */
export function checkUpstreams(root, only) {
  const reports = [];
  for (const u of loadUpstreams(root).upstreams) {
    if (only && u.id !== only) continue;
    const head = remoteHead(u.repo);
    const r = { id: u.id, repo: u.repo, mode: u.mode, pinned: u.sha, head, moved: head !== u.sha, licenseChanged: false, changed: [], removed: [], localEdits: [] };
    if (u.mode === "vendored") for (const p of u.paths) if (!existsSync(join(root, ...p.to.split("/"))) || sha256(readFileSync(join(root, ...p.to.split("/")))) !== p.sha256) r.localEdits.push(p.to);
    if (r.moved) {
      const g = fetchCommits(u.repo, [u.sha, head]);
      try {
        r.licenseChanged = g.oid(head, u.license.path) !== u.license.oid;
        for (const p of u.paths) {
          const now = g.oid(head, p.path);
          const was = p.oid ?? g.oid(u.sha, p.path);
          if (!now) r.removed.push(p.path);
          else if (now !== was) r.changed.push(p.path);
        }
      } finally {
        g.done();
      }
    }
    reports.push(r);
  }
  return reports;
}

/** The upstream diff of one source between its pin and `to` (default HEAD), limited to the recorded paths. */
export function diffUpstream(root, id, to) {
  const u = loadUpstreams(root).upstreams.find((x) => x.id === id);
  if (!u) throw new Error(`unknown upstream ${id}`);
  const target = to ?? remoteHead(u.repo);
  const g = fetchCommits(u.repo, [u.sha, target]);
  try {
    return [...new Set(u.paths.map((p) => p.path))].map((p) => g.diff(u.sha, target, p)).filter(Boolean).join("\n");
  } finally {
    g.done();
  }
}

/**
 * Move a source's pin to `to` (a commit, default HEAD).
 * vendored: refuses when a vendored file was edited here (its sha-256 no longer matches the record) or when the
 *   upstream licence changed; otherwise rewrites the vendored files, their hashes, and every reference to the old
 *   commit in catalog.json and THIRD-PARTY-NOTICES.md.
 * adapted: needs `reviewed` (the gtmos-* skills were checked against the new upstream text); then moves the pin and
 *   rewrites the old commit in those skills' frontmatter and attribution lines, and in THIRD-PARTY-NOTICES.md.
 * Returns what changed.
 */
export function refreshUpstream(root, id, { to, reviewed = false } = {}) {
  const data = loadUpstreams(root);
  const u = data.upstreams.find((x) => x.id === id);
  if (!u) throw new Error(`unknown upstream ${id}`);
  const target = to ?? remoteHead(u.repo);
  if (!SHA_RE.test(target)) throw new Error("--sha must be a full 40-character commit");
  if (target === u.sha) return { id, unchanged: true };
  if (u.mode === "adapted" && !reviewed) throw new Error(`${id} is adapted: read \`upstream diff ${id}\`, update the gtmos-* skills, then refresh with --reviewed`);
  const edited = u.mode === "vendored" ? u.paths.filter((p) => !existsSync(join(root, ...p.to.split("/"))) || sha256(readFileSync(join(root, ...p.to.split("/")))) !== p.sha256) : [];
  if (edited.length) throw new Error(`refusing to refresh ${id}: these vendored files were edited here: ${edited.map((p) => p.to).join(", ")}`);
  const g = fetchCommits(u.repo, [u.sha, target]);
  const touched = [];
  try {
    if (g.oid(target, u.license.path) !== u.license.oid) throw new Error(`refusing to refresh ${id}: the upstream licence (${u.license.path}) changed between ${u.sha.slice(0, 8)} and ${target.slice(0, 8)}; review it by hand`);
    if (u.mode === "vendored") {
      for (const p of u.paths) {
        if (!g.oid(target, p.path)) throw new Error(`${p.path} no longer exists at ${target.slice(0, 8)}: remove it from the catalog and upstreams.json first`);
        const buf = g.show(target, p.path);
        const abs = join(root, ...p.to.split("/"));
        if (sha256(readFileSync(abs)) !== sha256(buf)) touched.push(p.to);
        writeFileSync(abs, buf);
        p.sha256 = sha256(buf);
      }
      // Files added upstream under a vendored root come along too.
      for (const r of u.roots ?? []) {
        for (const f of g.lsFiles(target, r.path)) {
          if (u.paths.some((p) => p.path === f)) continue;
          const dest = r.to + f.slice(r.path.length);
          const abs = join(root, ...dest.split("/"));
          if (existsSync(abs)) throw new Error(`${dest} exists here but is not a vendored file of ${id}`);
          const buf = g.show(target, f);
          mkdirSync(dirname(abs), { recursive: true });
          writeFileSync(abs, buf);
          u.paths.push({ path: f, to: dest, sha256: sha256(buf) });
          touched.push(dest);
        }
      }
    } else {
      for (const p of u.paths) {
        const oid = g.oid(target, p.path);
        if (!oid) throw new Error(`${p.path} no longer exists at ${target.slice(0, 8)}: re-point the skills first`);
        p.oid = oid;
      }
    }
    const old = u.sha;
    u.sha = target;
    saveUpstreams(root, data);
    // Every pinned reference to the old commit moves with the pin. A full commit id is unique, so skills and the
    // catalog replace it everywhere; the notices also carry short ids, replaced only on lines naming this repo.
    const rewrite = (path, perLine) => {
      const abs = join(root, ...path.split("/"));
      const text = readFileSync(abs, "utf8");
      const next = perLine
        ? text.split("\n").map((l) => (l.includes(u.repo) ? l.split(old).join(target).split(old.slice(0, 8)).join(target.slice(0, 8)) : l)).join("\n")
        : text.split(old).join(target);
      if (next !== text) {
        writeFileSync(abs, next);
        touched.push(path);
      }
    };
    rewrite("catalog.json", false);
    rewrite("THIRD-PARTY-NOTICES.md", true);
    for (const d of readdirSync(join(root, "skills"))) {
      for (const f of ["SKILL.md", ...(existsSync(join(root, "skills", d, "references")) ? readdirSync(join(root, "skills", d, "references")).filter((x) => x.endsWith(".md")).map((x) => `references/${x}`) : [])]) {
        const p = `skills/${d}/${f}`;
        if (existsSync(join(root, ...p.split("/"))) && readFileSync(join(root, ...p.split("/")), "utf8").includes(old)) rewrite(p, false);
      }
    }
    return { id, from: old, to: target, touched: [...new Set(touched)] };
  } finally {
    g.done();
  }
}

/** Lint the registry against the working tree (no network). Pushes messages into `err(where, msg)`. */
export function lintUpstreams(root, catalog, skillMeta, err) {
  const data = loadUpstreams(root);
  const byRepo = new Map();
  for (const u of data.upstreams) {
    const where = `upstreams.json (${u.id})`;
    if (byRepo.has(u.repo)) err(where, `${u.repo} is registered twice`);
    byRepo.set(u.repo, u);
    if (!SHA_RE.test(u.sha)) err(where, "sha must be a full commit");
    if (!ALLOWED_LICENSES.includes(u.license?.spdx)) err(where, `licence ${u.license?.spdx} is not one we may copy`);
    if (!u.license?.file || !existsSync(join(root, u.license.file))) err(where, `licence copy ${u.license?.file} is missing`);
    if (u.mode === "vendored") {
      for (const p of u.paths) {
        const abs = join(root, ...p.to.split("/"));
        if (!existsSync(abs)) err(where, `${p.to} is missing`);
        else if (sha256(readFileSync(abs)) !== p.sha256) err(where, `${p.to} differs from ${u.repo}@${u.sha.slice(0, 8)}: vendored files are verbatim (put changes in a gtmos-* skill, or refresh the pin)`);
      }
    } else {
      for (const p of u.paths) for (const s of p.skills ?? []) if (!skillMeta.has(s)) err(where, `${p.path} names an unknown skill ${s}`);
    }
  }
  // Every vendored catalog entry and every adapted skill's source is registered, at the registered commit.
  for (const s of catalog.skills) {
    if (s.origin === "vendored") {
      const repo = /^https:\/\/github\.com\/([^/]+\/[^/]+)\//.exec(s.upstream ?? "")?.[1];
      const u = repo && byRepo.get(repo);
      if (!u) err("catalog.json", `${s.name}: ${repo ?? s.upstream} is not registered in upstreams.json`);
      else if (!s.upstream.includes(`/tree/${u.sha}/`)) err("catalog.json", `${s.name}: upstream is not pinned to ${u.id}@${u.sha.slice(0, 8)}`);
    }
    if (s.origin === "adapted") {
      const meta = skillMeta.get(s.name) ?? {};
      for (const url of [meta.upstream, ...(meta.merged_from ? meta.merged_from.split(" | ") : [])].filter(Boolean)) {
        const m = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(?:tree|blob)\/([0-9a-f]{40})\//.exec(url);
        if (!m) continue;
        const u = byRepo.get(m[1]);
        if (!u) err(`skills/${s.name}/SKILL.md`, `${m[1]} is not registered in upstreams.json (run \`node scripts/skills.mjs upstream scan\`)`);
        else if (u.sha !== m[2]) err(`skills/${s.name}/SKILL.md`, `${m[1]} is pinned at ${m[2].slice(0, 8)}, upstreams.json at ${u.sha.slice(0, 8)}`);
      }
    }
  }
}

/**
 * Register (or refresh the records of) every adapted source from the skills' own frontmatter: one entry per
 * repository, pinned at the commit the skills name, with the object id of every path they were adapted from.
 */
export function scanAdapted(root, skillMeta) {
  const want = new Map(); // repo -> { sha, paths: Map(path -> Set(skill)) }
  for (const [name, meta] of skillMeta) {
    for (const url of [meta.upstream, ...(meta.merged_from ? meta.merged_from.split(" | ") : [])].filter(Boolean)) {
      const m = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/(?:tree|blob)\/([0-9a-f]{40})\/(.+)$/.exec(url);
      if (!m) continue;
      const [, repo, sha, path] = m;
      if (!want.has(repo)) want.set(repo, { sha, paths: new Map() });
      const w = want.get(repo);
      if (w.sha !== sha) throw new Error(`${repo} is pinned at two commits (${w.sha.slice(0, 8)}, ${sha.slice(0, 8)}); use one`);
      if (!w.paths.has(path)) w.paths.set(path, new Set());
      w.paths.get(path).add(name);
    }
  }
  const data = loadUpstreams(root);
  const out = [];
  for (const [repo, w] of want) {
    const existing = data.upstreams.find((u) => u.repo === repo);
    if (existing?.mode === "vendored") continue;
    const id = existing?.id ?? idOf(repo).toLowerCase() + (data.upstreams.some((u) => u.id === idOf(repo).toLowerCase() && u.repo !== repo) ? `-${repo.split("/")[0].toLowerCase()}` : "");
    const g = fetchCommits(repo, [w.sha]);
    try {
      const lic = findLicense(g, w.sha);
      if (!lic) throw new Error(`${repo}@${w.sha.slice(0, 8)} has no root licence file`);
      const spdx = detectLicense(lic.text);
      if (!ALLOWED_LICENSES.includes(spdx)) throw new Error(`${repo}: licence not recognised`);
      const file = `licenses/${localLicenseName(spdx, repo)}`;
      if (!existsSync(join(root, file))) throw new Error(`${repo}: add its licence text as ${file}`);
      const paths = [...w.paths].sort(([a], [b]) => a.localeCompare(b)).map(([path, skills]) => {
        const oid = g.oid(w.sha, path);
        if (!oid) throw new Error(`${repo}@${w.sha.slice(0, 8)} has no ${path}`);
        return { path, oid, skills: [...skills].sort() };
      });
      data.upstreams = data.upstreams.filter((u) => u.repo !== repo).concat({ id, repo, sha: w.sha, mode: "adapted", license: { spdx, path: lic.path, oid: lic.oid, file }, paths });
      out.push(`${id}: ${repo}@${w.sha.slice(0, 8)}, ${paths.length} path(s)`);
    } finally {
      g.done();
    }
  }
  saveUpstreams(root, data);
  return out;
}
