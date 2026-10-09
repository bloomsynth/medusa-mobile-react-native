import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, createEmptyAddress } from '../app/types/checkout';

test('URL polyfill preserves SDK URL and query construction', () => {
  const url = new URL('/store/products', 'http://10.0.2.2:9000');
  url.searchParams.set('fields', '+variants.inventory_quantity');
  expect(url.origin).toBe('http://10.0.2.2:9000');
  expect(url.pathname).toBe('/store/products');
  expect(url.searchParams.get('fields')).toBe('+variants.inventory_quantity');
  expect(new URLSearchParams('q=hello%20world').get('q')).toBe('hello world');
});

test('checkout resolver returns field errors for invalid input', async () => {
  const result = await zodResolver(checkoutSchema)(
    {
      email: 'invalid',
      shipping_address: createEmptyAddress(),
      billing_address: createEmptyAddress(),
      use_same_billing: true,
    },
    {},
    { fields: {}, shouldUseNativeValidation: false },
  );
  expect(result.errors).toHaveProperty(
    'email.message',
    'please-enter-a-valid-email',
  );
  expect(result.errors).toHaveProperty(
    'shipping_address.first_name.message',
    'first-name-is-required',
  );
  expect(result.errors).toHaveProperty(
    'billing_address.postal_code.message',
    'postal-code-is-required',
  );
});

test('checkout resolver preserves valid input', async () => {
  const address = {
    first_name: 'Test',
    last_name: 'Customer',
    address_1: '123 Test St',
    postal_code: '12345',
    city: 'Berlin',
    country_code: 'de',
    phone: '123456789',
  };
  const input = {
    email: 'test@example.com',
    shipping_address: address,
    billing_address: address,
    use_same_billing: true,
  };
  const result = await zodResolver(checkoutSchema)(
    input,
    {},
    { fields: {}, shouldUseNativeValidation: false },
  );
  expect(result.errors).toEqual({});
  expect(result.values).toEqual(input);
});

test('legacy storage supports persisted cart and auth token APIs', async () => {
  const key = 'dependency-compatibility-test';
  expect(await AsyncStorage.getItem(key)).toBeNull();
  await AsyncStorage.setItem(key, 'cart_test');
  expect(await AsyncStorage.getItem(key)).toBe('cart_test');
  await AsyncStorage.removeItem(key);
  expect(await AsyncStorage.getItem(key)).toBeNull();
});
