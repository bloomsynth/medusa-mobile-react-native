# create-medusa-mobile

Creates a React Native storefront for Medusa v2 from the
[Medusa Mobile template](https://github.com/bloomsynth/medusa-mobile-react-native).

```sh
npx create-medusa-mobile my-store
```

The CLI clones the template, renames the app, writes `.env`, installs
dependencies with `npm ci`, and makes an initial Git commit. It has no npm
dependencies; it needs Node (`^22.22.0`, `^24.3.0`, or `>=26`), npm, and Git.

## Usage

The CLI prompts for any value not passed as an option. Pass `--yes` to accept
the defaults derived from the directory name, for example in scripts:

```sh
npx create-medusa-mobile my-store --yes \
  --display-name "My Store" --bundle-id com.example.mystore \
  --backend-url http://10.0.2.2:9000 --publishable-key pk_...
```

Run it with `--help` for every option.

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
template repository: this package, its test and publish workflow, the issue
templates, `CODE_OF_CONDUCT.md`, and `SECURITY.md`. `LICENSE` is kept.

If a step fails after cloning, the CLI removes the partly created project. A
failed `npm ci` is reported but keeps the project.

## Template version

Each published version clones the template at its own release tag, for example
`create-medusa-mobile@0.1.0`, so it always customizes the template it was tested
with. Pass `--ref main` for the latest template, or `--template` with another Git
URL or a local repository.

Run from a checkout of the template repository, the CLI clones that checkout's
last commit instead, because unreleased versions have no tag. Uncommitted
changes are not included:

```sh
node packages/create-medusa-mobile/bin/create-medusa-mobile.js ../my-store
```

## Development

The tests are in `__tests__/create-medusa-mobile.test.js` in the template
repository and run with `npm run verify`. They customize a copy of the real
template files, so a change to a native identifier in the template that the CLI
does not handle fails the tests. `npm pack --dry-run` in this directory lists
the files that would be published.

## Releasing

Releases are published by `.github/workflows/publish-cli.yml` when a tag named
`create-medusa-mobile@<version>` is pushed. The workflow checks that the tag
matches `version` in this `package.json`, runs `npm run verify`, and publishes
with provenance through npm trusted publishing. It skips a version that is
already on npm.

To release:

1. Set `version` in this `package.json` and merge the change to `main`.
2. Tag that commit and push the tag:

   ```sh
   git tag create-medusa-mobile@0.2.0
   git push origin create-medusa-mobile@0.2.0
   ```

Release when the template's native projects, `app.json`, `package.json`, or
`.env.template` change in a way the CLI edits, so new projects get the change.

### First release

Trusted publishing is configured on an existing package, so publish 0.1.0 by
hand once:

1. Merge to `main`. With 2FA enabled on your npm account, publish from this
   directory on an up-to-date `main`:

   ```sh
   npm login
   npm publish --access public
   ```

2. Straight away, tag that commit and push `create-medusa-mobile@0.1.0` as
   above. The published CLI clones this tag, so it fails until the tag exists.
   The workflow run for the tag verifies and then skips publishing, because
   0.1.0 is already on npm.
3. On npmjs.com, open the package's **Settings**, add a **Trusted Publisher**
   for GitHub Actions with repository `bloomsynth/medusa-mobile-react-native`
   and workflow `publish-cli.yml`, and then disallow token publishing.

Later releases need only the tag.
