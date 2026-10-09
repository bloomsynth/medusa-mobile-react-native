import React from 'react';
import { View, Text } from 'react-native';
import { convertToLocale } from '@utils/product-price';
import { HttpTypes } from '@medusajs/types';

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem;
  style?: 'default' | 'tight';
  currencyCode: string;
};

const LineItemUnitPrice = ({
  item,
  style = 'default',
  currencyCode,
}: LineItemUnitPriceProps) => {
  const { unit_price } = item;
  const total = item.total ?? unit_price * item.quantity;
  const original_total = item.original_total ?? total;

  const hasReducedPrice = original_total > 0 && total < original_total;

  const percentage_diff = hasReducedPrice
    ? Math.round(((original_total - total) / original_total) * 100)
    : 0;

  return (
    <View className="flex flex-col justify-center h-full">
      {hasReducedPrice && (
        <>
          <Text className="text-content">
            {style === 'default' && (
              <Text className="text-content">Original: </Text>
            )}
            <Text
              className="line-through text-content"
              testID="product-unit-original-price"
            >
              {convertToLocale({
                amount: original_total / item.quantity,
                currency_code: currencyCode,
              })}
            </Text>
          </Text>
          {style === 'default' && (
            <Text className="text-primary">-{percentage_diff}%</Text>
          )}
        </>
      )}
      <Text
        className={`text-base ${
          hasReducedPrice ? 'text-primary' : 'text-content'
        }`}
      >
        {convertToLocale({
          amount: unit_price * item.quantity,
          currency_code: currencyCode,
        })}
      </Text>
    </View>
  );
};

export default LineItemUnitPrice;
