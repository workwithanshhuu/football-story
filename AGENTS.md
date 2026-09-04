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
- Figma pages and HTML prototypes are visual references only. They may clarify presentation, but they cannot add behavior or change a contract.

## Change workflow

- Read only the relevant requirement section and OpenAPI path/schema before editing.
- Trace substantive work to the specific `FR-*`, `NFR-*`, `GAP-*`, or `DEC-*` IDs it implements.
- Write or update the narrowest focused test with the change. Keep changes within the owning route, component, or service boundary.
- Keep API changes additive by default. Breaking contract changes require an explicit note and synchronized consumer updates.
- Do not edit generated files by hand, commit changes, rewrite published history, or revert unrelated user work.

## Local conventions

- This is a Vite + React + TanStack Start app. Routes live in `src/routes/`; shared UI lives in `src/components/`.
- Prefer existing components, tokens, and `lucide-react` icons. Preserve the visual language in [`docs/figma-design-spec.md`](docs/figma-design-spec.md).
- Use `pnpm lint` and `pnpm build` for validation when the change touches application code.
