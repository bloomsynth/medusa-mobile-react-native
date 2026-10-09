import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Alert } from 'react-native';
import Checkout from '../app/screens/checkout';
import Button from '../app/components/common/button';
import ShippingStep from '../app/components/checkout/steps/shipping-step';
import PaymentStep from '../app/components/checkout/steps/payment-step';
import { useCart } from '../app/data/cart-context';

jest.mock('@fluent/react', () => ({
  useLocalization: () => ({ l10n: { getString: (key: string) => key } }),
}));
jest.mock('../app/data/cart-context', () => ({ useCart: jest.fn() }));
jest.mock('../app/data/hooks', () => ({
  useCountries: () => [],
  useCurrentCheckoutStep: () => 'delivery',
  useActivePaymentSession: () => undefined,
}));
jest.mock('../app/api/client', () => ({ __esModule: true, default: {} }));
jest.mock('../app/components/common/navbar', () => () => null);
jest.mock('../app/components/common/button', () => () => null);
jest.mock('../app/components/checkout/checkout-steps', () => () => null);
jest.mock('../app/components/checkout/steps/address-step', () => () => null);
jest.mock('../app/components/checkout/steps/shipping-step', () => () => null);
jest.mock('../app/components/checkout/steps/payment-step', () => () => null);
jest.mock('../app/components/checkout/steps/review-step', () => () => null);
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({}) }));

let renderer: ReactTestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  await ReactTestRenderer.act(async () => renderer?.unmount());
  jest.restoreAllMocks();
});

async function renderCheckout(hasShipping: boolean) {
  jest.mocked(useCart).mockReturnValue({
    cart: {
      id: 'cart_test',
      items: [{ id: 'item_test' }],
      shipping_methods: hasShipping
        ? [{ shipping_option_id: 'shipping_test' }]
        : [],
    },
  } as unknown as ReturnType<typeof useCart>);
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Checkout />);
  });
}

test('missing shipping method disables continuation and guards the handler', async () => {
  await renderCheckout(false);
  expect(renderer.root.findByType(Button).props.disabled).toBe(true);
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByType(Button).props.onPress();
  });
  expect(renderer.root.findAllByType(PaymentStep)).toHaveLength(0);
  expect(Alert.alert).toHaveBeenCalledWith('error', 'select-shipping-method');
});

test('a saved shipping method allows continuing to payment', async () => {
  await renderCheckout(true);
  expect(renderer.root.findByType(Button).props.disabled).toBe(false);
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByType(Button).props.onPress();
  });
  expect(renderer.root.findAllByType(PaymentStep)).toHaveLength(1);
});

test('shipping updates block continuation until the save finishes', async () => {
  await renderCheckout(true);
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(ShippingStep).props.onUpdatingChange(true);
  });
  expect(renderer.root.findByType(Button).props.disabled).toBe(true);
  await ReactTestRenderer.act(async () => {
    await renderer.root.findByType(Button).props.onPress();
  });
  expect(renderer.root.findAllByType(PaymentStep)).toHaveLength(0);
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(ShippingStep).props.onUpdatingChange(false);
  });
  expect(renderer.root.findByType(Button).props.disabled).toBe(false);
});
