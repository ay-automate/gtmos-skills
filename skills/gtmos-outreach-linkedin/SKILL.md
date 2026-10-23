---
name: gtmos-outreach-linkedin
description: "Write LinkedIn connection notes, first messages after an accept, and the two follow-ups, and run them on the org's LinkedIn seats. With GTM OS connected it checks the seats and the owner's high-risk acceptance (outreach.linkedin_seats), drafts through the Outreach engine, proposes every send for a person to approve inside the seat's caps and warm-up, and uses connect_then_message steps in a definition.sequence. Use for \"write a connection request\", \"LinkedIn DM\", \"LinkedIn follow-up\", \"add LinkedIn to the sequence\", \"why are my LinkedIn sends held\"."
license: MIT
metadata:
  version: "0.2.0"
  category: "outbound"
  upstream: "https://github.com/Jakeschincariol/linkedin-agent-skill/tree/add2c23882fe79180737d242ff80a5da205eda6a/skills/li-dm"
  upstream_sha: "add2c23882fe79180737d242ff80a5da205eda6a"
  upstream_license: "MIT; Copyright (c) 2026 Jake Schincariol"
  modified: "2026-10-23: rebranded and adapted for GTM OS (LinkedIn lanes and seats, caps and warm-up, the high-risk acceptance, approved sends, sequence LinkedIn steps; the hand-send rule restated for approval-gated sends)"
---

# LinkedIn outreach

> Part of [GTM OS Skills](https://github.com/ay-automate/gtmos-skills). Adapted from [`li-dm`](https://github.com/Jakeschincariol/linkedin-agent-skill/tree/add2c23882fe79180737d242ff80a5da205eda6a/skills/li-dm) in Jakeschincariol/linkedin-agent-skill (MIT, Copyright (c) 2026 Jake Schincariol). Changed for GTM OS: the operating section below (LinkedIn lanes and seats, caps and warm-up, the owner's high-risk acceptance, approved sends and sequence steps), the hand-send rule restated for approval-gated sends. Notices: [THIRD-PARTY-NOTICES.md](https://github.com/ay-automate/gtmos-skills/blob/main/THIRD-PARTY-NOTICES.md) (installed beside the skills as `THIRD-PARTY-NOTICES.md`).

## With GTM OS connected

> **Rules ([GTMOS-RULES.md](../GTMOS-RULES.md)).** Read `policy.get_dry_mode` first; in dry mode every effect stops at a draft. E-class operations are proposed and a different person approves them; never approve your own proposal. Numbers come only from operation results, named with the operation. Claims about results, customers or metrics must be backed by active proof from `proof.list`.

**1. Is LinkedIn live?** `outreach.linkedin_seats` Q returns: whether Unipile is connected (and live or fixture), whether an owner accepted LinkedIn's high risk (`highRisk.accepted`), each LinkedIn lane's seat with its caps per kind (connection requests vs messages and InMail, per UTC day and a rolling 7 days), the warm-up (25/50/75/100% over the first four weeks of sending), usage today and this week, `noteMaxChars`, and the webhook to configure. Report what it says. While `highRisk.accepted` is false every LinkedIn send is refused: only an owner can accept it (`broker.accept_high_risk`, human only, approved by someone else). The Unipile webhook secret is human only too (`outreach.linkedin_webhook_secret`): never ask for it or print it.

**2. Draft.** `outreach.draft_message {contactId, channel: "linkedin", ...}` D, or `outreach.draft_personalized_message` (*spends inline*: the org's model). Use the method below; the invite note must fit `noteMaxChars`. `brand.check_text` Q on the copy, and any claim goes through `gtmos-content-claims-gate`.

**3. Propose the send.** `outreach.send_message` E on an activated LinkedIn lane proposes; a different person approves. Over a seat cap a send is held until room opens, never dropped (`policy.trust_holds.list` Q shows held actions). Suppression, consent and the first-degree snapshot (no connection request to an existing connection) are checked before it goes.

**4. In a sequence.** A LinkedIn step in a `definition.sequence` (`gtmos-outreach-sequences`) sets `linkedin.action`: `connect_then_message` sends the note, waits for the accept (`acceptWait`, then the next step or an exit) and only then the message. A reply on LinkedIn or email stops every channel for that person. `outreach.step_stats` Q measures each LinkedIn step like an email step.

## Without GTM OS

Use the method below and send every message yourself, by hand, from your own LinkedIn account. Automated connection and message tools break LinkedIn's User Agreement and get accounts restricted.

---

The invite note is short. The first message decides whether there is a second one. Neither is a pitch.

## Before writing, get the specifics

Ask for, in one batched question:

1. **Who**: name, role, company.
2. **The hook**: the actual reason to reach out now. A post they wrote, something their company shipped, a mutual connection, a talk they gave. Not "they fit my ICP".
3. **What the user wants**: a conversation, a referral, a sale. Be honest internally, even if the message does not lead with it.

If there is no specific reason to message this person today, say so. A message with no reason is what everyone else sends.

## The invite note

```
{one specific reference to them} + {one line of who you are} + {no ask}
```

The note asks for nothing. It exists to make the accept obvious. LinkedIn caps notes at about 200 to 300 characters depending on the account; with GTM OS connected the seat reports the limit (`noteMaxChars`). Count the characters and show the count.

```
Saw your post on killing the discovery call - we did the same thing in March
and it worked. I run ops at a 12-person studio. Would like to follow along.
                                                                    [187/200]
```

## The first message, after they accept

Wait a day. Then:

- **Two to four sentences.** A screen of text is a delete.
- **Reference the specific thing** from the note: continuity is the reason the note was specific.
- **Give something before asking.** A number, a template, a name, an answer.
- **One ask, and make it small.** "Worth a 15-minute call?" beats "let me walk you through our platform".
- **No calendar link in message one.** It reads as a funnel, because it is.

## Follow-ups

Two. That is the number.

- **+4 days**: add something new. Never "just bumping this" or "following up on my last message". If you have nothing new, you have no follow-up.
- **+10 days**: the close-the-loop message. Say you will stop, and mean it. This one gets a surprising share of the replies, because it removes the pressure.

Then stop. A third follow-up converts nobody and costs the relationship.

## Never

- Never send messages in bulk or outside the account's limits. Unattended automation breaks LinkedIn's User Agreement and gets accounts restricted; that is why GTM OS keeps LinkedIn sends off until an owner accepts the risk, caps every seat with a warm-up, and has a person approve each send.
- Never fabricate a mutual connection, a shared school, or having read something the user has not read.
- Never write the message that opens "I hope this message finds you well".
- Never push past the daily invite limit. Beyond it, LinkedIn throttles the account, and a throttled account is a dead one.

## Output

The invite note with its character count, the first message, and both follow-ups with the day they go out. With GTM OS connected each one is a draft proposed for a person to approve; without it, the user sends every one of them by hand.
