import {StoreCart} from '@medusajs/types';
import React from 'react';
import {Image, View} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import {HttpTypes} from '@medusajs/types';
import LineItemQuantity from '@components/cart/line-item-quantity';
import LineItemUnitPrice from '@components/cart/line-item-price';
import {convertToLocale} from '@utils/product-price';
import {formatImageUrl} from '@utils/image-url';
import PromoCodeInput from '@components/cart/promo-code-input';

type CartContentProps = {
  cart: HttpTypes.StoreCart;
  mode: 'checkout' | 'cart';
};

const CartContent = ({cart, mode}: CartContentProps) => {
  return (
    <View>
      <View className="mb-4">
        <CartItems cart={cart} mode={mode} />
      </View>
      {mode === 'cart' && <PromoCodeInput />}

      <CartSummary cart={cart} />
    </View>
  );
};

const CartItems = ({
  cart,
  mode,
}: {
  cart?: StoreCart;
  mode: 'checkout' | 'cart';
}) => {
  if (!cart) {
    return null;
  }
  const sortedItems = cart?.items?.sort((a, b) => {
    return (a.created_at ?? '') < (b.created_at ?? '') ? -1 : 1;
  });
  return (
    <View>
      {sortedItems?.map(item => (
        <CartItem
          key={item.id}
          item={item}
          currencyCode={cart.currency_code}
          mode={mode}
        />
      ))}
    </View>
  );
};

type CartItemProps = {
  item: HttpTypes.StoreCartLineItem;
  currencyCode: string;
  mode: 'checkout' | 'cart';
};

const CartItem = ({item, currencyCode, mode}: CartItemProps) => {
  const {l10n} = useLocalization();

  return (
    <View className="flex flex-row gap-2 p-2 mb-2 bg-background-secondary rounded-lg items-center">
      <Image
        source={{uri: formatImageUrl(item.thumbnail)}}
        className="w-20 h-20"
      />
      <View className="flex-1">
        <Text className="text-base font-content-bold">
          {item.product_title}
        </Text>
        {!!item.variant_title && (
          <Text className="text-base opacity-80">
            {l10n.getString('variant')}: {item.variant_title}
          </Text>
        )}
        <View className="mt-2 flex-1 flex-row justify-between">
          <LineItemQuantity
            quantity={item.quantity}
            lineItemId={item.id}
            mode={mode}
          />
          <LineItemUnitPrice item={item} currencyCode={currencyCode} />
        </View>
      </View>
    </View>
  );
};

type SummaryItem = {
  name: string;
  key: keyof StoreCart;
};

const CartSummary = ({cart}: {cart?: StoreCart}) => {
  const {l10n} = useLocalization();
  if (!cart) {
    return null;
  }
  const summaryItems: SummaryItem[] = [
    {
      name: l10n.getString('subtotal'),
      key: 'item_subtotal',
    },
    {
      name: l10n.getString('shipping'),
      key: 'shipping_total',
    },
    {
      name: l10n.getString('taxes'),
      key: 'tax_total',
    },
  ];

  const discountTotal = cart.discount_total || 0;

  return (
    <View>
      <Text className="text-2xl mb-4">{l10n.getString('summary')}</Text>
      <View className="border-t border-gray-300 py-4">
        {summaryItems.map(item => (
          <View
            className="flex-row justify-between items-center"
            key={item.key}>
            <Text className="opacity-80">{item.name}</Text>
            <Text className="text-base">
              {convertToLocale({
                amount: cart[item.key] as number,
                currency_code: cart.currency_code,
              })}
            </Text>
          </View>
        ))}
        {discountTotal > 0 && (
          <View className="flex-row justify-between items-center">
            <Text className="opacity-80">{l10n.getString('discount')}</Text>
            <Text className="text-base text-green-500">
              -
              {convertToLocale({
                amount: discountTotal,
                currency_code: cart.currency_code,
              })}
            </Text>
          </View>
        )}
      </View>
      <View className="border-t border-b border-gray-300 py-4">
        <View className="flex-row justify-between items-center">
          <Text className="opacity-80">{l10n.getString('total')}</Text>
          <Text className="text-lg font-content-bold">
            {convertToLocale({
              amount: cart.total,
              currency_code: cart.currency_code,
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CartContent;
