# User Role and Match Scenarios

This document describes the user and match situations footArena must keep in mind when designing product behavior. It is a scenario reference, not a replacement for the canonical requirements or API contract.

- Product behavior and scope: [`requirements.md`](requirements.md)
- API resources, schemas, and enums: [`openapi.yaml`](openapi.yaml)
- Repository implementation rules: [`../AGENTS.md`](../AGENTS.md)

If this document conflicts with either canonical source, stop and resolve the conflict explicitly. Do not invent a third interpretation.

## Core Model

Do not model every combination as a separate account type. Keep three dimensions separate:

| Dimension    | Meaning                                   | Examples                                                              |
| ------------ | ----------------------------------------- | --------------------------------------------------------------------- |
| Account role | What a user can generally do              | Player, referee, organizer/host, volunteer                            |
| Match role   | How the user is involved in one match     | Participant, host, referee, scorer, spectator                         |
| Permission   | What the user may do to this match's data | View, basic result entry, detailed event logging, correct, administer |

A single account may hold multiple account roles. A match assigns responsibilities locally. Permission must be checked server-side and must not be inferred from participation alone.

## Logging Modes

There are two distinct scoring experiences:

| Mode                     | Use when                                             | Output                                                                            |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Detailed live logging    | Events are captured during play by the active logger | Event ledger, live score, derived detailed scorecard and player actions           |
| Basic post-match logging | No one can capture events during play                | Final result and explicitly limited summary; never imply a complete event history |

There is exactly one active logger per match. A handover may move that designation to another device or user, but concurrent multi-logger editing is not supported.

## Scenario Catalog

### SCN-01: Referee-only logger

A referee officiates and records the match but is not on either squad.

- May view the match and operate detailed live logging when designated.
- Does not receive player statistics merely by logging events.
- In later phases, the match may be marked as officiated according to the requirements.

### SCN-02: Player-only participant

A player participates while a separate referee or scorer records the match.

- May view the live state and completed scorecard.
- May receive derived career statistics from attributed events.
- Cannot edit events, undo actions, or correct the scorecard solely because they played.

### SCN-03: Player and referee, basic post-match entry

A player-referee combination exists, but nobody captures the match event by event.

- May submit a final result and the limited fields supported by the basic flow.
- Must not create a fabricated detailed event timeline.
- The UI and scorecard must clearly distinguish this record from detailed live logging.

### SCN-04: Player and referee, detailed live logger

The same person plays and records the match, usually from the sideline or during substitutions.

- May use the detailed logger only while holding the active logger designation.
- Must be able to log without blocking on network connectivity.
- The product should make the extra cognitive load visible through simple, fast interactions.

### SCN-05: Player-host with an external referee

A player creates and manages the match, participates in the game, and assigns a separate referee to officiate or log it.

- The host retains match setup and lifecycle responsibilities as permitted.
- The referee can log only when designated as the active logger.
- Playing status, host status, referee status, and logger permission remain independent.

### SCN-06: Player-host with a separate scorer

A player hosts and plays while a non-playing scorer operates the logger.

- The scorer can record events when designated.
- The scorer does not automatically gain host powers or player statistics.
- This is a match-scoped scorer assignment, not necessarily a permanent account role.

### SCN-07: Referee or scorer handover

The active logger loses battery, connectivity, or availability and another authorized person takes over.

- Transfer the single active logger designation.
- Fence the previous device or logger for new writes.
- Preserve and review pending offline events as a recovery bundle; do not silently merge concurrent edits.

### SCN-08: Organizer or captain who does not play

A user creates the match, manages squads and join requests, and assigns the referee or scorer without appearing in either squad.

- May administer the match within host permissions.
- Is not a participant and must not receive player statistics.
- May be the active logger only if the match designates them accordingly.

### SCN-09: Guest or placeholder player

Someone plays without an account and is represented by a claimable placeholder or anonymous player identity.

- Their match participation can contribute to the match record under the placeholder rules.
- Personal data and discovery visibility remain restricted.
- Claiming, refusing, merging, and anonymising history must remain auditable and append-only.

### SCN-10: Spectator or follower

A non-participant views a live or completed match through an allowed sharing or spectator surface.

- Read-only access only.
- No event writes, score corrections, logger assignment, or lifecycle commands.
- Live public distribution is phase-dependent and must not be assumed from a shareable completed scorecard.

### SCN-11: Participant reviewing a completed match

A player reviews the scorecard, career record, correction history, or share card after the match.

- May inspect the record and share permitted representations.
- Cannot rewrite totals or events.
- Corrections, when allowed, remain append-only and restricted to the defined correction actors and time window.

### SCN-12: Match with no normal completion

A match is cancelled, abandoned, forfeited, or produces no result.

- Preserve the lifecycle state and reason.
- Do not present an abandoned or forfeited match as a normal completed match.
- Apply the distinct rules for whether events, results, and player statistics count.

## Change Checklist

For any feature involving users, matches, logging, scorecards, stats, sharing, or permissions:

1. Identify the account role, match role, and permission for each actor.
2. Classify the flow as detailed live logging, basic post-match logging, viewing, administration, or handover.
3. Check whether the single-active-logger rule applies.
4. Define what happens offline, during handover, after completion, and for abandoned or forfeited matches where relevant.
5. Confirm whether the behavior is Phase 0, Phase 1, Phase 2, or Phase 3.
6. Trace the change to the specific `FR-*`, `NFR-*`, `GAP-*`, or `DEC-*` IDs in [`requirements.md`](requirements.md).
7. If an API shape or permission contract changes, update [`openapi.yaml`](openapi.yaml) with the implementation.
8. Add the narrowest test for the role and permission boundary being changed.

## Non-goals

- Do not create separate applications or login gates for player, referee, and host combinations.
- Do not infer write access from being a player, being visible in a squad, or being able to view a scorecard.
- Do not represent a basic post-match result as if it came from a complete detailed logger.
- Do not add concurrent multi-logger editing without a new explicit decision and conflict model.
