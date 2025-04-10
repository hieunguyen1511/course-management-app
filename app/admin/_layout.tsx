import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationIndependentTree } from '@react-navigation/native';
// import { useColorScheme } from 'react-native';

import SCREENS from '@/screens/admin/screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import DashboardScreen from '@/screens/admin/dashboard';
import NotificationsScreen from '@/screens/admin/notifications';
import SettingScreen from '@/screens/admin/setting';
import CourseScreen from '@/screens/admin/course/course';
import CategoryScreen from '@/screens/admin/category/category';
const Drawer = createDrawerNavigator();

export default function AdminLayout() {
  // const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationIndependentTree>
        <Drawer.Navigator initialRouteName={SCREENS.DASHBOARD}>
          <Drawer.Screen name={SCREENS.DASHBOARD} component={DashboardScreen} />
          <Drawer.Screen name={SCREENS.NOTIFICATIONS} component={NotificationsScreen} />
          <Drawer.Screen name={SCREENS.CATEGORY} component={CategoryScreen} />
          <Drawer.Screen name={SCREENS.COURSE} component={CourseScreen} />
          <Drawer.Screen name={SCREENS.SETTING} component={SettingScreen} />
        </Drawer.Navigator>
      </NavigationIndependentTree>
    </GestureHandlerRootView>
  );
}
