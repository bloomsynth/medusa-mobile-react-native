import React, { useState } from 'react';
import {
  TextInput,
  TextInputInstance,
  TextInputProps,
  View,
} from 'react-native';
import Text from './text';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
};

const Input = React.forwardRef<TextInputInstance, InputProps>(
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
        <TextInput
          ref={ref}
          className={`border rounded-lg p-4 text-base text-content ${
            error
              ? 'border-red-500'
              : isFocused
              ? 'border-primary'
              : 'border-gray-300'
          } ${className}`}
          onChangeText={text => {
            onChangeText?.(text);
          }}
          onFocus={e => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
