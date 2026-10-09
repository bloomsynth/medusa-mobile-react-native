module.exports = {
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest.style-mock.js',
  },
  transform: {
    '^.+\\.ttf$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer',
    ),
  },
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native.*|@react-native.*|@react-navigation.*)/)',
  ],
};
