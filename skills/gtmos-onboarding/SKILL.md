---
name: gtmos-onboarding
description: Guide a user through the per-organization GTM OS setup wizard over MCP (gtm_describe / gtm_query / gtm_act) -- Welcome, Connect your data, Your definitions, Rules and who approves what, The build, First motion and 90 days -- citing the evidence behind every draft, never inventing a value, and stopping for the human-only steps and the four-eyes approvals. Use when the user wants to set up (or finish setting up) an organization in a running GTM OS instance; run gtmos-setup first if no instance is connected.
---

# GTM OS per-org setup runbook (the agent executes this)

The console's setup wizard and this runbook drive the SAME operations: whatever you save here, the
user sees in the console (Setup), and the other way round. Before this skill, the workspace must be
connected to an instance (`.claude/gtmos-instance.json` has an `apiUrl`, `/mcp` shows the gtmos
server). If not, run the `gtmos-setup` skill first.

## Rules (all of them, every time)

1. **Read the schema before every call.** `gtm_describe {"name":"<operation>"}` returns the exact input
   schema; `docs/gtmos/reference/operations.md` has the same entries. Never guess a field or a value
   of an enum. Reads go through `gtm_query {"name":"<op>","input":{...}}`, writes through
   `gtm_act {"name":"<op>","input":{...}}`.
2. **Never invent a value.** A value you save comes from one of: the user's own words in this
   conversation, an `evidence` entry of a drafted card, a `reasons[].fact` of `onboarding.suggest`,
   the crawled site (`research.workspace_profile.get`), an uploaded setup document, or a connected
   source's real counts. If none of these has it, leave the field empty and open a numbered ask
   (`asks.create`, or `onboarding.request_access` / `onboarding.request_docs`) with an owner. "I don't
   know yet" is a valid answer; a plausible guess is not.
