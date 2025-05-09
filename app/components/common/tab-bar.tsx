import React from 'react';
import {TouchableNativeFeedback, View} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from './text';
import {useColors} from '@styles/hooks';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Icon from '@react-native-vector-icons/ant-design';

type icon = 'home' | 'appstore' | 'profile' | 'bars';

function TabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const {l10n} = useLocalization();
  const colors = useColors();
  const iconMap: Record<string, icon> = {
    Home: 'home',
    Categories: 'appstore',
    Collections: 'bars',
    Profile: 'profile',
  };

  return (
    <View className="flex-row justify-around bg-background items-center elevation-lg pb-safe">
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const iconName = iconMap[route.name];

        return (
          <TouchableNativeFeedback
            key={route.key}
            onPress={onPress}
            className="flex-1 ">
            <View className="flex-1 h-16 justify-center items-center gap-[1px]">
              <Icon
                name={iconName}
                size={18}
                color={isFocused ? colors.primary : colors.content}
              />
              <Text
                className={`text-sm ${
                  isFocused ? 'text-primary font-content-bold' : 'text-content'
                }`}>
                {l10n.getString(label)}
              </Text>
            </View>
          </TouchableNativeFeedback>
        );
      })}
    </View>
  );
}

export default TabBar;
