import React, {useState} from 'react';
import {View} from 'react-native';
import {
  Dropdown as BaseDropdown,
  type IDropdownRef,
} from 'react-native-element-dropdown';
import Text from './text';
import {DropdownProps as BaseDropdownProps} from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model';

type DropdownProps<T> = BaseDropdownProps<T> & {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
};

const Dropdown = React.forwardRef<IDropdownRef, DropdownProps<any>>(
  (
    {
      label,
      error,
      required,
      containerClassName = '',
      className = '',
      onChangeText,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className={`mb-4 ${containerClassName}`}>
        {label && (
          <Text className="text-base mb-2">
            {label}
            {required && '*'}
          </Text>
        )}
        <View
          className={`border rounded-lg p-4 text-base text-content ${
            error
              ? 'border-red-500'
              : isFocused
              ? 'border-primary'
              : 'border-gray-300'
          } ${className}`}>
          <BaseDropdown
            ref={ref}
            onChangeText={text => {
              onChangeText?.(text);
            }}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            {...props}
          />
        </View>
        {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
      </View>
    );
  },
);

Dropdown.displayName = 'Input';

export default Dropdown;
