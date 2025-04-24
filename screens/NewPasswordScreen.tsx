import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';

const NewPasswordScreen: React.FC<MyScreenProps['NewPasswordScreenProps']> = ({
  navigation,
  route,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [userId, setUserId] = useState(0);

  useEffect(() => {
    if (route.params.userId) {
      setUserId(route.params.userId);
      console.log('User ID:', route.params.userId);
    }
  }, [route.params.userId]);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }
    setError(null);
    setIsLoading(true);

    if (userId === 0) {
      return;
    }

    try {
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_API_USER_UPDATE_NEW_PASSWORD}`,
        {
          userId: userId,
          password: newPassword,
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        navigation.popTo('LoginScreen', { message: 'Cập nhật mật khẩu thành công!' });
      } else {
        console.error('Failed to update password:', response.data);
      }
    } catch (error) {
      console.error('Error updating password:', error);
    } finally {
      setIsLoading(false);
    }

    console.log('User ID:', userId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Form Fields */}
        <View style={styles.form}>
          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
          {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
          onPress={() => {
            handleSubmit();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.changeButtonText}>Cập nhật</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  changeButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  changeButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default NewPasswordScreen;
