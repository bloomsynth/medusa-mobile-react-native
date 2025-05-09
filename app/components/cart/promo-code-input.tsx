import React, {useState} from 'react';
import {View, TouchableOpacity, Keyboard} from 'react-native';
import {useLocalization} from '@fluent/react';
import {useCart} from '@data/cart-context';
import Input from '@components/common/input';
import RoundedButton from '@components/common/rounded-button';
import Text from '@components/common/text';
import Icon from '@react-native-vector-icons/ant-design';
import {useColors} from '@styles/hooks';
import {HttpTypes} from '@medusajs/types';
import Badge from '@components/common/badge';
import {convertToLocale} from '@utils/product-price';
import Button from '@components/common/button';
import Accordion from '@components/common/accordion';
import {useSharedValue} from 'react-native-reanimated';

type Promotion = HttpTypes.StorePromotion;

const PromoCodeInput = () => {
  const {l10n} = useLocalization();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isExpanded = useSharedValue(false);
  const {applyPromoCode, removePromoCode, cart} = useCart();
  const colors = useColors();

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (error) {
      setError(null);
    }
  };

  const handleApplyCode = async () => {
    if (!code || isLoading) {
      return;
    }

    Keyboard.dismiss();

    setError(null);
    setIsLoading(true);
    try {
      const applied = await applyPromoCode(code);
      if (applied) {
        setCode('');
      } else {
        setError(l10n.getString('invalid-promo-code'));
      }
    } catch (err: any) {
      setError(err?.message || l10n.getString('failed-to-apply-promotion'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCode = async (promoCode: string) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      await removePromoCode(promoCode);
    } catch (err: any) {
      setError(err?.message || l10n.getString('failed-to-remove-promotion'));
    } finally {
      setIsLoading(false);
    }
  };

  const promotions = cart?.promotions as Promotion[] | undefined;

  return (
    <>
      <View>
        <TouchableOpacity
          onPress={() => {
            isExpanded.value = !isExpanded.value;
          }}>
          <Text
            className={`text-primary ${isExpanded.value ? 'mb-2' : 'mb-4'}`}>
            {l10n.getString('add-a-promo-code')}
          </Text>
        </TouchableOpacity>

        <Accordion isExpanded={isExpanded}>
          <View className="flex-row gap-2">
            <View className="flex-1">
              <Input
                placeholder={l10n.getString('enter-promo-code')}
                value={code}
                onChangeText={handleCodeChange}
                autoCapitalize="characters"
                error={error || undefined}
              />
            </View>
            <View className="w-20">
              <Button
                variant="secondary"
                onPress={handleApplyCode}
                loading={isLoading}
                title={l10n.getString('apply')}
              />
            </View>
          </View>
        </Accordion>
      </View>

      {promotions && promotions.length > 0 && (
        <View>
          <Text className="text-base mb-1">
            {l10n.getString('applied-promotions')}:
          </Text>
          {promotions.map((promotion, index) => (
            <View
              key={promotion.id}
              className="flex-row justify-between items-center bg-background-secondary px-3 py-2 rounded-lg mb-4">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Badge
                    variant={promotion.is_automatic ? 'secondary' : 'primary'}
                    quantity={index + 1}
                  />
                  <Text className="text-base font-content-bold">
                    {promotion.code}
                  </Text>
                </View>
                {promotion.application_method?.value !== undefined && (
                  <Text className="text-sm opacity-70">
                    {promotion.application_method.type === 'percentage'
                      ? `${promotion.application_method.value}%`
                      : convertToLocale({
                          amount: promotion.application_method.value,
                          currency_code:
                            promotion.application_method.currency_code || '',
                        })}
                  </Text>
                )}
              </View>
              {promotion.code && (
                <RoundedButton
                  size="sm"
                  onPress={() =>
                    promotion.code && handleRemoveCode(promotion.code)
                  }>
                  <Icon name="close" size={12} color={colors.primary} />
                </RoundedButton>
              )}
            </View>
          ))}
        </View>
      )}
    </>
  );
};

export default PromoCodeInput;
