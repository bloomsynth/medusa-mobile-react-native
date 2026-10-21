/* global test, expect */

const { readFileSync } = require('node:fs');
const { dirname, join } = require('node:path');

test('React matches the renderer embedded in React Native', () => {
  const renderer = readFileSync(
    join(
      dirname(require.resolve('react-native/package.json')),
      'Libraries/Renderer/implementations/ReactFabric-dev.js',
    ),
    'utf8',
  );
  const rendererVersion = renderer.match(/reconcilerVersion: "([^"]+)"/);
  expect(rendererVersion).not.toBeNull();
  expect(require('react/package.json').version).toBe(rendererVersion?.[1]);
  expect(require('react-test-renderer/package.json').version).toBe(
    rendererVersion?.[1],
  );
});

test.each([
  '@react-native/babel-preset',
  '@react-native/eslint-config',
  '@react-native/jest-preset',
  '@react-native/metro-config',
  '@react-native/typescript-config',
])('%s stays aligned with the installed React Native release', name => {
  // Some config packages do not export package.json to module resolvers.
  const packageFile = join(
    dirname(dirname(require.resolve('react-native/package.json'))),
    name,
    'package.json',
  );
  expect(JSON.parse(readFileSync(packageFile, 'utf8')).version).toBe(
    JSON.parse(
      readFileSync(require.resolve('react-native/package.json'), 'utf8'),
    ).version,
  );
});
