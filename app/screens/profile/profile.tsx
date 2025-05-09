import React from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {useLocalization} from '@fluent/react';
import Text from '@components/common/text';
import MaterialIcon from '@react-native-vector-icons/material-design-icons';
import {useColors} from '@styles/hooks';
import {useNavigation} from '@react-navigation/native';
import Navbar from '@components/common/navbar';
import {useCustomer} from '@data/customer-context';
import twColors from 'tailwindcss/colors';

type ProfileOptionType = {
  icon:
    | 'account-details'
    | 'text-box-multiple-outline'
    | 'map-marker-outline'
    | 'cog-outline'
    | 'logout';
  label: string;
  onPress?: () => void;
};

const Profile = () => {
  const {l10n} = useLocalization();
  const navigation = useNavigation();
  const {customer, logout} = useCustomer();

  if (!customer) {
    return (
      <View className="flex-1 bg-background p-safe">
        <Navbar title={l10n.getString('profile')} showBackButton={false} />
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-content mb-4 text-center">
            {l10n.getString('sign-in-to-view-your-profile')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            className="bg-primary px-8 py-4 rounded-lg">
            <Text className="text-white font-medium">
              {l10n.getString('sign-in')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Main');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const options: ProfileOptionType[] = [
    {
      icon: 'account-details',
      label: l10n.getString('profile-information'),
      onPress: () => navigation.navigate('ProfileDetail'),
    },
    {
      icon: 'text-box-multiple-outline',
      label: l10n.getString('orders'),
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'map-marker-outline',
      label: l10n.getString('shipping-addresses'),
      onPress: () => navigation.navigate('AddressList'),
    },
    {
      icon: 'cog-outline',
      label: l10n.getString('settings'),
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'logout',
      label: l10n.getString('logout'),
      onPress: handleLogout,
    },
  ];

  return (
    <View className="flex-1 bg-background p-safe">
      {/* Header */}
      <Navbar title={l10n.getString('profile')} showBackButton={false} />

      <ScrollView className="flex-1">
        {/* Profile Info Section */}
        <View className="px-5 py-6">
          <View className="items-center mb-6">
            <MaterialIcon
              name="account-circle"
              size={100}
              color={twColors.gray[300]}
            />
            <Text type="display" className="text-content mb-1">
              {customer.first_name} {customer.last_name}
            </Text>
            <Text type="content" className=" text-content opacity-50">
              {customer.email}
            </Text>
          </View>

          {/* Profile Options */}
          <View className="mt-4 gap-4">
            {options.map((option, index) => (
              <ProfileOption
                key={index}
                icon={option.icon}
                label={option.label}
                onPress={option.onPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const ProfileOption = ({
  icon,
  label,
  onPress,
}: ProfileOptionType & {onPress?: () => void}) => {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="flex-row items-center pb-4 px-4 rounded-lg border-b border-gray-200">
        <MaterialIcon name={icon} size={20} color={colors.content} />
        <Text type="content" className="flex-1 ml-3">
          {label}
        </Text>
        <MaterialIcon name="chevron-right" size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

export default Profile;
