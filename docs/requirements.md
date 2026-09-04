# footArena — Functional Requirements Document

### The Football Operating System for Every Player, Every Match, Every Story

**Prepared as:** Founder/CEO scoping document
**Version:** 2.4
**Status:** Approved for build — no open questions remain
**Last revised:** 2026-09-03 (see Section 16, Changelog)

> **Naming — decided.** `footArena` is the product name, consumer-facing and
> engineering-facing alike. One name across the repo, the app store listing, the
> deep-link domain, and the watermark on every shared card. Trademark and domain
> clearance are execution tasks, not open questions (`OQ-07`, `DEC-07`).

> **Decision policy (v2.0).** Every open question and specification gap in this
> document has been decided. Section 19 is the decision log: what was decided,
> why, what it costs, and what it commits us to. A decision is not reopened by
> preference — it is reopened by a **new ADR** that states what changed in the
> world. Anything genuinely undecidable today is written as a **dated trigger**
> ("revisit when X is true"), never as an open question, because an undated open
> question becomes an implicit decision made by whoever writes the code first.
>
> The bias behind every call below: **optimise for the ten-year asset, not the
> ten-week launch.** The durable asset here is a trustworthy, player-owned career
> record. Anything that speeds up launch by making that record less trustworthy —
> mutable history, unattributed stats, stats a stranger can inflate — was rejected
> even when it was the cheaper build.

### How to cite this document

Every bullet in Sections 4–9 carries a stable requirement ID (`FR-<section>-<nn>`,
e.g. `FR-4.5-06`). Decided founder questions keep their `OQ-<nn>` identifiers
(Section 11), closed specification gaps keep `GAP-<nn>` (Section 14), non-functional
requirements are `NFR-<nn>` (Section 13), and every decision is `DEC-<nn>`
(Section 19). Per `AGENTS.md`, every design doc, ADR, and PR description must cite
the specific ID(s) it traces to — not just the section number. **IDs are append-only:** never renumber or reuse one. If a
requirement is withdrawn, strike it through and keep the ID so existing citations
stay resolvable.

Section numbering in Sections 1–11 is frozen, because ADRs and design docs
already cite it. New material is appended as Sections 12–16.

---

## 1. Product Thesis

Most football apps in this space (Club Duelz, GameGrid, NEXTXI) are built **top-down** — they sell to federations, clubs, and academies, and the player gets whatever view the club admin gives them.

We are building **bottom-up** — the player is the primary user and the primary customer. A club, a five-a-side turf, a Sunday-league team, or a tournament organizer is just _one more place the player plays_. The product is not "run my federation" — it's **"this is my football life, and I want to show it off."**

This single positioning decision drives every scoping call below: whenever a feature could be built for admins or for players, **we build it for the player first**, and let hosting/organizing be a role the player can also switch into — not a separate product.

**The emotional core of the product:** every match a player plays should produce something they're proud to post. Stats, scorecards, highlights, MVP badges, career milestones — Instagram-story-shaped, one tap to share.

---

## 2. User Roles (not separate apps — one account, switchable hats)

| Role               | Description                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Player**         | Default role. Plays, joins, tracks stats, builds a profile.                                                                       |
| **Referee/Umpire** | Verified role. Officiates matches, submits official scorecards.                                                                   |
| **Organizer/Host** | Any player can toggle this on to host a match or tournament — not a separate account type.                                        |
| **Volunteer**      | Lightweight role for people helping run a match/tournament without playing or officiating (scorer, photographer, ground support). |

A single login can hold multiple roles simultaneously (e.g., a player who also referees on weekends). This is a deliberate departure from rigid "login as player / login as referee" gating — the FR below reflects the revised, more flexible model, with the reasoning noted.

> **Scorer clarification (resolves a Phase 0/Phase 1 contradiction):** two different
> things were both called "scorer". They are separated as follows:
>
> - **Match-scoped logger designation — Phase 0.** A host may designate any
>   participant as the match's logger. The authoritative logger roles are
>   therefore `host`, `referee`, and `scorer`, all live from Phase 0. This is a
>   per-match assignment, not a platform role, and it is what `FR-4.5-*` and
>   `FR-4.7-*` depend on.
> - **Volunteer marketplace — Phase 1.** Posting volunteer needs, browsing them,
>   signing up, and accruing volunteering history (Section 5.6) is the Phase 1
>   feature. Only the marketplace is deferred; the ability to hand someone the
>   logging duty is not.
>
> Without this split, `FR-4.5-01`/`FR-4.7-05` (Phase 0) depend on a role the
> document introduced only in Phase 1. `docs/openapi.yaml` already encodes the
> resolved model as `LoggerRole: [host, referee, scorer]` in the Phase 0 contract.

---

## 3. Phasing Philosophy

We are not shipping all of this at once. Each phase must stand alone as something a real player would open every week.

- **Phase 0 (MVP):** Prove the core loop — find a match, play it, get a scorecard, share it.
- **Phase 1:** Prove retention — leaderboards, community, credibility score, richer hosting tools.
- **Phase 2:** Prove network effects — live scoring, insights, discovery ("Looking"), tournaments at scale.
- **Phase 3:** Platform maturity — monetization, verified officiating network, deeper analytics, brand/sponsor layer.

Nothing in Phase 2/3 should block Phase 0 shipping. Each phase is independently launchable. As of v2.0 each phase also has a **numeric exit gate** (Section 15) — a phase ends when its thesis is proved, not when its backlog empties.

---

## 4. Phase 0 — MVP: "Find it, play it, flex it"

**Goal:** A player can find a match this weekend, join it, and walk away with a scorecard worth posting.

> **Scope revision:** Per your three prototypes (match setup, match logger, pitch logger), we're pulling the **entire live match-day toolkit** into Phase 0, not just a post-match scorecard. This is a real scope increase over the original MVP cut, and it's worth naming honestly:
>
> - **Pro:** it's the single biggest differentiator in this document. Nobody in the reference set (Club Duelz, GameGrid, NEXTXI — competitive scan current as of 2026-08, not independently sourced; re-verify before using this claim externally) lets a host log ball-by-ball, position-specific events from a phone mid-match. If the data capture is this good from day one, the scorecard, the credibility score (Section 5.1), and the insights (Section 6.2) all inherit real data instead of self-reported end-of-match numbers.
> - **Con:** it's meaningfully more to build than a "enter final score after the match" form. The rest of this section reflects that trade-off explicitly rather than hiding it.
> - **Recommendation:** build the **list-based logger** (4.5) as the default for MVP — it works for any format and needs no pitch/position-coordinate design work. Ship the **pitch-view logger** (4.6) as a fast-follow within Phase 0 once the underlying event model is proven, since it's the same data model with a different (better, but heavier) UI on top. Both are scoped below so engineering can decide sequencing.

### 4.1 Authentication & Onboarding

- `FR-4.1-01` Phase 0 sign up and log in via **Email + Password only**. Phone Number + OTP authentication is removed from Phase 0 to avoid recurring SMS costs and provider/compliance dependency. Phone numbers remain a squad-invitation and placeholder-identity field, not a login credential.
- `FR-4.1-05` An existing email account can request a time-limited password-reset token by email and use it once to set a new password.
- `FR-4.1-02` Single account model. No "login as player vs referee" screen — instead, onboarding asks: _"How do you show up on the pitch?"_ with multi-select (Player, Referee, Both). This replaces the original either/or login gate, since a rigid choice at login forces re-authentication to switch roles, which kills retention.
- `FR-4.1-03` Basic profile: name, photo, position(s), preferred foot, city/area, skill self-rating. The skill self-rating is user-declared and is never confused with the computed Player Rating (`FR-5.1-01`).
- `FR-4.1-04` **Out of scope for MVP:** social login (Google/Apple), club/academy-linked onboarding, KYC for referees.

### 4.2 Match Discovery & Booking

- `FR-4.2-01` Browse nearby matches/turf bookings by location, date, and format (5-a-side, 7-a-side, 11-a-side).
- `FR-4.2-02` View match detail: venue, time, cost per head, format, current players joined/needed, host.
- `FR-4.2-03` **Book a slot** in an existing match (pay-to-join or free, host's choice).
- `FR-4.2-04` **Out of scope for MVP:** integrated payments gateway (start with "pay at venue" or external UPI link), turf/venue partnerships marketplace, recurring bookings.

### 4.3 Hosting a Match — Structured Setup

- `FR-4.3-01` Any player can create a match through a guided, four-step setup flow:
  1. **Format** — pick from a fixed set of formats (e.g., 5v5, 6v6, 7v7, 11v11), each with a default players-per-side count and a default match length; picking a format auto-adjusts suggested duration.
  2. **Where and how long** — ground/venue name, match length (minutes), number of halves/periods.
  3. **Teams** — home and away team names.
  4. **Squads** — build each team's roster: add a player by mobile number (from the host's contacts/prior opponents or a fresh number), assign a shirt number (auto-suggested, must be unique 1–99 per squad), position auto-assigned by formation slot order and manually reassignable. Adding a number that belongs to no account creates a **claimable placeholder player**; how it accrues stats, is claimed and merged, and can be refused is fully specified in Section 4.11 (`FR-4.11-01`..`FR-4.11-08`).
- `FR-4.3-02` **Validation before a match can go live:** each squad must meet the minimum headcount for the chosen format; shirt numbers must be unique and valid per squad; team names and venue must be filled in; match length must fall in a sane range (e.g., 10–180 min); halves/periods must be 1–4. The host sees a clear, plain-language list of what's missing — not a generic error.
- `FR-4.3-03` Host can approve/reject join requests or set to auto-accept (see 4.4).
- `FR-4.3-04` **Out of scope for MVP:** hosting tournaments (deferred to Phase 1), multi-venue recurring leagues, host verification/rating, saved/reusable squad templates (fast-follow — the underlying player records already support this).

### 4.4 Join Requests

- `FR-4.4-01` Player can **send a request to join** an open match.
- `FR-4.4-02` Player can **send a direct request** to another player/team inviting them to a match ("challenge a team").
- `FR-4.4-03` Host/recipient can accept/decline.
- `FR-4.4-04` **Out of scope for MVP:** waitlists, automated matchmaking by skill level.

### 4.5 Live Match Logging — List View (default MVP build)

This is the core new capability: instead of entering a final score after the fact, the host, referee, or a designated scorer **logs the match as it happens**, from a phone, on the sideline.

