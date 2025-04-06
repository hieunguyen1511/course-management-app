import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Portal } from 'react-native-paper';

interface MessageAlertProps {
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
}

const MessageAlert: React.FC<MessageAlertProps> = ({ message, type, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Auto hide after 3 seconds
    const timer = setTimeout(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        onHide();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Portal> {/* 🟢 Đảm bảo nó luôn hiển thị trên cùng */}
      <Animated.View 
        style={[
          styles.container,
          type === 'success' ? styles.successContainer : styles.errorContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.content}>
          <Ionicons 
            name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
            size={24} 
            color="white" 
          />
          <Text style={[styles.message]}>{message}</Text>
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    zIndex: 1000, 
  },
  successContainer: {
    backgroundColor: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: '#F44336',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
});

export default MessageAlert; 