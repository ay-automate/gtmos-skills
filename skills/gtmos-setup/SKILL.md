---
name: gtmos-setup
description: Install, connect and configure GTM OS for this workspace from zero -- prerequisites, an existing or a new local instance, the agent key, the live docs, connections, approvals -- then hand off to /build-gtm-system. Use FIRST whenever GTM OS is not set up yet (no .claude/gtmos-instance.json with an apiUrl, or `gtm doctor` fails).
---

# GTM OS setup runbook (Claude executes this)

You run every step yourself with the Bash tool. You stop ONLY at the blocks marked
**ASK THE USER**: ask, wait for the answer, then do what the block says next. Never skip a check,
never invent a command or a flag: every command below exists in this `gtm` CLI (`gtm help`,
`gtm <command> --help`). If a command fails, read its message (each one names the fix), fix it or
ask, and re-run the same step.

Conventions used below:

- Talk to the API on `http://127.0.0.1:<api port>` (not `localhost`: Node may resolve it to IPv6
  and miss Docker's port). Browser links use the console URL the setup printed
  (`http://localhost:<console port>` by default).
- `<api>` = `http://127.0.0.1:3001` unless the user chose other ports; `<console>` = the console URL;
  `<org id>` = the organization id; `<owner>` = the owner email; `<owner env file>` = the `.env`
  that holds `GTMOS_OWNER_PASSWORD` (`instance/.env` for a new install).
- Shell state does not survive between your Bash calls: put the variables a command needs in the
  same call.
- Passwords: never print, echo or `cat` a password or a `.env` file. Read one value straight into a
  variable inside the command that needs it:
  `"$(sed -n 's/^GTMOS_OWNER_PASSWORD=//p' <owner env file> | tr -d '\r')"`.
- You NEVER read, use or ask for the approver's password. You never approve anything.
- **Never silent.** If any operation or command is refused (FORBIDDEN, NOT_CONFIGURED,
  VALIDATION_FAILED) or turns into a proposal, tell the user in the same reply: the operation, the
  error, and the exact fix (console path + button, missing scope, or who must approve). Add it to
  the Open items in `.claude/memory/setup-status.md`; never skip the step silently.

## Step 1 -- Prerequisites and an existing instance

First, if this session was already running when `gtm init` wrote `.claude/` (the user typed
`/setup-gtmos` and got "No commands match", or `/build-gtm-system` is missing): Restart Claude Code in
this folder so it loads the new commands and skills (/setup-gtmos, /build-gtm-system...). Tell the user
exactly that and stop until they have restarted; Claude Code reads commands and skills only at startup.

Run, and summarise in one short table (OK / MISSING + the fix):

```bash
docker info --format '{{.ServerVersion}}'          # Docker running? (fix: start Docker Desktop / the docker service)
node -v                                             # Node 22 or newer (fix: install Node 22 LTS)
gtm version --offline                               # the CLI (fix: npm i -g @gtmos/cli)
df -h .                                             # >= 10 GB free on this drive (images + database)
node -e "const o=require('os');console.log((o.freemem()/2**30).toFixed(1)+' GB free RAM of '+(o.totalmem()/2**30).toFixed(1))"
```

Recommend at least 4 GB of free RAM for a new stack (Postgres, api, worker, MCP, console). Then
detect an instance that is ALREADY running on this machine:

```bash
curl -s -m 3 http://127.0.0.1:3001/health                                   # {"status":"ok"} = a GTM OS API answers
docker ps --format '{{.Names}}  {{.Ports}}' | grep -- '-api-1'              # which compose project runs it
cat .claude/gtmos-instance.json 2>/dev/null                                 # apiUrl set = this workspace is already connected
```

`gtm init` already probed 127.0.0.1:3001 and said so in its output when one answered.

- `.claude/gtmos-instance.json` has an `apiUrl` and `GTMOS_AGENT_TOKEN` is set in your environment:
  run `gtm doctor` (step 4). If it passes, setup is done: go to step 6.
- Something is MISSING: tell the user exactly what and how to fix it.

> **ASK THE USER** (only if something is missing): "Please fix <item> (<how>) and tell me when it
> is done." After the reply, re-run the failed checks; continue only when they pass.

## Step 2 -- One grouped question

Before asking, gather the defaults:

```bash
docker images --format '{{.Repository}}:{{.Tag}}' | grep -E '/gtmos-(api|console|worker|mcp):'   # local images?
node -e "const n=require('net');for(const p of [3000,3001,3004,5432])n.createServer().once('error',()=>console.log(p,'busy')).once('listening',function(){console.log(p,'free');this.close()}).listen(p,'127.0.0.1')"
```

- Version default: if all four images `gtmos-api`, `gtmos-console`, `gtmos-worker`, `gtmos-mcp`
  exist locally with the same tag, use that tag with `--no-pull` and their registry prefix as
  `--registry` (for example `ghcr.io/ay-automate`); otherwise `stable`, pulled from the default
  public registry `ghcr.io/ay-automate`.
- Ports default: 3000 (console), 3001 (api), 3004 (MCP), 5432 (Postgres); for a busy one propose
  the next free port.

> **ASK THE USER** (one message, all at once):
> 1. *Only if an instance answered in step 1:* "A GTM OS instance is already running at
>    http://127.0.0.1:3001 (<compose project>). Use it (recommended), or install a new one (it needs
>    other ports)?"
> 2. Organization name.
> 3. Owner email (the account you work as; Claude acts as an agent on its behalf).
> 4. Approver email: a DIFFERENT person (or at least a different identity) from the owner. GTM OS
>    has a four-eyes rule: whoever proposes a change can never approve it.
> 5. Version: "<local tag> (local images, no download)" or "stable" -- show the default.
> 6. Ports: the defaults above, or the free ones you propose for each busy port.
> 7. Provider keys: which do you have ready -- a model provider (Anthropic, Gemini or OpenAI;
>    one is required), looot, Resend? "Have them at hand: right after the install you paste them
>    in the console (Connections page), where they are live at once -- no restart."
>
> For **use existing** ask instead: the owner email of that instance, the organization id
> (console Settings > Developer shows it), and where its `.env` is if it holds
> `GTMOS_OWNER_PASSWORD` (e.g. the folder `gtm setup` ran in). If there is no such file, offer two
> options: they type the owner password in chat (warn: it stays in this transcript), or they do the
> owner-only steps themselves in the console when you reach them.
>
> After the reply: summarise the answers back in one line and continue with step 3.