- `FR-4.5-01` **Scoreboard header:** competition/venue label, live indicator, home/away team names, live score with manual step up/down controls per side, running match clock.
- `FR-4.5-02` **Team switcher:** toggle between logging for the home or away squad.
- `FR-4.5-03` **Squad grid:** tap a player to select them for logging. If the opposing team isn't fully named (e.g., a pickup opponent), fall back to a **shirt-number grid** instead of names, so logging never blocks on knowing every rival player's name.
- `FR-4.5-04` **Position-specific action vocabulary:** once a player is selected, show an action list tailored to their position — attacking actions for forwards/wingers (shot, assist, chance created, beat a man), progressive/defensive actions for midfielders and defenders (interception, tackle won, duel won/lost, clearance), and a distinct keeper vocabulary (save, claim, punch, distribution, goal conceded). This is what makes the resulting scorecard feel like a real stat line instead of "goals and assists" only. _The actions listed here are illustrative, not the enum._ The canonical, closed action vocabulary — and the position each action is offered for, whether it mutates the score, and whether it requires opponent attribution per `FR-4.5-06` — is reference data owned by catalog-service and served from `GET /action-types`. Adding or removing an action is a contract change, not a UI change (see `NFR-05`).
- `FR-4.5-05` **Goal detail capture:** tapping "Goal" opens a one-tap follow-up asking how it was scored (strong foot / weak foot / header / volley) — feeds the player's finishing profile without adding real friction.
- `FR-4.5-06` **Contested-action attribution:** actions that involve an opponent (duel won/lost, dribbled past, fouls) prompt a quick "against who?" step — tap the opposing shirt number, or skip and log it anyway. This is what lets the _same event_ eventually show up correctly on both players' records.
- `FR-4.5-07` **Live event log:** a running, most-recent-first feed of everything logged this match, with time-stamp, player, and action, color-coded positive/negative.
- `FR-4.5-08` **Undo:** last action can be reversed in one tap (and reverses the score if it was a goal). Ratified semantics, since "reversed" is ambiguous against an append-only ledger: undo is a **soft, single-step** operation that flips the event's `isUndone` flag and never deletes or edits the event; only the latest non-undone action for the match is eligible; only the match's active logger may perform it; and it is unavailable once the match reaches `completed`. Correcting anything older than the last action is _not_ undo — it is a post-match correction, which is an append-only compensating event inside a 72-hour window (`FR-4.16-02`).
- `FR-4.5-09` **Out of scope:** auto-detection of events via video/AI and GPS-based positioning (both carry standing triggers, Section 11); multi-scorer concurrent logging with conflict resolution — single logger per match is **permanent**, not an MVP shortcut (`DEC-06`, `FR-4.12-07`).

### 4.6 Live Match Logging — Pitch View (fast-follow within Phase 0)

Same underlying event model as 4.5, with a visual, spatial interface instead of a flat list — this is a heavier build and is sequenced as a fast-follow once 4.5 ships and the data model is validated in production.

