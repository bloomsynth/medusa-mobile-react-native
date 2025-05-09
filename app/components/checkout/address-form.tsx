import React from 'react';
import {View} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import Input from '@components/common/input';
import {Picker} from '@react-native-picker/picker';
import {Controller, UseFormReturn, FieldError} from 'react-hook-form';
import {CheckoutFormData, AddressFields} from '../../types/checkout';
import {Path} from 'react-hook-form';

type AddressFormProps = {
  title: string;
  form: UseFormReturn<CheckoutFormData>;
  type: 'shipping' | 'billing';
  isLoading?: boolean;
  countries: {label: string; value: string}[];
};

const AddressForm = ({
  title,
  form,
  type,
  isLoading,
  countries,
}: AddressFormProps) => {
  const {l10n} = useLocalization();
  const {
    control,
    formState: {errors},
    clearErrors,
  } = form;

  const addressErrors = errors[`${type}_address`] as
    | {[K in keyof AddressFields]?: FieldError}
    | undefined;

  const getFieldName = (field: keyof AddressFields): Path<CheckoutFormData> =>
    `${type}_address.${field}` as Path<CheckoutFormData>;

  const handleFieldChange =
    (field: keyof AddressFields, onChange: (value: string) => void) =>
    (value: string) => {
      clearErrors(`${type}_address.${field}`);
      onChange(value);
    };

  return (
    <View className="space-y-4">
      <Text className="text-2xl mb-4">{title}</Text>
      <Controller
        control={control}
        name={getFieldName('first_name')}
        render={({field: {onChange, value}}) => (
          <Input
            label={l10n.getString('first-name')}
            value={value as string}
            onChangeText={handleFieldChange('first_name', onChange)}
            error={addressErrors?.first_name?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('last_name')}
        render={({field: {onChange, value}}) => (
          <Input
            label={l10n.getString('last-name')}
            value={value as string}
            onChangeText={handleFieldChange('last_name', onChange)}
            error={addressErrors?.last_name?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('address_1')}
        render={({field: {onChange, value}}) => (
          <Input
            label={l10n.getString('address')}
            value={value as string}
            onChangeText={handleFieldChange('address_1', onChange)}
            error={addressErrors?.address_1?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('company')}
        render={({field: {onChange, value}}) => (
          <Input
            label={`${l10n.getString('company')} (${l10n.getString(
              'optional',
            )})`}
            value={value as string}
            onChangeText={handleFieldChange('company', onChange)}
            error={addressErrors?.company?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('postal_code')}
        render={({field: {onChange, value}}) => (
          <Input
            label={l10n.getString('postal-code')}
            value={value as string}
            onChangeText={handleFieldChange('postal_code', onChange)}
            error={addressErrors?.postal_code?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('city')}
        render={({field: {onChange, value}}) => (
          <Input
            label={l10n.getString('city')}
            value={value as string}
            onChangeText={handleFieldChange('city', onChange)}
            error={addressErrors?.city?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('province')}
        render={({field: {onChange, value}}) => (
          <Input
            label={`${l10n.getString('province-or-state')} (${l10n.getString(
              'optional',
            )})`}
            value={value as string}
            onChangeText={handleFieldChange('province', onChange)}
            error={addressErrors?.province?.message}
            editable={!isLoading}
          />
        )}
      />
      <Controller
        control={control}
        name={getFieldName('country_code')}
        render={({field: {onChange, value}}) => (
          <View className="mb-4">
            <Text className="text-sm font-content mb-2">
              {l10n.getString('country')}
            </Text>
            <View
              className={`border rounded-md ${
                addressErrors?.country_code
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}>
              <Picker
                selectedValue={value}
                onValueChange={val => {
                  clearErrors(`${type}_address.country_code`);
                  onChange(val);
                }}
                enabled={!isLoading}>
                <Picker.Item
                  label={l10n.getString('select-a-country')}
                  value=""
                />
                {countries.map(country => (
                  <Picker.Item
                    key={country.value}
                    label={country.label}
                    value={country.value}
                  />
                ))}
              </Picker>
            </View>
            {addressErrors?.country_code?.message && (
              <Text className="text-red-500 text-xs mt-1">
                {addressErrors.country_code.message}
              </Text>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        name={getFieldName('phone')}
        render={({field: {onChange, value}}) => (
          <Input
            label={l10n.getString('phone')}
            value={value as string}
            onChangeText={handleFieldChange('phone', onChange)}
            error={addressErrors?.phone?.message}
            editable={!isLoading}
          />
        )}
      />
    </View>
  );
};

export default AddressForm;
