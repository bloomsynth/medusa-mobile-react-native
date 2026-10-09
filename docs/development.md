# Development

## Install and verify

Use Node 24 from `.nvmrc` (with nvm: `nvm install && nvm use`) and the npm version
recorded in `package.json#packageManager`. Other supported Node versions are
listed in `package.json#engines`.

```sh
npm install --global npm@11.19.1
npm ci
# Only for a new checkout; preserve an existing .env.
cp .env.template .env
npm run verify
```

`verify` runs ESLint, TypeScript without emitting files, and Jest serially with
Watchman disabled. Unit tests mock backend calls and native modules; a backend,
Android SDK, Xcode, and real API key are not required. CI uses the same command
on pull requests and pushes to `main`, with a copy of the environment template.

Use `npm run test:ci -- --runTestsByPath __tests__/checkout-shipping.test.tsx`
for a focused test while developing. Use `npm install` when intentionally
changing dependencies, and include `package-lock.json` with the change.

## Connect a Medusa backend

The backend is managed separately. See the [Medusa installation guide](https://docs.medusajs.com/learn/installation)
for PostgreSQL, database configuration, and installation. Choose to skip the
optional web storefront; this repository provides the mobile storefront. Use the
version tested in the README when reproducing compatibility checks.

For an existing checkout of `medusa-starter-default`, run these commands in its
backend package directory using its configured package manager (the local backend
uses pnpm):

```sh
pnpm install --frozen-lockfile
pnpm exec medusa db:migrate
# Once on a fresh development database to populate demo data:
pnpm run seed
pnpm run dev
```

The starter seed populates products, inventory, regions, shipping options, the
manual payment provider, and a publishable API key linked to a sales channel.
Treat it as initialization for a fresh demo database; do not reseed an existing
store as a troubleshooting step. In Admin (`http://localhost:9000/app`), obtain a
publishable API key and ensure it is associated with the channel containing your
products. Use that key for `PUBLISHABLE_API_KEY`; admin credentials and secret
keys do not belong in the mobile app.

If the backend retains the starter Git history and has `UPSTREAM.md`, follow
that document to merge starter changes and apply backend upgrades. The mobile
repository does not perform those merges or database migrations.

## Environment values

`.env.template` is the canonical template. `.env` is ignored by Git. Values are
compiled into the app by `react-native-dotenv`; restart Metro with a cleared
cache and reload the app after changing them.

| Variable              | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| `MEDUSA_BACKEND_URL`  | Medusa server base URL reachable from the device        |
| `PUBLISHABLE_API_KEY` | Store API key associated with the product sales channel |
| `DEFAULT_LOCALE`      | `en-US` or `id-ID`; default is `en-US`                  |

| Target                  | Local backend URL                                               |
| ----------------------- | --------------------------------------------------------------- |
| Android Studio emulator | `http://10.0.2.2:9000` (template default)                       |
| iOS simulator           | `http://localhost:9000`                                         |
| Physical device         | Host computer's LAN IP, for example `http://192.168.1.100:9000` |

A saved locale overrides `DEFAULT_LOCALE`. Region, cart, and authentication also
persist in AsyncStorage; use the app's settings/logout controls where possible
when diagnosing stale state.

## Run Android

Install the Android development tools described in the
[React Native environment guide](https://reactnative.dev/docs/set-up-your-environment).
Use JDK 17. SDK, build tools, and NDK versions are declared in
`android/build.gradle`; install those versions through Android Studio. Configure
`ANDROID_HOME` and SDK tools on `PATH`, or an ignored `android/local.properties`.

Start the backend and an Android emulator, then start Metro in one terminal:

```sh
npm start -- --reset-cache
```

In another terminal at this repository root:

```sh
adb devices
npm run android
```

If the installed app cannot reach Metro over USB, use `adb reverse tcp:8081 tcp:8081`.
That forwards Metro only; the backend URL must still be reachable from the device.

## Run iOS

A full Xcode installation and a simulator are required. Install the Ruby gems
from the Gemfile and then CocoaPods dependencies:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

## Watchman troubleshooting

Jest does not use Watchman in `test:ci`. If Metro fails because the host's Watchman
installation cannot load a shared library, check `watchman --version`. A temporary
Metro config can bypass Watchman while preserving the repository configuration.
From the repository root:

```sh
node <<'NODE'
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = process.cwd();
const file = path.join(os.tmpdir(), 'medusa-mobile-metro-no-watchman.cjs');
fs.writeFileSync(file, `
const config = require(${JSON.stringify(path.join(root, 'metro.config.js'))});
module.exports = {
  ...config,
  projectRoot: ${JSON.stringify(root)},
  resolver: {...config.resolver, useWatchman: false},
};
`);
console.log(file);
NODE
```

Pass the printed path to `npm start -- --config <printed-path> --reset-cache`.
Do not commit the temporary config or machine-specific library paths.

## Manual validation

Choose checks that match the change. Record which platform and backend version
you exercised, and which checks remain unverified.

- Catalog: load products and region-specific prices, select a variant, and confirm
  stocked variants can be added while unavailable variants are blocked.
- Cart controls: tap the center and padding of View Cart after the reveal, repeat
  after adding/removing items, and check width, opacity, and badge animations.
- Cart data: add, update, and remove items; confirm totals and persisted state.
- Checkout: submit a valid address; confirm payment cannot be reached without a
  saved shipping method or while a shipping update is in flight; select manual
  payment, confirm the summary, and complete an order on a development backend.
- Authentication and region changes: confirm the cart follows the customer and
  selected region when touching those flows.

Stripe's external payment flow is still a TODO. A successful manual-payment
checkout does not validate Stripe. Jest covers shipping guards and payment
summary selection; native gestures, live inventory, and full order completion
require the relevant manual checks above.
