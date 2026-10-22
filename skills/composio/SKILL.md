---
name: composio
description: Use when the GTM engineer wants GTM OS to read from or act in THEIR OWN apps -- their CRM (HubSpot, Salesforce, Pipedrive, Attio, Zoho), product analytics (PostHog, Mixpanel, Amplitude), call recorders (Fireflies, Gong, Zoom, Fathom), ad platforms (Google, Meta, LinkedIn, TikTok), outbound rails (Smartlead, Instantly, lemlist), Slack, Notion, support or billing tools -- through Composio. Covers installing and logging in to the Composio CLI (macOS/Linux/Windows), what to automate for this GTM setup, the GTM OS path (Integrations > Connections > Composio -> connect app -> CRM of record -> sync; write-back via the approval-gated crm.update_record), errors and references.
---

# Composio in GTM OS

**What it is for.** Composio connects GTM OS to the customer's **own** SaaS accounts (1,000+
toolkits) and lets GTM OS read them and act in them. It is the **action layer**. Third-party
**data** (enrichment, emails, company lists, intent, SERP) is looot's job -- see `gtmos-looot`.
Never use Composio to buy data, and never use looot to write into the customer's CRM.

**Rule one: go through GTM OS.** Inside GTM OS every Composio call runs through a capability and
the approval gate (reads are free to run; writes are proposals a different human approves).
The Composio CLI below is for the engineer's own exploration -- finding the right toolkit or
tool and checking an account -- not a side door for production writes.

## The GTM OS path (production)

1. **Connect Composio** -- in **Integrations > Connections > Composio** the engineer clicks **Connect
   Composio** and signs in to their Composio account (OAuth 2.1 + PKCE against Composio Connect:
   `composio.oauth_start` -> Composio -> `<console>/composio/callback` -> `composio.oauth_callback`;
   tokens sealed, refreshed automatically; `composio.oauth_disconnect` forgets them). No key to
   paste. **Advanced** on the same card still takes a key (`composio.set_api_key`, verified live,
   stored sealed): a Composio Connect key (`ck_...`) or a developer project key (`ak_...`); a
   `uak_` user key is refused. Precedence when several exist: sign-in > `ck_` > `ak_`; without an
   org credential the instance `COMPOSIO_API_KEY` is the fallback. `composio.status` shows the
   `mode` (connect_oauth | connect_key | project).
2. **Link the apps already connected** -- `composio.sync_connections` (the agent may run
   it with a key holding `connection.manage`, the Claude Code default) discovers every app connected
   in the user's Composio account and records it ACTIVE (Search Console, Ahrefs on Composio's instant
   account, Gmail, Calendar, the CRM, ...); apps no longer connected become INACTIVE. It runs
   automatically after Connect Composio / a saved key, from `composio.status` when the last sync is
   older than 5 minutes, and just-in-time when a call needs an app that has no row yet. The card's
   **Sync connected apps** button does the same. So in Connect mode there is nothing to "adopt" by
   hand: sync, then `composio.status`.
3. **Connect a new app** -- only for an app NOT connected anywhere yet: the user connects it in their
   Composio account (connect.composio.dev) or clicks Connect on the card; then sync again. On the card: search the toolkit (`composio.toolkits`) and click
   Connect (`composio.connect`): in Connect mode an app already connected in the user's Composio
   account is verified live and used at once; otherwise Composio's hosted auth URL opens and the card
   polls until the account is `ACTIVE` (`composio.refresh`). **Use an existing connection**
   (`composio.accounts_available` -> `composio.adopt`) pins one specific account when there are
   several -- verified live first; an agent key with `connection.manage` may call both (every adopt is
   audited with the agent and the human it acts for). A project key (`ak_`) sync only links this
   org's own accounts; `includeUnowned` (humans only) also links the project's other ACTIVE accounts.
   Check with `gtm_query composio.status`. If the user hands you a Composio key (`ck_` / `ak_`),
   you may store it with `composio.set_api_key` (agent key with `connection.manage`; verified live,
   audited; never echo the key). `composio.connect`, the OAuth sign-in and `composio.disconnect`
   stay human-only.
   Pipedrive (and some others: Meta Ads, LinkedIn Ads, Webflow, WordPress.com, Snowflake, ZoomInfo)
   have no Composio-managed OAuth app -- they need the customer's own OAuth app or API key.
