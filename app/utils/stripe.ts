import { STRIPE_PUBLISHABLE_KEY } from '@env';
import { HttpTypes } from '@medusajs/types';
import {
  BillingDetails,
  PaymentSheetError,
  useStripe,
} from '@stripe/stripe-react-native';

export const STRIPE_PROVIDER_ID = 'pp_stripe_stripe';
export const stripePublishableKey = STRIPE_PUBLISHABLE_KEY || '';

type PaymentSheetMethods = Pick<
  ReturnType<typeof useStripe>,
  'initPaymentSheet' | 'presentPaymentSheet'
>;

// The Medusa Stripe provider stores the PaymentIntent client secret in the
// pending session's data.
export const getStripeClientSecret = (
  paymentCollection?: HttpTypes.StorePaymentCollection | null,
) => {
  const session = paymentCollection?.payment_sessions?.find(
    s => s.provider_id === STRIPE_PROVIDER_ID && s.status === 'pending',
  );
  const clientSecret = session?.data?.client_secret;
  return typeof clientSecret === 'string' ? clientSecret : undefined;
};

export const getBillingDetails = (
  cart: HttpTypes.StoreCart,
): BillingDetails => {
  const address = cart.billing_address ?? cart.shipping_address;
  const name = [address?.first_name, address?.last_name]
    .filter(Boolean)
    .join(' ');
  return {
    email: cart.email || undefined,
    phone: address?.phone || undefined,
    name: name || undefined,
    address: address
      ? {
          line1: address.address_1 || undefined,
          line2: address.address_2 || undefined,
          city: address.city || undefined,
          state: address.province || undefined,
          postalCode: address.postal_code || undefined,
          country: address.country_code?.toUpperCase() || undefined,
        }
      : undefined,
  };
};

// Opens the Stripe Payment Sheet, which collects the card and confirms the
// PaymentIntent (including 3D Secure). Resolves 'canceled' if the customer
// closes the sheet and throws on any other failure.
export const presentStripePayment = async (
  stripe: PaymentSheetMethods,
  {
    clientSecret,
    merchantDisplayName,
    billingDetails,
  }: {
    clientSecret: string;
    merchantDisplayName: string;
    billingDetails: BillingDetails;
  },
): Promise<'paid' | 'canceled'> => {
  const { error: initError } = await stripe.initPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName,
    defaultBillingDetails: billingDetails,
  });
  if (initError) {
    throw new Error(initError.message);
  }

  const { error } = await stripe.presentPaymentSheet();
  if (error?.code === PaymentSheetError.Canceled) {
    return 'canceled';
  }
  if (error) {
    throw new Error(error.message);
  }
  return 'paid';
};
