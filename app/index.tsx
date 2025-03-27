import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";
import { Redirect } from "expo-router";

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
import { RootStackParamList } from "@/types/RootStackParamList";
import { MyScreenProps } from "@/types/MyScreenProps";
import "../global.css";
import { useState } from "react";
const Stack = createNativeStackNavigator<RootStackParamList>();



const IndexScreen: React.FC<MyScreenProps["IndexScreenProps"]> = ({
  navigation,
  route,
}) => {
  
  useEffect(() => {
    console.log("Index Screen");
    navigation.navigate("Login", { message: "" });
  });
  // return (
  //   <View>
  //     <Text className="text-blue-600">Index Screen</Text>
  //     <Button title="go to test1" onPress={() => navigation.navigate("Test1", { userId: 1, userName: "John Doe" })} />
  //     <Button title="go to login" onPress={() => navigation.navigate("Login",{message:""})} />
  //   </View>
  // );
  //return null;
  return null;
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
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

export default IndexLayout;
