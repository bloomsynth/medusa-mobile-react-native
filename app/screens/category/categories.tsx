import React from 'react';
import {View, FlatList, TouchableOpacity} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {useLocalization} from '@fluent/react';
import Navbar from '@components/common/navbar';
import Text from '@components/common/text';
import {useColors} from '@styles/hooks';
import apiClient from '@api/client';
import Icon from '@react-native-vector-icons/ant-design';
import {StoreProductCategory} from '@medusajs/types';
import Loader from '@components/common/loader';
import ErrorUI from '@components/common/error-ui';

export default function Categories() {
  const {l10n} = useLocalization();
  const colors = useColors();
  const navigation = useNavigation();
  const {data, isLoading, error} = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.store.category.list(),
  });

  if (isLoading) {
    <Loader />;
  }

  if (error) {
    return <ErrorUI />;
  }

  const renderItem = ({item}: {item: StoreProductCategory}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('CategoryDetail', {categoryId: item.id});
      }}
      className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-base font-medium text-content">{item.name}</Text>
        {item.description && (
          <Text className="text-sm text-content-light mt-1" numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      <Icon name="right" size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title={l10n.getString('categories')} showBackButton={false} />
      <View className="border-t border-gray-200">
        <FlatList
          data={data?.product_categories}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerClassName="pb-4"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-base text-content text-center">
                {l10n.getString('no-categories-found')}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
