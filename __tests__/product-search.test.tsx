import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Search, { SEARCH_DEBOUNCE_MS } from '../app/screens/search';
import apiClient from '../app/api/client';

jest.mock('@fluent/react', () => ({
  useLocalization: () => ({
    l10n: {
      getString: (key: string, args?: Record<string, string>) =>
        args ? `${key}:${JSON.stringify(args)}` : key,
    },
  }),
}));
jest.mock('../app/api/client', () => ({
  __esModule: true,
  default: { store: { product: { list: jest.fn() } } },
}));
jest.mock('../app/data/region-context', () => ({
  useRegion: () => ({ region: { id: 'reg_test' } }),
}));
jest.mock('../app/styles/hooks', () => ({ useColors: () => ({}) }));
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({}) }));

const listProducts = jest.mocked(apiClient.store.product.list);

let renderer: ReactTestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(async () => {
  await ReactTestRenderer.act(async () => renderer?.unmount());
  jest.useRealTimers();
  jest.clearAllMocks();
});

async function renderSearch() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <Search />
      </QueryClientProvider>,
    );
  });
}

async function typeQuery(text: string) {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ testID: 'search-input' }).props.onChangeText(text);
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });
  await flushQueries();
}

// React Query batches result notifications on timers.
async function flushQueries() {
  await ReactTestRenderer.act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
}

const visibleText = () =>
  renderer.root.findAllByType(Text).map(node => node.props.children);

test('shows a prompt and does not query until a search term is entered', async () => {
  await renderSearch();
  await typeQuery('   ');
  expect(listProducts).not.toHaveBeenCalled();
  expect(visibleText()).toContain('search-prompt');
});

test('searches products by the trimmed term in the current region', async () => {
  listProducts.mockResolvedValue({
    products: [{ id: 'prod_1', title: 'Medusa Hoodie' }],
    count: 1,
    offset: 0,
    limit: 10,
  } as never);
  await renderSearch();
  await typeQuery('  hoodie ');
  expect(listProducts).toHaveBeenCalledTimes(1);
  expect(listProducts).toHaveBeenCalledWith(
    expect.objectContaining({ q: 'hoodie', region_id: 'reg_test', offset: 0 }),
  );
  expect(visibleText()).toContain('Medusa Hoodie');
});

test('only queries the latest term after typing settles', async () => {
  listProducts.mockResolvedValue({
    products: [],
    count: 0,
    offset: 0,
    limit: 10,
  } as never);
  await renderSearch();
  await ReactTestRenderer.act(async () => {
    const input = renderer.root.findByProps({ testID: 'search-input' });
    input.props.onChangeText('ho');
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    input.props.onChangeText('hood');
  });
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });
  expect(listProducts).toHaveBeenCalledTimes(1);
  expect(listProducts).toHaveBeenCalledWith(
    expect.objectContaining({ q: 'hood' }),
  );
});

test('shows an empty state naming the term when nothing matches', async () => {
  listProducts.mockResolvedValue({
    products: [],
    count: 0,
    offset: 0,
    limit: 10,
  } as never);
  await renderSearch();
  await typeQuery('nothing');
  expect(visibleText()).toContain(
    'no-products-found-for:{"query":"nothing"}',
  );
});
