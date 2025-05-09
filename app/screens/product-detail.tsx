import React, {PropsWithChildren, useMemo, useState} from 'react';
import {useNavigation, type StaticScreenProps} from '@react-navigation/native';
import {View} from 'react-native';
import {useLocalization} from '@fluent/react';
import AnimatedCartButton from '@components/cart/animated-cart-button';
import apiClient from '@api/client';
import {useQuery} from '@tanstack/react-query';
import Loader from '@components/common/loader';
import ErrorUI from '@components/common/error-ui';
import ImageCarousel from '@components/product/image-carousel';
import Icon from '@react-native-vector-icons/ant-design';
import {ScrollView} from 'react-native-gesture-handler';
import Text from '@components/common/text';
import ProductPrice from '@components/product/product-price';
import Card from '@components/common/card';
import utils from '@utils/common';
import OptionSelect from '@components/product/option-select';
import {HttpTypes} from '@medusajs/types';
import {useColors} from '@styles/hooks';
import RoundedButton from '@components/common/rounded-button';
import {useRegion} from '@data/region-context';
import WishlistButton from '@components/product/wishlist-button';

type Props = StaticScreenProps<{
  productId: string;
}>;

function ProductScreen({route}: Props) {
  const {l10n} = useLocalization();
  const {productId} = route.params;
  const {region} = useRegion();
  const {data, error, isPending} = useQuery({
    queryKey: ['product', productId],
    queryFn: () =>
      apiClient.store.product.retrieve(productId, {
        region_id: region?.id,
        fields: '*variants.inventory_quantity',
      }),
  });

  if (isPending) {
    return <Loader />;
  } else if (error || !data?.product) {
    return <ErrorUI />;
  }

  const {product} = data;

  return <ProductContent product={product} />;
}

const ProductContent = ({product}: {product: HttpTypes.StoreProduct}) => {
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    {},
  );

  const isSingleVariant = useMemo(() => {
    return product.variants?.length === 1;
  }, [product.variants]);

  const optionsAsKeymap = (
    variantOptions: HttpTypes.StoreProductVariant['options'],
  ) => {
    return variantOptions?.reduce(
      (acc: Record<string, string>, varopt: any) => {
        acc[varopt.option_id] = varopt.value;
        return acc;
      },
      {},
    );
  };

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return;
    }

    if (isSingleVariant) {
      return product.variants[0];
    }

    return product.variants.find(v => {
      const variantOptions = optionsAsKeymap(v.options);
      return utils.areEqualObjects(variantOptions, options);
    });
  }, [product.variants, options, isSingleVariant]);

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return selectedVariant?.id !== undefined;
  }, [selectedVariant?.id]);

  const hasSelectedAllOptions = useMemo(() => {
    return product.options?.every(option => options[option.id]);
  }, [product.options, options]);

  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true;
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true;
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true;
    }

    // Otherwise, we can't add to cart
    return false;
  }, [selectedVariant]);

  const setOptionValue = (optionId: string, value: string) => {
    setOptions(prev => ({
      ...prev,
      [optionId]: value,
    }));
  };

  return (
    <View className="flex-1 bg-background-secondary p-safe">
      <ScrollView className="flex-1">
        <View>
          <ImageCarousel data={product.images ?? []} />
          <View className="absolute w-full">
            <Header />
          </View>
        </View>
        <View className="p-4 -mt-8">
          <Card>
            <View className="flex-row justify-between items-center">
              <Text className="font-content-bold text-xl">{product.title}</Text>
              <WishlistButton product={product} />
            </View>
            <View className="mt-2">
              <RatingSummary />
            </View>
            <Text className="text-base opacity-80 mt-2">
              {product.description}
            </Text>
            <View className="mt-2">
              <ProductPrice product={product} variant={selectedVariant} />
            </View>
          </Card>
          {!isSingleVariant && (
            <View className="mt-4">
              <Card>
                <SelectVariant
                  product={product}
                  setOptionValue={setOptionValue}
                  options={options}
                />
              </Card>
            </View>
          )}
          <View className="mt-4">
            <Card>
              <ProductAttributes product={product} />
            </Card>
          </View>
          <View className="mt-4">
            <Card>
              <Features />
            </Card>
          </View>
        </View>
      </ScrollView>
      <View className="border-t border-gray-200">
        <AnimatedCartButton
          productId={product.id}
          selectedVariantId={selectedVariant?.id}
          disabled={!isValidVariant || !inStock}
          inStock={inStock}
          hasSelectedAllOptions={hasSelectedAllOptions}
        />
      </View>
    </View>
  );
};

