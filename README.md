# footArena

The player-first football app. The canonical product and API references are:

- [`docs/requirements.md`](docs/requirements.md): behavior, scope, phases, decisions, and traceability IDs.
- [`docs/openapi.yaml`](docs/openapi.yaml): HTTP paths, payloads, schemas, enums, and error contracts.

Everything else is supporting material. Start with [`AGENTS.md`](AGENTS.md) for
repository rules and [`docs/README.md`](docs/README.md) for the documentation map.

## Development

```sh
pnpm install
pnpm dev
```

Validate application changes with:

```sh
pnpm lint
pnpm build
```

The app uses Vite, React, and TanStack Start. Routes live in `src/routes/` and
shared components live in `src/components/`.
