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
- Node.js 22.13+ (22.x), 24.3+ (24.x), or 26+
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
npm ci
```

3. Configure environment variables:
```bash
cp .env.template .env
```
Edit `.env` with your Medusa backend URL and publishable API key.

For the Android Studio emulator, use `http://10.0.2.2:9000` (the template default). Use `http://localhost:9000` for the iOS simulator or your computer’s LAN IP for a physical device. The publishable key must be linked to the sales channel containing your products. See the [development guide](docs/development.md) for backend setup and troubleshooting.

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
bundle install
cd ios
bundle exec pod install
cd ..
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

## Development and AI agents

Start with [AGENTS.md](AGENTS.md) for repository instructions, the
[development guide](docs/development.md) for setup and validation, the
[architecture guide](docs/architecture.md) for state flow and dependency constraints,
and [App hooks](docs/app-hooks.md) for the shared state and theme APIs.
Use Node from `.nvmrc` and the npm version recorded in `package.json`.

```sh
npm run verify
```

This runs lint, TypeScript, and unit tests. GitHub Actions runs the same checks on
pull requests and pushes to `main`. Native builds and live backend checks are
covered separately in the development guide.

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

See [App hooks](docs/app-hooks.md) for the cart, region, customer, checkout, and
theme hooks, with usage examples.

## 🛡️ License

This project is licensed under the MIT License.

