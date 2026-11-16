---
name: composio
description: Use when the GTM engineer wants GTM OS to read from or act in THEIR OWN apps -- their CRM (HubSpot, Salesforce, Pipedrive, Attio, Zoho), product analytics (PostHog, Mixpanel, Amplitude), call recorders (Fireflies, Gong, Zoom, Fathom), ad platforms (Google, Meta, LinkedIn, TikTok), outbound rails (Smartlead, Instantly, lemlist), Slack, Notion, support or billing tools -- through Composio. Covers installing and logging in to the Composio CLI (macOS/Linux/Windows), what to automate for this GTM setup, the GTM OS 0.3.0 path (paste one ak_ project key in Integrations > Apps, connect apps from the Apps grid, CRM of record, sync; write-back via the approval-gated crm.update_record), errors and references.
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

1. **Link the Composio account once (a project key)** -- there is no Composio sign-in in GTM OS 0.3.0.
   Only a **project key that starts with `ak_`** is accepted (get it at platform.composio.dev > your
   project > Settings > API Keys). A Connect key (`ck_...`) and a `uak_` user key are refused. The
   owner or admin pastes the key once in **Integrations > Apps** (or the instance sets
   `COMPOSIO_API_KEY` as a fallback). If the person gives you the key and no working key is linked yet,
   you may store it with `integrations.setup.link_key` `{"apiKey":"<key>"}` (the older name
   `composio.set_api_key` still works; it is tested live, sealed and never echoed). Replacing a working
   key needs a person in the console. Check with `integrations.setup.status` (state `linked` means done;
   `needs_project_key`, `key_invalid` and `key_missing_permissions` say what to fix) and re-test with
   `integrations.setup.test`. Pasting the key is the first step, not the whole setup: the person also
   sets the **callback verifier** (the address shown on the Apps banner, `<console>/integrations/callback`)
   once in the Composio project settings, and the worker must be running so the app list loads.
2. **Connect the apps inside GTM OS** -- apps are connected from the **Integrations > Apps** grid, not in
   the Composio dashboard. Search the list (`integrations.catalog`), click **Connect** on the app and
   follow it: an OAuth app opens Composio's hosted page and the app's own consent page, an app that takes
   a key or token asks for the fields in GTM OS. Connecting is a human step (`integrations.connect`
   cannot be run by an agent). You can see the result with `integrations.status` (read only) and
   `integrations.accounts.list`. An app can have several accounts: everyone in the org can use an org
   account, and `integrations.refresh` re-checks one account. Apps that Composio does not manage
   (Pipedrive and some others: Meta Ads, LinkedIn Ads, Webflow, WordPress.com, Snowflake, ZoomInfo) need
   the organization's own OAuth app or an API key.
3. **Old connections** -- connections made by hand in the Composio dashboard are not picked up any more.
   `composio.sync_connections` now only reports (it is the same as `integrations.status`), and
   `composio.adopt` and the `composio.oauth_*` operations are retired. If an app shows as not
   connected, connect it again from the Apps grid. Check with `gtm_query integrations.setup.status`.
4. **CRM of record** -- in the "CRM of record" section of the CRM settings pick the CRM (`crm.settings.set
   {crmOfRecord}`; one of hubspot, salesforce, pipedrive, attio, zoho; requires an active connected
   account for it, owner/admin). This seeds the scheduled sync (every 6 hours).
5. **Sync** -- "Sync now" (`crm.sync`; one running sync per org), then `gtm_query crm.sync_status`
   for the last result. Synced companies/contacts/deals land as `gtm.*` records with provenance.
6. **Write-back** -- updating a record in their CRM is `crm.update_record {recordType, recordId,
   fields}`: an **E-class effect**, proposed, approved by a different human, reversible with
   `crm.undo_update_record {approvalId}`. Never write to the CRM any other way.
7. **Verify live** -- `integrations.status` shows the app account active, `crm.sync_status` a recent
   success, and `instance.readiness` the CRM seam live.
8. **Check completeness** -- `sync.completeness.run` counts every object at the CRM (HubSpot search
   total, Salesforce COUNT(), Pipedrive deals summary; else the last complete read) and flags what is
   mirrored below the org threshold (default 60%); `sync.parity_check` compares a live sample field by
   field (money to the cent). Read them with `sync.completeness` / `sync.health` (CRM > Data health).
   Caveat every number you report on a flagged object.

Any OTHER app (Close, Typeform, Stripe, ...) lands in the ontology through a signed source
mapping -- see `gtmos-source-mapping` (card: a connected app > Map to ontology).

**Composio vs your own MCP servers.** For an MCP server that is not an app in the Apps grid -- an
internal tool, a vendor's MCP endpoint -- do not route it through Composio: add it per org in
Integrations > Connections > **MCP servers** (`mcp_servers.*`, see the `mcp` skill) and bind its
tools as `mcp:<server>:<tool>`.

Disconnect an app account with `integrations.disconnect` (humans only; it deletes the connection at
Composio first). Write tools are gated; reads are not.

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
the data lands, the op that pulls it, what it still needs). Connect the app in Integrations > Apps, check it
with `integrations.status`, then run the op:

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
  and cancels the message. A background job (the rail hand-off sync) does this every 15 min and on those events.
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

- **The key is refused** (`integrations.setup.link_key` VALIDATION_FAILED, or state `key_invalid` /
  `needs_project_key` / `key_missing_permissions`): only a project key that starts with `ak_` works
  (platform.composio.dev > project > Settings > API Keys). A `ck_` Connect key or a `uak_` user key is
  refused, and there is no Composio sign-in to use instead. Nothing is saved on a refusal.
- **"The Composio sign-in is no longer supported"** (`composio.oauth_start` and friends): retired in
  0.3.0. Link the project key, then connect apps from Integrations > Apps.
- **Account not active** (pending, expired, failed): connect it again from the app's page in Integrations >
  Apps; hosted links expire after about 10 minutes. `integrations.refresh` re-checks one account.
- **NOT_CONFIGURED for an app**: that app has no connected account in GTM OS yet. Ask the user to connect it
  from the Apps grid, then check `integrations.status`. An app connected only in the Composio dashboard
  does not count.
- **The app list is empty**: the worker loads it. Make sure the worker runs; on a shared installation the
  instance sets `COMPOSIO_API_KEY`.
- **FORBIDDEN "does not hold the connection.manage scope"**: the agent key lacks it -- a new key from
  Settings > Developer (Claude Code preset) or `gtm token create --scopes ...,connection.manage`.
- **`crm.settings.set` refused**: no active connected account for that CRM app -- connect it in Integrations > Apps first.
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
