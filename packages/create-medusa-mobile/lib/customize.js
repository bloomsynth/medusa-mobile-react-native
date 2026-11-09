'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { TEMPLATE } = require('./names');

const TEMPLATE_REPOSITORY =
  'https://github.com/bloomsynth/medusa-mobile-react-native';

// Paths that describe the template repository itself rather than a store app.
const PRUNED_PATHS = [
  '.git',
  'packages/create-medusa-mobile',
  '__tests__/create-medusa-mobile.test.js',
  '.github/ISSUE_TEMPLATE',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
];
const PRUNED_PATTERNS = [/^android\/(hs_err|replay)_pid\d+\.log$/];

// Directories never copied into a generated project or scanned for names.
const SKIPPED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  'Pods',
  'build',
  '.gradle',
  '.cxx',
]);

const ENV_KEYS = {
  backendUrl: 'MEDUSA_BACKEND_URL',
  publishableKey: 'PUBLISHABLE_API_KEY',
  defaultLocale: 'DEFAULT_LOCALE',
  stripePublishableKey: 'STRIPE_PUBLISHABLE_KEY',
};

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Android string resources also treat quotes, backslashes, and a leading @ or
// ? specially.
function escapeAndroidString(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/^([@?])/, '\\$1');
}

function walk(root, relative = '') {
  const entries = [];
  for (const entry of fs.readdirSync(path.join(root, relative), {
    withFileTypes: true,
  })) {
    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) {
      continue;
    }
    const entryPath = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      entries.push(...walk(root, entryPath));
    }
    entries.push({ path: entryPath, directory: entry.isDirectory() });
  }
  return entries;
}

function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0);
}

function editFile(root, relative, edit) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    throw new Error(`Template file ${relative} is missing.`);
  }
  const before = fs.readFileSync(file, 'utf8');
  const after = edit(before);
  if (after === before) {
    throw new Error(
      `Template file ${relative} did not contain the expected value.`,
    );
  }
  fs.writeFileSync(file, after);
}

function replaceOnce(text, search, replacement, label) {
  if (!text.includes(search)) {
    throw new Error(`Could not find ${label} in the template.`);
  }
  // A replacer function keeps "$" in user input literal.
  return text.replace(search, () => replacement);
}

function prune(root) {
  for (const relative of PRUNED_PATHS) {
    fs.rmSync(path.join(root, relative), { recursive: true, force: true });
  }
  for (const entry of walk(root)) {
    if (!entry.directory && PRUNED_PATTERNS.some(re => re.test(entry.path))) {
      fs.rmSync(path.join(root, entry.path));
    }
  }
  // Remove a parent left empty by pruning, such as packages/ or .github/.
  for (const parent of ['packages', '.github']) {
    const dir = path.join(root, parent);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
  }
}

function setDisplayName(root, displayName) {
  const xmlName = escapeXml(displayName);
  editFile(root, 'app.json', text => {
    const json = JSON.parse(text);
    json.displayName = displayName;
    return `${JSON.stringify(json, null, 2)}\n`;
  });
  editFile(root, 'android/app/src/main/res/values/strings.xml', text =>
    replaceOnce(
      text,
      `<string name="app_name">${TEMPLATE.appName}</string>`,
      `<string name="app_name">${escapeAndroidString(displayName)}</string>`,
      'the Android app_name string',
    ),
  );
  editFile(root, `ios/${TEMPLATE.appName}/info.plist`, text =>
    text.replace(
      /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
      (_, open, close) => `${open}${xmlName}${close}`,
    ),
  );
  editFile(root, `ios/${TEMPLATE.appName}/LaunchScreen.storyboard`, text =>
    replaceOnce(
      text,
      `text="${TEMPLATE.appName}"`,
      `text="${xmlName}"`,
      'the launch screen title',
    ),
  );
}

function setPackageName(root, packageName) {
  editFile(root, 'package.json', text => {
    const json = JSON.parse(text);
    json.name = packageName;
    return `${JSON.stringify(json, null, 2)}\n`;
  });
  editFile(root, 'package-lock.json', text => {
    const json = JSON.parse(text);
    json.name = packageName;
    if (json.packages && json.packages['']) {
      json.packages[''].name = packageName;
    }
    return `${JSON.stringify(json, null, 2)}\n`;
  });
}