3. **Cite the evidence.** When you show a draft, show where each value comes from: quote the card's
   `evidence` item (or the suggestion's `{ fact, source }`) next to the value, e.g.
   "ICP country DE, weight 30 -- evidence: 14 of 22 closed-won accounts are in DE (closed-won deals)".
   A value with no evidence is shown as "no evidence -- please confirm or leave empty".
4. **The model drafts, the human owns.** Present drafts; save a value only after the user confirms
   it (`onboarding.card.edit` / `onboarding.update`). Never approve a card the user has not seen.
5. **Human-only operations.** Agent keys are refused on some operations (the tables say **human
   only**; the full list and what you do instead is in "Human-only: what you do instead" below). The
   refusal reads `FORBIDDEN: Operation "<name>" can only be performed by a human`. Over MCP every call counts as an agent call, even when
   the MCP bearer is a human's own session token: `roles.assign`, `onboarding.launch` and the rest
   are refused there too, so the human does them in the console. Never retry, never route around it
   (another key, the user's session, a raw API call): propose what you can, prepare the draft, then
   ask the human to finish it in the console and tell them where to click.
6. **The ARR band is private.** `profile.arrBand` is set and read by human owners / admins only;
   agents get FORBIDDEN ("the ARR band is private: only a human owner or admin can set it") and see it
   redacted. Never ask the user to paste it to you: tell them to set it themselves in Setup > Welcome
   (or leave it empty, which keeps it private). Never write it to a file or the memory.
7. **Four-eyes.** An operation that proposes (`blueprint.apply`, `env.promote`, `stage_map.set`, the
   ICP / pilot / customer-type / suppression ChangeSets, the journeys, what a build step proposes) is
   approved by a DIFFERENT human: not the proposer and not the person you act for. You never approve,
   never ask for the approver's password, and never use their session. Report the approval id and
   `<console>/org/<org id>/approvals`, then continue.
8. **Optimistic concurrency.** Every write takes `expectedVersion` from the last
   `onboarding.get`. A CONFLICT means someone else (often the user in the console) changed the
   session: re-read, show what changed, and ask before you redo the write.
9. **Never silent.** A refusal (FORBIDDEN, NOT_CONFIGURED, VALIDATION_FAILED, CONFLICT) or a
   proposal is told to the user in the same reply: the operation, the error, the fix and who owns it.
   Record it as an Open item in `.claude/memory/setup-status.md`.
10. **Only what exists.** Use the operations listed below; if `gtm_describe` does not know one, see
   "On an older instance".

## The six screens

1. **Welcome** (screen `welcome`; steps `company`, `motion`)
2. **Connect your data** (screen `connect`; steps `connections`)
3. **Your definitions** (screen `definitions`; steps `definitions`)
4. **Rules and who approves what** (screen `rules`; steps `rules`, `team`)
5. **The build** (screen `build`; steps `build`)
6. **First motion and 90 days** (screen `first_motion`; steps `plan`, `launch`)

Start every session with `gtm_query {"name":"onboarding.get"}`: it starts the session on first read
and returns `session.currentStep`, `completedSteps`, `version`, the cards and the progress. Resume
at `currentStep`; never redo a completed step unless the user asks (`onboarding.update` with
`reopenStep`). After each screen, mark its steps done with `onboarding.update`
`{"completeStep":"<step>","expectedVersion":<v>}` (one step per call, in order).

Operations for every screen:

| Operation | Access | Use |
|---|---|---|
| `onboarding.get` | read (`gtm_query`) | The session (status, currentStep, completedSteps, profile, version), cards with evidence, runbook, docs checklist, seats, plan, progress. Read it first and after every write. |
| `onboarding.update` | you may call it (`gtm_act`) | Save answers the USER gave (profile, pains, engines, sources, team, stakeholders) and step progress (completeStep / reopenStep / currentStep). Always pass expectedVersion. |
| `asks.list` | read (`gtm_query`) | The org's open asks (access requests, document requests, questions) with their numbers and owners. |
| `asks.get` | read (`gtm_query`) | One open ask. |
| `asks.create` | you may call it (`gtm_act`) | Turn a value nobody gave you into a numbered open ask with an owner, instead of guessing it. |
| `asks.answer` | you may call it (`gtm_act`) | Record an answer -- an agent answers only asks it owns; for any other ask, relay the answer to its owner (they answer it, or a member relays it in the console). |
| `runtime.list_approvals` | read (`gtm_query`) | What is waiting for a human approver (your proposals included). |

## Screen 1 -- Welcome (company, motion)

1. Ask the user, in one grouped question: company name, website, industry, team size, markets, deal
   sizes, sales cycles, motions, maturity, the tools in their stack, up to 3 pains, who runs it and
   the hours a week they give it, and the five free answers (what you sell, who buys, a great next
   quarter, what has not worked, what the OS must never do). Use the enum values of
   `onboarding.update` (gtm_describe); map the user's words to them and show the mapping. Unanswered =
   left empty. The stack decides which sources are selected by default and which access asks open;
   the hours size the 90-day plan.
2. With a website, run `research.workspace_profile.refresh`, then read
   `research.workspace_profile.get`: offer facts from it (with the page it came from) for the user to
   confirm; never copy them in unconfirmed.
3. Save the confirmed answers with `onboarding.update` (`profile`, `pains`, `team`,
   `stakeholders`). The ARR band: rule 6.
4. Read `onboarding.suggest`. Show the engines and blueprints with their `reasons` (and `against`).
   The user picks the engines (`onboarding.update` `{"engines":[...]}`, or `null` = take the
   suggestion) and, optionally, a blueprint (`blueprint.get` shows what it installs). Save the pick
   with `onboarding.update` `{"blueprint":"<id>"}`: the build (Screen 5) applies it adapted to the
   approved cards. Apply it now (`blueprint.apply`, it proposes: rule 7) only when the user asks, and
   then save `{"seed":{"changeSetId":"...","approvalId":"..."}}` too. Applying the same input again
   while its proposal still waits (and its base versions are current) returns that proposal with
   `reused: true`, not a duplicate.
5. `completeStep` `company`, then `motion`.

| Operation | Access | Use |
|---|---|---|
| `research.workspace_profile.refresh` | you may call it (`gtm_act`) | Crawl the company website so drafts can cite it. An agent key needs engine.configure (the `build` scope), else FORBIDDEN: ask an owner / admin to run it. |
| `research.workspace_profile.get` | read (`gtm_query`) | The crawled site profile (evidence for the company answers). |
| `onboarding.suggest` | read (`gtm_query`) | Suggested engines, blueprints and sources, each with reasons [{ fact, source }]. |
| `blueprint.list` | read (`gtm_query`) | The blueprint catalog. |
| `blueprint.get` | read (`gtm_query`) | One blueprint: what it installs. |
| `blueprint.apply` | proposes (`gtm_act`); a different human approves | Seed the picked motion; returns a ChangeSet + approval a different human approves. Usually left to the build (Screen 5), which applies it adapted to the approved cards. |

## Screen 2 -- Connect your data (connections)

1. Read `onboarding.signal_coverage`: per category, what is connected, real record counts, the most
   accounts one source covers (never a sum), `stackMissing`, and `catalog` (each connector: how it
   connects, where its data lands, the operations that pull it, what it still needs). Report only
   these numbers; no percentage or score that the operation did not return.
2. Read `onboarding.get` `runbook`: per source, what to ask for, who grants it, lead time, and
   whether it is EARLY. Connecting a source follows the `gtmos-setup` skill (Step 6: Connections):
   provider keys as connections, Composio apps through `composio.sync_connections`; a new OAuth
   sign-in is clicked by a human in the console.
3. A connected source the catalog says still needs a setting (a project id, an event map): ask the
   user for the value and save it with `connections.set_provider_setting`. Never guess an id.
4. Pull now, once a source is connected, so the next screens draft from real data:
   `product_analytics.sync` (PostHog, Mixpanel, Amplitude), `transcripts.sync` (Fireflies, Gong,
   Zoom, Fathom), `outbound_rails.sync_replies` (Smartlead, Instantly, lemlist). NOT_CONFIGURED means
   that tool is not connected: say so. `outbound_rails.list` shows which rail senders / campaigns a
   lane can bind; every send through a rail still goes through the approval-gated
   `outreach.send_message`.
5. For the grants the user cannot give now, run `onboarding.request_access` (optionally
   `grantors` = the emails the user names) and hand the user the numbered list it returns to forward.
6. `completeStep` `connections` (missing sources stay as numbered open asks; that is fine).

| Operation | Access | Use |
|---|---|---|
| `onboarding.signal_coverage` | read (`gtm_query`) | Real coverage per category (CRM, analytics, ads, calls, warehouse, outbound), the stack tools not connected yet, and per category the catalog: every connector we read, how it connects, where its data lands, the operations that pull it, what it still needs. |
| `sources.coverage` | read (`gtm_query`) | The per-source counts behind the coverage. |
| `instance.readiness` | read (`gtm_query`) | Which live seams are configured on this instance (Composio seams included). |
| `connections.list` | read (`gtm_query`) | The org's connections and their state (configured_unverified, live, ...). |
| `composio.status` | read (`gtm_query`) | Each app connected through Composio and whether it is ACTIVE. |
| `composio.sync_connections` | you may call it (`gtm_act`) | Record every app already connected in the org's Composio account (needs the connection.manage scope). Connecting a NEW app (composio.connect, OAuth) is human-only: gtmos-setup Step 6. |
| `connections.set_provider_setting` | you may call it (`gtm_act`) | A per-org connector setting the catalog says is missing (posthog / mixpanel project_id, tiktok_ads advertiser_id, an event_map, gsc site_url, ...). Only values the user gave you. |
| `product_analytics.sync` | you may call it (`gtm_act`) | Pull now: PostHog, Mixpanel and Amplitude events of the last 7 days become contact signals (and the 6-hourly pull stays scheduled). Owner / admin, or an agent key they scoped. |
| `transcripts.sync` | you may call it (`gtm_act`) | Pull now: call transcripts from Fireflies, Gong, Zoom and Fathom into conversation memory. Owner / admin, or an agent key they scoped. |
| `outbound_rails.list` | read (`gtm_query`) | The Smartlead senders and Instantly / lemlist campaigns a sending lane can bind, and why a campaign cannot carry an approved message (owner / admin). |
| `outbound_rails.sync_replies` | you may call it (`gtm_act`) | Pull now: replies from Smartlead, Instantly and lemlist into conversation memory (they stop the sequence). Owner / admin, or an agent key they scoped. |
| `onboarding.request_access` | you may call it (`gtm_act`) | One numbered open ask per missing grant (what, who grants it, lead time); returns the list to forward. |

## Screen 3 -- Your definitions

1. Documents first. `onboarding.get` `docs` is the checklist (ICP notes, stage definitions, pricing,
   brand voice, suppression lists, DPA). A document the user hands you (a file in this workspace):
   `onboarding.docs.upload` with its `docKey` (it answers that document's open ask);
   `onboarding.docs.list` shows what was extracted. A document they mention but have not shared:
   `onboarding.request_docs` with an owner each. Never upload a file the user did not point you at.
2. `onboarding.draft_cards` drafts every card from the org's own data, answers and documents. With a
   model configured (mode `auto`), each value cites evidence ids; an uncited value is dropped and
   opens a numbered question ask; without a model the card says so (`evidence.model`). Edited,
   approved, pending and skipped cards are kept (pass `force` only when the user asks to redraft one).
3. For each card of this step (`onboarding.get` `cards`), show the draft WITH its evidence (rule 3).
   The user confirms, changes or skips it: `onboarding.card.edit` (shape per card in the reference)
   / `onboarding.card.skip`.
4. Approve with `onboarding.card.approve` only what the card table lets you; for the rest, tell the
   user to approve it in Setup > Your definitions (rule 5). The answer's `card.status` is
   `approved`, `pending_approval` (a different human approves: rule 7) or `failed` (say why; the card
   stays editable). A card whose draft is not complete yet is refused with VALIDATION_FAILED and its
   `issues` (e.g. an `icp` card with no rules on an org without closed-won deals): fill it with the
   user's own criteria (`onboarding.card.edit`), or skip it. Seen live: with no revenue source
   connected, the `money` card opens the numbered ask "Connect a CRM with deals or Stripe" and fails
   until one is connected; `brand_voice` needs at least one tone word in the user's words.
5. The cards of this screen:
   - `crm_stages`: `stage_map.unmapped` lists the CRM's REAL stage values; `stage_map.suggest` /
     `stage_map.ai_suggest` propose a mapping; the user confirms it on the card (or you save it with
     `stage_map.set`, which an agent proposes for the approver).
   - `customer_types`: compare with `customer_type.list` (and `customer_type.classify` for a sample
     record the user names); approving proposes a ChangeSet.
   - `brand_voice`: compare with `brand.get`; brand voice is human-only (`brand.set`).
   - `suppression`: built from their suppression documents and words; approving proposes a ChangeSet
     a different human approves. Suppression lists are RESTRICTED documents: an agent cannot read
     them, so your draft has the competitors and existing-customer rules but NOT the do-not-contact
     list. Say so, and ask an owner / admin to redraft that card (`onboarding.draft_cards`
     `{"force":["suppression"]}`, or Redraft in the console) and approve it. Never ask for the
     addresses in the chat.
6. `onboarding.blueprint_adaptations` shows what the picked blueprint will take from the approved
   cards when the build applies it: show it before the build.
7. Definitions you publish land in `dev`; prod needs signing + promotion (Screen 6).
8. `completeStep` `definitions`.

The cards of this screen and who can approve them:

| Card | Publishes through | Approve |
|---|---|---|
| `stages` (Lifecycle stages) | `journey.propose`, `journey.apply` | you may approve it: it becomes `pending_approval` and a different human approves the ChangeSet / journey / mapping in Approvals |
| `icp` (ICP and the weights sheet) | `config.propose_changeset`, `config.validate_changeset`, `config.apply` | you may approve it: it becomes `pending_approval` and a different human approves the ChangeSet / journey / mapping in Approvals |
| `money` (Revenue truth and currency) | `money.settings.set`, `crm.settings.set` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `deal_words` (Your words for deals) | `deal_type.set` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `owners` (Who owns what) | `territory.upsert` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `pilot` (Pilot scope) | `config.propose_changeset`, `config.validate_changeset`, `config.apply` | you may approve it: it becomes `pending_approval` and a different human approves the ChangeSet / journey / mapping in Approvals |
| `customer_types` (Customer types and their journeys) | `config.propose_changeset`, `config.validate_changeset`, `config.apply` | you may approve it: it becomes `pending_approval` and a different human approves the ChangeSet / journey / mapping in Approvals |
| `crm_stages` (Your CRM stage values) | `stage_map.set` | you may approve it: it becomes `pending_approval` and a different human approves the ChangeSet / journey / mapping in Approvals |
| `brand_voice` (Brand voice and forbidden claims) | `brand.set` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `suppression` (Who the engines never contact) | `config.propose_changeset`, `config.validate_changeset`, `config.apply` | you may approve it: it becomes `pending_approval` and a different human approves the ChangeSet / journey / mapping in Approvals |

| Operation | Access | Use |
|---|---|---|
| `onboarding.docs.upload` | you may call it (`gtm_act`) | Upload a setup document the user GAVE you (<= 10 MB: PDF with text, .docx, .xlsx, CSV, TSV, JSON, Markdown, text) so the drafts can cite it; with docKey it answers that document's open ask. Images and scans are refused with the reason. |
| `onboarding.docs.list` | read (`gtm_query`) | The uploaded setup documents and what was extracted (restricted ones -- suppression lists, the DPA, contact data -- show their text to owners / admins only). |
| `onboarding.docs.remove` | you may call it (`gtm_act`) | Remove a setup document (its uploader or an admin). Drafted cards keep their values. |
| `onboarding.request_docs` | you may call it (`gtm_act`) | Ask for the setup documents (ICP notes, stage definitions, pricing, brand voice, suppression lists, DPA) as numbered open asks. |
| `onboarding.draft_cards` | you may call it (`gtm_act`) | Needs engine.configure (the `build` scope). Draft the definition cards from the org's own data, answers and documents (mode auto: the org's model drafts with cited evidence, else the deterministic drafter with the reason). Each draft carries its evidence. |
| `onboarding.card.edit` | you may call it (`gtm_act`) | Needs engine.configure (the `build` scope). Change a card's draft to a value the user confirmed. |
| `onboarding.card.skip` | you may call it (`gtm_act`) | Needs engine.configure (the `build` scope). Skip a card for now, or reopen it. |
| `onboarding.card.approve` | you may call it (`gtm_act`) | Needs engine.configure (the `build` scope). Publish a card through the operation that owns it, as the caller. Only for the cards the card table lets you finish: a human-only target refuses you and marks the card failed. |
| `stage_map.unmapped` | read (`gtm_query`) | CRM stage values not mapped to a canonical stage yet (real values from the CRM): the crm_stages card. |
| `stage_map.suggest` | read (`gtm_query`) | Deterministic stage mapping suggestions. |
| `stage_map.ai_suggest` | you may call it (`gtm_act`) | Model-assisted stage mapping suggestions (review them with the user). An agent key needs engine.configure. |
| `stage_map.set` | proposes (`gtm_act`); a different human approves | Save a stage mapping the user confirmed. An agent key needs engine.configure, and an agent's call becomes an approval proposal: the approver signs it. |
| `journey.list` | read (`gtm_query`) | The org's journeys (the stages card's current state). |
| `customer_type.list` | read (`gtm_query`) | The org's customer types, the journeys they route to and how many companies each holds (the customer_types card's current state). |
| `customer_type.classify` | read (`gtm_query`) | Which customer type a company, person or deal is, and which types it matches. |
| `brand.get` | read (`gtm_query`) | The brand voice and kit in force (the brand_voice card's current state). |
| `brand.set` | **human only**: agent keys are refused | Brand voice and kit: a human approves the brand_voice card (or sets it) in the console. |
| `proof.list` | read (`gtm_query`) | The proof library: sources (case studies, metrics, testimonials, logos) with permission (public / anonymized / internal_only), expiry, state and claims. Only active proof backs a claim in outreach. |
| `proof.extract_from_document` | you may call it (`gtm_act`) | Turn a case study the user hands you (file or pasted text) into a DRAFT proof source; the org's model proposes claims, each quoted word for word (no model = the text is saved and you add claims with proof.update). Ask the user the permission and expiry; never guess them. |
| `proof.update` | you may call it (`gtm_act`) | Add / fix / remove a draft's claims (each excerpt copied exactly from the text, holding every number of the claim). |
| `proof.propose_activation` | **human only**: agent keys are refused | Activating proof: a person proposes it in Settings > Proof library and a different person approves it. |
| `voice.customer_language.mine` | you may call it (`gtm_act`) | Find the customers' own words (pains, outcomes, objections, triggers) in transcripts, classified replies and won-deal notes; each phrase keeps its source. They wait for a human to approve. |
| `voice.customer_language.approve` | **human only**: agent keys are refused | Approving customer phrases: a person reviews them in Settings > Proof library > Customer language. |
| `onboarding.blueprint_adaptations` | read (`gtm_query`) | What the chosen blueprint takes from the approved cards (ICP, pilot, stages, customer types, suppression, trust caps) before it is applied. |

## Screen 4 -- Rules and who approves what (rules, team)

1. The cards of this step (below): show the draft and its evidence; the user approves them in the
   console (their targets are human-only). For `autonomy`, say plainly that outreach never acts within
   caps unless the org baseline already grants it, and that engines go live only at Launch.
2. Show the current policy as read (`policy.get_dry_mode`, `policy.guardrails.get`,
   `policy.engine_modes.get`, `policy.get_autonomy_scopes`) next to the draft, so the user sees the
   change.
3. Seats: `roles.list` shows the profiles and the members. Save the seats the user names (member
   user ids from `roles.list` `members`) with `onboarding.seats.set`. Its `roles.errors` for an agent
   is expected: the binding to a role profile (`roles.assign`) is human-only -- the user saves the
   seats again in the console, or assigns the profiles in Settings > Members. Warn before a seat is
   bound: a profile caps its holder at its base role and removes its denied operations (Operator =
   member; Exec = admin without config / journey / send operations; Ops lead = admin; Engineer =
   builder). `roles.list` returns `keepsSetupAuthority` per profile and `setupStewards` (the owners /
   admins who can still run the build, approve the cards and launch). Never put the sole owner in the
   Operator or Exec seat: seat them as Ops lead (or leave them unseated). The kernel refuses a change
   that would narrow, demote or remove the last setup steward with CONFLICT
   `details.reason` `LAST_OWNER_NARROWING`: the fix is another un-narrowed owner or admin first.
4. Custom role profiles (`roles.upsert`) are human-only: describe what the user wants (base role,
   denied operations, KPIs, actions) and let them create it in the console. A profile only narrows.
5. `completeStep` `rules`, then `team`.

| Card | Publishes through | Approve |
|---|---|---|
| `buying_roles` (Buying roles) | `buying_roles.set` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `consent` (Consent and GDPR) | `privacy.settings.set` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `trust` (Dry mode and guardrails) | `policy.set_dry_mode`, `policy.guardrails.set` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |
| `autonomy` (Autonomy per engine) | `policy.engine_modes.set`, `policy.set_autonomy_scope` | **a human approves it in the console** (its target is human-only): you prepare the draft, they click Approve |

| Operation | Access | Use |
|---|---|---|
| `policy.get_dry_mode` | read (`gtm_query`) | Whether the org is in dry mode. |
| `policy.guardrails.get` | read (`gtm_query`) | The caps, quiet hours, timezone and channels in force. |
| `policy.engine_modes.get` | read (`gtm_query`) | Each engine's dry / live mode. |
| `policy.get_autonomy_scopes` | read (`gtm_query`) | The autonomy grants (org baseline and per engine). |
| `policy.set_dry_mode` | **human only**: agent keys are refused | Dry mode: part of the trust card, a human approves it. |
| `policy.guardrails.set` | **human only**: agent keys are refused | Caps, quiet hours, timezone, channels: part of the trust card, a human approves it. |
| `policy.engine_modes.set` | **human only**: agent keys are refused | Engine live / dry: part of the autonomy card (and Launch), a human approves it. |
| `policy.set_autonomy_scope` | **human only**: agent keys are refused | Autonomy grants: part of the autonomy card, a human approves it. |
| `roles.list` | read (`gtm_query`) | Role profiles (Operator, Ops lead, Exec, Engineer + custom) with keepsSetupAuthority, who holds which, setupStewards, the KPI / action catalog. |
| `roles.my_dashboard` | read (`gtm_query`) | The caller's seat dashboard (an agent sees its delegator's). |
| `roles.upsert` | **human only**: agent keys are refused | Create or edit a role profile: owner / admin, human only. |
| `roles.assign` | **human only**: agent keys are refused | Give a member a role profile: owner / admin, human only. |
| `onboarding.seats.set` | you may call it (`gtm_act`) | Save the seats (operator, ops lead, exec, deputy); the role-profile binding it runs is human-only and comes back in roles.errors for an agent. |

