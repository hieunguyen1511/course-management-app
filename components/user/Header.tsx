import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Strings } from "@/constants/Strings";

const Header: React.FC<{ userName: string; onProfilePress: () => void }> = ({
  userName,
  onProfilePress,
}) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.welcomeText}>{Strings.user_home.welcome_back}</Text>
      <Text style={styles.userName}>{userName}</Text>
    </View>
    <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
      <Ionicons name="person-circle-outline" size={40} color="#4a6ee0" />
    </TouchableOpacity>
  </View>
);
export default Header;
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileButton: {
    padding: 5,
  },
});
