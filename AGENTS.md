# Working in this repository

This is a React Native CLI storefront for Medusa v2. The backend is a separate
project; do not assume it is installed or running. The README records the tested
Medusa version. `package.json` and `package-lock.json` record dependency versions.

## Start here

- [Development setup and validation](docs/development.md)
- [Architecture and dependency constraints](docs/architecture.md)
- [Human-facing project guide](README.md)

Use Node from `.nvmrc` and the npm version in `package.json#packageManager`.
Install with `npm ci`. Copy `.env.template` to `.env` only if `.env` is absent;
placeholder values suffice for unit tests. See the development guide for a real
backend, publishable key, and emulator networking.

## Commands

| Task                        | Command             |
| --------------------------- | ------------------- |
| Required checks             | `npm run verify`    |
| Lint                        | `npm run lint`      |
| TypeScript                  | `npm run typecheck` |
| Unit tests without Watchman | `npm run test:ci`   |
| Metro                       | `npm start`         |
| Android build and launch    | `npm run android`   |
| iOS build and launch        | `npm run ios`       |

## Code conventions

- Use the configured Medusa SDK in `app/api/client.tsx`. Keep cart mutations in
  `app/data/cart-context.tsx` so the server response updates the shared cart.
- Follow existing React Query usage for fetched catalog and checkout options.
  Include request inputs such as region and cart IDs in query keys.
- Navigation is declared in `app/app.tsx`; use its existing static navigation
  types when adding screens or route parameters.
- Reuse `app/components/common`, NativeWind classes, and theme hooks. Preserve
  touch targets and animations when changing interactive controls.
- Put visible copy in the Fluent templates under `app/constants/fluent-templates`;
  update both supported locales and their types when adding message keys.
- Use Medusa `HttpTypes` and the Zod schemas in `app/types/checkout.ts` rather than
  widening API or form data to `any`. Preserve loading, empty, and error states.
- Keep import aliases in `babel.config.js` and `tsconfig.json` aligned.

## Validation and completion

Run `npm run verify` for code, configuration, or dependency changes. For a
documentation-only edit, check commands, links, and the diff. Add focused
regression tests for changed business behavior; test observable outcomes.

Jest mocks native modules and API calls. Passing Jest does not establish native
build, hit-area, animation, or live backend compatibility. For UI changes, check
the affected flow on a device or emulator. For dependency/native changes, also
build the affected platform and exercise the affected integrations. The
[development guide](docs/development.md#manual-validation) lists the key flows.

Keep changes scoped to the request and preserve unrelated work. Keep environment
files, credentials, generated builds, and dependency directories out of commits.
For upgrades, check the constraints in the architecture guide and commit the
updated lockfile with the manifest. Update these docs when the workflow changes.

When handing back work, state what changed, the checks performed and their
results, and any remaining limitations. Distinguish automated tests, native
builds, and manual checks. Commit or publish when requested by the user.