function setBundleId(root, bundleId) {
  editFile(root, 'android/app/build.gradle', text =>
    text
      .replace(/(namespace\s+)"[^"]*"/, `$1"${bundleId}"`)
      .replace(/(applicationId\s+)"[^"]*"/, `$1"${bundleId}"`),
  );
  editFile(root, `ios/${TEMPLATE.appName}.xcodeproj/project.pbxproj`, text =>
    text.replace(
      /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
      `PRODUCT_BUNDLE_IDENTIFIER = ${bundleId};`,
    ),
  );

  // Kotlin package declarations and imports, then the source directories.
  const packagePattern = new RegExp(
    `\\b${TEMPLATE.androidPackage.replace(/\./g, '\\.')}\\b`,
    'g',
  );
  for (const entry of walk(root, 'android')) {
    if (!entry.directory && /\.(kt|java)$/.test(entry.path)) {
      const file = path.join(root, entry.path);
      const text = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, text.replace(packagePattern, bundleId));
    }
  }
  const sourceRoot = path.join(root, 'android/app/src');
  const templateDir = TEMPLATE.androidPackage.split('.');
  for (const sourceSet of fs.readdirSync(sourceRoot)) {
    for (const language of ['java', 'kotlin']) {
      const base = path.join(sourceRoot, sourceSet, language);
      const from = path.join(base, ...templateDir);
      if (!fs.existsSync(from)) {
        continue;
      }
      const to = path.join(base, ...bundleId.split('.'));
      const staging = path.join(base, `.create-medusa-mobile-${process.pid}`);
      // Stage the move so a bundle ID nested under the template package works.
      fs.renameSync(from, staging);
      removeEmptyParents(path.dirname(from), base);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(staging, to);
    }
  }
}

function removeEmptyParents(dir, stop) {
  let current = dir;
  while (current !== stop && fs.readdirSync(current).length === 0) {
    fs.rmdirSync(current);
    current = path.dirname(current);
  }
}

// Replaces the remaining template identifier in text files and file names:
// Xcode targets, schemes, the Podfile target, and the registered module name.
function setAppName(root, appName) {
  const entries = walk(root);
  for (const entry of entries) {
    if (entry.directory) {
      continue;
    }
    const file = path.join(root, entry.path);
    const buffer = fs.readFileSync(file);
    if (isBinary(buffer)) {
      continue;
    }
    const text = buffer.toString('utf8');
    if (text.includes(TEMPLATE.appName)) {
      fs.writeFileSync(file, text.split(TEMPLATE.appName).join(appName));
    }
  }
  // walk() lists children before their parent, so renames stay valid.
  for (const entry of entries) {
    const name = path.posix.basename(entry.path);
    if (name.includes(TEMPLATE.appName)) {
      const from = path.join(root, entry.path);
      const to = path.join(
        path.dirname(from),
        name.split(TEMPLATE.appName).join(appName),
      );
      fs.renameSync(from, to);
    }
  }
}

function writeEnv(root, env = {}) {
  let text = fs.readFileSync(path.join(root, '.env.template'), 'utf8');
  for (const [option, key] of Object.entries(ENV_KEYS)) {
    const value = env[option];
    if (value === undefined) {
      continue;
    }
    if (/[\r\n]/.test(value)) {
      throw new Error(`${key} cannot contain line breaks.`);
    }
    const line = new RegExp(`^${key}=.*$`, 'm');
    text = line.test(text)
      ? text.replace(line, () => `${key}=${value}`)
      : `${text.replace(/\n?$/, '\n')}${key}=${value}\n`;
  }
  fs.writeFileSync(path.join(root, '.env'), text);
}

function writeReadme(root, names) {
  const readme = `# ${names.displayName}

A React Native storefront for [Medusa](https://medusajs.com) v2, created from the
[Medusa Mobile template](${TEMPLATE_REPOSITORY}).

## Getting started

You need a running [Medusa v2 backend](https://docs.medusajs.com/learn/installation)
and a [React Native environment](https://reactnative.dev/docs/set-up-your-environment).

1. Set \`MEDUSA_BACKEND_URL\` and \`PUBLISHABLE_API_KEY\` in \`.env\`
   (\`.env.template\` documents every value).
2. Start Metro with \`npm start\`.
3. In another terminal, run \`npm run android\`, or install pods and run iOS:

   \`\`\`sh
   bundle install
   cd ios && bundle exec pod install && cd ..
   npm run ios
   \`\`\`

Run \`npm run verify\` for lint, TypeScript, and unit tests.

## Documentation

- [Development setup and validation](docs/development.md)
- [Architecture and dependency constraints](docs/architecture.md)
- [App hooks for cart, region, customer, and theme](docs/app-hooks.md)
- [Instructions for AI agents](AGENTS.md)

| Identifier               | Value                    |
| ------------------------ | ------------------------ |
| App and module name      | \`${names.appName}\`     |
| Android package, iOS ID  | \`${names.bundleId}\`    |
| npm package              | \`${names.packageName}\` |
`;
  fs.writeFileSync(path.join(root, 'README.md'), readme);
}

/**
 * Turns a checkout of the template at `root` into a new project. Edits files in
 * place; run it only on a fresh copy.
 */
function customizeProject(root, names, env) {
  prune(root);
  setDisplayName(root, names.displayName);
  setPackageName(root, names.packageName);
  setBundleId(root, names.bundleId);
  setAppName(root, names.appName);
  writeEnv(root, env);
  writeReadme(root, names);
}

module.exports = {
  ENV_KEYS,
  TEMPLATE_REPOSITORY,
  customizeProject,
  escapeAndroidString,
  escapeXml,
};
