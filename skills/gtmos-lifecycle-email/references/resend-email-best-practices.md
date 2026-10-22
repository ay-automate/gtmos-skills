<!-- Source: https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/SKILL.md
     License: MIT (Copyright (c) 2026 Resend); full text in licenses/MIT-resend-resend-skills.txt of this repository. Frontmatter removed; text otherwise unchanged. -->

# Reference: `email-best-practices` from resend/resend-skills

Merged into `gtmos-lifecycle-email`. Read it for the upstream method; run the work the GTM OS way described in `../SKILL.md`.

# Email Best Practices

Guidance for building deliverable, compliant, user-friendly emails.

## Architecture Overview

```
[User] → [Email Form] → [Validation] → [Double Opt-In]
                                              ↓
                                    [Consent Recorded]
                                              ↓
[Suppression Check] ←──────────────[Ready to Send]
        ↓
[Idempotent Send + Retry] ──────→ [Email API]
                                       ↓
                              [Webhook Events]
                                       ↓
              ┌────────┬────────┬─────────────┐
              ↓        ↓        ↓             ↓
         Delivered  Bounced  Complained  Opened/Clicked
                       ↓        ↓
              [Suppression List Updated]
                       ↓
              [List Hygiene Jobs]
```

## Quick Reference

| Need to... | See |
|------------|-----|
| Set up SPF/DKIM/DMARC, fix spam issues | [Deliverability](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/deliverability.md) |
| Build password reset, OTP, confirmations | [Transactional Emails](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/transactional-emails.md) |
| Plan which emails your app needs | [Transactional Email Catalog](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/transactional-email-catalog.md) |
| Build newsletter signup, validate emails | [Email Capture](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/email-capture.md) |
| Send newsletters, promotions | [Marketing Emails](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/marketing-emails.md) |
| Ensure CAN-SPAM/GDPR/CASL compliance | [Compliance](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/compliance.md) |
| Decide transactional vs marketing | [Email Types](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/email-types.md) |
| Handle retries, idempotency, errors | [Sending Reliability](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/sending-reliability.md) |
| Process delivery events, set up webhooks | [Webhooks & Events](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/webhooks-events.md) |
| Manage bounces, complaints, suppression | [List Management](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/list-management.md) |
| Make emails accessible (screen readers, alt text, contrast) | [Accessibility](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/accessibility.md) |

## Start Here

**New app?**
Start with the [Catalog](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/transactional-email-catalog.md) to plan which emails your app needs (password reset, verification, etc.), then set up [Deliverability](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/deliverability.md) (DNS authentication) before sending your first email.

**Spam issues?**
Check [Deliverability](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/deliverability.md) first—authentication problems are the most common cause. Gmail/Yahoo reject unauthenticated emails.

**Marketing emails?**
Follow this path: [Email Capture](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/email-capture.md) (collect consent) → [Compliance](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/compliance.md) (legal requirements) → [Marketing Emails](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/marketing-emails.md) (best practices).

**Production-ready sending?**
Add reliability: [Sending Reliability](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/sending-reliability.md) (retry + idempotency) → [Webhooks & Events](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/webhooks-events.md) (track delivery) → [List Management](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/list-management.md) (handle bounces).

**Accessibility?**
Most emails fail basic accessibility checks. See [Accessibility](https://github.com/resend/resend-skills/blob/b2ae7b1798b70134faf679f35fc05b4331462988/skills/email-best-practices/references/accessibility.md) for `lang`/`dir`, presentational tables, headings, alt text, `<title>`, and contrast.