## Step 3 -- Install (new instance only)

**Use existing:** skip this step. `<api>` = `http://127.0.0.1:3001`, `<owner env file>` = the path
the user gave. If that org has no second admin yet, see step 7.

**Install new:** the stack goes in the subfolder `instance/`, so its compose file and `.env` never
mix with this agent workspace:

```bash
gtm setup instance --org "<org name>" --email <owner> --approver-email <approver> \
  --version <tag|stable> [--no-pull] \
  [--api-port <n>] [--console-port <n>] [--mcp-port <n>] [--postgres-port <n>] \
  --no-harness
```

- `--no-harness`: this workspace already has the harness from `gtm init`.
- Pass a `--*-port` flag only for a port the user changed. The generated `instance/.env` keeps
  `PUBLIC_API_URL` / `PUBLIC_CONSOLE_URL` / `PUBLIC_MCP_URL` in step with those ports.
- It takes a few minutes (first start runs the database migrations). It is idempotent: if it stops
  half-way, fix what it reports and run the same command again.
- `<owner env file>` = `instance/.env`; `<org id>` = its `ORGANIZATION_ID` (read only that value:
  `sed -n 's/^ORGANIZATION_ID=//p' instance/.env`).
- Provider keys (model provider, looot, Resend) go in the console Connections page in step 6 (per
  org, live immediately, no restart). Do NOT add them to `instance/.env` after the stack is up: an
  env change only applies when the containers are recreated.
- Containers recreated (this install restarts the worker; `gtm up`, `gtm upgrade` or
  `docker compose up -d --force-recreate` recreate them) drop Claude Code's MCP session: tell the user
  "run `/mcp` to reconnect the gtmos server" before you use the MCP tools again.

Tell the user (never print the passwords): "GTM OS is running. Console: <console>. Your password is
in `instance/.env` as `GTMOS_OWNER_PASSWORD`; the approver's is `GTMOS_APPROVER_PASSWORD` -- give it
to the approver privately, I will never use it."

