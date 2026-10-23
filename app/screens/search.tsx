import React, { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import Icon from '@react-native-vector-icons/ant-design';
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '@fluent/react';
import { useColors } from '@styles/hooks';
import RoundedButton from '@components/common/rounded-button';
import Text from '@components/common/text';
import ProductsList from '@components/product/product-list';
import { useRegion } from '@data/region-context';

export const SEARCH_DEBOUNCE_MS = 300;

const useDebouncedValue = (value: string, delay: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
};

export default function Search() {
  const { l10n } = useLocalization();
  const colors = useColors();
  const navigation = useNavigation();
  const { region } = useRegion();
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DEBOUNCE_MS);

  return (
    <View className="flex-1 bg-background p-safe">
      <View className="px-4 h-14 flex-row items-center gap-3">
        <RoundedButton onPress={() => navigation.goBack()}>
          <Icon name="left" size={14} />
        </RoundedButton>
        <View className="flex-1 h-12 flex-row items-center gap-2 px-4 rounded-full bg-content-secondary elevation-sm">
          <Icon name="search" size={16} color={colors.primary} />
          <TextInput
            testID="search-input"
            className="flex-1 text-base text-content"
            placeholder={l10n.getString('search-products')}
            value={input}
            onChangeText={setInput}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>
      <View className="flex-1 mt-4">
        {query ? (
          <ProductsList
            queryKey={['products', 'search', region?.id ?? '', query]}
            additionalParams={{ q: query }}
            emptyComponent={
              <Text className="text-center mt-8">
                {l10n.getString('no-products-found-for', { query })}
              </Text>
            }
            hideTitle
          />
        ) : (
          <Text className="text-center mt-8 px-5">
            {l10n.getString('search-prompt')}
          </Text>
        )}
      </View>
    </View>
  );
}
