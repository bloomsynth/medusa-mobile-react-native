# create-medusa-mobile

Creates a React Native storefront for Medusa v2 from the
[Medusa Mobile template](https://github.com/bloomsynth/medusa-mobile-react-native).

The CLI clones the template, renames the app, writes `.env`, installs
dependencies with `npm ci`, and makes an initial Git commit. It has no npm
dependencies; it needs Node (`^22.22.0`, `^24.3.0`, or `>=26`), npm, and Git.

## Usage

From a clone of the template repository:

```sh
node packages/create-medusa-mobile/bin/create-medusa-mobile.js ../my-store
```

The CLI prompts for any value not passed as an option. Pass `--yes` to accept
the defaults derived from the directory name, for example in scripts:

```sh
node packages/create-medusa-mobile/bin/create-medusa-mobile.js ../my-store --yes \
  --display-name "My Store" --bundle-id com.example.mystore \
  --backend-url http://10.0.2.2:9000 --publishable-key pk_...
```

Run it with `--help` for every option. Once the package is published to npm,
`npx create-medusa-mobile my-store` takes the same options.

## What it changes

| Value                                          | Default for `my-store` | Option                                       |
| ---------------------------------------------- | ---------------------- | -------------------------------------------- |
| Module name, Xcode project/target/scheme, Pods | `MyStore`              | `--name`                                     |
| Name under the app icon (Android, iOS)         | `My Store`             | `--display-name`                             |
| Android package and iOS bundle ID              | `com.mystore`          | `--bundle-id`                                |
| npm package name in the manifest and lockfile  | `my-store`             | `--package-name`                             |
| `.env`, copied from `.env.template`            | template values        | `--backend-url`, `--publishable-key`, others |

Bundle IDs may contain only letters and digits in each dot-separated segment so
that one ID is valid on both Android and iOS.

The CLI also replaces `README.md` and removes files that only describe the
template repository: this package, its test, the issue templates,
`CODE_OF_CONDUCT.md`, and `SECURITY.md`. `LICENSE` is kept.

`--template` accepts another Git URL or a local repository, and `--ref` a branch
or tag. A local template is cloned from its last commit, so uncommitted
changes are not included. If a step fails after cloning, the CLI removes the
partly created project. A failed `npm ci` is reported but keeps the project.

## Development

The tests are in `__tests__/create-medusa-mobile.test.js` in the template
repository and run with `npm run verify`. They customize a copy of the real
template files, so a change to a native identifier in the template that the CLI
does not handle fails the tests.
