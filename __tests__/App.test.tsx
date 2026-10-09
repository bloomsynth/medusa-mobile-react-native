/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../app/app';

jest.mock('../app/api/client', () => ({
  __esModule: true,
  default: {
    store: {
      region: { list: jest.fn().mockResolvedValue({ regions: [] }) },
      customer: {
        retrieve: jest.fn().mockRejectedValue(new Error('Not signed in')),
      },
    },
  },
}));

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  expect(renderer!.toJSON()).not.toBeNull();

  await ReactTestRenderer.act(async () => {
    renderer!.unmount();
  });
});
