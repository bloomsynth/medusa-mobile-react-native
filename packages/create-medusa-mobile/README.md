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

The CLI also replaces `README.md` and removes files that only apply to the
template repository, such as its issue templates and release workflow. `LICENSE`
is kept.

If a step fails after cloning, the CLI removes the partly created project. A
failed `npm ci` is reported but keeps the project.

## Template version

Each version of the CLI clones the template at its own release tag, for example
`create-medusa-mobile@0.1.1`, so it always customizes the template it was tested
with. Pass `--ref main` for the latest template, or `--template` with another Git
URL or a local repository.

## Links

- [Medusa Mobile template](https://github.com/bloomsynth/medusa-mobile-react-native)
- [Report an issue](https://github.com/bloomsynth/medusa-mobile-react-native/issues)
- [Developing and releasing this CLI](https://github.com/bloomsynth/medusa-mobile-react-native/blob/main/packages/create-medusa-mobile/DEVELOPMENT.md)
