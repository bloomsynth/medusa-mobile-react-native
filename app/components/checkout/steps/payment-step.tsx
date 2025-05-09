import React, {useState} from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import {useQuery} from '@tanstack/react-query';
import {HttpTypes} from '@medusajs/types';
import apiClient from '@api/client';
import {
  PaymentProvider,
  PAYMENT_PROVIDER_DETAILS_MAP,
} from '../../../types/checkout';

type PaymentStepProps = {
  cart: HttpTypes.StoreCart;
  selectedProviderId?: string;
  onSelectProvider: (providerId: string) => void;
};

const PaymentStep = ({
  cart,
  selectedProviderId,
  onSelectProvider,
}: PaymentStepProps) => {
  const {l10n} = useLocalization();
  const [error, setError] = useState<string | null>(null);

  // Fetch available payment providers
  const {data: paymentProviders, isLoading: isLoadingProviders} = useQuery({
    queryKey: ['payment-providers', cart?.region_id],
    queryFn: async () => {
      if (!cart?.region_id) {
        throw new Error(l10n.getString('no-region-id'));
      }
      const {payment_providers} =
        await apiClient.store.payment.listPaymentProviders({
          region_id: cart.region_id,
        });
      return payment_providers as PaymentProvider[];
    },
    enabled: !!cart?.region_id,
  });

  const handleProviderSelect = (provider: PaymentProvider) => {
    // Skip if this provider is already selected
    if (selectedProviderId === provider.id) {
      return;
    }

    setError(null);
    onSelectProvider(provider.id);
  };

  const getPaymentUI = () => {
    if (!selectedProviderId) {
      return null;
    }

    switch (selectedProviderId) {
      case 'pp_stripe_stripe':
        return (
          <Text className="text-content">
            {l10n.getString('stripe-payment-coming-soon')}
          </Text>
        );
      case 'pp_system_default':
        return (
          <Text className="text-content">
            {l10n.getString(
              'no-additional-actions-required-for-manual-payment',
            )}
          </Text>
        );
      default:
        return (
          <Text className="text-content">
            {l10n.getString('payment-provider-is-in-development', {
              provider:
                PAYMENT_PROVIDER_DETAILS_MAP[selectedProviderId]?.name ||
                selectedProviderId,
            })}
          </Text>
        );
    }
  };

  if (isLoadingProviders || !paymentProviders?.length) {
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
        {l10n.getString('select-payment-method')}
      </Text>
      {error && (
        <Text className="text-red-500 mb-4" testID="payment-error">
          {error}
        </Text>
      )}
      <View className="gap-4">
        {paymentProviders.map(provider => {
          const isSelected = selectedProviderId === provider.id;
          const displayName =
            PAYMENT_PROVIDER_DETAILS_MAP[provider.id]?.name || provider.id;

          return (
            <TouchableOpacity
              key={provider.id}
              onPress={() => handleProviderSelect(provider)}
              className={`p-4 border rounded-lg flex-row justify-between items-center ${
                isSelected ? 'border-primary' : 'border-gray-200'
              }`}>
              <View className="flex-row items-center flex-1">
                <View
                  className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-gray-300'
                  }`}>
                  {isSelected ? (
                    <View className="h-3 w-3 rounded-full bg-primary" />
                  ) : null}
                </View>
                <Text className="ml-2 flex-1">{displayName}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedProviderId && (
        <View className="mt-6 p-4 bg-background-secondary rounded-lg">
          {getPaymentUI()}
        </View>
      )}
    </View>
  );
};

export default PaymentStep;