## Step 4 -- Agent key, connect this workspace, check

Mint an AGENT key (it acts as the agent, proposes, never approves) with the owner's session, in
ONE call so the session token and the password never appear in the transcript:

```bash
export GTMOS_API_URL=<api> GTMOS_ORG=<org id>
export GTMOS_PASSWORD="$(sed -n 's/^GTMOS_OWNER_PASSWORD=//p' <owner env file> | tr -d '\r')"
export GTMOS_TOKEN="$(gtm login --email <owner> --console-url <console> | sed -n "s/^export GTMOS_TOKEN='\(.*\)'$/\1/p")"
gtm token create --name claude-code --client claude-code --preset full-gtm-engineer --expires-days 90
```

The **Full GTM engineer** preset (record.read, record.write, engine.configure, connection.manage --
never action.approve) lets you configure everything an owner/admin can, except approving, agent
keys / roles, OAuth sign-ins and Dry Mode. A key without engine.configure is refused every
"build" operation (definitions, workspace settings, research profile, fields, pipelines, flags).

(`gtm login` reads the password from `GTMOS_PASSWORD`; `--console-url` must be the console origin
the API trusts.) The output shows the key ONCE with its export lines. Then connect this workspace
to the instance and pull the LIVE reference docs:

```bash
gtm init --url <api> --key <agent key> --yes
GTMOS_AGENT_TOKEN='<agent key>' gtm init --refresh --yes
GTMOS_API_URL=<api> GTMOS_TOKEN='<agent key>' GTMOS_ORG=<org id> gtm doctor
```

`gtm init` writes `.claude/gtmos-instance.json` (no secret), refreshes `.mcp.json` (Bearer
`${GTMOS_AGENT_TOKEN}`), `.claude/gtm-context.md` and `docs/gtmos/reference/` from the live org. It
refuses a key that can approve (exit 3). `gtm doctor` lists what is not live yet -- step 6 fixes it.

The key is stored ONLY in the user's environment, never in a file of this workspace. Claude Code
reads `GTMOS_AGENT_TOKEN` when it starts and expands it into the `.mcp.json` header, so the MCP
server connects only after a restart with the variable set.

- NEVER write the key into `.mcp.json` (it stays `Bearer ${GTMOS_AGENT_TOKEN}`), `CLAUDE.md`,
  `.claude/settings.json`, `.claude/settings.local.json` or any other file, and never ask the user
  to paste it back into the chat. (Claude Code's docs do not state that a settings file's `env`
  feeds the `.mcp.json` `${VAR}` expansion, so the OS environment is the only supported place.)
- If `gtm init` warns that `.mcp.json` holds a literal credential, the gtmos entry has been rewritten
  to `${GTMOS_AGENT_TOKEN}`; have the user revoke that key (`gtm token revoke <key id>`) and use a
  fresh one from the environment.

> **ASK THE USER**: "Set the agent key in your environment, then restart Claude Code in this folder
> (I keep going with the CLI until then):
> - Windows PowerShell (persistent): `[Environment]::SetEnvironmentVariable('GTMOS_AGENT_TOKEN', '<agent key>', 'User')`
>   -- then open a NEW terminal.
> - macOS / Linux: add `export GTMOS_AGENT_TOKEN='<agent key>'` to `~/.zshrc` or `~/.bashrc`, then
>   open a new terminal.
>
> After the restart, run `/mcp`: the `gtmos` server must show connected."
>
> Meanwhile you continue: pass `GTMOS_AGENT_TOKEN='<agent key>'` (and `GTMOS_TOKEN` for `gtm`
> commands) inline per call, or call the REST API directly:
>
> ```bash
> curl -s "<api>/v1/operations/<query op>?input=<url-encoded JSON>" -H "Authorization: Bearer <agent key>" -H "x-gtmos-organization-id: <org id>"
> curl -s -X POST "<api>/v1/operations/<write op>" -H "Authorization: Bearer <agent key>" -H "x-gtmos-organization-id: <org id>" -H "content-type: application/json" -d '<JSON input>'
> ```
>
> Queries are GET with `?input=`, writes are POST with a JSON body. After the restart use the MCP
> tools (`gtm_query`, `gtm_propose`, ...) instead.