const Header = () => {
  const navigation = useNavigation();
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <View className="flex-row justify-between items-center p-4">
      <RoundedButton onPress={goBack}>
        <Icon name="left" size={14} />
      </RoundedButton>
    </View>
  );
};

type SelectVariantProps = {
  product: HttpTypes.StoreProduct;
  setOptionValue: (optionId: string, value: string) => void;
  // isAdding: boolean;
  options: Record<string, string | undefined>;
};

const SelectVariant = ({
  product,
  setOptionValue,
  options,
}: SelectVariantProps) => {
  return (
    <View className="flex flex-col gap-y-4">
      {product.options?.map(option => (
        <View key={option.id}>
          <OptionSelect
            option={option}
            current={options[option.id]}
            updateOption={setOptionValue}
            title={option.title ?? ''}
            disabled={false}
          />
        </View>
      ))}
      <View />
    </View>
  );
};

const ProductAttributes = ({product}: {product: any}) => {
  const {l10n} = useLocalization();

  return (
    <View>
      <Text className="text-xl mb-6 opacity-75">
        {l10n.getString('product-information')}
      </Text>
      <View className="flex flex-row justify-between gap-x-8">
        <View className="flex flex-col flex-1 gap-y-4">
          <View>
            <Text className="font-semibold opacity-75">
              {l10n.getString('material')}
            </Text>
            <Text>{product.material ? product.material : '-'}</Text>
          </View>
          <View>
            <Text className="font-semibold opacity-75">
              {l10n.getString('country-of-origin')}
            </Text>
            <Text>{product.origin_country ? product.origin_country : '-'}</Text>
          </View>
          <View>
            <Text className="font-semibold opacity-75">
              {l10n.getString('type')}
            </Text>
            <Text>{product.type ? product.type.value : '-'}</Text>
          </View>
        </View>
        <View className="flex flex-col flex-1 gap-y-4">
          <View>
            <Text className="font-semibold opacity-75">
              {l10n.getString('weight')}
            </Text>
            <Text>{product.weight ? `${product.weight} g` : '-'}</Text>
          </View>
          <View>
            <Text className="font-semibold opacity-75">
              {l10n.getString('dimensions')}
            </Text>
            <Text>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : '-'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const Features = () => {
  const {l10n} = useLocalization();
  const colors = useColors();
  return (
    <View className="flex-row gap-2">
      <FeatureWrapper>
        <Icon name="swap" size={30} color={colors.content} />
        <Text className="text-sm font-content-bold">
          {l10n.getString('days-return', {count: 7})}
        </Text>
      </FeatureWrapper>
      <FeatureWrapper>
        <Icon name="dingding" size={30} color={colors.content} />
        <Text className="text-sm font-content-bold">
          {l10n.getString('fast-delivery')}
        </Text>
      </FeatureWrapper>
    </View>
  );
};

const FeatureWrapper = ({children}: PropsWithChildren<{}>) => {
  return (
    <View className="flex-1 bg-background-secondary gap-2 rounded-lg p-2 justify-center items-center opacity-80">
      {children}
    </View>
  );
};

const RatingSummary = () => {
  const colors = useColors();
  return (
    <View className="flex-row items-center gap-1">
      <View className="flex-row items-center px-1 py-[1] bg-green-500 rounded-md">
        <Icon name="star" size={16} color={colors.contentSecondary} />
        <Text className="text-base text-content-secondary opacity-80 ml-1">
          4.5
        </Text>
      </View>
      <Text className="text-sm opacity-50">(102)</Text>
    </View>
  );
};

export default ProductScreen;
