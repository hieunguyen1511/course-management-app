import { View, StyleSheet } from "react-native";
import React from "react";
const HorizontalRule = () => {
  return <View style={styles.horizontalRule} />;
};

const styles = StyleSheet.create({
  horizontalRule: {
    borderBottomColor: "#d1d5db",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
});

export default HorizontalRule;