## Step 5 -- Read the docs you just pulled

Read `docs/gtmos/README.md`, then `docs/gtmos/guides/04-connections.md` and
`docs/gtmos/reference/connections.md`. Before any operation below, read its entry in
`docs/gtmos/reference/operations.md` (never guess a field). Re-pull them any time with
`gtm init --refresh`.

## Step 6 -- Connections, in this order

Check what is missing first: `instance.readiness` (or `gtm doctor`). Provider keys always go in
as Connections (stored per org, live at once, no container restart) -- never by editing
`instance/.env`. For each key below (the user told you in step 2 which they have ready):

> **ASK THE USER** (per provider): "Paste your <provider> key in the console (private, recommended):
> <console>/org/<org id>/connections > Add a connection > <provider>. Or paste it here and I will
> store it -- but a key pasted in chat stays visible in this transcript."
>
> If they used the console: wait for "done", then check `instance.readiness`.
> If they pasted it in chat: store it with `connections.create` (POST, the agent key works) and
> never repeat the key afterwards:
> `{"provider":"<provider>","label":"<provider>","secret":"<key>"}`.

1. **Model provider (always required):** `anthropic` and/or `gemini` (or `openai`). At least one
   must be live.
2. **looot** (`looot`): the only third-party data provider (enrichment, search, intent).
3. **Resend** (`resend`): email sending when no Gmail / Microsoft 365 mailbox sends.

A connection stored but never tested reads `configured_unverified`. `connections.test` is
customer-facing: it is PROPOSED and the approver approves it (step 7); clicking **Test** on the
connection in the console is the alternative.

4. **Composio** (the user's own apps: CRM, Search Console, Ahrefs, Slack, ...):

   > **ASK THE USER**: "Open <console>/org/<org id>/connections#composio and click **Connect
   > Composio** (sign in to Composio). Tell me when it says connected."
   >
   > After "done": check `composio.status` (GET). It must report the connection; if not, ask them
   > to retry and check again.

   Then link the apps already connected in their Composio account -- YOU do this with the agent key
   (it holds `connection.manage`; linking an already-authorized connection creates no credential and
   executes nothing, and writes through the app stay approval-gated):

   1. **Discover + sync**: `composio.sync_connections` (POST `{}`). It finds every app connected in
      their Composio account (Search Console, Ahrefs, Gmail, Calendar, their CRM, Slack, ...) and
      records each one ACTIVE; apps no longer connected become INACTIVE. Read `connected` and
      `toolkits[].change` in the result.
   2. **Check**: `composio.status` (GET) -- every app you need must be `ACTIVE`.
   3. **Pin a specific account** only when the user has several for one app:
      `composio.accounts_available` `{"toolkit":"<toolkit>"}`, then `composio.adopt`
      `{"toolkit":"<toolkit>","connectedAccountId":"<id>"}` (verified live; agent keys with
      `connection.manage` may do it).
   4. **CRM of record**: `crm.settings.set` `{"crmOfRecord":"<toolkit>"}` once the CRM is ACTIVE
      (owner/admin; if it is refused for the agent key, ask the user to pick it on the Composio card).

   A `FORBIDDEN` "does not hold the connection.manage scope" means the key was created without it:
   mint a new key with `--scopes record.read,record.write,engine.configure,connection.manage` (step 4).

   > **ASK THE USER** only when an app they need is NOT connected anywhere yet: "Connect <App> in
   > your Composio account (connect.composio.dev), or click **Connect** next to it on
   > <console>/org/<org id>/connections#composio. Tell me when it is done."
   >
   > After "done": `composio.sync_connections` again, then `composio.status`. (`composio.connect`,
   > the OAuth sign-in and `composio.disconnect` are human-only. If the user gives you a Composio
   > key instead of signing in, store it with `composio.set_api_key` `{"apiKey":"<key>"}` --
   > verified live, never echoed -- then sync.)

   5. **Pull the data now** (owner / admin, or this agent key they scoped), so the setup drafts from
      real data: `product_analytics.sync` (PostHog, Mixpanel, Amplitude: product events become contact
      signals; PostHog / Mixpanel need `<toolkit>/project_id` via `connections.set_provider_setting`),
      `transcripts.sync` (Fireflies, Gong, Zoom, Fathom into conversation memory) and
      `outbound_rails.sync_replies` (Smartlead, Instantly, lemlist replies). Each keeps its scheduled
      pull; NOT_CONFIGURED = that tool is not connected. `outbound_rails.list` shows the rail senders
      and campaigns a sending lane can bind (every send still goes through the approval gate).

   Google Search Console is REQUIRED only if the org uses the SEO & GEO engine; then also set the
   property (`connections.set_provider_setting` `gsc/site_url` = `sc-domain:<domain>`) -- see
   guide 04.

5. **Sending domain** (for email outreach). GTM OS has no DNS operation: `lane.activate` checks
   SPF, DKIM and DMARC when a lane goes live.

   > **ASK THE USER**: "Which domain do you send from, and through which provider (Resend, Google
   > Workspace, Microsoft 365)?" Then print the records to add at their DNS host:
   >
   > - SPF: one TXT on `<domain>` starting `v=spf1`, including the provider's sender (the exact
   >   include comes from the provider: Resend > Domains, or the Workspace / 365 admin).
   > - DKIM: the TXT (or CNAME) at `<selector>._domainkey.<domain>` the provider shows.
   > - DMARC: a TXT on `_dmarc.<domain>`, e.g. `v=DMARC1; p=none; rua=mailto:dmarc@<domain>`.
   >
   > "Tell me when they are added." Then check them: `nslookup -type=TXT <domain>` and
   > `nslookup -type=TXT _dmarc.<domain>`. Not visible yet: DNS can take time; continue and
   > re-check before go-live.

