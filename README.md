# Medusa Mobile

[![Tested with Medusa 2.21.2](https://img.shields.io/badge/Medusa-tested%20with%202.21.2-blue)](https://github.com/medusajs/medusa/releases/tag/v2.21.2)

![Medusa Mobile](https://i.imgur.com/LKvNyGX.png)

A modern e-commerce mobile application built with React Native and Medusa. Whether you're building a React Native starter Medusa project or a production app, this provides a complete shopping experience with features like product browsing, cart management, user authentication, and order tracking.

Tested with the Medusa **2.21.2** starter backend.

## ✨ Features

- 🛍️ Product browsing with infinite scroll
- 👤 User authentication and profile management
- 🔍 Categories and collections
- 🛒 Cart management
- 🏃‍♂️ Guest checkout
- 📦 Order tracking
- 🎨 Beautiful UI with smooth animations
- 🌍 Multi-region support
- 🌐 Localization support
- 🌙 Dark/Light theme support
- 🎭 Multiple themes built-in
- 📱 Native performance with Reanimated

## 🎨 Themes
![Multiple themes](https://i.imgur.com/CfogW5z.png)

Fully customizable using the existing themes or create your own.

## 🛠️ Tech Stack

- React Native
- TypeScript
- Medusa JS
- React Query
- React Navigation
- NativeWind (TailwindCSS)
- React Native Reanimated

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v20 or newer)
- React Native development environment - [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment)
- A running Medusa v2 backend server - [Medusa v2 installation](https://docs.medusajs.com/learn/installation)

## 🚀 Getting Started with React Native Medusa

### Step 1: Environment Setup

1. Clone the repository:
```bash
git clone git@github.com:bloomsynth/medusa-mobile-react-native.git medusa-mobile
cd medusa-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.template .env
```
Edit `.env` with your Medusa backend URL and publishable API key.

NOTE: Update the `MEDUSA_BACKEND_URL` in your `.env` file. If you set the URL as localhost, then the Android emulator will not be able to connect to the server. Use your local IP address instead. example: `http://192.168.1.100:9000` Run `ipconfig` to get your local IP address.

### Step 2: Start Metro Server

```bash
npm start
```

### Step 3: Run the Application

For Android:
```bash
npm run android
```

For iOS:
Install dependencies for iOS:
```bash
npx pod-install ios
```

Run the application:
```bash
npm run ios
```

## 📱 Expo Usage

This project uses React Native CLI to ensure maximum flexibility for all developers. However, Expo users are more than welcome! You can easily add Expo support with a single command.

[Learn more about migrating to Expo CLI](https://docs.expo.dev/bare/using-expo-cli/)

## 📁 Project Structure

```
app/
├── screens/       # Screen components
├── components/    # Reusable UI components
├── data/          # Data context providers
├── styles/        # Theme and style utilities
├── utils/         # Helper functions
└── api/           # API client configuration
```

## 📍 Roadmap

Here are the planned features and improvements:

- [x] 🎁 Promo code support
- [x] 🌍 Region selector for multi-region support
- [x] 📖 Developer Guide
- [x] 🌐 Localization support
- [ ] 💳 Stripe integration for secure payments
- [ ] 🔄 Related products suggestions
- [ ] 🔍 Product search functionality
- [ ] 📦 cli-tool to generate a new project from this template
- [ ] 🎨 Advanced customization options
- [ ] 🔌 Plugins to extend the functionality of the app

## 📖 Developer Guide

### 🛒 Cart Management

The cart functionality is provided through the `useCart` hook, which gives you access to cart operations and state.

#### Basic Usage

```tsx
import { useCart } from '@data/cart-context';

function MyComponent() {
  const { 
    cart,                // Current cart state
    addToCart,          // Add items to cart
    updateLineItem,     // Update item quantity
    removeLineItem,     // Remove item from cart
    applyPromoCode,     // Apply discount code
    removePromoCode,    // Remove discount code
    setShippingMethod   // Set shipping option
  } = useCart();
}
```

#### Working with Cart Items

1. Add a product to cart:
```tsx
const { addToCart } = useCart();

// Quantity is required when adding items
await addToCart(variantId, 1); // Add one item
await addToCart(variantId, 3); // Add three items
```

2. Update item quantity:
```tsx
const { updateLineItem } = useCart();

// Update to specific quantity
await updateLineItem(lineItemId, 2);

// Remove item by setting quantity to 0
await updateLineItem(lineItemId, 0);
```

#### Managing Promotions

```tsx
const { applyPromoCode, removePromoCode } = useCart();

// Apply a promotion code
const success = await applyPromoCode('SUMMER2024');

// Remove a promotion code
await removePromoCode('SUMMER2024');
```

#### Shipping Methods

```tsx
const { setShippingMethod } = useCart();

// Set shipping method
await setShippingMethod(shippingMethodId);
```

#### Accessing Cart Data

```tsx
const { cart } = useCart();

// Get cart items
const items = cart.items;

// Get cart totals
const {
  subtotal,
  tax_total,
  shipping_total,
  discount_total,
  total
} = cart;

// Check applied discounts
const appliedPromotions = cart.promotions;

// Get selected shipping method
const currentShipping = cart.shipping_methods?.[0];
```

#### Cart Lifecycle

The cart system handles various states and transitions:

1. Cart Creation:
```tsx
const { cart } = useCart();

// Cart is automatically created when needed
// You don't need to explicitly create a cart
```

2. Guest to Customer Cart Transfer:
```tsx
// When a guest user logs in, their existing cart is 
// automatically associated with their customer account
// This is handled by the CartProvider and CustomerProvider

import { useCustomer } from '@data/customer-context';
import { useCart } from '@data/cart-context';

function CheckoutFlow() {
  const { customer } = useCustomer();
  const { cart } = useCart();
  
  // Cart remains the same, only the customer_id is updated
}
```

3. Cart update on region change:
```tsx
import { useRegion } from '@data/region-context';
import { useCart } from '@data/cart-context';

function MyComponent() {
  const { region } = useRegion();
  const { cart } = useCart();

  // Cart automatically updates when region changes
  // Product prices will be updated based on the region
  console.log(cart.region_id); // Current region ID
  console.log(cart.currency_code); // Region's currency
}
```

### 🌍 Region Management

The region functionality is provided through the `useRegion` hook, which handles region selection and persistence.

#### Basic Usage

```tsx
import { useRegion } from '@data/region-context';

function MyComponent() {
  const {
    region,             // Current selected region
    setRegion,          // Update region state
  } = useRegion();
}
```

#### Working with Regions

1. Access current region:
```tsx
const { region } = useRegion();

// Get region details (if region is loaded)
const {
  id,
  name,
  currency_code,
  countries
} = region || {};
```

2. Change region:
```tsx
const { setRegion } = useRegion();

// Fetch region data first
const { region: newRegion } = await apiClient.store.region.retrieve(regionId);

// Update region
setRegion(newRegion);
// This will:
// - Persist region selection
// - Update cart region automatically
// - Trigger price recalculations
```

#### Region Selection UI

The app provides a built-in region selector modal:

```tsx
import { useNavigation } from '@react-navigation/native';

function MyComponent() {
  const navigation = useNavigation();
  
  // Open region selector modal
  const openRegionSelect = () => {
    navigation.navigate('RegionSelect');
  };
}
```

#### Working with Countries

The app provides a dedicated hook for accessing region countries:

```tsx
import { useCountries } from '@data/region-context';

function AddressForm() {
  const countries = useCountries();
  
  // Format countries for picker/selector
  const countryOptions = countries?.map(country => ({
    label: country.display_name,
    value: country.iso_2
  }));
}
```

#### Region Persistence

Region selection is automatically persisted using AsyncStorage:
- On first load, defaults to the first available region
- On subsequent loads, restores the previously selected region
- Region ID is stored under the 'region_id' key

### 👤 Customer Management

The customer functionality is provided through the `useCustomer` hook, which handles authentication and customer data management.

#### Basic Usage

```tsx
import { useCustomer } from '@data/customer-context';

function MyComponent() {
  const {
    customer,           // Current customer data
    login,             // Login with email/password
    logout,            // Logout current customer
    register,          // Register new customer
    refreshCustomer,   // Refresh customer data
    updateCustomer     // Update customer details
  } = useCustomer();
}
```

#### Authentication

1. Login:
```tsx
const { login } = useCustomer();

try {
  await login(email, password);
  // On successful login:
  // - JWT token is stored in AsyncStorage
  // - Customer data is fetched
  // - Cart is associated with customer
} catch (error) {
  // Handle login error
}
```

2. Register new customer:
```tsx
const { register } = useCustomer();

try {
  await register(
    email,
    password,
    firstName,
    lastName
  );
  // Registration automatically logs in the customer
} catch (error) {
  // Handle registration error
}
```

3. Logout:
```tsx
const { logout } = useCustomer();

await logout();
// This will:
// - Clear the stored JWT token
// - Reset customer data
// - Reset cart
```

#### Managing Customer Data

1. Access customer information:
```tsx
import { useLoggedIn } from '@data/hooks';

function MyComponent() {
  const { customer } = useCustomer();
  const isLoggedIn = useLoggedIn();

  // Access customer details
  const {
    email,
    first_name,
    last_name,
    phone,
    billing_address,
    shipping_addresses
  } = customer || {};
}
```

2. Update customer details:
```tsx
const { updateCustomer } = useCustomer();

// Update customer information
await updateCustomer({
  first_name: "John",
  last_name: "Doe",
  phone: "+1234567890"
});
```

3. Refresh customer data:
```tsx
const { refreshCustomer } = useCustomer();

// Fetch latest customer data from server
await refreshCustomer();
```

#### Session Management

The customer session is automatically managed:
- JWT token is stored in AsyncStorage under 'auth_token'
- Session is restored on app launch
- Token is automatically attached to API requests
- Session is cleared on logout

### 🎨 Theme Management

The app includes a flexible theming system with built-in light/dark mode support and multiple color schemes.

#### Basic Usage

```tsx
import { useColors, useTheme, useThemeName, useColorScheme } from '@styles/hooks';

function MyComponent() {
  const colors = useColors();          // Get current theme colors
  const themeName = useThemeName();    // Get current theme name
  const { colorScheme } = useColorScheme(); // Get 'light' or 'dark'

  // Access theme colors
  const {
    primary,            // Brand/accent color
    background,         // Main background
    backgroundSecondary,// Secondary/card background
    content,           // Main text color
    contentSecondary   // Secondary text color
  } = colors;
}
```

#### Setting Default Theme

```tsx
// In app.tsx, set your preferred theme name in ThemeProvider
<ThemeProvider name="default">
  {/* ... other providers */}
</ThemeProvider>
```

Available theme names:
- "default" (Purple accent)
- "vintage" (Warm red accent)
- "funky" (Teal accent)
- "eco" (Green accent)

#### Changing Themes

```tsx
import { useTheme } from '@styles/hooks';

function ThemeSwitcher() {
  const { setThemeName } = useTheme();
  
  // Switch to a different theme
  const switchTheme = (name: string) => {
    setThemeName(name); // 'default' | 'vintage' | 'funky' | 'eco'
  };
}
```
#### System Dark Mode

The theme system automatically responds to system dark mode changes through NativeWind's `useColorScheme` hook. Each theme includes both light and dark variants that are automatically applied based on the system setting.

#### Styling Components

The app uses NativeWind (TailwindCSS) for styling. Theme colors are available as Tailwind classes:

```tsx
function ThemedButton() {
  return (
    <TouchableOpacity className="bg-primary"> // Theme primary color
      <Text className="text-content font-bold"> // Theme content color
        Click Me
      </Text>
    </TouchableOpacity>
  );
}
```

### 🪝 Useful Hooks

The app provides additional hooks for common functionality:

```tsx
import { 
  useProductQuantity,
  useVariantQuantity,
  useCartQuantity,
  useCurrentCheckoutStep,
  useActivePaymentSession,
  useLoggedIn,
  useCountries
} from '@data/hooks';

// Get quantity of a specific product in cart
const quantity = useProductQuantity(productId);

// Get quantity of a specific variant in cart
const variantQuantity = useVariantQuantity(variantId);

// Get total number of items in cart
const cartQuantity = useCartQuantity();

// Get current checkout step
const checkoutStep = useCurrentCheckoutStep(); 
// Returns: 'address' | 'delivery' | 'payment' | 'review'

// Get active payment session in checkout
const paymentSession = useActivePaymentSession();

// Check if user is logged in
const isLoggedIn = useLoggedIn();

// Get formatted list of countries for current region
const countries = useCountries();
// Returns: Array<{ label: string, value: string }>
```

## 🛡️ License

This project is licensed under the MIT License.

