import React from 'react';
import {View, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import Text from '@components/common/text';
import Navbar from '@components/common/navbar';
import {useCustomer} from '@data/customer-context';
import Button from '@components/common/button';
import {useNavigation} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import apiClient from '@api/client';
import {useColors} from '@styles/hooks';
import Icon from '@react-native-vector-icons/ant-design';
import {HttpTypes} from '@medusajs/types';
import twColors from 'tailwindcss/colors';
import {useCountries} from '@data/region-context';
import utils from '@utils/common';

const AddressList = () => {
  const {customer} = useCustomer();
  const colors = useColors();
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const {data, refetch, isRefetching} = useQuery({
    queryKey: ['address-list'],
    queryFn: async () => {
      const {addresses} = await apiClient.store.customer.listAddress();
      return addresses;
    },
    enabled: !!customer,
  });

  const countries = useCountries();

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await apiClient.store.customer.deleteAddress(addressId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['address-list']});
    },
  });

  const handleDelete = (addressId: string) => {
    deleteAddressMutation.mutate(addressId);
  };

  const renderAddressCard = (address: HttpTypes.StoreCustomerAddress) => (
    <View
      key={address.id}
      className="bg-background rounded-lg p-4 mb-4 border border-gray-200">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 gap-1">
          <Text className="font-bold mb-1">
            {address.first_name} {address.last_name}
          </Text>
          <Text className="text-gray-500">{address.address_1}</Text>
          {address.address_2 && (
            <Text className="text-gray-500">{address.address_2}</Text>
          )}
          <Text className="text-gray-500">
            {address.city}, {address.province} {address.postal_code}
          </Text>
          <Text className="text-gray-500">
            {utils.getCountryName(address.country_code || '', countries)}
          </Text>
          {address.phone && (
            <Text className="text-gray-500">{address.phone}</Text>
          )}
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddressForm', {
                address,
              })
            }
            className="p-2">
            <Icon name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(address.id)}
            className="p-2">
            <Icon name="delete" size={20} color={twColors.red[500]} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!customer) {
    return (
      <View className="flex-1 bg-background p-safe">
        <Navbar title="Addresses" />
        <Text className="text-center text-gray-500 mt-6">
          Please sign in to view your addresses
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title="Addresses" />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[colors.primary]}
            />
          }>
          <View className="p-4">
            {data?.map(renderAddressCard)}
            {data?.length === 0 && (
              <Text className="text-center text-gray-500">
                No addresses found
              </Text>
            )}
          </View>
        </ScrollView>
        <View className="p-4 border-t border-gray-200">
          <Button
            title="Add New Address"
            // @ts-ignore
            onPress={() => navigation.navigate('AddressForm')}
          />
        </View>
      </View>
    </View>
  );
};

export default AddressList;
