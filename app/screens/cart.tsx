import React from 'react';
import Navbar from '@components/common/navbar';
import Text from '@components/common/text';
import {useCart} from '@data/cart-context';
import {ScrollView, View} from 'react-native';
import Button from '@components/common/button';
import {useNavigation} from '@react-navigation/native';
import {useLocalization} from '@fluent/react';
import CartContent from '@components/cart/cart-content';

const Cart = () => {
  const {l10n} = useLocalization();
  const {cart} = useCart();
  const isEmptyCart = !cart?.items || cart.items.length === 0;

  const navigation = useNavigation();

  const goToCheckout = () => {
    navigation.navigate('Checkout');
  };

  const goHome = () => {
    navigation.navigate('Main');
  };
  return (
    <View className="flex-1 bg-background p-safe">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <Navbar title={l10n.getString('cart')} />
        <View className="p-4">
          {!isEmptyCart ? (
            <CartContent cart={cart} mode="cart" />
          ) : (
            <EmptyCart />
          )}
        </View>
      </ScrollView>
      <View className="p-4 bg-background-secondary">
        {!isEmptyCart ? (
          <Button title={l10n.getString('checkout')} onPress={goToCheckout} />
        ) : (
          <Button title={l10n.getString('go-home')} onPress={goHome} />
        )}
      </View>
    </View>
  );
};

const EmptyCart = () => {
  const {l10n} = useLocalization();
  return (
    <View className="px-4 mt-20">
      <Text className="text-lg text-center">
        {l10n.getString('you-dont-have-anything-in-your-cart')}
      </Text>
    </View>
  );
};

export default Cart;
