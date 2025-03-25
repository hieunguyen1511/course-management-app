import { Image, Text, StyleSheet, Platform } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import "../../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlatList, View } from "react-native";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/api/axiosInstance";


export default function HomeScreen() {
  console.log("Fetching data from:", process.env.EXPO_PUBLIC_DEV_BACKEND_API_URL); // Debug
  console.log("Platform:", Platform.OS); // Debug
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    axiosInstance
      .get(`${process.env.EXPO_PUBLIC_API_GET_ALL_USERS}`)
      .then((res) => {
        setData(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View>
        <Text>Settings1122333</Text>
        <Text>Learnadada2 adaadadadawdmore1</Text>
        <HelloWave />
        <Text className="text-blue-500 text-center">
          Lea1arn more2 about what's included in this starter app.
        </Text>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View>
              <Text>{item.username}</Text>
              <Text>{item.email}</Text>
            </View>
          )}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