## Screen 5 -- The build

1. `onboarding.engine_readiness`: per picked engine, each requirement met / missing / unknown, with
   the evidence and the remediation. An unknown is reported as unknown, never as met.
2. Tell the user what the build will do (the steps below), then `onboarding.build.start`. It returns
   at once (`run.status` `queued`); one run at a time per org (a second start returns the running one
   with `alreadyRunning: true`).
3. Follow it with `onboarding.build.get` every few seconds until `run.terminal`: report each step's
   status and its real result (ChangeSet, approval, ask and adapter ids). A step you may not run is
   `skipped` with the refusal; a failure carries its reason and the run continues. Stop it with
   `onboarding.build.cancel` only when the user asks.
4. `needsHuman` lists what waits for a person: the proposals of this run (a different human approves
   them in Approvals) and the asks raised. Nothing you do executes an approval. A finished run with
   failed, partial or cancelled steps: fix the cause with the user, then `onboarding.build.start`
   `{"retryRunId":"<run id>"}` re-runs only the failed, partial, cancelled and unfinished steps. A
   `skipped` step is NOT retried that way: once its cause is fixed (a CRM connected, a website
   given), start a new run, optionally only that step: `onboarding.build.start`
   `{"steps":["<step key>"]}`.
5. Walk the missing readiness requirements with the user: each one maps to an earlier screen, a
   connection, or an open ask. Do not mark the build done while a required requirement is missing
   without telling the user it is.
