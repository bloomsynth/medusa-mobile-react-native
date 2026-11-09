'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { parseArgs } = require('node:util');
const { TEMPLATE_REPOSITORY, customizeProject } = require('./customize');
const {
  resolveNames,
  toAppName,
  toDisplayName,
  validateAppName,
  validateBundleId,
  validateDisplayName,
} = require('./names');

const { version } = require('../package.json');

// Release tags name the CLI version, e.g. create-medusa-mobile@0.1.0.
const RELEASE_TAG_PREFIX = 'create-medusa-mobile@';

const USAGE = `Usage: create-medusa-mobile <directory> [options]

Creates a React Native storefront for Medusa v2 from the Medusa Mobile template.

Project names (derived from <directory> when omitted):
  --name <AppName>          Native module, Xcode target, and scheme name
  --display-name <name>     Name shown under the app icon
  --bundle-id <id>          Android package and iOS bundle ID (com.example.store)
  --package-name <name>     npm package name

Store connection (written to .env):
  --backend-url <url>       MEDUSA_BACKEND_URL
  --publishable-key <key>   PUBLISHABLE_API_KEY
  --locale <locale>         DEFAULT_LOCALE (en-US or id-ID)
  --stripe-key <key>        STRIPE_PUBLISHABLE_KEY

Template and setup:
  --template <git-url|dir>  Template repository (default: ${TEMPLATE_REPOSITORY})
  --ref <branch|tag>        Template branch or tag (default: ${RELEASE_TAG_PREFIX}${version},
                            the release this CLI was tested with)
  --skip-install            Do not run npm ci
  --skip-git                Do not initialize a Git repository
  -y, --yes                 Use defaults instead of prompting
  -h, --help                Show this help
  -v, --version             Show the version
`;

const OPTIONS = {
  name: { type: 'string' },
  'display-name': { type: 'string' },
  'bundle-id': { type: 'string' },
  'package-name': { type: 'string' },
  'backend-url': { type: 'string' },
  'publishable-key': { type: 'string' },
  locale: { type: 'string' },
  'stripe-key': { type: 'string' },
  template: { type: 'string' },
  ref: { type: 'string' },
  'skip-install': { type: 'boolean' },
  'skip-git': { type: 'boolean' },
  yes: { type: 'boolean', short: 'y' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
};

class UsageError extends Error {}

function parse(argv) {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: OPTIONS,
      allowPositionals: true,
    });
  } catch (error) {
    throw new UsageError(error.message);
  }
  if (parsed.positionals.length > 1) {
    throw new UsageError('Pass a single project directory.');
  }
  return { directory: parsed.positionals[0], values: parsed.values };
}

function run(command, args, options) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    // npm is a .cmd shim on Windows, which Node only runs through a shell.
    shell: process.platform === 'win32' && command === 'npm',
    ...options,
  });
  if (result.error) {
    throw result.error;
  }
  return result.status === 0;
}

/**
 * The published CLI clones the release tag of its own version, so each version
 * customizes the template it was tested against. Run from a checkout of the
 * template repository, which has no tag before a release, it clones that
 * checkout's last commit instead.
 */
function defaultTemplate(packageRoot = path.join(__dirname, '..')) {
  const checkout = path.resolve(packageRoot, '../..');
  const isCheckout =
    fs.existsSync(path.join(checkout, '.git')) &&
    fs.existsSync(path.join(checkout, 'packages/create-medusa-mobile'));
  return isCheckout
    ? { template: checkout }
    : {
        template: `${TEMPLATE_REPOSITORY}.git`,
        ref: `${RELEASE_TAG_PREFIX}${version}`,
      };
}

function templateSource(template) {
  // Local clones ignore --depth unless the source is a file:// URL.
  return fs.existsSync(template)
    ? pathToFileURL(path.resolve(template)).href
    : template;
}

function isInsideGitRepository(dir) {
  const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: dir,
    stdio: 'ignore',
  });
  return result.status === 0;
}

function createAsker(io) {
  const rl = readline.createInterface({ input: io.stdin, output: io.stdout });
  // The iterator buffers lines, so answers typed or piped ahead are kept.
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (message, initial, validate) => {
    for (;;) {
      io.stdout.write(`${message}${initial ? ` (${initial})` : ''}: `);
      const { value: line, done } = await lines.next();
      if (done) {
        throw new UsageError('Input ended before every question was answered.');
      }
      const value = line.trim() || initial || '';
      const error = validate?.(value);
      if (!error) {
        return value;
      }
      io.stdout.write(`${error}\n`);
    }
  };
  return { ask, close: () => rl.close() };
}

