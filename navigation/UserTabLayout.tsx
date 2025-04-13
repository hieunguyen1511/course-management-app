import { RootStackParamList } from '@/types/RootStackParamList';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Platform } from 'react-native';

import HomeScreen from '@/screens/user/HomeScreen';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ExploreScreen from '@/screens/user/ExploreScreen';
import UserCourseScreen from '@/screens/user/UserCourseScreen';
import AccountScreen from '@/screens/user/UserAccountScreen';

const Tabs = createBottomTabNavigator<RootStackParamList>();

export default function UserTabLayout() {
  return (
    <Tabs.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: '#687076',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="ExploreScreen"
        component={ExploreScreen}
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="search" color={color} />,
        }}
      />

      <Tabs.Screen
        name="UserCourseScreen"
        component={UserCourseScreen}
        options={{
          title: 'Khóa học',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="library-books" color={color} />,
        }}
      />
      <Tabs.Screen
        name="AccountScreen"
        component={AccountScreen}
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="account-circle" color={color} />,
        }}
      />
    </Tabs.Navigator>
  );
}
