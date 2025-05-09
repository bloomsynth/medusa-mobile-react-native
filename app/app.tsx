import React from 'react';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ThemeProvider from '@styles/theme-provider';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import TabBar from '@components/common/tab-bar';
import Splash from '@screens/splash';
import Home from '@screens/home';
import Categories from '@screens/category/categories';
import CategoryDetail from '@screens/category/category-detail';
import Collections from '@screens/collection/collections';
import CollectionDetail from '@screens/collection/collection-detail';
import ProductDetail from '@screens/product-detail';
import Cart from '@screens/cart';
import Checkout from '@screens/checkout';
import Profile from '@screens/profile/profile';
import SignIn from '@screens/auth/login';
import Register from '@screens/auth/register';
import Orders from '@screens/order/orders';
import OrderDetail from '@screens/order/order-detail';
import ProfileDetail from '@screens/profile/profile-detail';
import {CartProvider} from '@data/cart-context';
import {RegionProvider} from '@data/region-context';
import {CustomerProvider} from '@data/customer-context';
import {LocaleProvider} from '@data/locale-context';
import AddressForm from '@screens/address/address-form';
import AddressList from '@screens/address/address-list';
import RegionSelect from '@screens/region-select';
import Settings from '@screens/settings';

import '@styles/global.css';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export type RootStackParamList = StaticParamList<typeof RootStack>;

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider name="default">
      <LocaleProvider>
        <RegionProvider>
          <CartProvider>
            <CustomerProvider>
              <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView>
                  <SafeAreaProvider>
                    <Navigation />
                  </SafeAreaProvider>
                </GestureHandlerRootView>
              </QueryClientProvider>
            </CustomerProvider>
          </CartProvider>
        </RegionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

const HomeTabs = createBottomTabNavigator({
  tabBar: props => <TabBar {...props} />,
  screens: {
    Home: {
      screen: Home,
      options: {
        title: 'home',
      },
    },
    Categories: {
      screen: Categories,
      options: {
        title: 'categories',
      },
    },
    Collections: {
      screen: Collections,
      options: {
        title: 'collections',
      },
    },
    Profile: {
      screen: Profile,
      options: {
        title: 'profile',
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Splash',
  groups: {
    App: {
      screenOptions: {
        headerShown: false,
      },
      screens: {
        Main: HomeTabs,
        Splash,
        ProductDetail,
        CategoryDetail,
        CollectionDetail,
        Cart,
        Checkout,
        SignIn,
        Register,
        Orders,
        OrderDetail,
        ProfileDetail,
        AddressList,
        AddressForm,
        Settings,
      },
    },
    Modal: {
      screenOptions: {
        presentation: 'modal',
        headerShown: false,
      },
      screens: {
        RegionSelect: RegionSelect,
      },
    },
  },
});

const Navigation = createStaticNavigation(RootStack);
