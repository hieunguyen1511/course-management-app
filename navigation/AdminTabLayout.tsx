import CourseScreen from '@/screens/admin/CourseScreen';
import CategoryScreen from '@/screens/admin/CategoryScreen';
import DashboardScreen from '@/screens/admin/DashboardScreen';
import SettingScreen from '@/screens/admin/SettingScreen';
import UserScreen from '@/screens/admin/user/UserScreen';
import { RootStackParamList } from '@/types/RootStackParamList';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator<RootStackParamList>();

export default function AdminTabLayout() {
  return (
    <Drawer.Navigator
      initialRouteName="DashboardScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="DashboardScreen"
        options={{
          drawerLabel: 'Trang chủ',
          headerTitle: 'Trang chủ',
          drawerIcon: () => <Ionicons name="home" size={24} color="#4a6ee0" />,
        }}
        component={DashboardScreen}
      />
      <Drawer.Screen
        name="UserScreen"
        options={{
          drawerLabel: 'Quản lý người dùng',
          headerTitle: 'Quản lý người dùng',
          drawerIcon: () => <Ionicons name="people" size={24} color="#4a6ee0" />,
        }}
        component={UserScreen}
      />
      <Drawer.Screen
        name="CategoryScreen"
        options={{
          drawerLabel: 'Quản lý chủ đề',
          headerTitle: 'Quản lý chủ đề',
          drawerIcon: () => <Ionicons name="list" size={24} color="#4a6ee0" />,
        }}
        component={CategoryScreen}
      />
      <Drawer.Screen
        name="CourseScreen"
        options={{
          drawerLabel: 'Quản lý khóa học',
          headerTitle: 'Quản lý khóa học',
          drawerIcon: () => <Ionicons name="book" size={24} color="#4a6ee0" />,
        }}
        component={CourseScreen}
      />
      <Drawer.Screen
        name="SettingScreen"
        options={{
          drawerLabel: 'Cài đặt',
          headerTitle: 'Cài đặt',
          drawerIcon: () => <Ionicons name="settings" size={24} color="#4a6ee0" />,
        }}
        component={SettingScreen}
      />
    </Drawer.Navigator>
  );
}
