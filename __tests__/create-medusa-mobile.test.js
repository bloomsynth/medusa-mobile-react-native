/**
 * @jest-environment node
 */
/* global afterAll, beforeAll, describe, expect, jest, test */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { PassThrough } = require('node:stream');
const {
  customizeProject,
} = require('../packages/create-medusa-mobile/lib/customize');
const {
  defaultTemplate,
  main,
} = require('../packages/create-medusa-mobile/lib/create');
const { resolveNames } = require('../packages/create-medusa-mobile/lib/names');

jest.setTimeout(60000);

const ROOT = path.join(__dirname, '..');
// Template files the CLI edits or prunes; app sources contain no app names.
const TEMPLATE_PATHS = [
  'android',
  'ios',
  '.github',
  'packages',
  '__tests__',
  '.gitignore',
  'app.json',
  'index.js',
  'package.json',
  'package-lock.json',
  '.env.template',
  'README.md',
  'LICENSE',
  'CODE_OF_CONDUCT.md',
  'SECURITY.md',
];
const SKIPPED = new Set(['node_modules', 'Pods', 'build', '.gradle', '.cxx']);

const temporaryDirectories = [];

function makeTemporaryDirectory() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-medusa-mobile-'));
  temporaryDirectories.push(dir);
  return dir;
}

function copyTemplate() {
  const dir = makeTemporaryDirectory();
  for (const relative of TEMPLATE_PATHS) {
    fs.cpSync(path.join(ROOT, relative), path.join(dir, relative), {
      recursive: true,
      filter: source => !SKIPPED.has(path.basename(source)),
    });
  }
  return dir;
}

function listFiles(root, relative = '') {
  return fs
    .readdirSync(path.join(root, relative), { withFileTypes: true })
    .flatMap(entry => {
      const entryPath = path.posix.join(relative, entry.name);
      return entry.isDirectory()
        ? [entryPath, ...listFiles(root, entryPath)]
        : [entryPath];
    });
}

function read(root, relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function git(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr);
  }
  return result.stdout;
}

function createIo() {
  const output = { stdout: '', stderr: '' };
  return {
    output,
    io: {
      stdin: { isTTY: false },
      stdout: { write: text => (output.stdout += text) },
      stderr: { write: text => (output.stderr += text) },
    },
  };
}

afterAll(() => {
  while (temporaryDirectories.length) {
    fs.rmSync(temporaryDirectories.pop(), { recursive: true, force: true });
  }
});

describe('resolveNames', () => {
  test('derives app, display, package, and bundle names from the directory', () => {
    expect(resolveNames('stores/acme-shop')).toEqual({
      names: {
        appName: 'AcmeShop',
        displayName: 'Acme Shop',
        packageName: 'acme-shop',
        bundleId: 'com.acmeshop',
      },
    });
  });

  test.each([
    ['an app name starting with a digit', '1shop', {}, /App name/],
    [
      'a bundle ID with a hyphen',
      'shop',
      { bundleId: 'com.acme-co.shop' },
      /Bundle ID/,
    ],
    ['a bundle ID with one segment', 'shop', { bundleId: 'shop' }, /Bundle ID/],
    ['a reserved Kotlin word', 'shop', { bundleId: 'com.new.shop' }, /"new"/],
    [
      'the template bundle ID',
      'shop',
      { bundleId: 'com.rnstartermedusa' },
      /template ID/,
    ],
    [
      'the template app name',
      'shop',
      { appName: 'RnStarterMedusa' },
      /template name/,
    ],
    [
      'a display name with a line break',
      'shop',
      { displayName: 'Acme\nShop' },
      /control characters/,
    ],
    [
      'an invalid npm name',
      'shop',
      { packageName: 'Acme Shop' },
      /npm package/,
    ],
  ])('rejects %s', (_, directory, options, message) => {
    expect(resolveNames(directory, options).errors).toEqual(
      expect.arrayContaining([expect.stringMatching(message)]),
    );
  });
});

