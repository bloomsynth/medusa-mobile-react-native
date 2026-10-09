import { formatImageUrl } from '@utils/image-url';
import { cssInterop } from 'nativewind';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  Carousel,
  CarouselRef,
  Pagination,
} from 'react-native-reanimated-carousel';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;

type HeroCarouselItem = {
  type: 'product' | 'category' | 'collection';
  entityId: string;
  imageUrl: string;
};

const PagiationTw = cssInterop(Pagination, {
  containerClassName: 'containerStyle',
  dotClassName: 'dotStyle',
  activeDotClassName: 'activeDotStyle',
});

const HeroCarousel = () => {
  const ref = React.useRef<CarouselRef>(null);
  const progress = useSharedValue<number>(0);
  const navigation = useNavigation();
  const enableNavigation = false;

  const { data } = useQuery<HeroCarouselItem[]>({
    queryKey: ['hero-carousel'],
    queryFn: async () => {
      const response = await fetch(
        'https://dummyjson.com/c/9fd9-bd11-4526-8405',
      );
      return response.json();
    },
  });

  if (!data || data.length === 0) {
    return null;
  }

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      index,
      animated: true,
    });
  };

  const onPressItem = (index: number) => {
    if (!enableNavigation) {
      return;
    }
    const item = data[index];
    if (item.type === 'product') {
      navigation.navigate('ProductDetail', { productId: item.entityId });
    }
    if (item.type === 'category') {
      navigation.navigate('CategoryDetail', { categoryId: item.entityId });
    }
    if (item.type === 'collection') {
      navigation.navigate('CollectionDetail', { collectionId: item.entityId });
    }
  };

  return (
    <View className="items-center gap-2 mb-4">
      <Carousel
        ref={ref}
        style={styles.carousel}
        data={data}
        loop={true}
        autoplay={true}
        autoplayInterval={4000}
        progress={progress}
        layout={{
          type: 'parallax',
          scale: 0.92,
          offset: 0,
        }}
        renderItem={({ index }) => {
          const uri = formatImageUrl(data[index].imageUrl);
          return (
            <Pressable onPress={() => onPressItem(index)}>
              <Image
                source={{ uri }}
                className="w-full h-full rounded-lg border border-gray-200"
                resizeMode="cover"
              />
            </Pressable>
          );
        }}
      />
      {data.length > 1 && (
        <PagiationTw
          progress={progress}
          count={data.length}
          onPress={onPressPagination}
          dotClassName="bg-gray-400 rounded-full"
          activeDotClassName="bg-content"
          containerClassName="gap-3"
          dotStyle={styles.paginationDot}
        />
      )}
    </View>
  );
};

export default HeroCarousel;

const styles = StyleSheet.create({
  carousel: { width, height: 115 },
  paginationDot: { width: 8, height: 8 },
});
