import Button from '@components/common/button';
import Text from '@components/common/text';
import React, { useEffect, useRef } from 'react';
import Icon from '@react-native-vector-icons/ant-design';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useLocalization } from '@fluent/react';
import { useColors } from '@styles/hooks';
import { useCart } from '@data/cart-context';
import { useProductQuantity } from '@data/hooks';
import { useNavigation } from '@react-navigation/native';
import Badge from '@components/common/badge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const { l10n } = useLocalization();
  const { addToCart } = useCart();
  const [adding, setAdding] = React.useState(false);
  const productQuantityInCart = useProductQuantity(productId);
  const visible = productQuantityInCart > 0;
  const reveal = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    reveal.value = withTiming(visible ? 1 : 0, { duration: 300 });
  }, [visible, reveal]);

  const revealStyle = useAnimatedStyle(() => ({
    width: 192 * reveal.value,
    marginRight: 8 * reveal.value,
    opacity: reveal.value,
  }));
  const addToCartHandler = async () => {
    if (!selectedVariantId || disabled || !inStock) {
      return;
    }
    setAdding(true);
    await addToCart(selectedVariantId, 1);
    setAdding(false);
  };

  return (
    <View className="p-4 flex-row">
      <Animated.View style={[styles.reveal, revealStyle]}>
        <View style={styles.viewCart}>
          <ViewCart quantity={productQuantityInCart} />
        </View>
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
    </View>
  );
};

const ViewCart = ({ quantity }: { quantity: number }) => {
  const { l10n } = useLocalization();
  const colors = useColors();
  const navigation = useNavigation();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity]);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const prevQuantity = useRef(quantity);

  useEffect(() => {
    // Only animate when quantity increases
    if (prevQuantity.current && quantity > prevQuantity.current) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 8 }),
      );
    }
    prevQuantity.current = quantity;
  }, [quantity, scale]);

  const badgeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const navigateToCart = () => {
    navigation.navigate('Cart');
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={l10n.getString('view-cart')}
      disabled={quantity === 0}
      onPress={navigateToCart}
      onPressIn={() => {
        opacity.value = withTiming(0.2, { duration: 150 });
      }}
      onPressOut={() => {
        opacity.value = withTiming(1, { duration: 250 });
      }}
      style={[
        styles.cartButton,
        { backgroundColor: colors.background },
        opacityStyle,
      ]}
    >
      <View pointerEvents="none">
        <View className="flex-row gap-1 items-center">
          <View>
            <Icon name="shopping-cart" size={18} color={colors.content} />
            <Animated.View
              className="absolute -top-[8] -right-[8]"
              style={badgeAnimatedStyle}
            >
              <Badge quantity={quantity} />
            </Animated.View>
          </View>
          <Text
            className="ml-2 text-content font-content-bold"
            numberOfLines={1}
          >
            {l10n.getString('view-cart')}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export default AnimatedCartButton;

const styles = StyleSheet.create({
  reveal: { overflow: 'hidden' },
  viewCart: { width: 192 },
  cartButton: {
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});
