import { View, Text, Button } from "react-native";
import React from "react";
import { Redirect, useRouter } from "expo-router";

import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";

import { RootStackParamList } from "@/types/RootStackParamList";
import { MyScreenProps } from "@/types/MyScreenProps";
import "../global.css";
import { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";
import * as SecureStore from "expo-secure-store";
const Stack = createNativeStackNavigator<RootStackParamList>();

import { setAccessToken } from "@/api/axiosInstance";

async function getUserInformation() {
  try {
    const user = await SecureStore.getItemAsync("user");
    if (user) {
      console.log("User", user);
      return user;
    } else {
      console.log("No user");
      return JSON.stringify({});
    }
  } catch (e) {
    console.log("Error getting user", e);
    return JSON.stringify({});
  }
}

async function refreshToken() {
  try {
    const refresh_token = await SecureStore.getItemAsync("refresh_token");
    if (refresh_token) {
      console.log("Refresh token", refresh_token);
      return refresh_token;
    } else {
      console.log("No refresh token");
      return null;
    }
  } catch (e) {
    console.log("Error getting token", e);
    return null;
  }
}

async function processLogin(navigation: any, homeRouter: any) {
  const refresh_token = await refreshToken();
  const user = await getUserInformation();
  const jsonUser = JSON.parse(user);

  axiosInstance
    .post(`${process.env.EXPO_PUBLIC_API_REFRESH_TOKEN}`, {
      refresh_token: refresh_token,
    })
    .then((res) => {
      console.log("Refresh token response", res.data);
      if (res.data.access_token) {
        setAccessToken(res.data.access_token);
        if (jsonUser.role === 1) {
          homeRouter.push({
            pathname: "/(tabs)/home",
            params: { tmessage: "Hello from Login" },
          });
        }
        if (jsonUser.role === 0) {
          homeRouter.push({
            pathname: "/admin",
            params: { tmessage: "Hello from Login" },
          });
        }
      } else {
        navigation.replace("Login", { message: "Please login" });
      }
    })
    .catch((err) => {
      console.log("Error refreshing token", err);
      navigation.replace("Login", { message: "Please login" });
    });
}

const IndexScreen: React.FC<MyScreenProps["IndexScreenProps"]> = ({
  navigation,
  route,
}) => {
  const homeRouter = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  useEffect(() => {
    if (isProcessing) {
      //processLogin(navigation, homeRouter);
      setIsProcessing(false);
    }
  }, [isProcessing]);
  return (
    <View className="flex justify-center items-center h-full">
      <Text>Index Screen</Text>
      {/* <Button
        title="Go to Test1"
        onPress={() => {
          navigation.navigate("Test1", { message: "Hello from Index" });
        }}
      />
      <Button
        title="Go to Test2"
        onPress={() => {
          navigation.navigate("Test2", { message: "Hello from Index" });
        }}
      /> */}
      <Button
        title="Go to Login"
        onPress={() => {
          navigation.navigate("Login", { message: "Hello from Index" });
        }}
      />
      <Button
        title="Go to Register"
        onPress={() => {
          navigation.navigate("Register", { message: "Hello from Index" });
        }}
      />
      <Button
        title="Go to UserTabLayout"
        onPress={() => {
          navigation.navigate("UserTabLayout", { message: "Hello from Index" });
        }}
      />
      <Button
        title="Go to AdminLayout"
        onPress={() => {
          navigation.navigate("AdminLayout", { message: "Hello from Index" });
        }}
      />
    </View>
  );
};

// auth
import Login from "@/screens/login";
import Register from "@/screens/register";

// Tab Layout
import UserTabLayout from "./(tabs)/_layout";
import AdminLayout from "./admin/_layout";

// User Screen
import ChangePasswordScreen from "@/screens/user/ChangePasswordScreen";
import EditProfileScreen from "@/screens/user/EditProfileScreen";
import UserViewAllEnrollmentScreen from "@/screens/user/UserViewAllEnrollmentScreen";
import UserRatingScreen from "@/screens/user/UserRatingScreen";
import UserViewAllCourseScreen from "@/screens/user/UserViewAllCourseScreen";
import UserDetailCourseScreen from "@/screens/user/UserDetailCourseScreen";
import UserViewLessonScreen from "@/screens/user/UserViewLessonScreen";
import DetailCourseScreen from "@/screens/user/DetailCourseScreen";
import SearchCourseScreen from "@/screens/user/SearchCourseScreen";

function IndexLayout() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator
        initialRouteName="Index"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Index"
          component={IndexScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        {/* Tab Layout */}
        <Stack.Screen name="UserTabLayout">
          {() => <UserTabLayout />}
        </Stack.Screen>
        <Stack.Screen name="AdminLayout" component={AdminLayout} />

        {/* User Screen */}
        <Stack.Screen
          name="ChangePasswordScreen"
          component={ChangePasswordScreen}
        />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen
          name="UserViewAllEnrollmentScreen"
          component={UserViewAllEnrollmentScreen}
        />
        <Stack.Screen name="UserRatingScreen" component={UserRatingScreen} />
        <Stack.Screen
          name="UserViewAllCourseScreen"
          component={UserViewAllCourseScreen}
        />
        <Stack.Screen
          name="UserDetailCourseScreen"
          component={UserDetailCourseScreen}
        />
        <Stack.Screen
          name="UserViewLessonScreen"
          component={UserViewLessonScreen}
        />
        <Stack.Screen
          name="DetailCourseScreen"
          component={DetailCourseScreen}
        />
        <Stack.Screen
          name="SearchCourseScreen"
          component={SearchCourseScreen}
        />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

export default IndexLayout;
