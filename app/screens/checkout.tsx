import React, {useState} from 'react';
import {View, ScrollView, Alert} from 'react-native';
import {useLocalization} from '@fluent/react';
import {useCart} from '@data/cart-context';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Button from '@components/common/button';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import Navbar from '@components/common/navbar';
import apiClient from '@api/client';
import {
  CheckoutFormData,
  checkoutSchema,
  AddressFields,
  CHECKOUT_STEPS,
  PAYMENT_PROVIDER_DETAILS_MAP,
  createEmptyAddress,
  CheckoutStep,
  addressSchema,
} from '../types/checkout';
import CheckoutSteps from '@components/checkout/checkout-steps';
import AddressStep from '@components/checkout/steps/address-step';
import ShippingStep from '@components/checkout/steps/shipping-step';
import PaymentStep from '@components/checkout/steps/payment-step';
import ReviewStep from '@components/checkout/steps/review-step';
import {
  useCountries,
  useCurrentCheckoutStep,
  useActivePaymentSession,
} from '@data/hooks';
import {StoreCartAddress} from '@medusajs/types';
import utils from '@utils/common';

const Checkout = () => {
  const {l10n} = useLocalization();
  const {cart, updateCart, resetCart} = useCart();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const countries = useCountries();
  const currentStep = useCurrentCheckoutStep();
  const activeSession = useActivePaymentSession();
  const [selectedPaymentProviderId, setSelectedPaymentProviderId] = useState(
    activeSession?.provider_id,
  );

  const [activeStep, setActiveStep] = useState(currentStep);

  const getAddressFromCart = (
    cartAddress?: StoreCartAddress,
  ): AddressFields => {
    if (!cartAddress) {
      return createEmptyAddress();
    }
    const result = addressSchema.safeParse(cartAddress);
    return result.success ? result.data : createEmptyAddress();
  };

  const defaultValues: CheckoutFormData = {
    email: cart?.email || '',
    shipping_address: getAddressFromCart(cart?.shipping_address),
    billing_address: getAddressFromCart(cart?.billing_address),
    use_same_billing:
      cart?.billing_address && cart?.shipping_address
        ? utils.areEqualObjects(
            addressSchema.safeParse(cart.billing_address),
            addressSchema.safeParse(cart.shipping_address),
          )
        : true,
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  // Check if cart is empty
  const isEmptyCart = !cart?.items || cart.items.length === 0;

  if (isEmptyCart) {
    return null;
  }

  const renderStep = () => {
    switch (activeStep) {
      case 'address':
        return (
          <AddressStep
            form={form}
            isLoading={isLoading}
            countries={countries}
          />
        );
      case 'delivery':
        return <ShippingStep cart={cart} />;
      case 'payment':
        return (
          <PaymentStep
            cart={cart}
            selectedProviderId={selectedPaymentProviderId}
            onSelectProvider={setSelectedPaymentProviderId}
          />
        );
      case 'review':
        return <ReviewStep cart={cart} />;
      default:
        return null;
    }
  };

  const handleStepPress = (step: CheckoutStep) => {
    const currentStepIndex = CHECKOUT_STEPS.findIndex(s => s.id === activeStep);
    const targetStepIndex = CHECKOUT_STEPS.findIndex(s => s.id === step);

    if (targetStepIndex < currentStepIndex) {
      setActiveStep(step);
    }
  };

  const handleAddressSubmit = async () => {
    const useSameBilling = form.getValues('use_same_billing');
    const validateFields: (keyof CheckoutFormData)[] = [
      'email',
      'shipping_address',
    ];
    if (!useSameBilling) {
      validateFields.push('billing_address');
    }
    const isValid = await form.trigger(validateFields);
    if (!isValid) {
      return;
    }

    const {email, shipping_address, billing_address, use_same_billing} =
      form.getValues();

    const payload = {
      email,
      shipping_address,
      billing_address: use_same_billing ? shipping_address : billing_address,
    };

    await updateCart(payload);

    setActiveStep('delivery');
  };

  const handleDeliverySubmit = () => {
    setActiveStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentProviderId) {
      throw new Error(l10n.getString('please-select-a-payment-method'));
    }
    if (!cart) {
      throw new Error(l10n.getString('no-cart-found'));
    }

    await apiClient.store.payment.initiatePaymentSession(cart, {
      provider_id: selectedPaymentProviderId,
    });
    setActiveStep('review');
  };

  const handleOrderComplete = async () => {
    if (!cart?.id) {
      throw new Error(l10n.getString('no-cart-found'));
    }

    const selectedProvider = selectedPaymentProviderId
      ? PAYMENT_PROVIDER_DETAILS_MAP[selectedPaymentProviderId]
      : null;

    if (selectedProvider?.hasExternalStep) {
      switch (selectedPaymentProviderId) {
        case 'pp_stripe_stripe':
          // TODO: Implement Stripe payment flow
          break;
        default:
          throw new Error(l10n.getString('payment-provider-not-supported'));
      }
    } else {
      const response = await apiClient.store.cart.complete(cart.id);

      if (response.type === 'cart') {
        throw new Error(
          response.error?.message || l10n.getString('failed-to-complete-order'),
        );
      }
      await resetCart();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
            },
            {
              name: 'OrderDetail',
              params: {orderId: response.order.id},
            },
          ],
        }),
      );
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      switch (activeStep) {
        case 'address':
          await handleAddressSubmit();
          break;
        case 'delivery':
          handleDeliverySubmit();
          break;
        case 'payment':
          await handlePaymentSubmit();
          break;
        case 'review':
          await handleOrderComplete();
          break;
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        l10n.getString('error'),
        error instanceof Error
          ? error.message
          : l10n.getString('an-error-occurred'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getReviewStepCtaText = () => {
    const selectedProvider =
      PAYMENT_PROVIDER_DETAILS_MAP[selectedPaymentProviderId ?? ''];

    if (selectedProvider?.hasExternalStep) {
      return l10n.getString('pay-using-provider', {
        provider: selectedProvider.name,
      });
    }
    return l10n.getString('place-order');
  };

  const getCtaText = () => {
    switch (activeStep) {
      case 'address':
        return l10n.getString('continue-to-delivery');
      case 'delivery':
        return l10n.getString('continue-to-payment');
      case 'payment':
        return l10n.getString('review-order');
      case 'review':
        return getReviewStepCtaText();
      default:
        return l10n.getString('continue');
    }
  };

  return (
    <View className="flex-1 bg-background p-safe">
      <View className="flex-1">
        <View className="mb-4">
          <Navbar title={l10n.getString('checkout')} />
        </View>
        <CheckoutSteps currentStep={activeStep} onStepPress={handleStepPress} />
        <ScrollView className="flex-1 px-4" contentContainerClassName="pb-4">
          {renderStep()}
        </ScrollView>
      </View>
      <View className="p-4 bg-background-secondary border-t border-gray-200">
        <Button
          variant="primary"
          title={getCtaText()}
          onPress={handleContinue}
          loading={isLoading}
        />
      </View>
    </View>
  );
};

export default Checkout;