6. **Unipile** (LinkedIn) -- optional. Ask whether they want LinkedIn steps; if yes they add it on
   the Unipile card of the Connections page (API key + DSN).

Finish with `instance.readiness` (or `gtm doctor`): show the "Required connections" that are still
not live and what each needs.

## Step 7 -- Approvals (four-eyes)

Explain to the user, briefly: Claude PROPOSES every customer-facing action and every config change
that goes live; a DIFFERENT human approves it. The approver signs in to the console AS THE APPROVER
account and decides in **Approvals** (<console>/org/<org id>/approvals). You never use the
approver's credentials and you never approve.

> **ASK THE USER** (existing instance with no second admin): "Your organization needs a second
> admin to approve. Please run in YOUR own terminal (not here, so I never see the password):
> `gtm member add --email <approver> --password '<a password>' --role admin --org <org id>` with
> that instance's `.env` loaded, or invite them in Settings > Members
> (<console>/org/<org id>/members)."
>
> After "done": continue.

When something you proposed is waiting (e.g. `connections.test`), report the approval id and the
link, ask the user to have the approver approve it, and continue with other work.

**Config goes live by sign + promote.** Definitions you seed land in `dev`; the runtime reads
`prod`. Read `config.promotion_status` and, while `attention` is true, tell the user: "N definitions
are in dev, not live. The approver opens Environments > Go live, clicks 'Review & sign all proposed
(N)', then 'Promote dev -> prod', and approves + executes the promotion in Approvals." You may propose
`env.promote`; you never sign (`definition.sign_many` is human-only, and never by the person you act for).

## Step 8 -- Hand-off

Summarise: instance URL + console, org, the agent key name (never the key), what is live, what is
still missing -- and every Open item in `.claude/memory/setup-status.md` with its fix and owner.

Then the organization's own setup (the six-screen wizard the console shows under Setup): read
`onboarding.get` (where the org is: `session.currentStep`, `progress`). If it is not completed,
follow the `gtmos-onboarding` skill screen by screen (company and motion with `onboarding.suggest`,
data with `onboarding.signal_coverage` and `onboarding.request_access`, definitions, rules and
seats with `roles.list`, the build with `onboarding.engine_readiness`, `onboarding.build.start` and
`onboarding.build.get`, the 90-day plan with `onboarding.plan.set`, the OS brief with
`onboarding.brief`, and what Launch needs with `onboarding.launch.preview`). It never invents a
value and leaves the human-only steps (Launch, brand voice, rules, role profiles) to the user.

Then run `/build-gtm-system` (it defines the workspace profile, research settings and every
engine item, and records each in setup-status.md).
