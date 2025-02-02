import {useColors} from '@styles/hooks';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';

const Loader = () => {
  const colors = useColors();
  return (
    <View className="flex-1 bg-background p-4">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default Loader;