describe('customizeProject', () => {
  const names = {
    appName: 'AcmeShop',
    displayName: "Acme & Co's Shop",
    packageName: 'acme-shop',
    bundleId: 'com.acme.shop',
  };
  let project;

  beforeAll(() => {
    project = copyTemplate();
    customizeProject(project, names, {
      backendUrl: 'https://store.example.com',
      publishableKey: 'pk_$&_test',
    });
  });

  test('leaves no template identifiers in file names or contents', () => {
    const leftovers = listFiles(project).filter(file => {
      if (/rnstartermedusa/i.test(file)) {
        return true;
      }
      const stat = fs.statSync(path.join(project, file));
      return stat.isFile() && /rnstartermedusa/i.test(read(project, file));
    });
    expect(leftovers).toEqual([]);
  });

  test('renames the native module, Xcode project, and Podfile target', () => {
    expect(JSON.parse(read(project, 'app.json')).name).toBe('AcmeShop');
    expect(read(project, 'ios/Podfile')).toContain("target 'AcmeShop' do");
    expect(read(project, 'ios/AcmeShop/AppDelegate.swift')).toContain(
      'withModuleName: "AcmeShop"',
    );
    expect(
      fs.existsSync(
        path.join(
          project,
          'ios/AcmeShop.xcodeproj/xcshareddata/xcschemes/AcmeShop.xcscheme',
        ),
      ),
    ).toBe(true);
    expect(read(project, 'android/settings.gradle')).toContain(
      "rootProject.name = 'AcmeShop'",
    );
  });

  test('applies the bundle ID to Android sources and the Xcode project', () => {
    const gradle = read(project, 'android/app/build.gradle');
    expect(gradle).toContain('namespace "com.acme.shop"');
    expect(gradle).toContain('applicationId "com.acme.shop"');
    const activity = read(
      project,
      'android/app/src/main/java/com/acme/shop/MainActivity.kt',
    );
    expect(activity).toMatch(/^package com\.acme\.shop$/m);
    expect(activity).toContain('getMainComponentName(): String = "AcmeShop"');
    const pbxproj = read(project, 'ios/AcmeShop.xcodeproj/project.pbxproj');
    expect(pbxproj.match(/PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g)).toEqual([
      'PRODUCT_BUNDLE_IDENTIFIER = com.acme.shop;',
      'PRODUCT_BUNDLE_IDENTIFIER = com.acme.shop;',
    ]);
  });

  test('escapes the display name for each platform', () => {
    expect(JSON.parse(read(project, 'app.json')).displayName).toBe(
      "Acme & Co's Shop",
    );
    expect(
      read(project, 'android/app/src/main/res/values/strings.xml'),
    ).toContain('<string name="app_name">Acme &amp; Co\\\'s Shop</string>');
    expect(read(project, 'ios/AcmeShop/info.plist')).toContain(
      '<string>Acme &amp; Co&apos;s Shop</string>',
    );
    expect(read(project, 'ios/AcmeShop/LaunchScreen.storyboard')).toContain(
      'text="Acme &amp; Co&apos;s Shop"',
    );
  });

  test('renames the npm package in the manifest and lockfile', () => {
    expect(JSON.parse(read(project, 'package.json')).name).toBe('acme-shop');
    const lockfile = JSON.parse(read(project, 'package-lock.json'));
    expect(lockfile.name).toBe('acme-shop');
    expect(lockfile.packages[''].name).toBe('acme-shop');
  });

  test('writes .env from the template with the given values', () => {
    const env = read(project, '.env');
    expect(env).toMatch(/^MEDUSA_BACKEND_URL=https:\/\/store\.example\.com$/m);
    expect(env).toMatch(/^PUBLISHABLE_API_KEY=pk_\$&_test$/m);
    expect(env).toMatch(/^DEFAULT_LOCALE=en-US$/m);
    expect(read(project, '.env.template')).toMatch(/^PUBLISHABLE_API_KEY=$/m);
  });

  test('removes template-repository files and keeps the license', () => {
    for (const file of [
      'packages',
      '__tests__/create-medusa-mobile.test.js',
      '.github/workflows/publish-cli.yml',
      '.github/ISSUE_TEMPLATE',
      'CODE_OF_CONDUCT.md',
      'SECURITY.md',
    ]) {
      expect(fs.existsSync(path.join(project, file))).toBe(false);
    }
    expect(fs.existsSync(path.join(project, 'LICENSE'))).toBe(true);
    expect(
      fs.existsSync(path.join(project, '.github/workflows/verify.yml')),
    ).toBe(true);
    expect(read(project, 'README.md')).toMatch(/^# Acme & Co's Shop$/m);
  });

  test('moves sources for a bundle ID nested under the template package', () => {
    const nested = copyTemplate();
    customizeProject(nested, {
      ...names,
      bundleId: 'com.rnstartermedusa.shop',
    });
    expect(
      listFiles(nested, 'android/app/src/main/java').filter(f =>
        f.endsWith('.kt'),
      ),
    ).toEqual([
      'android/app/src/main/java/com/rnstartermedusa/shop/MainActivity.kt',
      'android/app/src/main/java/com/rnstartermedusa/shop/MainApplication.kt',
    ]);
  });
});

describe('defaultTemplate', () => {
  test('uses the checkout when run from the template repository', () => {
    expect(
      defaultTemplate(path.join(ROOT, 'packages/create-medusa-mobile')),
    ).toEqual({ template: ROOT });
  });

  test('clones the release tag of its version when installed from npm', () => {
    const installed = path.join(
      makeTemporaryDirectory(),
      'node_modules/create-medusa-mobile',
    );
    fs.mkdirSync(installed, { recursive: true });
    const {
      version,
    } = require('../packages/create-medusa-mobile/package.json');
    expect(defaultTemplate(installed)).toEqual({
      template: 'https://github.com/bloomsynth/medusa-mobile-react-native.git',
      ref: `create-medusa-mobile@${version}`,
    });
  });
});

describe('main', () => {
  function commitTemplate(template = copyTemplate()) {
    git(template, ['init', '--quiet']);
    git(template, ['add', '--all']);
    git(template, [
      '-c',
      'user.name=Template',
      '-c',
      'user.email=template@example.com',
      'commit',
      '--quiet',
      '--message',
      'template',
    ]);
    return template;
  }

  test('creates and commits a customized project from a template repository', async () => {
    const template = commitTemplate();
    const target = path.join(makeTemporaryDirectory(), 'acme-shop');
    const { io, output } = createIo();
    // CI runners have no Git identity; the CLI passes io.env to git commit.
    const env = {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    };
    const code = await main(
      [target, '--template', template, '--skip-install', '--yes'],
      { ...io, env },
    );
    expect(output.stderr).toBe('');
    expect(code).toBe(0);
    expect(JSON.parse(read(target, 'app.json')).name).toBe('AcmeShop');
    expect(
      read(target, 'android/app/src/main/java/com/acmeshop/MainActivity.kt'),
    ).toMatch(/^package com\.acmeshop$/m);
    expect(git(target, ['log', '--format=%s'])).toBe(
      'chore: initialize project from Medusa Mobile template\n',
    );
    expect(git(target, ['status', '--porcelain'])).toBe('');
    // .env is ignored by the template's .gitignore, so it stays uncommitted.
    expect(git(target, ['ls-files', '.env'])).toBe('');
    expect(fs.existsSync(path.join(target, '.env'))).toBe(true);
  });

  test('clones a release tag without printing git notes', () => {
    const template = commitTemplate();
    git(template, ['tag', 'create-medusa-mobile@9.9.9']);
    const target = path.join(makeTemporaryDirectory(), 'acme-shop');
    // git writes to the terminal, so run the CLI as a process to capture it.
    const result = spawnSync(
      process.execPath,
      [
        path.join(
          ROOT,
          'packages/create-medusa-mobile/bin/create-medusa-mobile.js',
        ),
        target,
        '--template',
        template,
        '--ref',
        'create-medusa-mobile@9.9.9',
        '--skip-install',
        '--skip-git',
        '--yes',
      ],
      { encoding: 'utf8' },
    );
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    expect(result.stdout).not.toMatch(/detached HEAD|switching to/i);
    expect(JSON.parse(read(target, 'app.json')).name).toBe('AcmeShop');
  });

  test('refuses a non-empty directory and leaves it unchanged', async () => {
    const target = makeTemporaryDirectory();
    fs.writeFileSync(path.join(target, 'keep.txt'), 'mine');
    const { io, output } = createIo();
    const code = await main([target, '--template', ROOT, '--yes'], io);
    expect(code).toBe(1);
    expect(output.stderr).toContain('already exists and is not empty');
    expect(fs.readdirSync(target)).toEqual(['keep.txt']);
  });

  test('reports invalid names before cloning', async () => {
    const target = path.join(makeTemporaryDirectory(), 'shop');
    const { io, output } = createIo();
    const code = await main(
      [target, '--bundle-id', 'com.acme-co', '--yes'],
      io,
    );
    expect(code).toBe(1);
    expect(output.stderr).toContain('Bundle ID');
    expect(fs.existsSync(target)).toBe(false);
  });

  test('removes the clone when customizing fails', async () => {
    const template = copyTemplate();
    fs.rmSync(
      path.join(template, 'ios/RnStarterMedusa/LaunchScreen.storyboard'),
    );
    commitTemplate(template);
    const target = path.join(makeTemporaryDirectory(), 'shop');
    const { io, output } = createIo();
    const code = await main(
      [target, '--template', template, '--skip-install', '--skip-git', '--yes'],
      io,
    );
    expect(code).toBe(1);
    expect(output.stderr).toContain('LaunchScreen.storyboard is missing');
    expect(fs.existsSync(target)).toBe(false);
  });

  test('prompts for missing names and connection values', async () => {
    const template = commitTemplate();
    const target = path.join(makeTemporaryDirectory(), 'acme-shop');
    const stdin = new PassThrough();
    stdin.isTTY = true;
    const { io, output } = createIo();
    // Accept the app name, set the display name, retry an invalid bundle ID,
    // accept the backend URL, and set the publishable key.
    stdin.end(
      ['', 'Acme Store', 'com.acme-co', 'com.acme.store', '', 'pk_1'].join(
        '\n',
      ),
    );
    const code = await main(
      [target, '--template', template, '--skip-install', '--skip-git'],
      { ...io, stdin },
    );
    expect(output.stderr).toBe('');
    expect(code).toBe(0);
    expect(output.stdout).toContain(
      'App name (letters and digits) (AcmeShop): ',
    );
    expect(output.stdout).toContain('Bundle ID needs at least two');
    expect(JSON.parse(read(target, 'app.json'))).toEqual({
      name: 'AcmeShop',
      displayName: 'Acme Store',
    });
    expect(read(target, 'android/app/build.gradle')).toContain(
      'applicationId "com.acme.store"',
    );
    const env = read(target, '.env');
    expect(env).toMatch(/^MEDUSA_BACKEND_URL=http:\/\/10\.0\.2\.2:9000$/m);
    expect(env).toMatch(/^PUBLISHABLE_API_KEY=pk_1$/m);
  });

  test('stops when prompted input ends early', async () => {
    const target = path.join(makeTemporaryDirectory(), 'shop');
    const stdin = new PassThrough();
    stdin.isTTY = true;
    stdin.end('Shop\n');
    const { io, output } = createIo();
    expect(await main([target], { ...io, stdin })).toBe(1);
    expect(output.stderr).toContain('Input ended');
    expect(fs.existsSync(target)).toBe(false);
  });

  test('prints usage', async () => {
    const { io, output } = createIo();
    expect(await main(['--help'], io)).toBe(0);
    expect(output.stdout).toContain('Usage: create-medusa-mobile <directory>');
  });
});
