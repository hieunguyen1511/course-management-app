import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { Strings } from "@/constants/Strings";
interface Category {
  id: number;
  name: string;
}

const CategoryItem: React.FC<{
  category: Category;
  onPress: () => void;
}> = ({ category, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryItem, { backgroundColor: "white" }]}
    onPress={onPress}
  >
    <Text style={[styles.categoryName, { color: "#333" }]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minWidth: 100,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default CategoryItem;
