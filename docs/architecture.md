# Architecture and compatibility

## Where to work

| Area               | Entry points and responsibilities                                   |
| ------------------ | ------------------------------------------------------------------- |
| App and navigation | `app/app.tsx`: providers, query client, static stack/tab routes     |
| Medusa connection  | `app/api/client.tsx`: shared SDK, environment values, JWT storage   |
| Shared state       | `app/data/*-context.tsx`: region, cart, customer, locale            |
| Derived state      | `app/data/hooks.ts`: quantities, checkout step, active session      |
| Screens            | `app/screens`: screen-level fetches and interaction orchestration   |
| UI                 | `app/components`: reusable controls and checkout step components    |
| Validation         | `app/types/checkout.ts`: Zod schemas, form types, provider metadata |
| Styling and copy   | `app/styles`, `app/constants/fluent-templates`                      |
| Tests              | `__tests__`, `jest.config.js`, `jest.setup.js`                      |

## State and API flow

The Medusa SDK is configured once in `app/api/client.tsx`. Catalog screens and
checkout option components use React Query for fetched data. Cart state lives
in `CartProvider`, rather than React Query: its mutation methods update the
context using the returned server cart. Keep that context synchronized when
adding new cart operations; a separate cached cart can leave totals and checkout
steps stale.

`RegionProvider` restores the selected region from AsyncStorage. `CartProvider`
then restores or creates the region's cart and updates it on region changes.
`CustomerProvider` links the cart on login and resets it on logout. The SDK stores
the JWT using AsyncStorage. Persisted IDs can outlive a backend database reset;
check this before treating stale cart/region data as an API regression.

Product detail requests `+variants.inventory_quantity`. This computed Medusa
field must be explicitly included for stock checks. Check `manage_inventory`,
`allow_backorder`, and available quantity when diagnosing Add to Cart behavior.

## Checkout invariants

`app/screens/checkout.tsx` owns the active step, address form, selected payment
provider, and loading flags. `useCurrentCheckoutStep` supplies the initial step
from the cart; subsequent transitions are controlled by the screen.

- Address submission validates the Zod form and saves addresses through
  `updateCart` before proceeding to delivery.
- `ShippingStep` awaits `setShippingMethod`, which saves the returned cart in
  context. It reports the pending update to the screen and prevents concurrent
  option updates. Both the continue button and its handler guard against missing
  shipping methods or an in-flight update.
- Payment selection is local to the screen. Continuing initiates a payment session
  before opening review. That API call does not refresh the context cart.
- `ReviewStep` therefore prefers the selected provider passed by the screen, then
  falls back to a pending or authorized cart session. Do not derive the summary
  solely from a possibly stale `cart.payment_collection`.
- Manual payment completes the cart, checks whether the API returned an order or
  an error cart, resets the cart, and navigates to the order. Stripe's external
  flow is not implemented yet.

The animated View Cart control is in
`app/components/cart/animated-cart-button.tsx`. Its reveal wrapper animates width,
margin, and opacity; the inner native Pressable owns taps and press opacity.
Preserve the inner touch area while changing wrapper animation or layout.

## Dependency constraints

These constraints describe the current React Native 0.87.1 setup. Recheck them
against installed package metadata and upstream release notes when upgrading.
`package-lock.json` is the installation source of truth; a newer release alone
is not evidence that an ecosystem upgrade is compatible.

| Packages                                                        | Current constraint and reason                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| React and react-test-renderer                                   | Both pinned to 19.2.3 to match RN's embedded renderer                                          |
| React Native and its Babel/Metro/ESLint/Jest/TypeScript configs | Keep the RN package family aligned at 0.87.1; use a compatible community CLI                   |
| ESLint                                                          | Stay on 9.x: RN's ESLint config declares support for 8.x or 9.x                                |
| TypeScript                                                      | Current parser support is `>=4.8.4 <6.1.0`; keep TS below 6.1 while that applies               |
| Babel                                                           | Keep 7.x across the Babel toolchain; the RN preset depends on Babel 7 transforms               |
| NativeWind and Tailwind                                         | Stable NativeWind 4 uses Tailwind 3; Tailwind 4 requires a coordinated migration               |
| Reanimated, Worklets, Gesture Handler, carousel                 | Check compatible versions together; validate Babel transforms, Jest mocks, and native behavior |
| Medusa SDK and types                                            | Keep their versions aligned and check Store API behavior against the tested backend            |
| Zod and Hook Form resolver                                      | Keep Zod 4 with a compatible resolver; test nested field errors and successful parsing         |

The TypeScript parser comes transitively from `@react-native/eslint-config`.
Check its installed supported range rather than upgrading the compiler
independently. Avoid `--force` or `--legacy-peer-deps` as a compatibility fix.

Dependabot groups npm minor/patch updates weekly and opens major updates
separately. For an upgrade, inspect peer requirements and migration notes, update
manifest and lockfile together, run `npm run verify`, then build and exercise the
affected platform and integrations. Update this table when a constraint changes.

## Test boundaries

- `App.test.tsx` exercises rendering with API calls mocked.
- `dependency-compatibility.test.ts` checks URL query construction, Zod resolver
  behavior, and mocked AsyncStorage operations.
- `checkout-shipping.test.tsx` checks the missing-method and pending-update guards
  and the transition after a saved selection.
- `checkout-payment-summary.test.tsx` checks explicit provider selection and the
  fallback to an authorized cart session.

These are unit/regression tests. They do not validate live inventory responses,
Android/iOS builds, actual storage persistence, native hit areas, animations, or
end-to-end payment. See [manual validation](development.md#manual-validation).
