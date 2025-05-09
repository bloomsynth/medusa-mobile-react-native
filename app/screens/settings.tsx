import React from 'react';
import {View, ScrollView} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import Navbar from '@components/common/navbar';
import {DEFAULT_LOCALE, useLocale} from '@data/locale-context';
import Button from '@components/common/button';
import Dropdown from '@components/common/dropdown';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';

const settingSchema = z.object({
  language: z.enum(['en-US', 'id-ID'], {message: 'language-is-required'}),
});

type ProfileFormData = z.infer<typeof settingSchema>;

type DropdownData = {
  label: string;
  value: ProfileFormData['language'];
};

const dropdownData: DropdownData[] = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: 'Bahasa',
    value: 'id-ID',
  },
];

const Settings = () => {
  const {l10n} = useLocalization();
  const {locale, setLocale} = useLocale();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      language: DEFAULT_LOCALE,
    },
  });

  const handleSave = React.useMemo(
    () =>
      handleSubmit(data => {
        setLocale(data.language);
      }),
    [handleSubmit, setLocale],
  );

  const renderContent = () => {
    return (
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-gray-500">{l10n.getString('language')}</Text>
          <Controller
            control={control}
            name="language"
            render={({field: {onChange, onBlur, value}}) => (
              <Dropdown
                data={dropdownData}
                value={value}
                onBlur={onBlur}
                onChange={data => onChange(data.value)}
                labelField="label"
                placeholder={l10n.getString('select-language')}
                valueField="value"
                error={
                  errors.language?.message
                    ? l10n.getString(errors.language.message)
                    : undefined
                }
              />
            )}
          />
        </View>
      </View>
    );
  };

  React.useEffect(() => {
    reset({
      language: locale,
    });
  }, [locale, reset]);

  return (
    <View className="flex-1 bg-background p-safe">
      <Navbar title={l10n.getString('settings')} />
      <View className="flex-1">
        <ScrollView className="flex-1">
          <View className="p-4 pb-8">{renderContent()}</View>
        </ScrollView>
        <View className="p-4 border-t border-gray-200">
          <Button
            title={l10n.getString('save')}
            onPress={handleSave}
            variant="primary"
          />
        </View>
      </View>
    </View>
  );
};

export default Settings;
