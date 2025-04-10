import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { router, useRouter } from 'expo-router';
import { Strings } from '@/constants/Strings';
import '@/global.css';
import Checkbox from '@/components/ui/Checkbox';
import HorizontalRule from '@/components/ui/HorizontalRule';

import NotificationToast from '@/components/NotificationToast';
import { ToastType } from '@/components/NotificationToast';
import tokenStorageManager from '@/storage/tokenStorage/tokenStorageManager';
import * as SecureStore from 'expo-secure-store';
const Login: FC<MyScreenProps['LoginScreenProps']> = ({ navigation, route }) => {
  //const homeRouter = ueseRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRemmebermeChecked, setIsRemmebermeChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  const showToast = async (message: string | '', type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (route?.params?.message_from_register) {
      setTimeout(() => {
        showToast(route?.params?.message_from_register || '', ToastType.SUCCESS);
      }, 300);
    }
  }, [route?.params]);

  async function saveUserInformation(user: any) {
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch (e) {
      console.log('Error saving user', e);
    }
  }

  const handleLogin = async () => {
    try {
      if (username === '' || password === '') {
        showToast('Vui lòng nhập đầy đủ thông tin', ToastType.ERROR);
        return;
      }
      setIsLoading(true);
      try {
        const res = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_LOGIN}`, {
          username: username,
          password: password,
        });

        if (res.status === 200) {
          tokenStorageManager.setAccessToken(res.data.access_token);
          await saveUserInformation(res.data.user);
          if (isRemmebermeChecked) {
            await tokenStorageManager.setRefreshToken(res.data.refresh_token, !isRemmebermeChecked);
          }

          const user = {
            role: res.data.user.role,
          };

          if (user.role === 1) {
            router.replace('/(tabs)/home');
          }
          if (user.role === 0) {
            router.replace('/admin');
          }
        }
      } catch (error: any) {
        console.error('Error in login attempt:', error);
        let errorMessage = 'Đăng nhập thất bại';

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = error.response.data?.message || 'Đăng nhập thất bại';
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'Không thể kết nối đến máy chủ';
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = 'Có lỗi xảy ra khi đăng nhập';
        }

        showToast(errorMessage, ToastType.ERROR);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      showToast('Có lỗi xảy ra khi đăng nhập', ToastType.ERROR);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>{Strings.login.title}</Text>

          <Image source={require('@/assets/images/course-bg-login.png')} style={styles.logoImage} />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person"
                size={24}
                color="gray"
                style={[styles.inputIcon, styles.inputIconBorder]}
              />
              <TextInput
                style={styles.input}
                autoComplete="username"
                textContentType="username"
                importantForAutofill="yes"
                placeholder={Strings.login.placeHolderUsername}
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed"
                size={24}
                color="gray"
                style={[styles.inputIcon, styles.inputIconBorder]}
              />
              <TextInput
                autoComplete="password"
                importantForAutofill="yes"
                textContentType="password"
                style={styles.input}
                placeholder={Strings.login.placeHolderPassword}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordIcon}
              >
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              checked={isRemmebermeChecked}
              onCheck={setIsRemmebermeChecked}
              label={Strings.login.rememberMe}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading ? styles.loginButtonLoading : null]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" style={styles.loadingIndicator} />
                <Text style={styles.buttonText}>{Strings.login.loggingin}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{Strings.login.login}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <HorizontalRule />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              console.log('Google sign in pressed');
              // Add your Google sign-in logic here
            }}
          >
            <Image source={require('@/assets/images/google.png')} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>{Strings.login.signInByGoogle}</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{Strings.login.dontHaveAccount} </Text>
            <TouchableOpacity
              onPress={() => {
                router.push('/register');
              }}
            >
              <Text style={styles.registerLink}>{Strings.login.register}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
  },
  formContainer: {
    backgroundColor: 'white',
    height: '100%',
    padding: 20,
    marginTop: 32,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 32,
    textAlign: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 4,
  },
  inputIcon: {
    paddingHorizontal: 5,
    color: '#3b82f6',
  },
  inputIconBorder: {
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  passwordIcon: {
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  loginButtonLoading: {
    backgroundColor: '#60a5fa',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#4b5563',
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
  },
  registerText: {
    color: '#4b5563',
    textAlign: 'center',
  },
  registerLink: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default Login;
