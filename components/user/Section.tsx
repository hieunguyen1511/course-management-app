import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { Strings } from "@/constants/Strings";
const Section: React.FC<{
  title: string;
  onViewAllPress?: () => void;
  showViewAll?: boolean;
  children: React.ReactNode;
}> = ({ title, onViewAllPress, showViewAll = true, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>{Strings.user_home.view_all}</Text>
        </TouchableOpacity>
      )}
    </View>
    {children}
  </View>
);
const styles = StyleSheet.create({
  section: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  viewAllText: {
    color: "#4a6ee0",
    fontWeight: "600",
  },
});
export default Section;
