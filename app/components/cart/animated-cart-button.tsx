import Button from '@components/common/button';
import Text from '@components/common/text';
import React, {useEffect, useRef} from 'react';
import Icon from '@react-native-vector-icons/ant-design';
import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import {useLocalization} from '@fluent/react';
import {useColors} from '@styles/hooks';
import {useCart} from '@data/cart-context';
import {useProductQuantity} from '@data/hooks';
import {useNavigation} from '@react-navigation/native';
import Badge from '@components/common/badge';

type AnimatedCartButtonProps = {
  productId: string;
  selectedVariantId?: string;
  disabled?: boolean;
  inStock?: boolean;
  hasSelectedAllOptions?: boolean;
};

const AnimatedCartButton = ({
  productId,
  selectedVariantId,
  disabled = false,
  inStock,
  hasSelectedAllOptions = false,
}: AnimatedCartButtonProps) => {
  const {l10n} = useLocalization();
  const {addToCart} = useCart();
  const [adding, setAdding] = React.useState(false);
  const productQuantityInCart = useProductQuantity(productId);
  const showViewCart = useSharedValue(productQuantityInCart > 0);
  const viewCartWidth = 192;

  useEffect(() => {
    if (productQuantityInCart > 0) {
      showViewCart.value = true;
    } else {
      showViewCart.value = false;
    }
  }, [productQuantityInCart, showViewCart]);

  const rowStyles = useAnimatedStyle(() => {
    return {
      gap: withTiming(showViewCart.value ? 8 : 0),
    };
  });

  const viewCartStyles = useAnimatedStyle(() => {
    return {
      width: withTiming(showViewCart.value ? viewCartWidth : 0),
      opacity: withTiming(showViewCart.value ? 1 : 0),
    };
  });

  const addToCartHandler = async () => {
    if (!selectedVariantId || disabled || !inStock) {
      return;
    }
    setAdding(true);
    await addToCart(selectedVariantId, 1);
    setAdding(false);
  };

  return (
    <Animated.View className="p-4 flex-row" style={[rowStyles]}>
      <Animated.View style={[viewCartStyles]}>
        <ViewCart quantity={productQuantityInCart} />
      </Animated.View>
      <View className="flex-1">
        <Button
          title={
            hasSelectedAllOptions && !inStock
              ? l10n.getString('out-of-stock')
              : l10n.getString('add-to-cart')
          }
          onPress={addToCartHandler}
          disabled={disabled}
          loading={adding}
        />
      </View>
    </Animated.View>
  );
};

const ViewCart = ({quantity}: {quantity: number}) => {
  const {l10n} = useLocalization();
  const colors = useColors();
  const navigation = useNavigation();
  const scale = useSharedValue(1);
  const prevQuantity = useRef(quantity);

  useEffect(() => {
    // Only animate when quantity increases
    if (prevQuantity.current && quantity > prevQuantity.current) {
      scale.value = withSequence(
        withSpring(1.3, {damping: 8}),
        withSpring(1, {damping: 8}),
      );
    }
    prevQuantity.current = quantity;
  }, [quantity, scale]);

  const badgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const navigateToCart = () => {
    navigation.navigate('Cart');
  };

  return (
    <Button
      variant="secondary"
      disabled={quantity === 0}
      onPress={navigateToCart}>
      <View>
        <View className="flex-row gap-1 items-center">
          <View>
            <Icon name="shopping-cart" size={18} color={colors.content} />
            <Animated.View
              className="absolute -top-[8] -right-[8]"
              style={badgeAnimatedStyle}>
              <Badge quantity={quantity} />
            </Animated.View>
          </View>
          <Text
            className="ml-2 text-content font-content-bold"
            numberOfLines={1}>
            {l10n.getString('view-cart')}
          </Text>
        </View>
      </View>
    </Button>
  );
};

export default AnimatedCartButton;
