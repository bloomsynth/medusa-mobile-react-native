import React from 'react';
import { Pressable, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  useSharedValue,
  SharedValue,
} from 'react-native-reanimated';
import Icon from '@react-native-vector-icons/ant-design';
import { useColors } from '@styles/hooks';

const OFFSET = 56; // Distance between buttons
const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

type IconName = 'tool' | 'switcher' | 'plus' | 'setting' | 'database' | 'bug';

type ActionButton = {
  icon: IconName;
  onPress: () => void;
  label?: string;
};

type FabButtonProps = {
  actions: ActionButton[];
  mainIcon?: IconName;
};

const ActionButton = ({
  isExpanded,
  index,
  icon,
  onPress,
}: {
  isExpanded: SharedValue<boolean>;
  index: number;
  icon: IconName;
  onPress: () => void;
}) => {
  const colors = useColors();
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;
    const scaleValue = isExpanded.value ? 1 : 0;

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(delay, withTiming(scaleValue)),
        },
      ],
      opacity: withDelay(delay, withTiming(isExpanded.value ? 1 : 0)),
    };
  });

  return (
    <Animated.View className="absolute bottom-0 right-0" style={animatedStyles}>
      <TouchableOpacity
        onPress={onPress}
        className="bg-background p-4 rounded-full justify-center items-center elevation-sm "
      >
        <Icon name={icon} size={24} color={colors.content} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const FabButton = ({ actions, mainIcon = 'plus' }: FabButtonProps) => {
  const colors = useColors();
  const isExpanded = useSharedValue(false);

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };

  const mainButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(
            isExpanded.value ? '45deg' : '0deg',
            SPRING_CONFIG,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View>
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          isExpanded={isExpanded}
          index={index + 1}
          icon={action.icon}
          onPress={action.onPress}
        />
      ))}
      <Pressable onPress={toggleExpanded}>
        <Animated.View
          style={mainButtonStyle}
          className="bg-primary p-4 self-center rounded-full justify-center items-center elevation-md"
        >
          <Icon name={mainIcon} size={24} color={colors.contentSecondary} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export default FabButton;
