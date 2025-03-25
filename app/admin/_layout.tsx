import { View, Text, Button } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import {
  NavigationIndependentTree,
  useNavigation,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SCREENS from "@/screens/admin/screens";
import { Gesture, GestureHandlerRootView } from "react-native-gesture-handler";

import DashboardScreen from "@/screens/admin/dashboard";
import NotificationsScreen from "@/screens/admin/notifications";
import SettingScreen from "@/screens/admin/setting";
import CourseScreen from "@/screens/admin/course";
import CategoryScreen from "@/screens/admin/category";
import { Slot } from "expo-router";

const Drawer = createDrawerNavigator();

export default function AdminLayout() {
  const colorScheme = useColorScheme();

  return (
    
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationIndependentTree>
          <Drawer.Navigator
            initialRouteName={SCREENS.DASHBOARD}
            //   drawerContent={(props) => {
            //     const { routeNames, index } = props.state;
            //     const focused = routeNames[index];
            //     return (
            //       <DrawerContentScrollView {...props}>
            //         <Text>ABC</Text>
            //         <DrawerItem
            //           label={"Profile"}
            //           onPress={() => {
            //             props.navigation.navigate(SCREENS.PROFILE);
            //           }}
            //           focused={focused === SCREENS.PROFILE}
            //           activeBackgroundColor={Colors.ORANGE}
            //           inactiveBackgroundColor={Colors.GRAY_LIGHT}
            //           inactiveTintColor={Colors.BLACK}
            //           activeTintColor={Colors.WHITE}
            //         />
            //       </DrawerContentScrollView>
            //     );
            //   }}
          >
            <Drawer.Screen
              name={SCREENS.DASHBOARD}
              component={DashboardScreen}
            />
            <Drawer.Screen
              name={SCREENS.NOTIFICATIONS}
              component={NotificationsScreen}
            />
            <Drawer.Screen name={SCREENS.CATEGORY} component={CategoryScreen} />
            <Drawer.Screen name={SCREENS.COURSE} component={CourseScreen} />
            <Drawer.Screen name={SCREENS.SETTING} component={SettingScreen} />
          </Drawer.Navigator>
        </NavigationIndependentTree>
      </GestureHandlerRootView>
  );
}
