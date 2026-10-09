import { HttpTypes } from '@medusajs/types';
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

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

type CarouselProps = {
  data: HttpTypes.StoreProductImage[];
};

const PagiationTw = cssInterop(Pagination, {
  containerClassName: 'containerStyle',
  dotClassName: 'dotStyle',
  activeDotClassName: 'activeDotStyle',
});

const ImageCarousel = ({ data }: CarouselProps) => {
  const ref = React.useRef<CarouselRef>(null);
  const progress = useSharedValue<number>(0);
  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      index,
      animated: true,
    });
  };

  return (
    <View className="bg-background-secondary">
      <Carousel
        ref={ref}
        style={{ width, height: height * 0.4 }}
        data={data}
        loop={false}
        progress={progress}
        renderItem={({ index }) => {
          const uri = formatImageUrl(data[index].url);
          return (
            <Image
              source={{ uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          );
        }}
      />
      {data.length > 1 && (
        <View className="absolute left-0 right-0 bottom-8">
          <PagiationTw
            progress={progress}
            count={data.length}
            onPress={onPressPagination}
            dotClassName="bg-gray-200 rounded-full"
            activeDotClassName="bg-gray-600"
            containerClassName="gap-2 justify-center"
            dotStyle={styles.paginationDot}
          />
        </View>
      )}
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  paginationDot: { width: 8, height: 8 },
});
