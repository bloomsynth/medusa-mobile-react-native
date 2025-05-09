import {z} from 'zod';

export type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

export const CHECKOUT_STEPS: {
  id: CheckoutStep;
  title: string;
  icon: 'environment' | 'inbox' | 'wallet' | 'profile';
}[] = [
  {id: 'address', title: 'address', icon: 'environment'},
  {id: 'delivery', title: 'delivery', icon: 'inbox'},
  {id: 'payment', title: 'payment', icon: 'wallet'},
  {id: 'review', title: 'review', icon: 'profile'},
];

export type AddressFields = {
  first_name: string;
  last_name: string;
  address_1: string;
  company?: string;
  postal_code: string;
  city: string;
  country_code: string;
  province?: string;
  phone: string;
};

export const addressSchema = z.object({
  first_name: z.string().min(1, 'first-name-is-required'),
  last_name: z.string().min(1, 'last-name-is-required'),
  address_1: z.string().min(1, 'address-is-required'),
  company: z.string().optional().or(z.literal('')),
  postal_code: z.string().min(1, 'postal-code-is-required'),
  city: z.string().min(1, 'city-is-required'),
  country_code: z.string().min(1, 'country-is-required'),
  province: z.string().optional().or(z.literal('')),
  phone: z.string().min(1, 'phone-is-required'),
}) satisfies z.ZodType<AddressFields>;

export const createEmptyAddress = (): AddressFields =>
  Object.fromEntries(
    Object.keys(addressSchema.shape).map(key => [key, '']),
  ) as AddressFields;

export const checkoutSchema = z.object({
  email: z.string().email('please-enter-a-valid-email'),
  shipping_address: addressSchema,
  billing_address: addressSchema,
  use_same_billing: z.boolean(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export type PaymentProvider = {
  id: string;
  name: string;
  description?: string;
  is_installed: boolean;
};

export const PAYMENT_PROVIDER_DETAILS_MAP: Record<
  string,
  {name: string; hasExternalStep: boolean}
> = {
  pp_system_default: {name: 'Manual', hasExternalStep: false},
  pp_stripe_stripe: {name: 'Stripe', hasExternalStep: true},
};