6. `completeStep` `build`.

The build steps, in run order:

| Step | What it does | Runs |
|---|---|---|
| `cards` | Settle the definition cards waiting on an approval | `onboarding.cards.resolve` |
| `blueprint` | Adapt the chosen blueprint to your approved cards and propose it | `blueprint.apply`, `onboarding.update` |
| `stages` | Suggest a stage for each unmapped CRM value and ask you to decide | `stage_map.unmapped`, `stage_map.ai_suggest`, `asks.create` |
| `crm_adapters` | Read each connected CRM's schema, audit it and propose the mapping | `adapter.get`, `adapter.start`, `adapter.audit`, `adapter.propose` |
| `completeness` | Check how complete your synced data is | `sync.completeness.run` |
| `plays` | Re-rank the plays catalog for your org | `plays.rescore` |
| `score` | Rescore your accounts (no outbound action) | `policy.engine_modes.get`, `score.rescan_organization` |
| `site` | Read your website again for the workspace profile | `research.workspace_profile.refresh` |
| `index` | Reindex search and agent memory | `search.reindex_now` |
| `readiness` | Snapshot what each engine still waits on | `onboarding.engine_readiness` |
| `brief` | Regenerate the OS brief (readiness snapshot + your model's cited summary) | `onboarding.brief.refresh` |

| Operation | Access | Use |
|---|---|---|
| `onboarding.build.start` | proposes (`gtm_act`); a different human approves | Start the build run (a worker job). Each step runs real operations AS YOU (your scopes, your delegator's role profile); what a step proposes waits for a different human in Approvals. One run at a time; retryRunId re-runs only a finished run's failed / partial / cancelled / unrun steps. Needs engine.configure (the `build` scope). |
| `onboarding.build.get` | read (`gtm_query`) | The run's live log: each step's status, real results and linked ids (ChangeSets, approvals, asks #n, adapters, jobs), and needsHuman (your proposals still waiting, the asks you raised). |
| `onboarding.build.cancel` | you may call it (`gtm_act`) | Needs engine.configure (the `build` scope). Stop a run between steps (its requester or an owner / admin). What a finished step proposed stays proposed. |
| `onboarding.cards.resolve` | you may call it (`gtm_act`) | Needs engine.configure (the `build` scope). Settle the cards waiting on an approval: executed = approved, rejected / expired = failed (editable again). Never approves anything; the build's first step runs it. |
| `onboarding.engine_readiness` | read (`gtm_query`) | Per picked engine: each requirement met / missing / unknown, with the evidence read and the next step. |
| `config.promotion_status` | read (`gtm_query`) | Definitions still in dev (not live) and what must be signed. |
| `plays.rescore` | you may call it (`gtm_act`) | Rescore the plays once the definitions changed (the build's plays step runs it too). |

## Screen 6 -- First motion and 90 days (plan, launch)

1. Read the plan in `onboarding.get` (`plan.phases`, `deferred`, `overCapacity`, sized by the hours a
   week; each item says why it is there, who owns it and what it waits on). The user shapes it with
   `onboarding.plan.set` (keys from `plan.phases[].items[].key` / `plan.deferred[].key`, play refs
   from `plays.catalog`): `add`, `remove`, `defer` with a reason, `undefer`, `order`, `phase`,
   `hours`. A play they want that the catalog does not have: `request` (it runs `studio.request` as
   you); a catalog play not installed yet: `add` with `install: true` (it ships only after a
   different person approves it in Studio).
2. `onboarding.brief.refresh` (readiness checked live + the model's cited summary), then
   `onboarding.brief`: give the user the Markdown, or save it where they ask. A withheld section says
   why (role, scopes); a summary sentence without evidence is never shown.
3. Going live: `onboarding.launch.preview` says per definition what Launch would sign / promote and
   per engine what the approved autonomy card allows. Launch (`onboarding.launch`) is human-only: show
   the preview and ask the user to click Launch in Setup > First motion (signing is four-eyes: the
   signer is never the proposer; each promotion is approved by a teammate). Outside Launch you may
   propose `env.promote` (rule 7).
4. `completeStep` `plan`, then `launch`. Then summarise: what is live, what waits for whom
   (approval ids, ask numbers), and the Open items.

| Operation | Access | Use |
|---|---|---|
| `plays.catalog` | read (`gtm_query`) | The plays the plan can use (refs catalog:<key>, org:<key>, request:<id>). |
| `onboarding.plan.set` | you may call it (`gtm_act`) | Shape the 90-day plan: add plays from plays.catalog to a lane, remove, defer with a reason, bring back, reorder, pin a lane, set your own hours, ask Studio for a new play (request). Capacity comes from the Welcome hours; what does not fit is deferred with the reason. Publishes nothing. |
| `studio.request` | you may call it (`gtm_act`) | Request a new play the catalog does not have (onboarding.plan.set request does the same and puts its review in the plan). |
| `onboarding.brief` | read (`gtm_query`) | The smart OS brief for the caller (Markdown + sections): company, their words, engines + readiness, data, approved definitions, rules + seats, guessed-for-you drafts, numbered open asks, the 90-day plan, decisions (approval ids), the model's cited summary. |
| `onboarding.brief.refresh` | you may call it (`gtm_act`) | Check engine readiness live (the plan reads it) and have the org's model write the cited summary (uncited sentences dropped; no model = said so). |
| `onboarding.launch.preview` | read (`gtm_query`) | What Launch would sign, promote and turn live (nothing written): tell the person what launching needs. |
| `onboarding.launch` | **human only**: agent keys are refused | Launch: sign + promote every setup definition, engines live only per the approved autonomy card. A human runs it in the console. |
| `definition.sign_many` | **human only**: agent keys are refused | Sign the proposed definitions: a human, never the person who proposed them. |
| `env.promote` | proposes (`gtm_act`); a different human approves | Needs engine.configure (the `build` scope). Propose promoting dev -> prod; a different human approves and executes it. |

## Human-only: what you do instead

Every operation below refuses an agent key with `FORBIDDEN: Operation "<name>" can only be performed by a human` (the ARR band with its own
FORBIDDEN). That is expected, not an error to work around. For each one: do the part you may do
(prepare and edit the draft, propose, read the preview), then ask the human to finish it, naming the
screen and the button, and record it as an Open item.

| Refused for agents | What you do instead |
|---|---|
| `profile.arrBand` | Never ask for it, never store it. Tell the user to set it in Setup > Welcome themselves (or leave it empty: it stays private). |
| `composio.connect` | Connecting a new app is an OAuth sign-in: give the user the console link (Connections > Composio > Connect), then run composio.sync_connections when they say done. |
| `money.settings.set` | Prepare the money card (edit it to what the user confirmed); the user approves it in Setup > Your definitions. |
| `deal_type.set` | Prepare the deal_words card; the user approves it in Setup > Your definitions. |
| `territory.upsert` | Prepare the owners card; the user approves it in Setup > Your definitions. |
| `brand.set` | Prepare the brand_voice card from their words and their brand documents; the user approves it in Setup > Your definitions. |
| `buying_roles.set` | Prepare the buying_roles card; the user approves it in Setup > Rules. |
| `privacy.settings.set` | Prepare the consent card; the user approves it in Setup > Rules. |
| `policy.set_dry_mode` | Prepare the trust card; the user approves it in Setup > Rules. |
| `policy.guardrails.set` | Prepare the trust card (caps, quiet hours, timezone, channels); the user approves it in Setup > Rules. |
| `policy.engine_modes.set` | Prepare the autonomy card; the user approves it in Setup > Rules. Engines go live only at Launch, per that approved card. |
| `policy.set_autonomy_scope` | Prepare the autonomy card; the user approves it in Setup > Rules. |
| `roles.upsert` | Describe the profile the user wants (base role, denied operations, KPIs, actions: it only narrows); an owner / admin creates it in Settings > Members. |
| `roles.assign` | Save the seats with onboarding.seats.set (its roles.errors is expected); an owner / admin saves them again in Setup > Rules, or assigns the profile in Settings > Members (never the sole owner as Operator or Exec: LAST_OWNER_NARROWING). |
| `definition.sign_many` | List what waits to be signed (config.promotion_status, onboarding.launch.preview); a human other than the proposer signs it. |
| `proof.propose_activation` | Prepare the draft proof (proof.extract_from_document / proof.update) and tell the user to propose activation in Settings > Proof library; a different person approves it. |
| `voice.customer_language.approve` | Mine the phrases (voice.customer_language.mine) and tell the user to review them in Settings > Proof library > Customer language. |
| `onboarding.launch` | Read onboarding.launch.preview and tell the user exactly what Launch will sign, promote and turn live; they click Launch in Setup > First motion. |

## Open asks

Every gap becomes a numbered ask with an owner, never a guess: `asks.list` shows them (number,
kind, owner, status). When the owner answers in the conversation, record it with `asks.answer` and
then save the value through the screen's own operation. You answer only the asks you own: for any other, give the answer to the ask's owner (or a member relays it in the console). Report the open asks in every summary.

## On an older instance

The setup operations above ship with GTM OS 0.2.5. If `gtm_describe` does not know one, the instance
is older: say which part needs the update, carry on with what exists, and ask an operator to update
the instance (console Settings > Updates, or `gtm upgrade`). Never imitate a missing operation with
other writes.
