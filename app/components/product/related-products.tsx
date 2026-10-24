import React from 'react';
import { useLocalization } from '@fluent/react';
import { HttpTypes } from '@medusajs/types';
import FeaturedCollection from '@components/home/featured-collection';
import { useRegion } from '@data/region-context';

// Products in the same collection are the closest match; fall back to shared
// categories. Products with neither have nothing meaningful to suggest.
export const getRelatedProductsParams = (
  product: HttpTypes.StoreProduct,
): Partial<HttpTypes.StoreProductListParams> | undefined => {
  if (product.collection_id) {
    return { collection_id: [product.collection_id] };
  }
  const categoryIds = product.categories?.map(category => category.id) ?? [];
  if (categoryIds.length > 0) {
    return { category_id: categoryIds };
  }
  return undefined;
};

const RelatedProducts = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const { l10n } = useLocalization();
  const { region } = useRegion();
  const params = getRelatedProductsParams(product);

  if (!params) {
    return null;
  }

  return (
    <FeaturedCollection
      name={l10n.getString('related-products')}
      showCta={false}
      queryKey={['products', 'related', region?.id ?? '', product.id]}
      additionalParams={params}
      excludeProductId={product.id}
    />
  );
};

export default RelatedProducts;
