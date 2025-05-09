import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import Navbar from '@components/common/navbar';
import {useCustomer} from '@data/customer-context';
import apiClient from '@api/client';
import {HttpTypes} from '@medusajs/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {useQuery} from '@tanstack/react-query';
import Loader from '@components/common/loader';
import ErrorUI from '@components/common/error-ui';
import {formatImageUrl} from '@utils/image-url';
import {convertToLocale} from '@utils/product-price';
import {useNavigation} from '@react-navigation/native';
import {getFulfillmentStatus, type FulfillmentStatus} from '@utils/order';

import {useColors} from '@styles/hooks';
dayjs.extend(relativeTime);

type Order = HttpTypes.StoreOrder;

const MAX_THUMBNAILS = 5;

const OrdersScreen = () => {
  const {l10n} = useLocalization();
  const {customer} = useCustomer();
  const navigation = useNavigation();

  const {isPending, error, data, refetch, isRefetching} = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.store.order.list(),
    enabled: !!customer,
  });

  const colors = useColors();

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderDetail', {orderId});
  };

  const renderOrderItem = ({item}: {item: Order}) => {
    const itemsToShow = item.items?.slice(0, MAX_THUMBNAILS) || [];
    const remainingItems = (item.items?.length || 0) - MAX_THUMBNAILS;

    return (
      <TouchableOpacity
        className="bg-background rounded-lg p-4 mb-4 border border-primary"
        onPress={() => handleOrderPress(item.id)}>
        <View className="flex-row justify-between mb-2">
          <Text className="text-base font-bold">
            {l10n.getString('order-with-id', {id: item.display_id ?? '-'})}
          </Text>
          <Text className="text-sm text-gray-500">
            {dayjs(item.created_at).fromNow()}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-700">
            {l10n.getString(
              getFulfillmentStatus(
                item.fulfillment_status as FulfillmentStatus,
              ),
            )}
          </Text>
          <Text className="text-base font-semibold">
            {convertToLocale({
              amount: item.total,
              currency_code: item.currency_code,
            })}
          </Text>
        </View>
        <View className="flex-row items-center mt-2">
          <View className="flex-1 flex-row justify-between">
            <View className="flex-row gap-2">
              {itemsToShow.map(
                orderItem =>
                  orderItem.thumbnail && (
                    <Image
                      key={orderItem.id}
                      source={{uri: formatImageUrl(orderItem.thumbnail)}}
                      className="w-12 h-12"
                      resizeMode="cover"
                    />
                  ),
              )}
            </View>
            {remainingItems > 0 && (
              <Text className="text-sm text-gray-500 ml-2">
                {l10n.getString('remaining-items', {
                  count: String(remainingItems),
                })}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleOrderPress(item.id)}
            className="bg-primary rounded-lg p-3">
            <Text className="text-content-secondary">
              {l10n.getString('view')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-gray-500 mt-2">
          {l10n.getString('count-items', {
            count: String(item.items?.length || 0),
          })}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!customer) {
    return (
      <View className="flex-1 bg-background">
        <Navbar title={l10n.getString('orders')} />
        <Text className="text-center text-gray-500 mt-6">
          {l10n.getString('sign-in-to-view-orders')}
        </Text>
      </View>
    );
  }

  if (isPending) {
    return (
      <View className="flex-1 bg-background">
        <Navbar title={l10n.getString('orders')} />
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background">
        <Navbar title={l10n.getString('orders')} />
        <ErrorUI />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title={l10n.getString('orders')} />
      <FlatList
        data={data.orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-6">
            {l10n.getString('no-orders-found')}
          </Text>
        }
      />
    </View>
  );
};

export default OrdersScreen;
