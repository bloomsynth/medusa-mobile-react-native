import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import {useColors} from '@styles/hooks';
import {useQuery} from '@tanstack/react-query';
import {HttpTypes} from '@medusajs/types';
import apiClient from '@api/client';
import {convertToLocale} from '@utils/product-price';
import {useCart} from '@data/cart-context';

type ShippingStepProps = {
  cart: HttpTypes.StoreCart;
};

const ShippingStep = ({cart}: ShippingStepProps) => {
  const {l10n} = useLocalization();
  const colors = useColors();
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<
    Record<string, number>
  >({});
  const {setShippingMethod} = useCart();
  const [selectedMethodId, setSelectedMethodId] = useState(
    cart?.shipping_methods?.[0]?.shipping_option_id || null,
  );
  const [updatingOptionId, setUpdatingOptionId] = useState<string | null>(null);
  const [isCalculatingPrices, setIsCalculatingPrices] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {data: shippingOptions, isLoading: isLoadingShippingOptions} = useQuery(
    {
      queryKey: ['shipping-options', cart?.id],
      queryFn: async () => {
        if (!cart?.id) {
          throw new Error(l10n.getString('no-cart-id'));
        }
        const {shipping_options} =
          await apiClient.store.fulfillment.listCartOptions({
            cart_id: cart.id,
          });
        return shipping_options;
      },
      enabled: !!cart?.id,
    },
  );

  // Calculate prices for shipping options
  useEffect(() => {
    if (!cart?.id || !shippingOptions?.length) {
      return;
    }

    setIsCalculatingPrices(true);
    const calculatedOptions = shippingOptions.filter(
      sm => sm.price_type === 'calculated',
    );

    if (calculatedOptions.length) {
      Promise.all(
        calculatedOptions.map(option =>
          apiClient.store.fulfillment
            .calculate(option.id, {
              cart_id: cart.id,
            })
            .then(({shipping_option}) => ({
              id: shipping_option.id,
              amount: shipping_option.amount,
            })),
        ),
      )
        .then(results => {
          const pricesMap: Record<string, number> = {};
          results.forEach(result => {
            if (result.id && result.amount) {
              pricesMap[result.id] = result.amount;
            }
          });
          setCalculatedPricesMap(pricesMap);
        })
        .catch((err: Error) => {
          console.error('Failed to calculate shipping prices:', err);
        })
        .finally(() => {
          setIsCalculatingPrices(false);
        });
    } else {
      setIsCalculatingPrices(false);
    }
  }, [cart?.id, shippingOptions]);

  const handleShippingMethodSelect = async (id: string) => {
    if (!cart?.id) {
      return;
    }

    // Skip if this option is already selected
    if (selectedMethodId === id) {
      return;
    }

    setError(null);
    setUpdatingOptionId(id);

    try {
      await setShippingMethod(id);
      setSelectedMethodId(id);
    } catch (err) {
      setError(l10n.getString('failed-to-update-shipping-method'));
      console.error(err);
    } finally {
      setUpdatingOptionId(null);
    }
  };

  if (isLoadingShippingOptions || !shippingOptions?.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500">
          {l10n.getString('loading-shipping-options')}...
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-6">
      <Text className="text-2xl mb-4">
        {l10n.getString('select-shipping-method')}
      </Text>
      {error && (
        <Text className="text-red-500 mb-4" testID="shipping-error">
          {error}
        </Text>
      )}
      <View className="gap-4">
        {shippingOptions.map(option => {
          const isCalculated = option.price_type === 'calculated';
          const amount = isCalculated
            ? calculatedPricesMap[option.id]
            : option.amount;
          const isUpdating = updatingOptionId === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleShippingMethodSelect(option.id)}
              disabled={isUpdating || (isCalculated && isCalculatingPrices)}
              className={`p-4 border rounded-lg flex-row justify-between items-center ${
                selectedMethodId === option.id
                  ? 'border-primary'
                  : 'border-gray-200'
              }`}>
              <View className="flex-row items-center flex-1">
                <View
                  className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                    selectedMethodId === option.id
                      ? 'border-primary'
                      : 'border-gray-300'
                  }`}>
                  {selectedMethodId === option.id ? (
                    <View className="h-3 w-3 rounded-full bg-primary" />
                  ) : null}
                </View>
                <Text className="ml-2 flex-1">{option.name}</Text>
              </View>
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text>
                  {isCalculated && isCalculatingPrices
                    ? `${l10n.getString('calculating')}...`
                    : amount !== undefined
                    ? convertToLocale({
                        amount,
                        currency_code: cart.currency_code,
                      })
                    : '-'}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ShippingStep;
