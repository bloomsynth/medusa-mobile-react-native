import React from 'react';
import {View, ScrollView, KeyboardTypeOptions} from 'react-native';
import {useLocalization} from '@fluent/react';
import Navbar from '@components/common/navbar';
import Button from '@components/common/button';
import Input from '@components/common/input';
import {useNavigation} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import apiClient from '@api/client';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {HttpTypes} from '@medusajs/types';
import {addressSchema, createEmptyAddress} from '../../types/checkout';

type AddressFormData = z.infer<typeof addressSchema>;

type Props = {
  route: {
    params?: {
      address?: HttpTypes.StoreCustomerAddress;
    };
  };
};

type FieldConfig = {
  name: keyof AddressFormData;
  label: string;
  required: boolean;
  keyboardType?: KeyboardTypeOptions;
};

const FIELDS: FieldConfig[] = [
  {name: 'first_name', label: 'first-name', required: true},
  {name: 'last_name', label: 'last-name', required: true},
  {name: 'address_1', label: 'address', required: true},
  {name: 'company', label: 'company', required: false},
  {name: 'city', label: 'city', required: true},
  {name: 'province', label: 'province-or-state', required: true},
  {name: 'postal_code', label: 'postal-code', required: true},
  {name: 'country_code', label: 'country-code', required: true},
  {name: 'phone', label: 'phone', required: false, keyboardType: 'phone-pad'},
];

const AddressForm = ({route}: Props) => {
  const {l10n} = useLocalization();
  const address = route.params?.address;
  const isEditing = !!address;
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const defaultValues = isEditing
    ? {...createEmptyAddress(), ...address}
    : createEmptyAddress();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      first_name: defaultValues.first_name || '',
      last_name: defaultValues.last_name || '',
      address_1: defaultValues.address_1 || '',
      postal_code: defaultValues.postal_code || '',
      city: defaultValues.city || '',
      country_code: defaultValues.country_code || '',
      phone: defaultValues.phone || '',
      company: defaultValues.company || undefined,
      province: defaultValues.province || undefined,
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (isEditing && address?.id) {
        await apiClient.store.customer.updateAddress(address.id, data);
      } else {
        await apiClient.store.customer.createAddress(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['address-list']});
      navigation.goBack();
    },
  });

  const onSubmit = handleSubmit(data => {
    addAddressMutation.mutate(data);
  });

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar
        title={
          isEditing
            ? l10n.getString('edit-address')
            : l10n.getString('add-address')
        }
      />
      <View className="flex-1">
        <ScrollView className="flex-1">
          <View className="p-4">
            {FIELDS.map(field => (
              <Controller
                key={field.name}
                control={control}
                name={field.name}
                render={({field: {onChange, onBlur, value}}) => (
                  <Input
                    label={l10n.getString(field.label)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={
                      errors[field.name]?.message
                        ? l10n.getString(errors[field.name]?.message || '')
                        : undefined
                    }
                    required={field.required}
                    keyboardType={field.keyboardType}
                  />
                )}
              />
            ))}
          </View>
        </ScrollView>
        <View className="p-4 border-t border-gray-200">
          <Button
            title={
              isEditing
                ? l10n.getString('save-changes')
                : l10n.getString('add-address')
            }
            onPress={onSubmit}
            loading={addAddressMutation.isPending}
          />
        </View>
      </View>
    </View>
  );
};

export default AddressForm;
