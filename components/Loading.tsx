import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";

const LoadingSpinner = ({ size = 30, color = "white" }) => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.spinner,
        { width: size, height: size, borderColor: color, transform: [{ rotate: spin }] },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  spinner: {
    borderWidth: 3,
    borderTopColor: "transparent",
    borderRadius: 50,
  },
});

export default LoadingSpinner;