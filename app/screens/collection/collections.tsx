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
import {HttpTypes} from '@medusajs/types';
import Loader from '@components/common/loader';
import ErrorUI from '@components/common/error-ui';
import FeaturedCollection from '@components/home/featured-collection';

export default function Collections() {
  const {l10n} = useLocalization();
  const colors = useColors();
  const navigation = useNavigation();
  const {data, isLoading, error} = useQuery({
    queryKey: ['collections'],
    queryFn: () => apiClient.store.collection.list(),
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorUI />;
  }

  const renderItem = ({item}: {item: HttpTypes.StoreCollection}) => (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('CollectionDetail', {collectionId: item.id});
      }}
      className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-base font-medium text-content">{item.title}</Text>
      </View>
      <Icon name="right" size={18} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title={l10n.getString('collections')} showBackButton={false} />

      <View className="border-t border-gray-200 mb-4">
        <FlatList
          data={data?.collections}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerClassName="pb-4"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-base text-content text-center">
                {l10n.getString('no-collections-found')}
              </Text>
            </View>
          }
        />
      </View>
      <View className="px-5">
        <FeaturedCollection
          name={l10n.getString('trending-products')}
          showCta={false}
        />
      </View>
    </View>
  );
}