async function collectInput(directory, values, io) {
  const options = {
    appName: values.name,
    displayName: values['display-name'],
    bundleId: values['bundle-id'],
    packageName: values['package-name'],
  };
  const env = {
    backendUrl: values['backend-url'],
    publishableKey: values['publishable-key'],
    defaultLocale: values.locale,
    stripePublishableKey: values['stripe-key'],
  };

  if (!values.yes && io.stdin.isTTY) {
    // Prompt for values not passed as flags, offering derived defaults.
    const { ask, close } = createAsker(io);
    try {
      directory ??= await ask('Project directory', 'my-medusa-store', value =>
        value ? undefined : 'Enter a directory.',
      );
      const base = path.basename(path.resolve(directory));
      options.appName ??= await ask(
        'App name (letters and digits)',
        toAppName(base),
        validateAppName,
      );
      options.displayName ??= await ask(
        'Display name',
        toDisplayName(base),
        validateDisplayName,
      );
      options.bundleId ??= await ask(
        'Bundle ID',
        `com.${options.appName.toLowerCase()}`,
        validateBundleId,
      );
      env.backendUrl ??= await ask(
        'Medusa backend URL',
        'http://10.0.2.2:9000',
      );
      env.publishableKey ??=
        (await ask('Publishable API key (Enter to set it later)')) || undefined;
    } finally {
      close();
    }
  }
  if (!directory) {
    throw new UsageError('Pass the project directory to create.');
  }

  const resolved = resolveNames(directory, options);
  if (resolved.errors) {
    throw new UsageError(resolved.errors.join('\n'));
  }
  return { directory, names: resolved.names, env };
}

/**
 * Runs the CLI. Returns the process exit code instead of exiting, so tests can
 * call it directly.
 */
async function main(argv, io = process) {
  let target;
  let existed = false;
  let cloned = false;
  try {
    const { directory: positional, values } = parse(argv);
    if (values.help) {
      io.stdout.write(USAGE);
      return 0;
    }
    if (values.version) {
      io.stdout.write(`${version}\n`);
      return 0;
    }

    const { directory, names, env } = await collectInput(
      positional,
      values,
      io,
    );
    target = path.resolve(directory);
    if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
      throw new UsageError(`${directory} already exists and is not empty.`);
    }

    const defaults = values.template
      ? { template: values.template }
      : defaultTemplate();
    const template = defaults.template;
    const ref = values.ref ?? defaults.ref;
    io.stdout.write(
      `Creating ${names.displayName} in ${target}\n` +
        `Template: ${template}${ref ? ` at ${ref}` : ''}\n`,
    );
    const cloneArgs = ['clone', '--depth', '1', '--quiet'];
    if (ref) {
      cloneArgs.push('--branch', ref);
    }
    cloneArgs.push(templateSource(template), target);
    existed = fs.existsSync(target);
    if (!run('git', cloneArgs)) {
      throw new Error(
        `Could not clone the template from ${template}${ref ? ` at ${ref}` : ''}.`,
      );
    }
    cloned = true;

    customizeProject(target, names, env);
    io.stdout.write(
      `Renamed the app to ${names.appName} (${names.bundleId}) and wrote .env.\n`,
    );

    if (!values['skip-install']) {
      io.stdout.write('Installing dependencies with npm ci\n');
      if (!run('npm', ['ci'], { cwd: target })) {
        io.stderr.write(
          'npm ci failed. Fix the error above, then run npm ci in the project.\n',
        );
      }
    }

    if (!values['skip-git'] && !isInsideGitRepository(path.dirname(target))) {
      const git = args => run('git', args, { cwd: target });
      const committed =
        git(['init', '--quiet']) &&
        git(['add', '--all']) &&
        git([
          'commit',
          '--quiet',
          '--message',
          'chore: initialize project from Medusa Mobile template',
        ]);
      if (!committed) {
        io.stderr.write(
          'Could not create the initial Git commit; the files are left staged.\n',
        );
      }
    }

    const relative = path.relative(process.cwd(), target) || '.';
    io.stdout.write(`
Done. Next steps:

  cd ${relative}
${values['skip-install'] ? '  npm ci\n' : ''}${
      env.publishableKey ? '' : '  # Set PUBLISHABLE_API_KEY in .env\n'
    }  npm start
  npm run android   # or: cd ios && bundle exec pod install && cd .. && npm run ios
`);
    return 0;
  } catch (error) {
    // Leave no half-customized project behind; keep a directory the user made.
    if (cloned && existed) {
      for (const entry of fs.readdirSync(target)) {
        fs.rmSync(path.join(target, entry), { recursive: true, force: true });
      }
    } else if (cloned) {
      fs.rmSync(target, { recursive: true, force: true });
    }
    io.stderr.write(`${error.message}\n`);
    if (error instanceof UsageError) {
      io.stderr.write('Run create-medusa-mobile --help for usage.\n');
    }
    return 1;
  }
}

module.exports = { RELEASE_TAG_PREFIX, USAGE, defaultTemplate, main, parse };
