import React, {useState} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import Navbar from '@components/common/navbar';
import {useCustomer} from '@data/customer-context';
import Button from '@components/common/button';
import Input from '@components/common/input';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import apiClient from '@api/client';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useColors} from '@styles/hooks';

const profileSchema = z.object({
  first_name: z.string().min(1, 'first-name-is-required'),
  last_name: z.string().min(1, 'last-name-is-required'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileDetails = () => {
  const {l10n} = useLocalization();
  const {customer, refreshCustomer} = useCustomer();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
    },
  });

  const colors = useColors();

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiClient.store.customer.update(data);
      await refreshCustomer();
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCustomer();
      // Update form values with refreshed data
      reset({
        first_name: customer?.first_name || '',
        last_name: customer?.last_name || '',
        phone: customer?.phone || '',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSave = handleSubmit(data => {
    updateCustomerMutation.mutate(data);
  });

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
    });
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-gray-500">
              {l10n.getString('first-name')}
            </Text>
            <Controller
              control={control}
              name="first_name"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={l10n.getString('first-name')}
                  error={
                    errors.first_name?.message
                      ? l10n.getString(errors.first_name.message)
                      : undefined
                  }
                />
              )}
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-500">{l10n.getString('last-name')}</Text>
            <Controller
              control={control}
              name="last_name"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={l10n.getString('last-name')}
                  error={
                    errors.last_name?.message
                      ? l10n.getString(errors.last_name.message)
                      : undefined
                  }
                />
              )}
            />
          </View>

          <View className="gap-2">
            <Text className="text-gray-500">{l10n.getString('phone')}</Text>
            <Controller
              control={control}
              name="phone"
              render={({field: {onChange, onBlur, value}}) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={l10n.getString('phone')}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />
          </View>
        </View>
      );
    }

    return (
      <View className="gap-6">
        <View className="border-b border-gray-200 pb-6">
          <Text className="text-gray-500 mb-1">{l10n.getString('name')}</Text>
          <Text className="text-lg">
            {customer?.first_name} {customer?.last_name}
          </Text>
        </View>

        <View className="border-b border-gray-200 pb-6">
          <Text className="text-gray-500 mb-1">{l10n.getString('email')}</Text>
          <Text className="text-lg">{customer?.email}</Text>
        </View>

        <View className="border-b border-gray-200 pb-6">
          <Text className="text-gray-500 mb-1">{l10n.getString('phone')}</Text>
          <Text className="text-lg">{customer?.phone || '-'}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title={l10n.getString('profile-details')} />
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }>
          <View className="p-4 pb-8">{renderContent()}</View>
        </ScrollView>
        <View className="p-4 border-t border-gray-200">
          {isEditing ? (
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Button
                  variant="secondary"
                  title={l10n.getString('cancel')}
                  onPress={handleCancel}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={l10n.getString('save')}
                  onPress={handleSave}
                  loading={updateCustomerMutation.isPending}
                />
              </View>
            </View>
          ) : (
            <Button
              title={l10n.getString('edit-profile')}
              onPress={() => setIsEditing(true)}
              variant="primary"
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ProfileDetails;
