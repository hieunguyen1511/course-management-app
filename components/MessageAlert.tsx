import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageAlertProps {
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
}

const MessageAlert: React.FC<MessageAlertProps> = ({ message, type, onHide }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2700),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: fadeAnim },
        type === 'success' ? styles.successContainer : styles.errorContainer
      ]}
    >
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
        size={24} 
        color={type === 'success' ? '#fff' : '#fff'} 
      />
      <Text style={styles.messageText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  successContainer: {
    backgroundColor: '#28a745',
  },
  errorContainer: {
    backgroundColor: '#dc3545',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
});

export default MessageAlert; 