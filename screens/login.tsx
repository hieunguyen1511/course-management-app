import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import React, { FC, useState } from "react";

import { MyScreenProps } from "@/types/MyScreenProps";
import axiosInstance from "@/api/axiosInstance";
import { useRouter } from "expo-router";
import { Strings } from "@/constants/Strings";
import "../global.css";
import Checkbox from "@/components/ui/Checkbox";

const Login: FC<MyScreenProps["LoginScreenProps"]> = ({
  navigation,
  route,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRemmebermeChecked, setIsRemmebermeChecked] = useState(false);

  const homeRouter = useRouter();

  const handleLogin = () => {
    try {
      if (username === "" || password === "") {
        console.log("Username or password is empty");
        return;
      }
      axiosInstance
        .post(`${process.env.EXPO_PUBLIC_API_LOGIN}`, {
          username: username,
          password: password,
        })
        .then((res) => {
          try {
            if (res.status === 200) {
              console.log("Login successful");
              homeRouter.push({
                pathname: "/(tabs)/home",
                params: { tmessage: "Hello from Login" },
              });
              //navigation.navigate("UserTabLayout", { message: "Hello from Login" });
            }
          } catch (e) {
            console.log("Error in login attempt", e);
          }
        });
      console.log("Login attempt with:", username, password);
    } catch (error) {
      console.log("Login failed");
    }
  };

  return (
    <View className="flex  justify-center bg-blue-400">
      <View className="bg-white h-dvh p-5 mt-8 rounded-tl-[48] rounded-tr-[48]">
        <Text className="text-3xl font-bold text-blue-600 mb-8 text-center">
          {Strings.login.title}
        </Text>
        <Image
          source={require("../assets/images/course-bg-login.svg")}
          style={{ width: 200, height: 200, alignSelf: "center" }}
          className="rounded-xl"
        />
        <View className="mb-5">
          {/* <Text className="text-base text-gray-700 mb-1">
            {Strings.login.username}
          </Text> */}
          <TextInput
            className="w-full placeholder:text-gray-300 bg-white border border-gray-300 rounded-lg p-3 text-base"
            placeholder={Strings.login.placeHolderUsername}
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-5">
          {/* <Text className="text-base text-gray-700 mb-1">
            {Strings.login.password}
          </Text> */}
          <TextInput
            className="w-full placeholder:text-gray-300 bg-white border border-gray-300 rounded-lg p-3 text-base"
            placeholder={Strings.login.placeHolderPassword}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View className="mb-5">
          <TouchableOpacity>
            <Checkbox
              checked={isRemmebermeChecked}
              onCheck={setIsRemmebermeChecked}
              label={Strings.login.rememberMe}
            />
            {/* <Text className="text-gray-700 text-sm">
            {Strings.login.rememberMe}
          </Text> */}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg shadow-sm items-center mt-2"
          onPress={handleLogin}
        >
          <Text className="text-white font-bold text-base">
            {Strings.login.login}
          </Text>
        </TouchableOpacity>
        <View>
          <Text className="text-center mt-4">
            {Strings.login.dontHaveAccount}{" "}
            <TouchableOpacity
              className="text-blue-500 text-sm"
              onPress={() => {
                navigation.navigate("Register", {
                  message: "Hello from Login",
                });
              }}
            >
              {Strings.login.register}
            </TouchableOpacity>
          </Text>
          {/* <TouchableOpacity className="mt-4 items-center">
            <Text className="text-blue-500 text-sm">
              {Strings.login.forgotPassword}
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default Login;
