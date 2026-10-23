# App hooks

Shared app state is exposed through React context hooks. Use these hooks from
screens and components instead of calling the Medusa SDK directly for cart,
customer, or region changes. The [architecture guide](architecture.md#state-and-api-flow)
explains how the providers depend on each other.

| Hook                            | Source                          |
| ------------------------------- | ------------------------------- |
| `useCart`                       | `app/data/cart-context.tsx`     |
| `useRegion`, `useCountries`     | `app/data/region-context.tsx`   |
| `useCustomer`                   | `app/data/customer-context.tsx` |
| `useLocale`                     | `app/data/locale-context.tsx`   |
| Derived cart and checkout hooks | `app/data/hooks.ts`             |
| Theme hooks                     | `app/styles/hooks.tsx`          |

Each context hook throws when used outside its provider. The providers are
mounted in `app/app.tsx`.

## Cart

`useCart` exposes the current cart and the mutation methods. Each method saves
the cart returned by the server in context, so totals and checkout state stay in
sync. Add new cart operations to `CartProvider` rather than updating a separate
copy of the cart.

```tsx
import { useCart } from '@data/cart-context';

function MyComponent() {
  const {
    cart, // HttpTypes.StoreCart | undefined
    addToCart, // (variantId, quantity) => Promise<void>
    updateLineItem, // (lineItemId, quantity) => Promise<void>
    updateCart, // (data: CartUpdateData) => Promise<StoreCart>
    applyPromoCode, // (code) => Promise<boolean>
    removePromoCode, // (code) => Promise<void>
    setShippingMethod, // (shippingOptionId) => Promise<StoreCart>
    resetCart, // Clears the stored cart ID and cart state
  } = useCart();
}
```

### Line items

```tsx
const { addToCart, updateLineItem } = useCart();

// Quantity is required when adding items
await addToCart(variantId, 1);

// Update to a specific quantity
await updateLineItem(lineItemId, 2);

// Remove an item by setting its quantity to 0
await updateLineItem(lineItemId, 0);
```

### Promotions and shipping

```tsx
const { applyPromoCode, removePromoCode, setShippingMethod } = useCart();

// Returns whether the promotion was applied
const applied = await applyPromoCode('SUMMER2024');
await removePromoCode('SUMMER2024');

await setShippingMethod(shippingOptionId);
```

### Reading cart data

`cart` is undefined until the region and cart have loaded.

```tsx
const { cart } = useCart();

const items = cart?.items ?? [];
const total = cart?.total;
const appliedPromotions = cart?.promotions;
const currentShipping = cart?.shipping_methods?.[0];
```

### Lifecycle

- The cart ID is persisted in AsyncStorage under `cart_id`.
- Once a region is available, `CartProvider` restores the stored cart or creates
  one for that region. Components do not create carts explicitly.
- When the selected region changes, the cart's region is updated so prices and
  currency follow the region. If that update fails, the cart is reset.
- On login, the existing guest cart is linked to the customer. On logout, the
  cart is reset.

## Region

`useRegion` exposes the selected region and its setter.

```tsx
import { useRegion } from '@data/region-context';
import apiClient from '@api/client';

function MyComponent() {
  const { region, setRegion } = useRegion();

  const changeRegion = async (regionId: string) => {
    const { region: newRegion } =
      await apiClient.store.region.retrieve(regionId);
    // Persists the selection and updates the cart region
    setRegion(newRegion);
  };
}
```

The built-in region selector is the `RegionSelect` route:

```tsx
navigation.navigate('RegionSelect');
```

Region persistence:

- The region ID is stored in AsyncStorage under `region_id`.
- On first launch, the first region returned by the Store API is selected.
- On later launches, the stored region is retrieved again.

### Countries

There are two `useCountries` hooks:

```tsx
// Raw region countries: HttpTypes.StoreRegionCountry[] | undefined
import { useCountries } from '@data/region-context';

// Picker options: Array<{ label: string; value: string }>
import { useCountries } from '@data/hooks';
```

## Customer

`useCustomer` handles authentication and customer data.

```tsx
import { useCustomer } from '@data/customer-context';
import { useLoggedIn } from '@data/hooks';

function MyComponent() {
  const {
    customer, // HttpTypes.StoreCustomer | undefined
    login, // (email, password) => Promise<void>
    logout, // () => Promise<void>
    register, // (email, password, firstName, lastName) => Promise<void>
    refreshCustomer, // Fetch the latest customer data
    updateCustomer, // (data: HttpTypes.StoreUpdateCustomer) => Promise<void>
  } = useCustomer();
  const isLoggedIn = useLoggedIn();
}
```

The methods rethrow API errors; callers handle them.

```tsx
try {
  await login(email, password);
} catch (error) {
  // Show the error
}

// Creates the customer, then logs in
await register(email, password, firstName, lastName);

await updateCustomer({ first_name: 'John', last_name: 'Doe' });

// Logs out and resets the cart
await logout();
```

Session behavior:

- The SDK in `app/api/client.tsx` stores the JWT in AsyncStorage under
  `auth_token` and attaches it to requests.
- `CustomerProvider` calls `refreshCustomer` on mount to restore the session.
- A successful login fetches the customer and links the cart to them.

## Derived hooks

```tsx
import {
  useProductQuantity,
  useVariantQuantity,
  useCartQuantity,
  useCurrentCheckoutStep,
  useActivePaymentSession,
  useLoggedIn,
} from '@data/hooks';

const productQuantity = useProductQuantity(productId); // In the cart
const variantQuantity = useVariantQuantity(variantId); // In the cart
const cartQuantity = useCartQuantity(); // Total items in the cart

// 'address' | 'delivery' | 'payment' | 'review'
const checkoutStep = useCurrentCheckoutStep();

// The pending payment session in the cart, if any
const paymentSession = useActivePaymentSession();

const isLoggedIn = useLoggedIn();
```

`useCurrentCheckoutStep` gives only the initial checkout step. The checkout
screen controls later transitions; see
[checkout invariants](architecture.md#checkout-invariants).

## Theme

Themes are defined in `app/styles/themes.tsx`. Each theme has light and dark
variants, selected from the system color scheme through NativeWind.

```tsx
import {
  useColors,
  useTheme,
  useThemeName,
  useColorScheme,
} from '@styles/hooks';

function MyComponent() {
  const colors = useColors(); // Current theme colors
  const themeName = useThemeName(); // 'default' | 'vintage' | 'funky' | 'eco'
  const colorScheme = useColorScheme(); // 'light' | 'dark'
  const { setThemeName, isDarkMode } = useTheme();

  const {
    primary,
    background,
    backgroundSecondary,
    content,
    contentSecondary,
  } = colors;
}
```

The default theme is set in `app/app.tsx`:

```tsx
<ThemeProvider name="default">{/* ... other providers */}</ThemeProvider>
```

| Theme     | Accent   |
| --------- | -------- |
| `default` | Purple   |
| `vintage` | Warm red |
| `funky`   | Teal     |
| `eco`     | Green    |

Theme colors are also available as NativeWind classes. Prefer classes for
styling and use `useColors` where a color value is required, such as for icons.

```tsx
<TouchableOpacity className="bg-primary">
  <Text className="text-content font-bold">Click me</Text>
</TouchableOpacity>
```
