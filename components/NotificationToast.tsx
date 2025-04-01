import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export enum ToastType {
  SUCCESS = 1,
  ERROR = 2,
  WARNING = 3,
  INFO = 4,
}

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  onDismiss?: () => void;
  duration?: number; // Duration in ms
}

const NotificationToast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  onDismiss,
  duration = 2000, // Default 2 seconds
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getToastConfig = () => {
    switch (type) {
      case ToastType.SUCCESS:
        return {
          backgroundColor: '#10b981', // Green
          icon: 'checkmark-circle',
          title: 'Success',
        };
      case ToastType.ERROR:
        return {
          backgroundColor: '#ef4444', // Red
          icon: 'close-circle',
          title: 'Error',
        };
      case ToastType.WARNING:
        return {
          backgroundColor: '#f59e0b', // Amber
          icon: 'warning',
          title: 'Warning',
        };
      case ToastType.INFO:
        return {
          backgroundColor: '#3b82f6', // Blue
          icon: 'information-circle',
          title: 'Information',
        };
      default:
        return {
          backgroundColor: '#10b981',
          icon: 'checkmark-circle',
          title: 'Success',
        };
    }
  };

  const showToast = () => {
    setIsVisible(true);
    // Animate slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Set timeout to hide toast
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    // Animate slide out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, message, type]);

  const config = getToastConfig();
  const { width } = Dimensions.get('window');

  if (!isVisible && !visible) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          width: width - 32, // Account for margins
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={config.icon as any} size={24} color="white" style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{message}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// For direct use without props
let toastRef: {
  show: (message: string, type: ToastType, duration?: number) => void;
  hide: () => void;
} = {
  show: () => {},
  hide: () => {},
};

export const showToast = (message: string, type: ToastType, duration = 2000) => {
  toastRef.show(message, type, duration);
};

export const hideToast = () => {
  toastRef.hide();
};

// ToastProvider component for top-level use
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: ToastType.SUCCESS,
    duration: 2000,
  });

  // Set ref methods
  toastRef.show = (message, type, duration = 2000) => {
    setToastConfig({
      visible: true,
      message,
      type,
      duration,
    });
  };

  toastRef.hide = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.providerContainer}>
      {children}
      <NotificationToast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        duration={toastConfig.duration}
        onDismiss={() => setToastConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  providerContainer: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    top: StatusBar.currentHeight || 40,
    alignSelf: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  message: {
    color: 'white',
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 16,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NotificationToast;
