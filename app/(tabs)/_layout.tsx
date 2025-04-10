import React from 'react';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, Tabs } from 'expo-router';

export default function UserTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          listeners={tabBarListeners}
          options={{
            headerShown: false,
            title: 'Trang chủ',
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="house.fill" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          listeners={tabBarListeners}
          options={{
            headerShown: false,
            title: 'Khám phá',
            tabBarIcon: ({ color, size }) => <IconSymbol name="search" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="course"
          listeners={tabBarListeners}
          options={{
            headerShown: false,
            title: 'Khóa học',
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="library-books" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          listeners={tabBarListeners}
          options={{
            headerShown: true,
            title: 'Tài khoản',
            tabBarIcon: ({ color, size }) => (
              <IconSymbol name="account-circle" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const tabBarListeners = ({ navigation, route }: { navigation: any; route: any }) => ({
  tabPress: () => {
    router.replace({ pathname: route.name });
  },
});
