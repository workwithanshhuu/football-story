---
name: role-aware-product-changes
description: "Use when changing footArena users, player/referee/host roles, match participation, scorers, logging, scorecards, stats, sharing, lifecycle, or permissions. Keeps account roles, match roles, and write permissions separate."
user-invocable: false
---

# Role-Aware Product Changes

Use this workflow for any change that can affect who participates in a match, who can view or write data, or how a scorecard and player record are derived.

## References

- Read the scenario catalog: [`../../../docs/user-role-scenarios.md`](../../../docs/user-role-scenarios.md)
- Read the relevant canonical requirements section: [`../../../docs/requirements.md`](../../../docs/requirements.md)
- Read the relevant API path, schema, or enum: [`../../../docs/openapi.yaml`](../../../docs/openapi.yaml)

## Workflow

1. Name every actor's account role, match role, and permission. Do not collapse these into one role field without checking the contract.
2. Classify the flow as detailed live logging, basic post-match logging, viewing, administration, or logger handover.
3. Preserve exactly one active logger per match. If logging moves, use designation transfer and device fencing rather than concurrent writes.
4. Check the offline behavior and recovery behavior for any live logging change.
5. Check terminal match states: completed, abandoned, forfeited, and cancelled may have different stat and scorecard effects.
6. Trace the behavior to stable `FR-*`, `NFR-*`, `GAP-*`, or `DEC-*` IDs before editing.
7. Enforce permissions server-side. UI visibility is not authorization.
8. Add or update a focused test for the changed role boundary, especially a nearby actor who must remain read-only.
9. If the API contract changes, update `openapi.yaml` and its consumers together.

## Review Questions

- Can a player view a record without becoming an event writer?
- Can a host administer a match without automatically becoming a participant?
- Can a referee log without automatically receiving player statistics?
- Is a basic result visibly distinct from a detailed event-derived scorecard?
- Can a handover recover pending offline events without silently duplicating them?
- Are corrections append-only and limited to the documented actors and time window?
