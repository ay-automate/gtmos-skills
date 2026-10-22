# GTM OS rules for every skill

Every skill in this folder follows these rules when GTM OS is connected. A skill's own section adds to them; it never relaxes them.

1. **Dry mode first.** Call `policy.get_dry_mode` (and `policy.engine_modes.get`) before anything else. In dry mode every customer-facing effect stops at a draft or a proposal; say so up front.
2. **Effects are proposed, never self-approved.** E-class operations (a send, a publish, a campaign or budget change, a CRM write-back, a merge) only propose. A different person approves them in *Needs a human* (`runtime.list_approvals`). Never approve your own proposal, and never retry a rejected effect unchanged.
3. **Numbers come from operation results.** Every figure you report names the operation that produced it. When the sample is too small or the source is missing, write "not enough data yet" and why. Never estimate a number and present it as data.
4. **Claims need proof.** A result, metric, customer name, logo or quote in any copy must come from an active item in the proof library (`proof.list`). Customer wording comes from approved phrases (`voice.customer_language.list`). Without proof, cut the claim or leave a marked placeholder such as `[proof needed]`.
5. **Read the schema first.** Run `gtm_describe` on an operation before its first call in a session; the live registry wins over any skill text.
6. **Definitions before questions.** Read the org's signed definitions (ICP and scoring model, personas, segments, brand voice, money, lanes) before asking the user for anything they already hold.
7. **Brand gate.** Run copy through `brand.check_text` before proposing a send or a publish.
8. **Spend is real.** Quote before buying data (`capability.quote`, or `estimate: true` on enrichment) and stay inside the org's caps (`policy.guardrails.get`).

More detail: [How the skills use GTM OS](https://github.com/ay-automate/gtmos-skills/blob/main/docs/connecting-gtmos.md).
