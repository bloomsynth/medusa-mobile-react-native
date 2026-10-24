import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpTypes } from '@medusajs/types';
import RelatedProducts from '../app/components/product/related-products';
import apiClient from '../app/api/client';

jest.mock('@fluent/react', () => ({
  useLocalization: () => ({ l10n: { getString: (key: string) => key } }),
}));
jest.mock('../app/api/client', () => ({
  __esModule: true,
  default: { store: { product: { list: jest.fn() } } },
}));
jest.mock('../app/data/region-context', () => ({
  useRegion: () => ({ region: { id: 'reg_test' } }),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({}),
  TabActions: { jumpTo: jest.fn() },
}));

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

const product = (overrides: Partial<HttpTypes.StoreProduct>) =>
  ({ id: 'prod_current', title: 'Current', ...overrides } as never);

async function renderRelated(current: HttpTypes.StoreProduct) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={queryClient}>
        <RelatedProducts product={current} />
      </QueryClientProvider>,
    );
  });
  // React Query batches result notifications on timers.
  await ReactTestRenderer.act(async () => {
    await jest.runOnlyPendingTimersAsync();
  });
}

const visibleText = () =>
  renderer.root.findAllByType(Text).map(node => node.props.children);

const respondWith = (products: Partial<HttpTypes.StoreProduct>[]) =>
  listProducts.mockResolvedValue({
    products,
    count: products.length,
    offset: 0,
    limit: 10,
  } as never);

test('suggests other products from the same collection in the current region', async () => {
  respondWith([
    { id: 'prod_current', title: 'Current' },
    { id: 'prod_2', title: 'Medusa Sweatpants' },
  ]);
  await renderRelated(
    product({ collection_id: 'pcol_1', categories: [{ id: 'pcat_1' }] as never }),
  );
  expect(listProducts).toHaveBeenCalledWith(
    expect.objectContaining({
      collection_id: ['pcol_1'],
      region_id: 'reg_test',
      limit: 11,
    }),
  );
  expect(listProducts.mock.calls[0][0]).not.toHaveProperty('category_id');
  expect(visibleText()).toEqual(['related-products', 'Medusa Sweatpants']);
});

test('falls back to shared categories when the product has no collection', async () => {
  respondWith([{ id: 'prod_2', title: 'Medusa Shorts' }]);
  await renderRelated(
    product({
      collection_id: null,
      categories: [{ id: 'pcat_1' }, { id: 'pcat_2' }] as never,
    }),
  );
  expect(listProducts).toHaveBeenCalledWith(
    expect.objectContaining({ category_id: ['pcat_1', 'pcat_2'] }),
  );
  expect(visibleText()).toContain('Medusa Shorts');
});

test('renders nothing when the product has no collection or category', async () => {
  await renderRelated(product({ collection_id: null, categories: [] }));
  expect(listProducts).not.toHaveBeenCalled();
  expect(renderer.toJSON()).toBeNull();
});

test('hides the section when the only match is the product itself', async () => {
  respondWith([{ id: 'prod_current', title: 'Current' }]);
  await renderRelated(product({ collection_id: 'pcol_1' }));
  expect(listProducts).toHaveBeenCalled();
  expect(renderer.toJSON()).toBeNull();
});
