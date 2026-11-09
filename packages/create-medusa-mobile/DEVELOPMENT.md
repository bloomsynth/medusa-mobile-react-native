# Developing create-medusa-mobile

The package's [README](README.md) is its page on npm, so keep it to what users
of the CLI need. Notes for working on the CLI belong here; this file is not
published.

## Run from a checkout

Run from a checkout of the template repository, the CLI clones that checkout's
last commit instead of a release tag, because unreleased versions have no tag.
Uncommitted changes are not included:

```sh
node packages/create-medusa-mobile/bin/create-medusa-mobile.js ../my-store
```

## Tests

The tests are in `__tests__/create-medusa-mobile.test.js` at the repository root
and run with `npm run verify`. They customize a copy of the real template files,
so a change to a native identifier in the template that the CLI does not handle
fails the tests.

Run `npm pack --dry-run` in this directory to list the files that would be
published. Only `bin/`, `lib/`, `README.md`, `LICENSE`, and `package.json` are
included.

## Releasing

Releases are published by `.github/workflows/publish-cli.yml` when a tag named
`create-medusa-mobile@<version>` is pushed. The workflow checks that the tag
matches `version` in this `package.json`, runs `npm run verify`, and publishes
with provenance through npm trusted publishing. It skips a version that is
already on npm.

1. Set `version` in this `package.json` and merge the change to `main`.
2. Tag the merged commit on `main` and push the tag:

   ```sh
   git fetch origin
   git tag create-medusa-mobile@0.2.0 origin/main
   git push origin create-medusa-mobile@0.2.0
   ```

Each published version clones the template at its own tag, so release when the
template's native projects, `app.json`, `package.json`, or `.env.template`
change in a way the CLI edits, or when new projects should get other template
changes.

Trusted publishing must be set up once on npmjs.com: in the package's
**Settings**, add a **Trusted Publisher** for GitHub Actions with repository
`bloomsynth/medusa-mobile-react-native` and workflow `publish-cli.yml`, then
disallow token publishing.