4. **CRM of record** -- in the card's "CRM of record" section pick the CRM (`crm.settings.set
   {crmOfRecord}`; one of hubspot, salesforce, pipedrive, attio, zoho; requires an ACTIVE Composio
   account for it, owner/admin). This seeds the scheduled sync (every 6 hours).
5. **Sync** -- "Sync now" (`crm.sync`; one running sync per org), then `gtm_query crm.sync_status`
   for the last result. Synced companies/contacts/deals land as `gtm.*` records with provenance.
6. **Write-back** -- updating a record in their CRM is `crm.update_record {recordType, recordId,
   fields}`: an **E-class effect**, proposed, approved by a different human, reversible with
   `crm.undo_update_record {approvalId}`. Never write to the CRM any other way.
7. **Verify live** -- `composio.status` shows the toolkit ACTIVE, `crm.sync_status` a recent
   success, and `instance.readiness` the CRM seam live.
8. **Check completeness** -- `sync.completeness.run` counts every object at the CRM (HubSpot search
   total, Salesforce COUNT(), Pipedrive deals summary; else the last complete read) and flags what is
   mirrored below the org threshold (default 60%); `sync.parity_check` compares a live sample field by
   field (money to the cent). Read them with `sync.completeness` / `sync.health` (CRM > Data health).
   Caveat every number you report on a flagged object.

Any OTHER app (Close, Typeform, Stripe, ...) lands in the ontology through a signed source
mapping -- see `gtmos-source-mapping` (card: a connected app > Map to ontology).

**Composio Connect vs your own MCP servers.** Composio Connect is itself an MCP server (GTM OS
speaks to it with the same shared MCP client). For any OTHER MCP server -- an internal tool, a
vendor's MCP endpoint -- do not route it through Composio: add it per org in Integrations > Connections >
**MCP servers** (`mcp_servers.*`, see the `mcp` skill) and bind its tools as `mcp:<server>:<tool>`.

Disconnect an app with `composio.disconnect` (console card; in Connect mode the user's own Composio
connection is never deleted). Write tools are gated; reads are not.

**SEO & GEO through Composio**: Google Search Console connected through Composio satisfies the GSC
requirement (`instance.readiness` connector.gsc "via composio"; doctor: "Search Console: connected
via Composio"); Ahrefs through Composio adds domain rating, backlinks, keywords and competitors.
Run `seo_geo.run_visibility`, read `seo_geo.get_visibility`; pick the property with
`seo_geo.gsc_properties` + `connections.set_provider_setting gsc/site_url` when several match.

## Suggest what to automate (for this GTM setup)

Lead with these, matched to what the engineer runs -- recommend, with the reason:

- **CRM of record sync** (always, if they have a CRM): accounts/contacts/deals into GTM OS so Score,
  Enrichment and Outreach work on the real book of business; dedupe with Identity & DQ after the first sync.
- **Score -> CRM write-back**: push the qualification score / tier to a CRM field via
  `crm.update_record` so sales sees it where they work (approval-gated; batch carefully).
- **Meeting / reply logging**: Gmail + Google Calendar connected accounts already autolog
  activities -- prefer them over a Composio duplicate.
- **Slack**: hot-account and approval-waiting alerts to a channel -- GTM OS has a native Slack
  integration (Settings > Slack); prefer it, and use Composio's Slack toolkit only for actions it lacks.
- **Support / billing signals** (Zendesk, Intercom, Stripe...): read-only signals into Score
  (expansion, churn risk) -- propose the capability binding, do not hand-roll calls.
- **Product analytics -> signals** (PostHog, Mixpanel, Amplitude): `product_analytics.sync`.
- **Call recorders -> memory** (Fireflies, Gong, Zoom, Fathom): `transcripts.sync`.
- **Ad platforms -> campaign outcomes** (Google / Meta through Composio when not native, LinkedIn,
  TikTok): `perf_ads.sync_performance`.
- **Outbound rails** (Smartlead, Instantly, lemlist) behind the lanes: see below.
- Do NOT suggest Composio for enrichment, email finding or lists (looot). Outbound email always goes
  through lanes + `outreach.send_message` (approval-gated) -- a Composio rail is only ever a lane's
  sender, never called directly.

## Data sources and outbound rails

Every connector below feeds data INTO GTM OS (never a status badge only). The setup wizard's
Connect screen lists them per category (`onboarding.signal_coverage` -> categories[].catalog: where
the data lands, the op that pulls it, what it still needs). Connect the toolkit in Composio, run
`composio.sync_connections`, then the op:

| Category | Toolkit | Lands in | Op (6-hourly job once run) | Also needs |
|---|---|---|---|---|
| Product analytics | posthog, mixpanel, amplitude | contact signals (product_signup, product_activated, order_placed, cart_abandoned ...) | `product_analytics.sync` | `connections.set_provider_setting` posthog/project_id, mixpanel/project_id; optional `<toolkit>/event_map` JSON |
| Calls | fireflies, gong, zoom, fathom | conversation memory (transcripts, linked to contacts, indexed) | `transcripts.sync` (`toolkit` optional) | Zoom: cloud recording + audio transcripts |
| Ads | googleads, metaads, linkedin_ads, tiktok_ads | campaign outcomes (spend, impressions, clicks, conversions) | `perf_ads.sync_performance` | the campaign's custom.platform + externalCampaignId; google_ads/customer_id; tiktok_ads/advertiser_id. Read only through Composio: budget changes need native Google / Meta |
| Billing / warehouse | stripe, googlebigquery, snowflake | records | `source.suggest_mapping` -> `source.sync` | a signed mapping (`gtmos-source-mapping`) |
| Outbound rails | smartlead, instantly, lemlist | approved sends + replies (reply-stop) | `outbound_rails.list`, `outreach.send_message`, `outbound_rails.sync_replies` (hourly) | see below |

The event map: `{"user_signed_up": "product_signup", "$pageview": "ignore"}` -- kinds:
product_signup, product_activated, product_usage_spike, order_placed, cart_abandoned, form_submitted,
discovery_call_booked. Without it, default name rules classify sign-up / activation / purchase /
cart-abandoned events; everything else is skipped. An event with no email in the OS is counted
unresolved, never attached to a guessed record.

**Outbound rails.** A rail is a lane's sending mailbox; every send still goes through the approval,
suppression, claim guardrail, brand safety, caps, quiet hours and the unsubscribe footer.
- **Smartlead**: bind a Smartlead sender ADDRESS as the lane mailbox; each approved message is sent
  as one email (SMARTLEAD_SEND_SINGLE_EMAIL). Multi-step sequences work.
- **Instantly**: bind `instantly:<campaign id>`. The campaign must have exactly ONE email step whose
  subject is `{{gtmos_subject}}` and body `{{gtmos_body}}`; the approved message is set on the lead
  and the campaign sends it on its own schedule. One email per lead per campaign: bind follow-up
  steps to another campaign (another lane), or use Smartlead / a mailbox.
- **lemlist**: bind `lemlist:<campaign id>`; exactly ONE email step whose message is
  `{{icebreaker}}`; lemlist sends the step's own subject, so the approved subject must equal it.
- `outbound_rails.list` shows the bindable identities and why a campaign is refused.
- Instantly / lemlist take a HAND-OFF: before it the campaign must be active, its schedule inside the
  org send window (policy.guardrails sendWindow) and (Instantly) its daily limit within the day cap;
  pending hand-offs + today + 1 must stay within the caps. The message is `handed_off` until the
  rail reports the send (then `sent`); a reply / unsubscribe / suppression / consent withdrawal /
  erasure withdraws the lead at the rail (INSTANTLY_DELETE_LEAD, LEMLIST_DELETE_UNSUBSCRIBE_LEAD_FROM_CAMPAIGN)
  and cancels the message. The job is `outbound_rails.handoff_sync` (every 15 min + on those events).
- Call memory: internal-only calls are skipped unless `transcripts/include_internal_meetings` = true;
  synced transcripts follow `transcripts/default_visibility` (default private). Erased participants
  are cut out; an erased / redacted / archived transcript is never re-created or overwritten.
- Amplitude sends up to `amplitude/contacts_per_pull` contact emails per pull to Amplitude (default 25,
  0 = off); only an exact user id match counts.

## Composio CLI (exploration on the engineer's machine)

Verified against https://docs.composio.dev/docs/cli.md (2026-10-08).

**Install -- macOS / Linux:**

```bash
curl -fsSL https://composio.dev/install | sh
composio --help
composio upgrade            # later updates
```

**Windows:** the Composio docs say to install and run the CLI **inside WSL** (there is no native
PowerShell installer documented):

```powershell
wsl --install               # once, if WSL is not set up yet (then reboot)
wsl                         # open the Linux shell, then:
curl -fsSL https://composio.dev/install | sh
```

Do not `npm install` a Composio CLI: the old `composio-core` npm CLI is deprecated, and the
`composio` pip package is the Python SDK, not the CLI.

**Log in:**

```bash
composio login              # browser OAuth
composio login --no-wait    # prints a URL for a human to open; finish with: composio login --poll
```

**Explore (current syntax -- `add` / `apps` / `tools` are the old deprecated CLI):**

```bash
composio search "list hubspot companies"            # find tools by task
composio execute HUBSPOT_LIST_COMPANIES --get-schema # a tool's input schema
composio link hubspot                               # connect an account (hosted OAuth)
composio connections list                           # connected accounts
composio dev toolkits list                          # toolkits
composio dev connected-accounts list --toolkits hubspot
```

`composio execute <TOOL> -d '{...}'` runs a tool directly -- fine for a READ to learn a payload
shape; never for a production write (that is `crm.update_record` through the gate).
`composio setup --target claude` installs Composio's own agent plugin; you do not need it to use
Composio through GTM OS, and if installed it must not be used to bypass the GTM OS approval gate.

## Errors and recovery

- **401 on the key** (`composio.set_api_key` refuses): wrong or revoked key -- use Connect
  Composio instead, or a fresh `ck_` (connect.composio.dev) / `ak_` (platform.composio.dev >
  project > Settings > API Keys) key. A `uak_` user key never works for app calls.
- **Sign-in expired** (status "Sign-in expired", AUTH_EXPIRED "Reconnect Composio"): the refresh
  failed -- click Reconnect Composio on the card.
- **Account not ACTIVE** (`INITIATED`, `EXPIRED`, `FAILED`): reconnect from the card; hosted
  links expire after ~10 minutes.
- **NOT_CONFIGURED "Connect <App> in your Composio account (connect.composio.dev) or click Connect in
  Integrations > Connections > Composio"**: that app is not connected in the user's Composio account
  (routing already re-synced once). Ask the user to connect it, then `composio.sync_connections`.
- **INACTIVE after a sync**: the app was disconnected in Composio -- reconnect it there, then sync.
- **FORBIDDEN "does not hold the connection.manage scope"**: the agent key lacks it -- a new key from
  Settings > Developer (Claude Code preset) or `gtm token create --scopes ...,connection.manage`.
- **`crm.settings.set` refused**: no ACTIVE Composio account for that CRM toolkit -- connect it first.
- **Sync already running**: one sync per org; wait and read `crm.sync_status`.
- **`crm.update_record` FORBIDDEN / pending**: it is an approval -- a different human approves it
  under Needs a human; you never approve your own proposal.
- **Rate limit (429)**: Composio limits per organisation (Hobby 2,000 req/min, Pro 10,000); back off.
- **Tool returns `successful: false`**: read the error and the receipt; do not retry a write blindly.

## References

- Composio docs: https://docs.composio.dev/ -- CLI: https://docs.composio.dev/docs/cli.md
- Agent setup: https://docs.composio.dev/docs/agent-setup.md -- unattended auth:
  https://docs.composio.dev/docs/agent-setup/unattended-authentication.md
- API (v3.1): https://backend.composio.dev/api/v3.1 (header `x-api-key`) -- rate limits:
  https://docs.composio.dev/reference/rate-limits.md
- GTM OS reference: `docs/gtmos/reference/connections.md` and `docs/gtmos/reference/operations.md`
  (areas `composio`, `crm`), installed by `gtm init`.
