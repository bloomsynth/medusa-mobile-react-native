import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/ant-design';
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '@fluent/react';
import { useColors } from '@styles/hooks';
import Text from '@components/common/text';

const SearchBar = () => {
  const { l10n } = useLocalization();
  const colors = useColors();
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      accessibilityRole="search"
      accessibilityLabel={l10n.getString('search-products')}
      onPress={() => navigation.navigate('Search')}
      className="mx-5 mt-2 h-12 flex-row items-center gap-2 px-4 rounded-full bg-content-secondary elevation-sm"
    >
      <Icon name="search" size={16} color={colors.primary} />
      <Text className="text-base opacity-60">
        {l10n.getString('search-products')}
      </Text>
    </TouchableOpacity>
  );
};

export default SearchBar;
