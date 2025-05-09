import React, {useState} from 'react';
import {View, TouchableOpacity, ScrollView, Keyboard} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import Input from '@components/common/input';
import Button from '@components/common/button';
import {useCustomer} from '@data/customer-context';
import {CommonActions, useNavigation} from '@react-navigation/native';
import Navbar from '@components/common/navbar';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'first-name-is-required'),
  lastName: z.string().min(1, 'last-name-is-required'),
  email: z.string().email('invalid-email-address'),
  password: z.string().min(6, 'password-must-be-at-least-n-characters'),
});

type RegisterSchema = z.infer<typeof registerSchema>;

const Register = () => {
  const {l10n} = useLocalization();
  const [loading, setLoading] = useState(false);
  const {register: registerCustomer} = useCustomer();
  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    setError: setFormError,
    formState: {errors},
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      await registerCustomer(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
      );
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Main',
              state: {
                routes: [{name: 'Profile'}],
              },
            },
          ],
        }),
      );
    } catch (err) {
      setFormError('root', {
        type: 'manual',
        message:
          err instanceof Error
            ? err.message
            : l10n.getString('registration-failed'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title={l10n.getString('register')} />

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4 gap-4">
          {errors.root && (
            <Text className="text-red-500 text-center">
              {errors.root.message}
            </Text>
          )}

          <Controller
            control={control}
            name="firstName"
            render={({field: {onChange, value}}) => (
              <Input
                label={l10n.getString('first-name')}
                placeholder={l10n.getString('enter-your-first-name')}
                value={value}
                onChangeText={onChange}
                error={
                  errors.firstName?.message
                    ? l10n.getString(errors.firstName.message)
                    : undefined
                }
                containerClassName="mb-0"
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({field: {onChange, value}}) => (
              <Input
                label={l10n.getString('last-name')}
                placeholder={l10n.getString('enter-your-last-name')}
                value={value}
                onChangeText={onChange}
                error={
                  errors.lastName?.message
                    ? l10n.getString(errors.lastName.message)
                    : undefined
                }
                containerClassName="mb-0"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({field: {onChange, value}}) => (
              <Input
                label={l10n.getString('email')}
                placeholder={l10n.getString('enter-your-email')}
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                error={
                  errors.email?.message
                    ? l10n.getString(errors.email.message)
                    : undefined
                }
                containerClassName="mb-0"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({field: {onChange, value}}) => (
              <Input
                label={l10n.getString('password')}
                placeholder={l10n.getString('enter-your-password')}
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={
                  errors.password?.message
                    ? l10n.getString(errors.password.message, {n: 6})
                    : undefined
                }
                containerClassName="mb-0"
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            title={
              loading
                ? l10n.getString('creating-account')
                : l10n.getString('create-account')
            }
          />

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text className="text-center text-primary">
              {l10n.getString('already-have-an-account')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Register;
