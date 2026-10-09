import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { HttpTypes } from '@medusajs/types';
import ReviewStep from '../app/components/checkout/steps/review-step';

jest.mock('@fluent/react', () => ({
  useLocalization: () => ({ l10n: { getString: (key: string) => key } }),
}));
jest.mock('../app/components/cart/cart-content', () => () => null);

let renderer: ReactTestRenderer.ReactTestRenderer;
afterEach(async () => {
  await ReactTestRenderer.act(async () => renderer?.unmount());
});

async function summary(selectedProviderId?: string, sessionStatus?: string) {
  const cart = {
    shipping_methods: [],
    payment_collection: sessionStatus
      ? {
          payment_sessions: [
            { provider_id: 'pp_system_default', status: sessionStatus },
          ],
        }
      : undefined,
  } as unknown as HttpTypes.StoreCart;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <ReviewStep cart={cart} selectedProviderId={selectedProviderId} />,
    );
  });
  return JSON.stringify(renderer.toJSON());
}

test('shows the selected provider even before refreshed cart sessions arrive', async () => {
  const output = await summary('pp_system_default');
  expect(output).toContain('Manual');
  expect(output).not.toContain('no-payment-method-selected');
});

test('the current selection takes precedence over an older cart session', async () => {
  const output = await summary('pp_stripe_stripe', 'pending');
  expect(output).toContain('Stripe');
  expect(output).not.toContain('Manual');
});

test('resumed checkout can display an authorized payment session', async () => {
  expect(await summary(undefined, 'authorized')).toContain('Manual');
});
