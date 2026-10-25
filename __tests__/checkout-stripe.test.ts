import { HttpTypes } from '@medusajs/types';
import {
  getBillingDetails,
  getStripeClientSecret,
  presentStripePayment,
} from '../app/utils/stripe';

const collection = (
  sessions: Partial<HttpTypes.StorePaymentSession>[],
): HttpTypes.StorePaymentCollection =>
  ({ payment_sessions: sessions }) as HttpTypes.StorePaymentCollection;

const stripeWith = ({
  initError,
  presentError,
}: {
  initError?: { code: string; message: string };
  presentError?: { code: string; message: string };
} = {}) =>
  ({
    initPaymentSheet: jest.fn(async () => ({ error: initError })),
    presentPaymentSheet: jest.fn(async () => ({ error: presentError })),
  }) as unknown as Parameters<typeof presentStripePayment>[0];

const paymentInput = {
  clientSecret: 'pi_123_secret_abc',
  merchantDisplayName: 'Store',
  billingDetails: { email: 'buyer@example.com' },
};

describe('getStripeClientSecret', () => {
  test('reads the client secret from the pending Stripe session', () => {
    const secret = getStripeClientSecret(
      collection([
        {
          provider_id: 'pp_system_default',
          status: 'pending',
          data: { client_secret: 'wrong' },
        },
        {
          provider_id: 'pp_stripe_stripe',
          status: 'pending',
          data: { client_secret: 'pi_123_secret_abc' },
        },
      ]),
    );
    expect(secret).toBe('pi_123_secret_abc');
  });

  test('ignores sessions that are no longer pending or have no secret', () => {
    expect(
      getStripeClientSecret(
        collection([
          {
            provider_id: 'pp_stripe_stripe',
            status: 'authorized',
            data: { client_secret: 'pi_old_secret' },
          },
        ]),
      ),
    ).toBeUndefined();
    expect(
      getStripeClientSecret(
        collection([
          { provider_id: 'pp_stripe_stripe', status: 'pending', data: {} },
        ]),
      ),
    ).toBeUndefined();
    expect(getStripeClientSecret(undefined)).toBeUndefined();
  });
});

describe('getBillingDetails', () => {
  test('prefills Stripe with the cart billing address', () => {
    const cart = {
      email: 'buyer@example.com',
      billing_address: {
        first_name: 'Asha',
        last_name: 'Rao',
        address_1: '1 MG Road',
        city: 'Bengaluru',
        postal_code: '560001',
        country_code: 'in',
        phone: '9999999999',
      },
    } as HttpTypes.StoreCart;

    expect(getBillingDetails(cart)).toEqual({
      email: 'buyer@example.com',
      phone: '9999999999',
      name: 'Asha Rao',
      address: {
        line1: '1 MG Road',
        line2: undefined,
        city: 'Bengaluru',
        state: undefined,
        postalCode: '560001',
        country: 'IN',
      },
    });
  });
});

describe('presentStripePayment', () => {
  test('opens the sheet for the session and reports a completed payment', async () => {
    const stripe = stripeWith();

    await expect(presentStripePayment(stripe, paymentInput)).resolves.toBe(
      'paid',
    );
    expect(stripe.initPaymentSheet).toHaveBeenCalledWith({
      paymentIntentClientSecret: 'pi_123_secret_abc',
      merchantDisplayName: 'Store',
      defaultBillingDetails: { email: 'buyer@example.com' },
    });
    expect(stripe.presentPaymentSheet).toHaveBeenCalled();
  });

  test('treats closing the sheet as a cancel, not an error', async () => {
    const stripe = stripeWith({
      presentError: { code: 'Canceled', message: 'The payment was canceled' },
    });

    await expect(presentStripePayment(stripe, paymentInput)).resolves.toBe(
      'canceled',
    );
  });

  test('surfaces declines and setup failures without paying', async () => {
    await expect(
      presentStripePayment(
        stripeWith({
          presentError: { code: 'Failed', message: 'Your card was declined.' },
        }),
        paymentInput,
      ),
    ).rejects.toThrow('Your card was declined.');

    const stripe = stripeWith({
      initError: { code: 'Failed', message: 'Invalid client secret' },
    });
    await expect(presentStripePayment(stripe, paymentInput)).rejects.toThrow(
      'Invalid client secret',
    );
    expect(stripe.presentPaymentSheet).not.toHaveBeenCalled();
  });
});
