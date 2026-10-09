import { useNavigation, StackActions } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import Text from '@components/common/text';
import { useTheme } from '@styles/hooks';

const Splash = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  useEffect(() => {
    setTimeout(() => {
      navigation.dispatch(StackActions.replace('Main'));
    }, 300);
  }, [navigation]);
  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View className="flex-1 justify-center items-center bg-primary">
        <Text
          type="display"
          className="text-content-secondary text-5xl text-center"
        >
          MEDUSA{'\n'}MOBILE
        </Text>
      </View>
    </>
  );
};

export default Splash;
