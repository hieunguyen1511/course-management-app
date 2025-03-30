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

import Login from "@/screens/login";
import Register from "@/screens/register";
import UserTabLayout from "./(tabs)/_layout";
import Test1 from "@/screens/test1";
import Test2 from "@/screens/test2";
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
    if(isProcessing){
      processLogin(navigation, homeRouter);
      setIsProcessing(false);
    }
  }, [isProcessing]);
  return (
    <View className="flex justify-center items-center h-full">
      <Text>Index Screen</Text>
      <Button
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
      />  
    </View>
  );
};

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
        <Stack.Screen
          name="UserTabLayout"
          component={UserTabLayout}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Test1"
          component={Test1}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Test2"
          component={Test2}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

export default IndexLayout;
