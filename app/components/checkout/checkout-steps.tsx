import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import AntDesign from '@react-native-vector-icons/ant-design';
import {useColors} from '@styles/hooks';
import {CheckoutStep, CHECKOUT_STEPS} from '../../types/checkout';

type CheckoutStepsProps = {
  currentStep: CheckoutStep;
  onStepPress: (step: CheckoutStep) => void;
};

const CheckoutSteps = ({currentStep, onStepPress}: CheckoutStepsProps) => {
  const {l10n} = useLocalization();
  const colors = useColors();

  const getStepBackground = (isActive: boolean, isPast: boolean) => {
    if (isActive) {
      return 'bg-primary';
    } else if (isPast) {
      return 'bg-primary opacity-80';
    } else {
      return 'bg-gray-300';
    }
  };

  return (
    <View className="flex-row justify-between items-center mb-6 px-4">
      {CHECKOUT_STEPS.map((step, index: number) => {
        const isActive = step.id === currentStep;
        const isPast =
          CHECKOUT_STEPS.findIndex((s: typeof step) => s.id === currentStep) >
          index;

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <View
                className={`h-[1px] flex-1 mx-2 ${
                  isPast ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            )}
            <TouchableOpacity
              onPress={() => isPast && onStepPress(step.id)}
              disabled={!isPast}
              className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${getStepBackground(
                  isActive,
                  isPast,
                )}`}>
                <AntDesign
                  name={step.icon}
                  size={16}
                  color={
                    isActive || isPast
                      ? colors.contentSecondary
                      : colors.content
                  }
                />
              </View>
              <Text
                className={`text-xs mt-1 ${
                  isActive ? 'text-primary font-content-bold' : 'text-gray-500'
                }`}>
                {l10n.getString(step.title)}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default CheckoutSteps;
