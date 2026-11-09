'use strict';

const path = require('node:path');

// Identifiers used by the template's native projects and package manifest.
const TEMPLATE = Object.freeze({
  appName: 'RnStarterMedusa',
  packageName: 'medusa-mobile-react-native',
  androidPackage: 'com.rnstartermedusa',
});

// Kotlin and Java reserve these words, so they cannot be package segments.
const RESERVED_SEGMENTS = new Set(
  (
    'abstract as assert boolean break byte case catch char class const ' +
    'continue default do double else enum extends false final finally float ' +
    'for fun goto if implements import in instanceof int interface is long ' +
    'native new null object package private protected public return short ' +
    'static strictfp super switch synchronized this throw throws transient ' +
    'true try typealias typeof val var void volatile when while'
  ).split(' '),
);

const NPM_NAME = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;

function words(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

function toAppName(value) {
  return words(value)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('');
}

function toDisplayName(value) {
  return words(value)
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function toPackageName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-._~]+/g, '-')
    .replace(/^[-._]+|-+$/g, '');
}

function validateAppName(appName) {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(appName)) {
    return 'App name must start with a letter and contain only letters and digits.';
  }
  if (appName === TEMPLATE.appName) {
    return `App name must differ from the template name ${TEMPLATE.appName}.`;
  }
  if (['React', 'Pods', 'Test', 'Tests'].includes(appName)) {
    return `App name ${appName} is reserved by React Native or CocoaPods.`;
  }
  return undefined;
}

function validatePackageName(packageName) {
  if (!packageName || packageName.length > 214 || !NPM_NAME.test(packageName)) {
    return 'Package name must be a valid lowercase npm package name.';
  }
  return undefined;
}

function validateBundleId(bundleId) {
  const segments = bundleId.split('.');
  // Android disallows hyphens and iOS disallows underscores, so allow only
  // letters and digits to keep one identifier valid on both platforms.
  if (
    segments.length < 2 ||
    segments.some(segment => !/^[A-Za-z][A-Za-z0-9]*$/.test(segment))
  ) {
    return (
      'Bundle ID needs at least two dot-separated segments, each starting ' +
      'with a letter and containing only letters and digits (com.example.store).'
    );
  }
  const reserved = segments.find(segment =>
    RESERVED_SEGMENTS.has(segment.toLowerCase()),
  );
  if (reserved) {
    return `Bundle ID segment "${reserved}" is a reserved Java or Kotlin word.`;
  }
  if (bundleId.toLowerCase() === TEMPLATE.androidPackage) {
    return `Bundle ID must differ from the template ID ${TEMPLATE.androidPackage}.`;
  }
  return undefined;
}

function validateDisplayName(displayName) {
  if (!displayName.trim()) {
    return 'Display name cannot be empty.';
  }
  const isControl = code => code < 0x20 || code === 0x7f;
  if ([...displayName].some(char => isControl(char.charCodeAt(0)))) {
    return 'Display name cannot contain control characters.';
  }
  return undefined;
}

/**
 * Derives the project names from the target directory and explicit options,
 * and validates them. Returns `{names}` or `{errors}`.
 */
function resolveNames(directory, options = {}) {
  const base = path.basename(path.resolve(directory));
  const appName = options.appName ?? toAppName(base);
  const names = {
    appName,
    displayName: options.displayName ?? toDisplayName(base),
    packageName: options.packageName ?? toPackageName(base),
    bundleId: options.bundleId ?? `com.${appName.toLowerCase()}`,
  };
  const errors = [
    validateAppName(names.appName),
    validateDisplayName(names.displayName),
    validatePackageName(names.packageName),
    validateBundleId(names.bundleId),
  ].filter(Boolean);
  return errors.length ? { errors } : { names };
}

module.exports = {
  TEMPLATE,
  resolveNames,
  toAppName,
  toDisplayName,
  toPackageName,
  validateAppName,
  validateBundleId,
  validateDisplayName,
  validatePackageName,
};
