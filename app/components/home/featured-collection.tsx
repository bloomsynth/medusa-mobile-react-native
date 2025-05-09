import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import {formatImageUrl} from '@utils/image-url';
import {HttpTypes} from '@medusajs/types';
import apiClient from '@api/client';
import {useRegion} from '@data/region-context';
import PreviewPrice from '@components/product/preview-price';
import {getProductPrice} from '@utils/product-price';
import {TabActions} from '@react-navigation/native';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.35;
const ITEM_GAP = 16;

type FeaturedCollectionProps = {
  limit?: number;
  name?: string;
  showCta?: boolean;
  queryKey?: string[];
};

const FeaturedCollection = ({
  limit = 10,
  name,
  showCta = true,
  queryKey,
}: FeaturedCollectionProps) => {
  const {l10n} = useLocalization();
  const navigation = useNavigation();
  const {region} = useRegion();

  const {data} = useQuery({
    queryKey: queryKey ?? ['products', name, region?.id],
    queryFn: async () => {
      const response = await apiClient.store.product.list({
        limit: limit,
        region_id: region?.id,
        fields: '*variants.calculated_price',
      });
      return response;
    },
  });

  if (!data?.products || data.products.length === 0) {
    return null;
  }

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-content-bold">
          {name ?? l10n.getString('top-selling')}
        </Text>
        {showCta && (
          <TouchableOpacity
            onPress={() =>
              navigation.dispatch(TabActions.jumpTo('Collections'))
            }>
            <Text className="text-primary">{l10n.getString('see-all')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          decelerationRate="fast"
          snapToInterval={ITEM_WIDTH + ITEM_GAP}
          snapToAlignment="start">
          {data.products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    gap: ITEM_GAP,
  },
});

const ProductCard = ({product}: {product: HttpTypes.StoreProduct}) => {
  const navigation = useNavigation();
  const {cheapestPrice} = getProductPrice({product});

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ProductDetail', {productId: product.id})
      }
      style={{width: ITEM_WIDTH}}
      className="gap-2">
      <Image
        source={{uri: formatImageUrl(product.thumbnail)}}
        className="w-full h-48 rounded-lg"
        resizeMode="cover"
      />
      <View className="gap-1">
        <Text className="text-base font-content-bold" numberOfLines={1}>
          {product.title}
        </Text>
        {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
      </View>
    </TouchableOpacity>
  );
};

export default FeaturedCollection;