- `FR-4.6-01` Visual pitch (with halfway line, centre circle, penalty boxes) showing each on-field player as a token in their formation position; tap a token to select them and log an action, using the same position-specific action vocabulary as 4.5.
- `FR-4.6-02` **Bench strip** below the pitch: tap a bench player, then tap the on-field player they're replacing, to log a **substitution** — this swaps the two players' on-field/bench status and records the sub in the event log with the match clock.
- `FR-4.6-03` Same goal-detail modal, contested-action opponent attribution, live event log, and undo behavior as the list view.
- `FR-4.6-04` **Out of scope for MVP:** drag-and-drop repositioning of players mid-match, custom formation editing (positions are derived from the format's default formation shape).

### 4.7 Scorecard (Derived, Shareable)

- `FR-4.7-01` The scorecard is no longer a manually re-typed summary — it's **generated directly from the live event log** (4.5/4.6): final score, goals (with type), assists, cards, and a full position-by-position action tally per player.
- `FR-4.7-02` Man-of-the-match can still be manually flagged at the end by whoever holds the match's logger designation (host, referee, or designated scorer — see Section 2).
- `FR-4.7-03` Each player's profile auto-updates: matches played, goals, assists, and the fuller action breakdown.
- `FR-4.7-04` Scorecard renders as a **shareable image card** (the Instagram-story hook — exists from day one, not bolted on later), and because it's sourced from real logged events rather than a memory-based summary, it can show detail (shot accuracy, duels won, saves) that a typed-in scorecard never could.
- `FR-4.7-05` **Out of scope for MVP:** referee-only scorecard authority (in MVP any of the three logger designations — host, referee, or scorer — may log; an "Officiated" distinction for referee-logged matches arrives in Phase 1, `FR-5.2-02`), multi-logger conflict resolution (stated once here and referenced, rather than restated, by `FR-4.5-09` and `FR-6.1-04`), video-sourced highlights.

### 4.8 Minimal Profile & Career Log

- `FR-4.8-01` Public player profile: photo, position, career totals (matches, goals, assists, MVPs), recent match history, and now a lightweight per-position action summary sourced from 4.5/4.6.
- `FR-4.8-02` Shareable profile link/card.
- `FR-4.8-03` **Out of scope for MVP:** credibility score/rating algorithm (Phase 1), insights dashboards and trend analysis (Phase 2 — the data is being captured from Phase 0 onward, but the analysis layer comes later), comparisons to other players.

### 4.9 Match Lifecycle, Abandonment & Forfeit

Grassroots matches end in ways a clean state machine doesn't anticipate. Because career totals, results, and the Phase 1 rating all depend on which matches "count", the lifecycle is stated here in full rather than inferred per service.

- `FR-4.9-01` Lifecycle states are `draft | open | live | completed | abandoned | forfeited | cancelled`. The **only** legal transitions are `draft→open`, `draft→cancelled`, `open→live`, `open→cancelled`, `open→forfeited`, `live→completed`, `live→abandoned`, and `live→forfeited`. `completed`, `abandoned`, `forfeited`, and `cancelled` are terminal. Note that `live→cancelled` is **not** legal: once a ball has been kicked the match either completed, was abandoned, or was forfeited. Status is never set directly by a client; it changes only as a side effect of a lifecycle command.
- `FR-4.9-02` **Cancelled** is available before kickoff only. It has no event ledger and produces no scorecard, no result, and no career stats.
- `FR-4.9-03` **Abandoned** applies after kickoff: rain, injury, ground double-booked, safety, insufficient players remaining, or other (free-text required). The event ledger is **preserved in full** — an abandoned match is not a deleted match. The match records the period and match-clock at which it was abandoned, the reason code, and who ended it.
- `FR-4.9-04` **Stats from an abandoned match always count** toward career totals and per-action tallies, because those events genuinely happened. The **result** (win/loss/draw) counts only if at least 50% of scheduled regulation time had elapsed; below that the match is recorded as _No Result_. This split is deliberate: a player's minutes and actions are theirs regardless, but a scoreline from twelve minutes of play is not a result.
- `FR-4.9-05` **Forfeited** has two entry points. **Pre-kickoff (`open→forfeited`):** a side fails to field the format minimum (`FR-4.3-02`) at the scheduled start, or withdraws after the match was confirmed. **Mid-match (`live→forfeited`):** a side walks off, or refuses to continue after dropping below a playable headcount. A forfeit records a result for standings purposes with an explicit `walkover` marker, a reason, and the forfeiting side. **No individual player statistics accrue from a forfeit**, and it does not increment any player's matches-played — nobody completed a match. Where a mid-match forfeit follows real play, the ledger is preserved exactly as in `FR-4.9-03`, so the events remain inspectable even though they do not count.
- `FR-4.9-06` A repeated forfeiting host or side is a reputation signal, not just a state: forfeits are counted on the host's record and feed the Phase 1 credibility inputs (`FR-5.1-01`). This is intentional — no-shows are the single most corrosive experience in pickup football.
- `FR-4.9-07` **Zombie-match sweep:** a match left `live` with no logged event and no clock activity for 6 hours auto-transitions to `abandoned` with reason `stale`, preserving the ledger and notifying the logger and host. The recorded actor is `system`, never a user — an audit trail that attributes an automatic transition to a person is a lie in the record. Without this, `live` is a state matches can never leave.
- `FR-4.9-08` Every terminal transition is recorded with actor (a user id, or `system` for `FR-4.9-07`), timestamp, and reason, and is visible to match participants. Lifecycle history is append-only.

### 4.10 Mid-Match Roster Reality

- `FR-4.10-01` The format headcount minimum (`FR-4.3-02`) is a **pre-kickoff gate only**. Once a match is `live`, no headcount rule may ever block logging — a logger who cannot record what is happening in front of them will abandon the product mid-match.
- `FR-4.10-02` A side may play short. This is a legal, displayed state, not a validation error.
- `FR-4.10-03` **Late arrival:** a player who arrives after kickoff enters via a one-sided `player_in` event (a substitution with no outgoing player), stamped with the match clock.
- `FR-4.10-04` **Dismissal:** a red card removes the player from the field for the remainder of the match and reduces that side's on-field count. No replacement may occupy the vacated slot — the side plays short, as in the real laws of the game.
- `FR-4.10-05` **Walk-up player:** the logger may add a player to a squad after kickoff (common in pickup football). The addition is itself an event, so the ledger always explains why a side's headcount changed.
- `FR-4.10-06` On-field headcount at any match-clock time is **derived from the event ledger** (starting XI ± subs, dismissals, late arrivals, walk-ups), never stored as a mutable counter.

### 4.11 Placeholder Players — Claim, Merge & Consent

`FR-4.3-01` lets a host add anyone by mobile number. That is the product's growth loop and its largest privacy exposure, so the full rules are stated here.

- `FR-4.11-01` Adding a number with no account creates a **placeholder player**, keyed on the number in E.164 form (`NFR-09`). Placeholders accrue full statistics from the first match — the career record exists before the account does, which is precisely what makes signup worth it.
- `FR-4.11-02` **Placeholder visibility is restricted.** A placeholder appears only inside the scorecards of matches they actually played, shown as first name plus shirt number. A placeholder has no public profile URL, is never returned by discovery/search (`FR-6.3-01`), never appears on a leaderboard, and never has their number exposed to anyone but the host who added them.
- `FR-4.11-03` **Claim after email signup.** Email authentication does not automatically claim a phone-keyed placeholder, because the email account cannot prove ownership of that phone number. An authenticated user may review and request a placeholder claim through a separate, purpose-scoped verification flow; the user is shown "we found N matches" and must confirm. They may reject individual matches as mis-attributed within 14 days, which detaches those matches without deleting them. This verification flow is not login, signup, or a general account-authentication path.
- `FR-4.11-04` Merge is **idempotent, append-only, and audit-logged** — statistics are recomputed by re-projecting the ledger, never by copying totals between rows. Support can reverse a merge for 30 days.
- `FR-4.11-05` **Recycled-number protection:** a placeholder with no activity for 24 months is not auto-merged on claim. The claimant must confirm each match individually. Indian mobile numbers are recycled; silently handing a stranger's football history to a new owner of their number is unacceptable.
- `FR-4.11-06` **Right to refuse.** Anyone may have their placeholder removed by verifying the number. Removal converts them to an anonymous `Player #N` in past scorecards — preserving every teammate's and opponent's record — and adds the number to a **do-not-add list**. Hosts attempting to re-add it see a plain-language block, not a silent failure.
- `FR-4.11-07` Placeholder creation is rate-limited per host and reportable, so the mechanism cannot be used to spam numbers or fabricate squads.
- `FR-4.11-08` ~~Withdrawn.~~ Placeholder claim and visibility rules are age-neutral.

### 4.12 Offline-First Capture & Sync

The binding constraint of this entire product: someone is logging a match on a turf pitch with poor or no connectivity. This is a Phase 0 requirement, not an optimisation — it determines identifier allocation, ordering, and undo, and cannot be retrofitted.

- `FR-4.12-01` Live logging (`FR-4.5-*`, `FR-4.6-*`) is **fully usable with zero connectivity for an entire match**, with a queue depth target of 4 hours of continuous logging. No logging interaction may block on a network round-trip.
- `FR-4.12-02` **The client allocates event identifiers** (time-ordered UUIDv7) at the moment of the tap, so ordering survives a delayed sync and the same identifier serves as the idempotency key (`NFR-06`). A retry over a flaky connection can therefore never double-count a goal.
- `FR-4.12-03` Ledger order is `(periodNumber, matchClockSeconds, clientSequence)` — match time, not arrival time. Events that sync hours later still land in the position they occurred.
- `FR-4.12-04` **Undo works offline** (`FR-4.5-08`), queued in order like any other command, and the live score is derived on-device from the local ledger while offline.
- `FR-4.12-05` **Sync state is always visible** — pending count and last-synced time, with an explicit "N actions not yet synced" indicator. The logger must never have to guess whether their match is safe.
- `FR-4.12-06` Unsynced events survive app restart and device reboot, and retry with backoff for 7 days before surfacing a hard warning.
- `FR-4.12-07` **Device handover / fencing:** if the logger designation moves to another device mid-match (dead battery, phone handed to a substitute), the new device fences the old one via the monotonic live-state version. The fenced device may still upload its pending queue as a **recovery bundle**, which the new logger accepts or rejects as a batch. This chooses "recoverable, reviewed data" over both silent data loss and silent duplicate events.
- `FR-4.12-08` **Out of scope:** offline access to discovery, booking, or other players' profiles. Offline is a guarantee for _capture only_ — the thing that cannot be redone later.

### 4.13 Account Deletion, Export & Retention

India-first means the DPDP Act applies. These data-protection and portability rules constrain Phase 0 defaults and cannot wait for a later phase.

- `FR-4.13-01` ~~Withdrawn.~~ The product has no minimum-age gate or age-based signup restriction.
- `FR-4.13-02` ~~Withdrawn.~~ The product has no age-based profile visibility mode.
- `FR-4.13-03` ~~Withdrawn.~~ Share-card naming rules are not age-dependent.
- `FR-4.13-04` ~~Withdrawn.~~ No age-based consent workflow applies.
- `FR-4.13-05` ~~Withdrawn.~~ Monetisation rules are not scoped by user age.
- `FR-4.13-06` **Deletion anonymises, it does not erase history.** Deleting an account removes personal identifiers within 30 days and converts the player to `Player #N` in past scorecards. The underlying events remain, because erasing them would silently corrupt the career record of every teammate and opponent in those matches. This is stated to users plainly at deletion time.
- `FR-4.13-07` **Export.** A player can export their complete career record — matches, events they were party to, and derived stats — in JSON and CSV. The record belongs to the player; portability is the proof.
- `FR-4.13-08` Retention: match events are retained indefinitely as career history; any remaining purpose-scoped OTP artefacts and delivery logs are purged within 90 days; operational logs within 30 days.

### 4.14 Transactional Notifications

`FR-4.4-*` is a two-sided flow that does not work without notifications, so a minimal transactional set ships in Phase 0. This is distinct from the Phase 2 spectator/social notifications in `FR-6.1-02`.

- `FR-4.14-01` **Channels:** push is the primary channel for all in-product events. Phase 0 has no SMS login or signup. SMS is reserved for the exceptional purpose-scoped placeholder verification flow (`FR-4.11-03`, `FR-4.11-06`) and for match-critical messages when push is unavailable. WhatsApp arrives in Phase 1 and then becomes the preferred match-critical channel for India.
- `FR-4.14-02` **Phase 0 notification set:** join request received (host); join request accepted/declined (player); match confirmed, rescheduled, or cancelled (all participants); match reminder at T-3h; logger designation assigned (you are logging today); match went live; scorecard ready; placeholder history found at signup (`FR-4.11-03`).
- `FR-4.14-03` **Quiet hours** 22:00–07:00 local suppress everything except match-critical messages for a match starting within 12 hours.
- `FR-4.14-04` Per-category opt-out is available for all product notifications. Authentication and security messages are never opt-outable.
- `FR-4.14-05` Notification content never includes another player's phone number.

### 4.15 Share Card Generation

Section 8 makes sharing the emotional core of the product; this is its specification.

- `FR-4.15-01` Cards are **server-rendered PNGs** from versioned templates: 1080×1920 for stories and 1200×630 for link previews. Server-side rendering guarantees every card looks identical regardless of device, and lets a template improve without shipping a client release.
- `FR-4.15-02` Card types in Phase 0: match scorecard, individual player match performance, and career milestone (`FR-8-02`).
- `FR-4.15-03` **Naming rules on cards:** claimed players appear with their display name; placeholders (`FR-4.11-02`) appear as first name plus shirt number. No card ever contains a phone number.
- `FR-4.15-04` Every card carries the `footArena` mark and a deep link back, and must read well as a raw image with no app installed (`FR-8-04`).
- `FR-4.15-05` Cards from an abandoned match (`FR-4.9-03`) are explicitly labelled _Abandoned — partial_, and a _No Result_ match never renders a winning scoreline.
- `FR-4.15-06` Cards are generated on demand and cached in S3 through the media path established in ADR 0006. A card is regenerated if the underlying scorecard is corrected (`FR-4.16-02`).

### 4.16 Corrections, Immutability & the Audit Trail

The single most important property of this product is that the record can be trusted. That requires stating exactly when history can change and by whom.

- `FR-4.16-01` **In-match undo** (`FR-4.5-08`) is a soft, single-step flag on the last non-undone event, performed by the active logger before the match completes. The event row is never deleted or rewritten.
- `FR-4.16-02` **Post-match correction window: 72 hours** from match completion. Only the match's active logger or the host may correct, and every correction is an **append-only compensating event** carrying actor, timestamp, and reason. The scorecard re-projects from the ledger; the correction is never applied by editing a total.
- `FR-4.16-03` A corrected scorecard displays a visible _corrected_ marker with the number of corrections, and match participants can view the full audit trail. Silent correction is prohibited — it would make every scorecard unfalsifiable.
- `FR-4.16-04` After 72 hours the scorecard is **frozen**. Further change is possible only through the Phase 3 dispute flow (`FR-7-04`), which itself appends rather than edits.
- `FR-4.16-05` The Phase 1 Player Rating (`FR-5.1-01`) consumes only frozen scorecards, so a rating can never be built on numbers that are still moving.

### 4.17 Contested-Action Attribution Rules

`FR-4.5-06` captures who an action happened _against_. This defines what the opponent's record actually receives — without which a player accrues statistics generated entirely by the other side.

- `FR-4.17-01` An attributed contested action creates a **derived, mirrored entry** on the opponent's record (a logged "duel won" shows as a "duel lost" against the named opponent), always labelled **opponent-attributed** with the match and logger as provenance.
- `FR-4.17-02` **Opponent-attributed entries never feed the Player Rating** (`FR-5.1-01`). Only actions logged by a player's own side count toward their rating. This closes the obvious attack — an opposing scorer inflating or sabotaging someone's record — at the cost of a slightly thinner rating input, which is the right trade for a credibility product.
- `FR-4.17-03` Attribution remains skippable (`FR-4.5-06`). An unattributed contested action still counts fully for the player who performed it; it simply mirrors to nobody.
- `FR-4.17-04` Opponent-attributed entries are displayed on profiles and scorecards with their provenance visible, so a player can always see who logged what against them.

---

## 5. Phase 1 — Retention: "Build a reputation, build a circle"

**Goal:** Players come back weekly because their score, their community, and their standing are all growing.

### 5.1 Player Scorecard → Credibility Score

- `FR-5.1-01` Introduce a computed **Player Rating** (visible number, e.g., out of 10, or a tiered badge system) derived from: matches played, consistency, goals/assists per match, disciplinary record (cards), MVP frequency, host/peer endorsements, and — because Phase 0 now captures ball-by-ball events rather than end-of-match totals — position-specific action data (duels won, saves, interceptions, chances created) rather than just goals and assists. This is a direct benefit of pulling the live logger into Phase 0: the rating launches with real behavioral data instead of waiting a phase for it.
- `FR-5.1-02` Rating transparency is **hybrid, and this is a decision, not a compromise** (`DEC-04`): every _input_ is disclosed and every input's _contribution to the player's own rating_ is shown ("your duels won added +0.3 this month"), but the **weighting formula is not published** and is versioned server-side. A fully published formula in a small local market is a farming manual; a fully opaque score is the black box we said we would not build. Players get an explanation of their own number; nobody gets a recipe.
- `FR-5.1-03` **Rating integrity rules** are part of the rating, not a later anti-fraud project: a minimum of 5 frozen matches before a rating is displayed at all; a per-match cap on how much any single match can move the rating; opponent-attributed actions excluded entirely (`FR-4.17-02`); endorsement damping and decay (`FR-5.7-02`, `FR-5.7-03`); reliability penalties for forfeits and no-shows (`FR-4.9-06`); and only frozen scorecards as input (`FR-4.16-05`).
- `FR-5.1-04` Rating displayed prominently on profile and shareable cards — this becomes the "credit score" hook, differentiating from pure stat-tracking apps. A rating is always shown with the number of matches behind it, so a thin record can never masquerade as an established one.
- `FR-5.1-05` Every rating recomputation is versioned and reproducible: given the same frozen ledger and the same formula version, the same number results. A rating that cannot be recomputed cannot be defended in a dispute (`FR-7-04`).
- `FR-5.1-06` **Out of scope for Phase 1:** rating portability/verification across external leagues; the _statistical_ anti-fraud layer (collusion-ring detection across many matches) — the structural defences in `FR-5.1-03` ship in Phase 1, the behavioural detection follows in Phase 2.

### 5.2 Referee Role, Formalized

- `FR-5.2-01` Referees can register with credentials (self-declared in Phase 1; verified badge in Phase 2).
- `FR-5.2-02` Matches can designate a referee, whose submitted scorecard carries an **"Officiated" tag** distinct from host-submitted scorecards. _Renamed from "Verified" in v2.0 to remove a collision:_ this tag asserts only that a designated referee logged the match, which is all Phase 1 can honestly claim from a self-declared credential. The **Verified referee badge** — an externally checked identity and certification — is a different claim and arrives in Phase 3 (`FR-7-02`). Two different assurances must never share one word on a credibility product.
- `FR-5.2-03` Referees build their own officiating history/profile.

### 5.3 Tournaments (Hosting & Joining)

- `FR-5.3-01` Organizer can create a tournament: format (knockout/league/group+knockout), team registration window, venue(s), schedule.
- `FR-5.3-02` Teams/players can browse and request to join a tournament.
- `FR-5.3-03` Auto-generated brackets/league tables once teams confirmed.
- `FR-5.3-04` **Out of scope for Phase 1:** multi-venue broadcast tools, sponsor/prize management. ~~payment collection for entry fees within the app~~ — **superseded in v2.0 by `DEC-01`**: entry-fee collection is in Phase 1, on the same rails as match fees (`FR-5.8-05`). Tournaments are precisely where fee collection matters most, and running one phase with in-app match payments but hand-collected tournament fees would be an incoherent product.

### 5.4 Community

- `FR-5.4-01` Players can follow other players, form/join **teams** (persistent squads, not just one-off match rosters), and follow **communities** (local football groups, five-a-side circles, alumni teams).
- `FR-5.4-02` Community feed: match results, MVP shoutouts, milestones ("50th match!"), tournament announcements.
- `FR-5.4-03` **Out of scope for Phase 1:** community-level fundraising, monetized memberships.

### 5.5 Leaderboard

- `FR-5.5-01` Local (city/area) and community-level leaderboards: top scorers, most assists, highest-rated players, most consistent (matches/month).
- `FR-5.5-02` Time-bound leaderboards (weekly/monthly/season) to keep it fresh, not just all-time.
- `FR-5.5-03` **Out of scope for Phase 1:** national/global leaderboards (needs critical mass — Phase 2+).

### 5.6 Volunteering

- `FR-5.6-01` Matches/tournaments can post volunteer needs (scorer, photographer, setup help).
- `FR-5.6-02` Volunteers can browse and sign up; their profile logs volunteering history (contributes softly to community reputation, not the player credibility score).

### 5.7 Peer & Host Endorsements

`FR-5.1-01` lists endorsements as a rating input, but nothing in the product captured one. This closes that hole, and does it in a way that resists inflation.

- `FR-5.7-01` After a match is frozen (`FR-4.16-04`), each participant may endorse up to **three** other participants from that match, choosing a reason (leadership, reliability, sportsmanship, skill). Endorsements are one-directional and never negative — there is no downvote, because a downvote in a small local football community becomes a weapon.
- `FR-5.7-02` **Reciprocal-endorsement damping:** mutual endorsements between the same two players carry sharply reduced weight after the first, and endorsements only count from players a person has _not_ repeatedly played with. Two friends cannot farm each other's rating.
- `FR-5.7-03` Endorsement weight **decays over 12 months**, so a rating reflects current standing rather than an early burst of goodwill.
- `FR-5.7-04` Host endorsements (given by a match host to participants) count separately from peer endorsements and feed the reliability component of the rating (`FR-5.1-01`).
- `FR-5.7-05` Endorsement counts are visible on a profile; the identity of endorsers is visible only to the endorsed player.

### 5.8 In-App Payments (Phase 1)

Phase 0 stays deliberately payment-free (`FR-4.2-04`, `DEC-01`). Phase 1 introduces collection, because host trust and no-show reduction are the two problems money actually solves in pickup football.

- `FR-5.8-01` Match fee collection via a **UPI-first Indian PSP**, supporting UPI intent/collect, cards, and netbanking as fallbacks.
- `FR-5.8-02` **Funds are held and released to the host after the match completes**, not at booking — a paid slot that the host cancels is refunded automatically. This is the entire point of taking payments in-app rather than pointing at a UPI handle.
- `FR-5.8-03` Cancellation policy is set by the host from a fixed set of platform-defined options (free cancellation up to T-Nh, then partial, then none). Hosts cannot write arbitrary terms — inconsistent terms destroy player trust faster than any single bad match.
- `FR-5.8-04` A player who pays and is then forfeited against (`FR-4.9-05`) is refunded in full, automatically.
- `FR-5.8-05` Tournament entry-fee collection (`FR-5.3-04`) uses the same rails.
- `FR-5.8-06` **Out of scope for Phase 1:** platform take rate/commission (a Phase 3 monetisation decision), payouts to referees, and any wallet or stored-value balance — stored value invites regulatory obligations we have no reason to take on.

---

## 6. Phase 2 — Network Effects: "Watch it live, understand it deeper, find anyone"

**Goal:** The app becomes useful even when a player isn't the one playing — as a spectator, scout, or analyst of their own game.

### 6.1 Live Scoring — Spectator Distribution

- `FR-6.1-01` Event _capture_ already exists from Phase 0 (Sections 4.5/4.6). Phase 2 adds the _distribution_ layer on top: the live event feed becomes visible in real time to people who aren't the one logging it — followers, teammates not playing, family.
- `FR-6.1-02` Push notifications for followed players/teams/matches: "Goal! [Player] scores in the 34th minute."
- `FR-6.1-03` Public live match page, shareable by link, showing the running score and event feed to non-players.
- `FR-6.1-04` **Out of scope for Phase 2:** live video streaming (explicitly not this product's job — see Section 9), automated event detection via video/AI, multi-logger concurrent editing (still single-logger-per-match; see 4.5).

### 6.2 Insights

- `FR-6.2-01` Post-match and season-level analytics: form trends, goal contribution over time, performance vs specific opponents, positional heatmap-lite (self-reported zones, not GPS-tracked in early version).
- `FR-6.2-02` Team/opponent scouting view: "last 5 matches vs this opponent."
- `FR-6.2-03` **Out of scope for Phase 2:** wearable/GPS integration, computer-vision-based auto-stat generation (a credible future roadmap item, not a v2 commitment).

### 6.3 "Looking" — Discovery

- `FR-6.3-01` Structured search/discovery surface: find players by position/area/rating, find opponent teams looking for a match, find available referees/umpires for a booked slot, find open scorer/volunteer slots.
- `FR-6.3-02` This is distinct from match browsing (Section 4.2) — it's people/role discovery, not event discovery.

### 6.4 Tournaments at Scale

- `FR-6.4-01` Multi-day, multi-venue tournament support with scheduling conflict checks.
- `FR-6.4-02` Public tournament pages (shareable, similar to NEXTXI's public club pages) for organizers who want to build an audience.
- `FR-6.4-03` **Out of scope for Phase 2:** broadcast/streaming infrastructure, federation-grade compliance/discipline tooling (this product stays amateur/grassroots-focused, not a federation ops tool).

---

## 7. Phase 3 — Platform Maturity

**Goal:** Sustainable business model and deeper trust infrastructure, without diluting the player-first identity.

- `FR-7-01` **Monetization:** premium profile features (advanced insights, custom scorecard themes), tournament hosting tools for power organizers, promoted/sponsored community pages.
- `FR-7-02` **Verified referee network:** ID + certification verification, referee ratings by hosts/players, paid officiating marketplace.
- `FR-7-03` **Season recaps:** auto-generated shareable "year in football" reels (direct answer to the Instagram-story requirement, inspired by season-replay patterns seen elsewhere in this space) — highlight goals, milestones, rating growth.
- `FR-7-04` **Anti-fraud & dispute resolution:** flagging suspicious stat entries, scorecard dispute/appeal flow between hosts, referees, and players.
- `FR-7-05` **API/partnerships:** allow local turfs and five-a-side arenas to plug in as verified venues.

---

## 8. Cross-Cutting: Why This Gets Shared on Instagram

This isn't a separate feature — it's a design constraint applied to Sections 4–7:

1. `FR-8-01` Every scorecard, milestone, and rating-up moment renders as a **pre-formatted, story-shaped image** (9:16), one tap to export/share.
2. `FR-8-02` Career milestones (10th match, first hat-trick, first 8+ rating) trigger an **auto-generated card**, not a stat buried in a profile page.
3. `FR-8-03` Season recap reels (Phase 3) give players a reason to post even in the off-season.
4. `FR-8-04` None of this requires the _viewer_ to have the app — shared cards should look good as a raw image on Instagram/WhatsApp, with a subtle deep link back in.

---

## 9. Explicitly Out of Scope (Product-Wide)

To keep this focused, the following are **not** this product, at any phase:

- `FR-9-01` Live match video streaming/broadcast (we are a stats/community layer, not a broadcaster — leave this to partners).
- `FR-9-02` General football news/scores for professional leagues (stated up front by the founder — this is about the player's own football life, not EPL/UCL updates).
- `FR-9-03` Betting, fantasy football, or prediction markets.
- `FR-9-04` Full club/federation back-office software (payroll, facility management) — we stay player-and-match-centric, not administrative-back-office-centric like NEXTXI's club console.
- `FR-9-05` **Negative peer ratings, downvotes, or public player reviews.** Endorsements are additive only (`FR-5.7-01`). In a small local football community a downvote is a weapon, and a credibility score built on grudges is worth nothing.
- `FR-9-06` **Editing history by anyone who wasn't there.** No admin override, no support-edited scorecards, no host rewriting a frozen result (Section 17). Support intervention is an audited backend operation, never a product feature.
- `FR-9-07` **Self-reported statistics.** Every number in this product comes from a logged event in a real match. There is no "add my goals from Sunday" form, in any phase — the moment self-reporting exists, no number on the platform can be trusted again.
- `FR-9-08` ~~Withdrawn.~~ No separate age-scoped monetisation restriction remains in product scope.

---

## 10. Summary Table

| Module                              | Phase 0 (MVP)                                        | Phase 1                                    | Phase 2                        | Phase 3                                        |
| ----------------------------------- | ---------------------------------------------------- | ------------------------------------------ | ------------------------------ | ---------------------------------------------- |
| Auth & Roles                        | ✅ Basic, multi-role account                         | ✅ Referee role formalized (self-declared) | —                              | ✅ Verified referee badge (ID + certification) |
| Match Booking                       | ✅ Discovery, booking, pay-at-venue                  | —                                          | —                              | ✅ Venue partner API (Section 7)               |
| Hosting (Match Setup)               | ✅ Structured setup incl. squads/shirts/formats      | ✅ Tournaments                             | ✅ Multi-venue tournaments     | —                                              |
| Join Requests                       | ✅                                                   | —                                          | —                              | —                                              |
| Live Match Logging                  | ✅ List view + pitch view, event capture, subs, undo | —                                          | ✅ Spectator distribution/push | —                                              |
| Scorecard                           | ✅ Derived from live log + shareable                 | ✅ Referee-"Officiated" tag (5.2)          | —                              | ✅ Dispute/appeal flow                         |
| Profile/Career Log                  | ✅ Basic + per-position action summary               | ✅ Credibility score / Player Rating (5.1) | —                              | ✅ Season recap reels                          |
| Community                           | —                                                    | ✅ Teams, follows, feed                    | —                              | ✅ Sponsored community pages                   |
| Leaderboard                         | —                                                    | ✅ Local + community, time-bound           | ✅ Expanded reach              | —                                              |
| Volunteering                        | —                                                    | ✅ Volunteer marketplace                   | —                              | —                                              |
| Insights                            | —                                                    | —                                          | ✅ Trends, scouting view       | ✅ Advanced insights (premium)                 |
| Looking (Discovery)                 | —                                                    | —                                          | ✅                             | —                                              |
| Monetization                        | —                                                    | —                                          | —                              | ✅                                             |
| Match lifecycle & abandonment (4.9) | ✅ Full terminal states, No Result, walkover         | —                                          | —                              | —                                              |
| Offline-first capture (4.12)        | ✅ Full-match offline, handover/fencing              | —                                          | —                              | —                                              |
| Placeholder claim & merge (4.11)    | ✅ Claim, merge, refuse, do-not-add                  | —                                          | —                              | —                                              |
| Account deletion & export (4.13)    | ✅ Anonymising deletion, export, retention           | —                                          | —                              | —                                              |
| Notifications (4.14)                | ✅ Transactional (push; limited SMS fallback)        | ✅ WhatsApp channel                        | ✅ Spectator/social push       | —                                              |
| Corrections & trust (4.16)          | ✅ 72h window, freeze, audit trail                   | ✅ Rating consumes frozen only             | —                              | ✅ Dispute/appeal                              |
| Endorsements (5.7)                  | —                                                    | ✅ Capped, damped, decaying                | —                              | —                                              |
| Payments (5.8)                      | —                                                    | ✅ UPI collection, held funds, refunds     | —                              | ✅ Take rate, referee payouts                  |

**Table corrections in v1.1:** the credibility score was listed under _Scorecard_
though Section 5.1 defines it as a profile-level rating; _Insights_ appeared both
as a Phase 2 Profile entry and as its own Phase 2 row; and _Match Booking_,
_Community_, and _Insights_ showed no later-phase entries despite Section 7
committing to venue partner APIs, sponsored community pages, and premium
advanced insights. This table is a summary of Sections 4–7, never a source of
truth in its own right — where it disagrees with a numbered `FR-*`, the `FR-*`
wins.

---

## 11. Founder Questions — Decided

Version 1.0 left these open. They are now **all decided**, with the reasoning and
the cost of each stated. Entries keep their original `OQ-` identifiers so earlier
citations resolve, and each links to its entry in the decision log (Section 19).
If one of these must change, it changes through a new ADR that states what changed
in the world — not through preference.

- `OQ-01` **Payments — DECIDED: no in-app money in Phase 0; UPI collection with held funds in Phase 1.**
  Phase 0 ships `free`, `pay_at_venue`, and `external_link` only (`FR-4.2-04`). Phase 1 introduces PSP-backed collection where funds are held and released after the match, with automatic refunds on host cancellation and forfeit (`FR-5.8-*`). _Why:_ payments are the single largest source of regulatory, refund, and support load, and none of it teaches us whether the core loop works. But "pay at venue" permanently caps host trust and does nothing about no-shows, so deferring forever is not an option either. See `DEC-01`.
- `OQ-02` **Geography — DECIDED: India-first, explicitly, at every layer.**
  Email/password-only authentication in Phase 0, E.164 storage for phone-based squad/placeholder identity, IST defaults, UPI-first payments, DPDP Act as the governing privacy regime (`FR-4.13-*`). International expansion is a Phase 3+ question and must not distort Phase 0 defaults. See `DEC-02` and `DEC-22`.
- `OQ-03` **Referee supply — DECIDED: build the role, don't gate on supply; validate in parallel.**
  The Phase 1 referee role is a role flag plus a "Verified" tag on a scorecard (`FR-5.2-*`) — days of work, not months. Gating it behind user interviews trades a cheap option for a slow one. The 10–15 interviews still happen during Phase 0, but they inform the _Phase 3 paid officiating marketplace_ (`FR-7-02`), which is where the real investment sits. See `DEC-03`.
- `OQ-04` **Rating transparency vs gaming — DECIDED: transparent inputs and per-player contributions, unpublished weights.**
  Implemented as `FR-5.1-02`, with the structural integrity rules in `FR-5.1-03` doing the work that secrecy alone cannot. `FR-5.1-02` was reworded from "sees exactly what's feeding it" to match the decision, rather than leaving the document promising something we deliberately won't do. See `DEC-04`.
- `OQ-05` **MVP sequencing — DECIDED: list view first, pitch view as the fast-follow, one shared event model.**
  Already reflected in `docs/design/live-logging/design.md`. Both ship inside Phase 0; the list logger is the launch gate, the pitch logger is not. See `DEC-05`.
- `OQ-06` **Single logger — DECIDED: exactly one active logger per match, enforced, in every phase.**
  Enforced by logger designation and a monotonic live-state version, with explicit device handover and fencing so a dead battery is a recoverable event rather than a lost match (`FR-4.12-07`). Multi-logger concurrent editing stays out of scope permanently (`FR-4.7-05`); collaborative logging is a different product with a different conflict model, and would need its own ADR. See `DEC-06`.
- `OQ-07` **Brand — DECIDED: `footArena`, everywhere.**
  One name across repo, app, domain, and card watermark. A second consumer-facing name would mean two brands to build, and the watermark on every shared card (`FR-4.15-04`) is the cheapest distribution we have — it should compound into one name from the first share. Trademark and domain clearance are execution tasks. See `DEC-07`.
- `OQ-08` **Age-gated accounts — DECIDED: withdrawn from product scope.**
  The product has no age-based signup gate, visibility mode, card redaction rule, consent workflow, or monetisation rule. See `DEC-08`.

**Standing triggers** (things we deliberately are not deciding yet, with the
condition that forces the decision — each becomes an ADR when its trigger fires):

| Trigger                                                            | Decision it forces                                                                                  |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| First non-India market, or >5% of signups from one foreign country | Localisation, alternative auth, payment rails, and privacy regime beyond DPDP                       |
| Sustained >100 concurrent live matches                             | Whether live distribution (`FR-6.1-*`) still fits the serverless default in `AGENTS.md`, per an ADR |
| First credible collusion ring detected                             | Behavioural anti-fraud layer (`FR-5.1-06`) moves from Phase 2 to immediate                          |
| First paid officiating transaction                                 | Referee payouts, KYC, and platform take rate (`FR-5.8-06`)                                          |
| Video/CV stat extraction reaches usable accuracy on phone footage  | Whether automated event detection re-enters scope (currently out — `FR-4.5-09`, `FR-6.2-03`)        |

---

## 12. Glossary

Sections 1–11 use _team_, _squad_, _roster_, and _community_ interchangeably, and
several service and schema names are derived from them. These are the canonical
meanings; anything in the codebase that contradicts them is a bug in the code, not
in this section.

| Term                          | Meaning                                                                                                                                             | Notes                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Match**                     | A single scheduled game between two sides. The unit of discovery, booking, logging, and scorecard generation.                                       | Lifecycle in `FR-4.9-01`.                                                                                      |
| **Side**                      | `home` or `away` within one match.                                                                                                                  | Not a persistent entity.                                                                                       |
| **Squad**                     | The list of players assigned to one side _of one match_, with shirt numbers and formation slots.                                                    | Ephemeral, per match. Created in `FR-4.3-01` step 4.                                                           |
| **Squad member**              | One player's participation in one squad — the thing an action is logged against.                                                                    | May be a placeholder player (`FR-4.11-01`).                                                                    |
| **Team**                      | A **persistent** named group of players that exists across matches.                                                                                 | **Phase 1 only** (`FR-5.4-01`). In Phase 0 a "team name" is just a label on a side.                            |
| **Community**                 | A followable local group (five-a-side circle, alumni team, area group). Not a team; membership does not imply playing together.                     | Phase 1 (`FR-5.4-*`).                                                                                          |
| **Event / action**            | One immutable logged occurrence in a match (goal, tackle won, save…).                                                                               | Append-only; the ledger the scorecard is derived from.                                                         |
| **Logger designation**        | The per-match right to log events — held by exactly one of `host`, `referee`, or `scorer` at a time.                                                | Phase 0. See Section 2.                                                                                        |
| **Scorecard**                 | The derived, read-only projection of a completed match's event log.                                                                                 | Never hand-typed (`FR-4.7-01`).                                                                                |
| **Player Rating**             | The computed credibility score on a player's profile.                                                                                               | Phase 1 (`FR-5.1-01`). Distinct from the Phase 0 **skill self-rating** in `FR-4.1-03`, which is user-declared. |
| **Host**                      | The player who created a match.                                                                                                                     | A hat, not an account type.                                                                                    |
| **Volunteer**                 | Someone contributing to a match without playing or officiating.                                                                                     | The _marketplace_ is Phase 1; see the scorer clarification in Section 2.                                       |
| **Placeholder player**        | A player record created from a phone number that has no account yet. Accrues stats, restricted visibility, claimable.                               | `FR-4.11-*`. Not a "ghost" or a "guest" — those terms are not used.                                            |
| **Claim**                     | The act of an authenticated email account completing the separate purpose-scoped verification and taking ownership of eligible placeholder history. | `FR-4.11-03`.                                                                                                  |
| **Correction**                | An append-only compensating event that fixes a mistake after the match, within 72 hours.                                                            | Distinct from **undo**, which is in-match and soft (`FR-4.16-01`).                                             |
| **Frozen**                    | A scorecard past its correction window: read-only for every actor, including the host.                                                              | `FR-4.16-04`. Only frozen scorecards feed the rating.                                                          |
| **Opponent-attributed**       | A derived stat mirrored onto a player from an action logged by the opposing side.                                                                   | Displayed with provenance, never fed into the rating (`FR-4.17-02`).                                           |
| **No Result**                 | An abandoned match that stopped before 50% of regulation; stats count, the scoreline does not.                                                      | `FR-4.9-04`.                                                                                                   |
| **Walkover**                  | The result of a forfeit. No player statistics accrue.                                                                                               | `FR-4.9-05`.                                                                                                   |
| **Recovery bundle**           | The pending offline queue uploaded by a fenced device after logger handover, accepted or rejected as a batch.                                       | `FR-4.12-07`.                                                                                                  |
| **Logger handover / fencing** | Moving the single logger designation to another device, invalidating the old one's writes.                                                          | `FR-4.12-07`, `OQ-06`.                                                                                         |

---

## 13. Non-Functional Requirements

Version 1.0 contained none. Every entry below is **decided and binding**, with a
number attached wherever a number is possible — an NFR without a threshold is a
sentiment, and it will be quietly traded away on the first hard week.

- `NFR-01` **Offline-first capture — binding, launch-blocking.** Full-match offline
  logging with a 4-hour queue depth, client-allocated identifiers, and visible sync
  state. Specified in full as `FR-4.12-*`. _Target:_ zero data loss for a complete
  match logged with the device in airplane mode from kickoff to final whistle; this
  is a release-gating test, not an aspiration.
- `NFR-02` **Responsiveness.** A logged action shows confirmation in the UI within
  **100 ms**, from local state, never awaiting a server round-trip. Screen-to-screen
  navigation inside the logger within 200 ms. A logger who waits cannot keep up with
  play, and a logger who can't keep up stops logging.
- `NFR-03` **Availability.** Capture path (live logging write + local queue): the
  client-side guarantee in `NFR-01` means capture is **100% available to the user**
  regardless of backend state. Server-side targets: **99.9%** for live-logging sync
  and auth during local match windows (weekend 06:00–11:00 and 16:00–22:00 IST),
  **99.5%** for everything else. Degradation is graceful and explicit: distribution
  and projection may lag, capture may not.
- `NFR-04` **Battery and data budget.** A 90-minute logging session consumes **≤ 15%**
  of a typical mid-range Android battery and **≤ 5 MB** of mobile data. No polling
  in the logger, no media upload while a match is live, no background location.
- `NFR-05` **API evolution (already ratified).** Spec-first OpenAPI 3.1, one shared
  contract validated in CI (ADR 0004), opaque cursor pagination with documented
  exceptions (ADR 0001). Changes are additive by default; any removed/renamed field,
  changed type, or changed required-ness is breaking and must be flagged in the PR.
  The action vocabulary behind `FR-4.5-04` is reference data under this rule.
- `NFR-06` **Idempotency and retry safety (already ratified).** Every live-logging
  command carries an idempotency key — the client-allocated event id (`FR-4.12-02`) —
  and stream projection into the scorecard is idempotent (ADR 0005). This is the
  precondition that makes offline capture safe rather than merely optimistic.
- `NFR-07` **Security and access control (already ratified).** Stateless JWT auth
  (ADR 0002); internal calls via the documented `x-internal` mechanism (ADR 0011),
  never public routes. Write authority on a match ledger is limited to its single
  active logger (`OQ-06`). Authorisation is enforced server-side per the permission
  matrix in Section 17 — never by hiding a button.
- `NFR-08` **Privacy, retention, and deletion — decided.** DPDP Act governs.
  Retention and deletion rules are `FR-4.13-06`..`FR-4.13-08`: deletion anonymises
  rather than erases match history, personal identifiers are removed within 30 days,
  OTP artefacts purge at 90 days, operational logs at 30 days, and full export is a
  product feature (`FR-4.13-07`). Personal data is encrypted at rest and in transit;
  phone numbers are never exposed to any user other than the host who added them.
- `NFR-09` **Localisation and formats — decided.** Phone numbers used for squad
  identity are stored and compared in **E.164** (this is also the
  placeholder-matching key, `FR-4.11-01`); all
  timestamps stored UTC, rendered in the match's local timezone, IST as default;
  English only at launch with no hard-coded user-facing strings, so a second language
  is a translation task rather than a rewrite.
- `NFR-10` **Field usability and accessibility — binding.** The logger is used
  one-handed, outdoors, in direct sunlight, sometimes in rain, by someone also
  watching the match. Minimum **48 dp** tap targets in the logger, WCAG AA contrast
  in the daylight theme, no critical control requiring a two-handed gesture, and
  confirmation on destructive actions (end match; undo is single-tap by design,
  because it _is_ the correction). Positive/negative events in the feed
  (`FR-4.5-07`) are distinguished by icon and sign, never by colour alone.
- `NFR-11` **Observability — decided.** Every match is reconstructable after the
  fact: structured logs correlated by match id, an alert when projection lag between
  ledger and scorecard exceeds **60 seconds**, and an alert on any unsynced-queue
  age exceeding 24 hours across the fleet. Dispute handling (`FR-7-04`) is only
  possible if the history is inspectable.
- `NFR-12` **Cost discipline (already ratified).** Serverless by default per
  `AGENTS.md`; non-production infrastructure stays minimal and idle resources are
  removed (ADR 0007, ADR 0012). Any always-on component requires an ADR — the
  standing trigger for live distribution is in Section 11.
- `NFR-13` **Testability — binding on this document.** Every `FR-*` must be phrased
  so it can fail. Vague verbs ("rich", "seamless", "prominent") are not acceptable
  where engineering is expected to verify; where this document still uses one, the
  design doc must pin the concrete criterion and cite the `FR-*` it sharpens.
  Per `AGENTS.md`, the test is written first, and it cites the requirement id.

---

## 14. Specification Gaps — Resolved

These were the holes engineering would otherwise have filled silently and
inconsistently. All ten are now closed. Each entry keeps its `GAP-` identifier,
states the decision, and points at the requirements that implement it.

- `GAP-01` **Match abandonment and forfeit — RESOLVED.** `abandoned` and `forfeited`
  added as terminal states that preserve the event ledger; stats from abandoned
  matches always count, the _result_ counts only past the 50% mark, forfeits produce
  a result but no player stats, and a zombie `live` match is swept after 6 hours.
  → `FR-4.9-01`..`FR-4.9-08`. _Cost:_ two new states across match, live-logging, and
  scorecard, plus a scheduled sweep. _Why it's worth it:_ without it, every real-world
  abandoned match either corrupts the stats or discards a real ledger.
- `GAP-02` **Mid-match roster reality — RESOLVED.** Headcount minimums are a
  pre-kickoff gate only and never block logging; playing short is legal; late
  arrivals, dismissals, and walk-up players are all events, and on-field headcount is
  derived from the ledger rather than stored. → `FR-4.10-01`..`FR-4.10-06`.
  | `GAP-03` **Claimable placeholder players — RESOLVED.** E.164-keyed placeholders
  accrue stats immediately but are non-discoverable and name-limited until claimed;
  email-authenticated accounts use a separate purpose-scoped verification flow
  for claims, with a 14-day rejection window; merges are re-projected and
  audit-logged; 24-month-dormant placeholders require per-match confirmation;
  and anyone can force removal onto a do-not-add list.
  → `FR-4.11-01`..`FR-4.11-08`. _This is the highest-stakes decision in the document_
  — it is simultaneously the growth loop and the privacy exposure, which is exactly
  why it is specified rather than left to the first implementer.
- `GAP-04` **Post-match amendment — RESOLVED.** A 72-hour correction window for the
  logger or host, corrections as append-only compensating events with actor and
  reason, a visible _corrected_ marker, then a hard freeze. → `FR-4.16-02`..`FR-4.16-05`.
- `GAP-05` **Phase 0 notifications — RESOLVED.** A defined transactional set with
  push as primary, limited SMS for exceptional placeholder verification and
  match-critical fallback, WhatsApp from Phase 1,
  quiet hours, and per-category opt-out. → `FR-4.14-01`..`FR-4.14-05`.
- `GAP-06` **Share card specification — RESOLVED.** Server-rendered versioned PNGs at
  1080×1920 and 1200×630, strict naming rules for placeholders and minors, mandatory
  brand and deep link, explicit partial-match labelling, S3-cached via ADR 0006.
  → `FR-4.15-01`..`FR-4.15-06`.
- `GAP-07` **Append-only ledger vs soft undo — RESOLVED, with the deviation made
  explicit.** The split is: **in-match undo is a soft flag** on the last event
  (`FR-4.16-01`), **post-match correction is a compensating event** (`FR-4.16-02`).
  Undo is a narrow, conditionally-written, single-field mutation on a row whose
  payload stays immutable, kept because it keeps the live read path trivial at the
  moment the product can least afford latency. It is a deliberate, bounded exception
  to the append-only rule in `AGENTS.md`, **recorded in ADR 0017** — the rule stands
  everywhere else.
- `GAP-08` **Contested-action mirroring — RESOLVED.** Mirrored entries are derived and
  labelled opponent-attributed, are shown with provenance, and are **excluded from the
  Player Rating** so no one can be scored by the opposition's scorer.
  → `FR-4.17-01`..`FR-4.17-04`.
- `GAP-09` **Endorsements that nothing captured — RESOLVED.** Post-match peer and host
  endorsements, capped per match, damped for reciprocity, decaying over 12 months, with
  no downvote. → `FR-5.7-01`..`FR-5.7-05`.
- `GAP-10` **Clock and period semantics — RESOLVED.** The clock **counts up** within a
  period; periods are 1–4 as configured (`FR-4.3-01`); **stoppage time is recorded per
  period** as additional time rather than by rewinding the clock; events may be logged
  while the clock is paused and are stamped with the clock value at the moment it
  stopped, flagged `duringStoppage` where applicable; and match time, not wall time,
  is the ordering key (`FR-4.12-03`). Counting up matches how football is spoken about
  ("scored in the 34th") and makes an event's timestamp meaningful on a shared card.

---

## 15. Phase Exit Criteria

Section 3 gave each phase a qualitative goal, which cannot be evaluated — so in
practice a phase would end when the backlog ended, not when the thesis was proved.
These gates are now set. They are deliberately about **depth of use, not signup
count**, because signups measure marketing and this product lives or dies on
whether matches actually get logged end to end.

| Phase       | Thesis being tested                                        | Exit criteria (all must hold for 4 consecutive weeks)                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0** | The core loop works and the captured data is real.         | ≥ 250 matches logged end to end; ≥ 70% of matches that reach `live` reach a terminal state with a generated scorecard (not abandoned mid-log); **median ≥ 25 logged events per match** — the proof that the position-specific vocabulary (`FR-4.5-04`) is actually used and not just goals; ≥ 30% of generated scorecards shared externally; ≥ 40% of placeholder players claimed within 30 days (`FR-4.11-03`); zero confirmed data-loss incidents against `NFR-01`. |
| **Phase 1** | Players come back without being pushed.                    | D30 player retention ≥ 35%; ≥ 40% of monthly-active players play ≥ 2 matches per month; ≥ 60% of active players carry a displayed rating (≥ 5 frozen matches, `FR-5.1-03`); ≥ 25% of players belong to at least one persistent team or community; endorsement participation ≥ 30% of completed matches.                                                                                                                                                               |
| **Phase 2** | The product matters to people who aren't playing that day. | ≥ 5 non-participant viewers per live match on average; ≥ 20% of matches have at least one remote spectator; "Looking" (`FR-6.3-*`) produces a confirmed connection — match, opponent, referee, or volunteer — at ≥ 15% of searches.                                                                                                                                                                                                                                   |
| **Phase 3** | It is a business that doesn't compromise the record.       | ≥ 5% conversion to premium among rated players; positive contribution margin per active player; referee marketplace liquidity ≥ 60% of officiating requests filled.                                                                                                                                                                                                                                                                                                   |

A phase does not begin until the previous phase's gate is met, or the gate is
waived in writing with a reason recorded in Section 19. Otherwise the phasing
philosophy in Section 3 is decorative.

---

## 16. Traceability and Document Change Control

### 16.1 Requirement → implementation map

`AGENTS.md` requires every design doc and PR to trace to this document. This map
is the reverse index. It is a navigation aid, not a status report — the service
design docs and gap analyses hold real status.

| Requirements                                                                                                                 | Service                                                                                                | Design doc                                                        | OpenAPI tag(s)               |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------- |
| Requirements                                                                                                                 | Service                                                                                                | Design doc                                                        | OpenAPI tag(s)               |
| ---                                                                                                                          | ---                                                                                                    | ---                                                               | ---                          |
| `FR-4.1-*`, `FR-4.13-*` (auth, onboarding, roles, deletion, export)                                                          | `identity`                                                                                             | `docs/design/identity/design.md`                                  | `Auth`, `Users`              |
| `FR-4.8-*`, `FR-4.11-*` (public profile, career log, placeholder claim & merge)                                              | `profile`, `identity`                                                                                  | `docs/design/profile/design.md`, `docs/design/identity/design.md` | `Profiles`, `Users`, `Media` |
| `FR-4.3-01` step 1, `FR-4.5-04` (formats, formations, positions, action vocabulary)                                          | `catalog`                                                                                              | `docs/design/catalog/design.md`                                   | `Catalog`                    |
| `FR-4.2-*` (venue data)                                                                                                      | `venue`                                                                                                | `docs/design/venue/design.md`                                     | `Venues`                     |
| `FR-4.2-*`, `FR-4.3-*`, `FR-4.4-*`, `FR-4.9-*`, `FR-4.10-*` (discovery, hosting, squads, join requests, lifecycle, roster)   | `match`                                                                                                | `docs/design/match/design.md`                                     | `Matches`, `JoinRequests`    |
| `FR-4.5-*`, `FR-4.6-*`, `FR-4.12-*`, `FR-4.16-01`, `FR-4.17-*` (event capture, subs, undo, clock, offline sync, attribution) | `live-logging`                                                                                         | `docs/design/live-logging/design.md`                              | `LiveLogging`                |
| `FR-4.7-*`, `FR-4.16-02`..`FR-4.16-05` (derived scorecard, corrections, freeze)                                              | `scorecard`                                                                                            | `docs/design/scorecard/design.md`                                 | `Scorecards`                 |
| `FR-8-*`, `FR-4.15-*` (share cards)                                                                                          | `profile` (media)                                                                                      | ADR 0006                                                          | `Media`                      |
| `FR-4.14-*` (transactional notifications)                                                                                    | **new service required** — design complete; OpenAPI contract applied; tests and implementation pending | `docs/design/notification/design.md`                              | `Notifications`              |
| `FR-5.1-*`, `FR-5.7-*` (rating, endorsements)                                                                                | not yet built (Phase 1)                                                                                | —                                                                 | —                            |
| `FR-5.8-*` (payments)                                                                                                        | not yet built (Phase 1)                                                                                | —                                                                 | —                            |
| `FR-5.2-*`..`FR-5.6-*`, `FR-6.*`, `FR-7-*`                                                                                   | not yet built                                                                                          | —                                                                 | —                            |

Cross-cutting decisions live in `docs/adr/`. When an ADR changes a `DEC-*`, or a
standing trigger from Section 11 fires, the affected entry here is updated in the
same change — an ADR that silently supersedes a decision leaves this document wrong
for everyone who reads it next. Section 18 lists the ADRs the v2.0 decisions still
require.

### 16.2 Change control

- This document is the source of truth for product behavior and scope. `docs/openapi.yaml`
  is the source of truth for the HTTP contract; both must be corrected in the same
  change as code that reveals a mismatch.
- Requirement IDs are **append-only** — never renumber, never reuse. Withdrawn
  requirements are struck through and kept.
- Section numbers 1–11 are frozen; existing ADRs and design docs cite them. Sections
  added after v1.1 append; they never renumber what precedes them.
- **A decision in Section 19 is reopened only by a new ADR** that states what changed
  in the world. "We changed our mind" is not a reason; "the trigger in Section 11
  fired" is.
- v2.0 decisions imply contract changes that are **not** applied in this change.
  Section 18 lists that work explicitly so the gap is tracked rather than forgotten.
- Every substantive revision adds a row to the changelog below.

### 16.3 Changelog

| Version | Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | —          | Initial founder scoping document.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 1.1     | 2026-08-28 | Editorial and structural pass, no product scope added. Added stable `FR-*`/`OQ-*` requirement IDs and citation rules; added Glossary (12), Non-Functional Requirements (13), Open Specification Gaps (14), Phase Exit Criteria (15), and this traceability/change-control section (16). Resolved the Phase 0/Phase 1 "scorer" role contradiction in Section 2; aligned logger authority wording in `FR-4.7-02`/`FR-4.7-05`; sharpened `FR-4.5-04` (action vocabulary is a closed contract, not prose) and `FR-4.5-08` (undo semantics); corrected mis-slotted rows in the Section 10 summary table; marked `OQ-01`, `OQ-02`, `OQ-05`, `OQ-06` resolved with ADR/design references and added `OQ-07` (brand name) and `OQ-08` (minors); dated the competitor claim in Section 4.                                                                                                                                                                                                                                      |
| 2.0     | 2026-08-28 | **All open questions and specification gaps decided** (Sections 11, 14, 19); status moved from Draft to Approved for build. Added Phase 0 sections 4.9 (lifecycle, abandonment, forfeit), 4.10 (mid-match roster), 4.11 (placeholder claim/merge/consent), 4.12 (offline-first capture), 4.13 (age, consent, deletion, export), 4.14 (transactional notifications), 4.15 (share cards), 4.16 (corrections & immutability), 4.17 (contested-action attribution); Phase 1 sections 5.7 (endorsements) and 5.8 (payments). Rewrote `FR-5.1-*` for hybrid rating transparency and integrity rules. Converted all NFRs from proposed to binding with thresholds. Set numeric phase exit criteria. Added permission matrix (17), implementation-impact backlog (18), and decision log (19). Brand decided: `footArena`. Accepted ADRs 0014 (match lifecycle), 0015 (offline capture and event identity), 0016 (placeholder claim/merge), 0017 (scorecard immutability and corrections), 0018 (minors and data protection). |
| 2.1     | 2026-08-28 | Applied Section 18 items 1–6, 8, 9 to `docs/openapi.yaml` and `docs/database-design.md` (lifecycle/result fields and `match_lifecycle_transitions`, offline-capture UUIDv7/`clientSequence`/recovery bundles, placeholder claim/merge/do-not-add endpoints and tables, age/minor-privacy/deletion/export endpoints and tables, post-match corrections and scorecard freeze, opponent-attributed stat tallies, stoppage time), and added matching v2.0-alignment follow-up sections to the match, live-logging, scorecard, identity, and profile design docs. No product scope changed; this is the contract/schema step of the mandatory order in `AGENTS.md`. Tests and implementation remain outstanding for all of it. Item 7 (notification service) still needs its own design doc; item 11 remains Phase 1.                                                                                                                                                                                                     |
| 2.2     | 2026-08-29 | Removed the withdrawn `FR-4.13-04` consent workflow from the product scope, contract, schema, and design docs. This was an intermediate cleanup step before the later full withdrawal of all age-based product behavior recorded in version 2.3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2.3     | 2026-08-29 | Removed all age-based product behavior and age-derived policy from scope, contract, schema, and implementation. `FR-4.13-01`..`FR-4.13-05`, `FR-4.11-08`, and `FR-9-08` are now withdrawn; Phase 0 keeps only deletion, export, and retention under Section 4.13.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2.4     | 2026-09-03 | **Phase 0 authentication changed to email/password only.** Removed phone-number OTP login/signup to reduce SMS cost and provider/compliance dependency. Phone numbers remain for squad invitations and placeholder identity; placeholder claim/refusal uses separate purpose-scoped verification and is not authentication. Updated notification channels, retention wording, glossary, GAP-03, and DEC-22.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2.5     | 2026-09-03 | **Location decisions ratified in ADR 0029.** Nearby discovery is foreground-only and optional; manual discovery and all core match workflows remain fully usable without permission. Optional venue coordinates, immutable match snapshots, least-privilege disclosure, ephemeral search coordinates, and the six explicit non-tickets are now the canonical location policy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2.6     | 2026-09-03 | **Maps and directions boundary defined in ADR 0030.** Directions use an authenticated application deep link resolved against an authorized venue snapshot or venue identifier; raw coordinates, provider identifiers, credentials, and provider URLs stay out of public contracts and telemetry. Missing coordinates, unavailable maps, denied permission, and provider failure use an actionable address/city fallback and never block core match workflows. Provider-specific integration remains separately gated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.7     | 2026-09-03 | **LOC-017 notification service design completed.** Defined Phase 0 ownership, asynchronous event ingestion, token lifecycle, preferences, deduplication, retries, push/SMS fallback, timezone and quiet-hours policy, safe deep links, retention, deletion, and privacy-safe observability. OpenAPI/schema, tests, and implementation remain gated follow-up work under LOC-018 onward.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.8     | 2026-09-03 | **LOC-018 notification event and API contracts applied.** Added the device registration/revocation, preference, and internal event schemas in `docs/openapi.yaml`; the notification service implementation and focused test coverage remain the next work item.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

---

## 17. Permission Matrix

Roles were listed in Section 2 and authority was scattered across Sections 4.5–4.7.
This is the single authoritative table. It is enforced **server-side** (`NFR-07`);
hiding a control in the UI is not access control.

Actors are per-match unless noted: **Host** (created the match), **Active logger**
(exactly one at a time — host, referee, or scorer, `OQ-06`), **Referee** (designated
official), **Participant** (a player in either squad), **Spectator** (authenticated
user, not in the match), **Public** (unauthenticated).

| Action                                              | Host                               | Active logger                    | Referee (not logging) | Participant | Spectator               | Public            |
| --------------------------------------------------- | ---------------------------------- | -------------------------------- | --------------------- | ----------- | ----------------------- | ----------------- |
| Create match, edit setup pre-kickoff                | ✅                                 | —                                | —                     | —           | —                       | —                 |
| Add/remove squad members pre-kickoff                | ✅                                 | —                                | —                     | —           | —                       | —                 |
| Accept/decline join requests (`FR-4.4-03`)          | ✅                                 | —                                | —                     | —           | —                       | —                 |
| Assign/revoke logger designation                    | ✅                                 | claim on handover (`FR-4.12-07`) | —                     | —           | —                       | —                 |
| Start live logging (`live`)                         | ✅ if logger                       | ✅                               | —                     | —           | —                       | —                 |
| Log an event (`FR-4.5-*`, `FR-4.6-*`)               | only if logger                     | ✅                               | only if logger        | —           | —                       | —                 |
| Undo last event (`FR-4.16-01`)                      | only if logger                     | ✅                               | only if logger        | —           | —                       | —                 |
| Control clock / periods (`GAP-10`)                  | only if logger                     | ✅                               | only if logger        | —           | —                       | —                 |
| Add walk-up player mid-match (`FR-4.10-05`)         | ✅                                 | ✅                               | —                     | —           | —                       | —                 |
| Flag Man of the Match (`FR-4.7-02`)                 | ✅                                 | ✅                               | —                     | —           | —                       | —                 |
| End match / mark abandoned / forfeited (`FR-4.9-*`) | ✅                                 | ✅                               | ✅                    | —           | —                       | —                 |
| Correct within 72h window (`FR-4.16-02`)            | ✅                                 | ✅                               | —                     | —           | —                       | —                 |
| Correct after freeze                                | — (dispute flow only, Phase 3)     | —                                | —                     | —           | —                       | —                 |
| View live score + event feed                        | ✅                                 | ✅                               | ✅                    | ✅          | Phase 2 (`FR-6.1-*`)    | Phase 2, via link |
| View full scorecard                                 | ✅                                 | ✅                               | ✅                    | ✅          | ✅                      | ✅ (public match) |
| View correction audit trail (`FR-4.16-03`)          | ✅                                 | ✅                               | ✅                    | ✅          | —                       | —                 |
| Generate/share a card (`FR-4.15-*`)                 | ✅                                 | ✅                               | ✅                    | ✅          | ✅                      | —                 |
| Endorse participants (Phase 1, `FR-5.7-01`)         | ✅                                 | ✅                               | ✅                    | ✅          | —                       | —                 |
| See a player's phone number                         | only numbers they added themselves | —                                | —                     | —           | —                       | —                 |
| Claim a placeholder (`FR-4.11-03`)                  | —                                  | —                                | —                     | —           | the number's owner only | —                 |
| Force placeholder removal (`FR-4.11-06`)            | —                                  | —                                | —                     | —           | the number's owner only | —                 |

Cross-cutting rules that override the table:

- No actor may write to a match ledger unless they currently hold the logger
  designation. There is no admin override in the product; support intervention is
  an audited backend operation, never a UI affordance.
- A frozen scorecard (`FR-4.16-04`) is read-only for **every** actor, including the
  host. That is the point of freezing it.

---

## 18. Implementation Impact of the v2.0 Decisions

`AGENTS.md` requires `docs/openapi.yaml` to change in the same commit as code that
implements a contract change. **Update (v2.1):** items 1–6, 8, and 9 below have
now been applied to `docs/openapi.yaml`; implementation and focused tests remain
outstanding for every item. Item 7 (notifications) still needs its own design
doc before implementation, and item 11 remains Phase 1. This section is kept as
the backlog record of what changed and why; it is not rewritten so the original
decision trail stays intact.

| #   | Decision                                                                      | Contract / schema impact                                                                                                                                                                                                                                                                                                                                                                              | Breaking?                                                                                                                                                                       | Status (v2.1)                                                      |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Lifecycle states (`FR-4.9-*`)                                                 | `MatchStatus` gains `abandoned`, `forfeited`; new terminal-transition fields (reason, period, clock, actor); result type gains `no_result`, `walkover`. **The `MatchStatus` description in `docs/openapi.yaml` must also be corrected, not just the enum** — it currently documents `live→cancelled`, which `FR-4.9-01` makes illegal, and omits `open→forfeited`, `live→abandoned`, `live→forfeited` | Additive to the enum; consumers that exhaustively switch on status must handle new values. Removing `live→cancelled` is behaviourally breaking for any client that relies on it | ✅ Contract/schema applied; tests/code pending                     |
| 2   | Offline capture (`FR-4.12-*`)                                                 | Client-supplied event id becomes the idempotency key; ledger ordering documented as `(period, matchClock, clientSeq)`; recovery-bundle endpoint for device handover                                                                                                                                                                                                                                   | Additive                                                                                                                                                                        | ✅ Contract/schema applied; tests/code pending                     |
| 3   | Placeholder claim/merge (`FR-4.11-*`)                                         | Placeholder player representation, claim/merge operations, do-not-add list, 14-day rejection window                                                                                                                                                                                                                                                                                                   | Additive                                                                                                                                                                        | ✅ Contract/schema applied; tests/code pending                     |
| 4   | Account deletion/export (`FR-4.13-*`)                                         | Deletion and export operations plus retention rules                                                                                                                                                                                                                                                                                                                                                   | Additive                                                                                                                                                                        | ✅ Contract/schema applied; tests/code pending                     |
| 5   | Corrections & freeze (`FR-4.16-*`)                                            | Correction (compensating) event type, correction count and audit trail on scorecard, `frozen` scorecard state                                                                                                                                                                                                                                                                                         | Additive                                                                                                                                                                        | ✅ Contract/schema applied; tests/code pending                     |
| 6   | Contested-action mirroring (`FR-4.17-*`)                                      | Opponent-attributed derived stats with provenance, excluded from rating inputs                                                                                                                                                                                                                                                                                                                        | Additive                                                                                                                                                                        | ✅ Contract/schema applied; tests/code pending                     |
| 7   | Notifications (`FR-4.14-*`)                                                   | Device-token registration, per-category preferences, event ingestion, delivery policy, and provider fallback                                                                                                                                                                                                                                                                                          | New service                                                                                                                                                                     | ✅ Design doc applied; contract, tests, and implementation pending |
| 8   | Share cards (`FR-4.15-*`)                                                     | Card-type parameterisation, template version, partial-match labelling on the media path (ADR 0006)                                                                                                                                                                                                                                                                                                    | Additive                                                                                                                                                                        | ✅ Contract applied; tests/code pending                            |
| 9   | Clock semantics (`GAP-10`)                                                    | Per-period stoppage time, `duringStoppage` flag on events                                                                                                                                                                                                                                                                                                                                             | Additive                                                                                                                                                                        | ✅ Contract/schema applied; tests/code pending                     |
| 10  | Undo-vs-append-only exception (`GAP-07`)                                      | No contract change — deviation recorded in ADR 0017                                                                                                                                                                                                                                                                                                                                                   | None                                                                                                                                                                            | ✅ No contract change needed                                       |
| 11  | Endorsements, rating integrity, payments (`FR-5.7-*`, `FR-5.1-*`, `FR-5.8-*`) | Phase 1 surface; design docs first                                                                                                                                                                                                                                                                                                                                                                    | Phase 1                                                                                                                                                                         | ⏸ Phase 1, unstarted                                               |

The ADRs these decisions required are **written and accepted** alongside this
revision:

| ADR      | Covers                                                      | Requirements                                                                                                        |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ADR 0014 | Match lifecycle and result semantics                        | `FR-4.9-*`, `FR-4.10-*`                                                                                             |
| ADR 0015 | Offline-first capture and event identity                    | `NFR-01`, `FR-4.12-*`                                                                                               |
| ADR 0016 | Placeholder player identity, claim and merge                | `FR-4.11-*`                                                                                                         |
| ADR 0017 | Scorecard immutability, corrections, and the undo deviation | `FR-4.16-*`, `FR-4.5-08`                                                                                            |
| ADR 0018 | Data protection defaults                                    | `FR-4.13-*`, `NFR-08`                                                                                               |
| ADR 0029 | Location as an optional discovery accelerator               | `FR-4.2-*`, `FR-4.3-*`, `FR-4.4-*`, `FR-4.5-09`, `FR-4.13-*`, `FR-4.14-*`, `FR-6.2-*`, `NFR-04`, `NFR-07`, `NFR-08` |
| ADR 0030 | Provider-neutral maps and directions boundary               | `FR-4.2-01`, `FR-4.2-02`, `FR-4.4-*`, `FR-4.14-*`, `NFR-07`, `NFR-08`, `DEC-23`                                     |

Still to be designed before their phase begins, per the mandatory order in
`AGENTS.md`: the **notification service** (item 7 — a new service, needs a design
doc, not just an ADR), and the Phase 1 **rating**, **endorsement**, and **payments**
services (item 11).

---

## 19. Decision Log

Every decision, why it was made, and what it costs. A decision is reopened only by
a new ADR that states what changed in the world (Section 16.2).

| #        | Decision                                                                                                                                   | Rationale                                                                                                                                                                               | Cost we accepted                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DEC-01` | No in-app payments in Phase 0; UPI collection with held funds in Phase 1 (`FR-5.8-*`)                                                      | Payments carry the heaviest regulatory, refund, and support load and teach us nothing about the core loop; but pay-at-venue permanently caps host trust and does nothing about no-shows | Phase 0 hosts carry collection friction for one phase                                                                                                                                  |
| `DEC-02` | India-first at every layer — E.164, IST, UPI, DPDP (`NFR-08`, `NFR-09`)                                                                    | A product that is vaguely global is worse everywhere; the grassroots density we need is here                                                                                            | Some rework at first international market — accepted, and given a standing trigger                                                                                                     |
| `DEC-03` | Build the referee role in Phase 1 without gating on supply research                                                                        | The role is days of work; the expensive bet is the Phase 3 marketplace, and that's what the interviews should inform                                                                    | Possible low referee usage in Phase 1                                                                                                                                                  |
| `DEC-04` | Hybrid rating transparency: disclosed inputs and per-player contributions, unpublished weights (`FR-5.1-02`)                               | A published formula in a small local market is a farming manual; an opaque score is the black box we promised not to build                                                              | We must explain a number without publishing its recipe — harder UX writing                                                                                                             |
| `DEC-05` | List logger is the Phase 0 launch gate; pitch logger is the fast-follow                                                                    | Validates the event model before investing in spatial UI                                                                                                                                | Pitch view lands after first users                                                                                                                                                     |
| `DEC-06` | Exactly one active logger, enforced, with device handover and fencing (`FR-4.12-07`)                                                       | Concurrent logging is a fundamentally different conflict model and would compromise ledger integrity for a rare case                                                                    | Two-scorer setups are not supported, ever, without a new ADR                                                                                                                           |
| `DEC-07` | `footArena` is the single brand                                                                                                            | The card watermark is our cheapest distribution; it should compound into one name from the first share                                                                                  | Forgoes a "better" consumer name we don't have a reason to believe exists                                                                                                              |
| `DEC-08` | No age-based product restrictions (`FR-4.13-01`..`FR-4.13-05`)                                                                             | Age-gated signup, visibility, and monetisation rules add product friction without improving the integrity of the football record                                                        | The product no longer encodes age-based guardrails or tailored privacy semantics                                                                                                       |
| `DEC-09` | Abandoned matches preserve the ledger; stats always count, results count only past 50% (`FR-4.9-04`)                                       | Events genuinely happened and belong to the player; a scoreline from twelve minutes does not                                                                                            | Two-tier result semantics everywhere results are displayed                                                                                                                             |
| `DEC-10` | Forfeits produce a result but no player stats, and count against host/side reliability (`FR-4.9-05`, `FR-4.9-06`)                          | Nobody played, so nobody earns stats; no-shows are the most corrosive experience in pickup football and must have a consequence                                                         | Hosts may resist a visible forfeit record                                                                                                                                              |
| `DEC-11` | Offline-first capture is launch-blocking (`NFR-01`, `FR-4.12-*`)                                                                           | The pitch has no signal; capture is the one thing that cannot be redone later                                                                                                           | Materially heavier client than an online-only logger                                                                                                                                   |
| `DEC-12` | Placeholders accrue stats but are non-discoverable, name-limited, claimable, and refusable (`FR-4.11-*`)                                   | This is both the growth loop and the privacy exposure; the record must be worth claiming without being a public dossier on someone who never signed up                                  | Slower viral surface than fully public placeholder profiles                                                                                                                            |
| `DEC-13` | Deletion anonymises rather than erases (`FR-4.13-06`)                                                                                      | Erasing events would silently corrupt every teammate's and opponent's career record                                                                                                     | Must explain this clearly at deletion time, and defend it                                                                                                                              |
| `DEC-14` | 72-hour correction window, then permanent freeze (`FR-4.16-*`)                                                                             | Real mistakes surface within a day or two; indefinite mutability makes every scorecard unfalsifiable and every rating undefendable                                                      | Genuine late errors need the Phase 3 dispute flow                                                                                                                                      |
| `DEC-15` | In-match undo stays a soft flag; post-match correction is a compensating event (`GAP-07`)                                                  | Keeps the live read path trivial when latency matters most, while keeping history append-only where it counts                                                                           | A documented, bounded deviation from an `AGENTS.md` non-negotiable — requires an ADR                                                                                                   |
| `DEC-16` | Opponent-attributed actions never feed the rating (`FR-4.17-02`)                                                                           | Closes the obvious attack where the opposition's scorer shapes your record                                                                                                              | A slightly thinner rating input — the right trade for a credibility product                                                                                                            |
| `DEC-17` | Endorsements: capped, non-negative, reciprocity-damped, 12-month decay (`FR-5.7-*`)                                                        | Makes a listed rating input real without creating a downvote weapon in a small local community                                                                                          | More complex rating computation                                                                                                                                                        |
| `DEC-18` | Push primary, limited SMS for exceptional placeholder verification and match-critical fallback, WhatsApp from Phase 1 (`FR-4.14-01`)       | Join requests are unusable without notifications; SMS at scale is expensive and WhatsApp is where India actually reads messages                                                         | A notification service must be built in Phase 0                                                                                                                                        |
| `DEC-19` | Server-rendered, versioned share cards (`FR-4.15-01`)                                                                                      | Identical output on every device, and templates improve without a client release                                                                                                        | Rendering infrastructure cost per card                                                                                                                                                 |
| `DEC-20` | Match clock counts up; stoppage recorded as added time (`GAP-10`)                                                                          | Matches how football is spoken about and makes a shared card's "34'" meaningful                                                                                                         | Slightly more complex period model                                                                                                                                                     |
| `DEC-21` | Phase gates are numeric and depth-based, not signup-based (Section 15)                                                                     | Signups measure marketing; this product lives on whether matches are logged end to end                                                                                                  | We may hold a phase open longer than we'd like                                                                                                                                         |
| `DEC-22` | Phase 0 uses email/password authentication only; phone OTP is not a login/signup channel                                                   | Removes recurring SMS spend and SMS/DLT/provider dependency from the critical auth path while preserving phone numbers for squad identity and exceptional placeholder verification      | Phone-number-first onboarding and automatic phone-based placeholder claiming are deferred; users need email access and a separate verification flow for phone-keyed placeholder claims |
| `DEC-23` | Location is an optional, foreground-only discovery accelerator; core workflows never require it (`FR-4.2-*`, `NFR-04`, `NFR-07`, `NFR-08`) | Preserves nearby discovery while avoiding permission walls, background tracking, stored search history, and location-based product decisions                                            | Radius discovery and exact directions are unavailable without an authorized usable point; six explicitly excluded location capabilities require a new requirement and ADR              |
