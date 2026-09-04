# Documentation Map

Load the smallest relevant source first:

| Need | Read | Authority |
|---|---|---|
| Product behavior or scope | [`requirements.md`](requirements.md) | Canonical |
| API path or data shape | [`openapi.yaml`](openapi.yaml) | Canonical |
| User, match, and logging scenarios | [`user-role-scenarios.md`](user-role-scenarios.md) | Supporting reference |
| Visual layout or interaction treatment | [`figma-design-spec.md`](figma-design-spec.md) | Supporting |
| Screen-specific visual brief | [`figma-pages/`](figma-pages/) | Supporting |
| Logger prototype reference | [`match-logger.html`](match-logger.html), [`pitch-logger-v9.html`](pitch-logger-v9.html) | Supporting |

## Rules

- Do not duplicate requirements, schemas, or decisions in supporting documents.
- Cite the specific requirement ID when a design or code change implements product behavior.
- Update [`requirements.md`](requirements.md) and [`openapi.yaml`](openapi.yaml) together when behavior changes its API contract.
- Treat generated route metadata as implementation output, not documentation authority.