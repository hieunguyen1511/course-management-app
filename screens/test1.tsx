import { View, Text, Button } from "react-native";
import React, { useState } from "react";
import { useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/RootStackParamList";

type Test1ScreenProps = NativeStackScreenProps<RootStackParamList, "Test1">;

const Test1: React.FC<Test1ScreenProps> = ({ route, navigation }) => {
  const { userId, userName } = route.params || {};
  const [message, setMessage] = useState("");
  useState(() => {
    setMessage("Hello from Test1");
  });
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Test1 Screen</Text>
      <Text>User ID: {userId}</Text>
      <Text>User Name: {userName}</Text>

      {/* Nút quay về HomeScreen và gửi dữ liệu */}
      <Button
        title="Go Back to Home"
        onPress={() => {
          navigation.setParams({ message: "Hello from Test1" });
          navigation.goBack();
        }}
      />
    </View>
  );
};

export default Test1;
