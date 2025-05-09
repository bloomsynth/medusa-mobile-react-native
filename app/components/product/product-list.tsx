import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {HttpTypes} from '@medusajs/types';
import {useLocalization} from '@fluent/react';
import {useColors} from '@styles/hooks';
import Text from '@components/common/text';
import Loader from '@components/common/loader';
import ErrorUI from '@components/common/error-ui';
import {getProductPrice} from '@utils/product-price';
import {formatImageUrl} from '@utils/image-url';
import PreviewPrice from '@components/product/preview-price';
import apiClient from '@api/client';
import {useRegion} from '@data/region-context';
import WishlistButton from './wishlist-button';

const LIMIT = 10;

type ProductListRes = {
  products: HttpTypes.StoreProduct[];
  count: number;
  offset: number;
  limit: number;
};

type ProductsListProps = {
  queryKey?: string[];
  additionalParams?: Partial<HttpTypes.StoreProductListParams>;
  headerComponent?: React.ReactElement;
  name?: string;
  hideTitle?: boolean;
};

const ProductsList = ({
  queryKey,
  additionalParams = {},
  headerComponent,
  name,
  hideTitle = false,
}: ProductsListProps) => {
  const {l10n} = useLocalization();
  const colors = useColors();
  const {region} = useRegion();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: queryKey ?? ['products', region?.id],
    initialPageParam: 0,
    queryFn: async ({pageParam}) => {
      const params: HttpTypes.StoreProductListParams = {
        limit: LIMIT,
        offset: pageParam,
        fields: '*variants.calculated_price',
        region_id: region?.id,
        order: '-created_at',
        ...additionalParams,
      };
      return apiClient.store.product.list(params);
    },
    getNextPageParam: (lastPage: ProductListRes, pages) => {
      if (lastPage.products.length < LIMIT) {
        return undefined;
      }
      return pages.length * LIMIT;
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorUI />;
  }

  const products = data?.pages.flatMap(page => page.products) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) {
      return null;
    }
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        {headerComponent}
        {!hideTitle && (
          <Text className="text-lg font-content-bold">
            {name ?? l10n.getString('latest-products')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <FlatList
      contentContainerClassName="gap-4 px-5 pb-10"
      columnWrapperClassName="gap-4"
      data={products}
      numColumns={2}
      ListHeaderComponent={renderHeader}
      renderItem={({item}) => <ProductItem product={item} />}
      keyExtractor={item => item.id ?? ''}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
      refreshing={isRefetching}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      }
      onRefresh={refetch}
    />
  );
};

const ProductItem = ({product}: {product: HttpTypes.StoreProduct}) => {
  const {cheapestPrice} = getProductPrice({
    product,
  });
  const navigation = useNavigation();
  const navigateToProduct = () => {
    navigation.navigate('ProductDetail', {productId: product.id});
  };
  return (
    <TouchableOpacity
      onPress={navigateToProduct}
      className="flex-1 max-w-[50%]">
      <View>
        <View>
          <Image
            source={{uri: formatImageUrl(product.thumbnail)}}
            className="w-full h-48 rounded-2xl"
            resizeMode="cover"
          />
          <View className="absolute bottom-2 right-2">
            <WishlistButton product={product} />
          </View>
        </View>
        <Text className="text-base leading-5 font-content-bold mt-1 mb-2">
          {product.title}
        </Text>
        {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
      </View>
    </TouchableOpacity>
  );
};

export default ProductsList;
