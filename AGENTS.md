<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Repository Rules

## Authority

- Product behavior, scope, phases, decisions, and requirement IDs: [`docs/requirements.md`](docs/requirements.md).
- HTTP resources, schemas, enums, and operation contracts: [`docs/openapi.yaml`](docs/openapi.yaml).
- If the two files disagree, stop and resolve the contradiction explicitly; do not invent a third interpretation.

## Change workflow

- Read only the relevant requirement section and OpenAPI path/schema before editing.
- Trace substantive work to the specific `FR-*`, `NFR-*`, `GAP-*`, or `DEC-*` IDs it implements.
- Write or update the narrowest focused test with the change. Keep changes within the owning route, component, or service boundary.
- Keep API changes additive by default. Breaking contract changes require an explicit note and synchronized consumer updates.
- Do not edit generated files by hand, commit changes, rewrite published history, or revert unrelated user work.

## Local conventions

- This is a Vite + React + TanStack Start app. Routes live in `src/routes/`; shared UI lives in `src/components/`.
- Prefer existing components, tokens, and `lucide-react` icons.
- Use `pnpm lint` and `pnpm build` for validation when the change touches application code.

## Role and Match Scenario Model

- Treat [`docs/user-role-scenarios.md`](docs/user-role-scenarios.md) as the scenario reference for all role, match, logging, scorecard, stats, sharing, and permission changes.
- Keep these concepts separate: **account role** (what the user can do generally), **match role** (how they participate in one match), and **permission** (what they can do to that match's data).
- Before implementing a relevant change, identify which scenario(s) it supports and preserve the distinction between a detailed live logger and a basic post-match result submitter.
- Enforce the single active logger per match. A player, host, referee, or scorer may hold that designation, but participant status alone must never grant event-write permission.
- Do not introduce a new account type for a combination already expressible as switchable account roles plus match-scoped assignments. If behavior or the API contract changes, trace it to the applicable requirement IDs and update the canonical docs together.
- Use the role-aware change workflow in [`.github/skills/role-aware-product-changes/SKILL.md`](.github/skills/role-aware-product-changes/SKILL.md) when changing role-sensitive behavior.

## Pitch Logger Protection

- Treat the current pitch logger screen as frozen. Do not make changes to its layout, styling, copy, interaction behavior, animations, activity cards, pitch view, or read-only presentation.
- This protection applies to `/logger`, `/player`, `src/components/LoggerFrame.tsx`, the pitch logger styles in `src/styles.css`, and the reference behavior in `docs/pitch-logger-v9.html`.
- Do not refactor, restyle, or “clean up” these surfaces as part of unrelated work. Only change them when the user explicitly requests a pitch logger change.
