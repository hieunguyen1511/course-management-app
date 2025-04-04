import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Strings } from '@/constants/Strings';
import '../global.css';
import HorizontalRule from '@/components/ui/HorizontalRule';
import axiosInstance from '@/api/axiosInstance';
import NotificationToast, { ToastType } from '@/components/NotificationToast';

enum UserRole {
  ADMIN = 0,
  USER = 1,
}

interface FormData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string | '';
}

interface FormErrors {
  fullname?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
}

const RegisterScreen: React.FC<MyScreenProps['RegisterScreenProps']> = ({ navigation, route }) => {
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  // Show toast helper function
  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.fullname.trim()) {
      newErrors.fullname = Strings.register.requireFullname;
      isValid = false;
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = Strings.register.requireUsername;
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = Strings.register.requireEmail;
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = Strings.register.invalidEmail;
      isValid = false;
    }

    // Validate password   F
    if (!formData.password) {
      newErrors.password = Strings.register.requirePassword;
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = Strings.register.minimumPassword;
      isValid = false;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = Strings.register.passwordNotMatch;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);

      try {
        const respone = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_REGISTER}`, {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email,
          birth: '',
          password: formData.password,
          role: UserRole.USER,
          phone: formData.phone,
          avatar: '',
        });
        if (respone.status === 201) {
          setIsLoading(false);
          //showToast(Strings.register.success_message, ToastType.SUCCESS);
          navigation.replace('Login', { message_from_register: Strings.register.success_message });
        }
      } catch (error: any) {
        setIsLoading(false);
        const errorMessage = error.response?.data?.message || 'Registration failed';
        showToast(errorMessage, ToastType.ERROR);
      }
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>{Strings.register.title}</Text>

            <Text style={styles.description}>{Strings.register.descripton}</Text>

            <Image
              source={require('../assets/images/course-bg-login.png')}
              style={styles.logoImage}
            />

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={24} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={Strings.register.placeHolderFullname}
                  value={formData.fullname}
                  onChangeText={value => handleChange('fullname', value)}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.fullname && <Text style={styles.errorText}>{errors.fullname}</Text>}
            </View>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="at" size={24} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={Strings.register.placeHolderUsername}
                  value={formData.username}
                  onChangeText={value => handleChange('username', value)}
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={24} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={Strings.register.placeHolderEmail}
                  value={formData.email}
                  onChangeText={value => handleChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={24} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={Strings.register.placeHolderPassword}
                  value={formData.password}
                  onChangeText={value => handleChange('password', value)}
                  secureTextEntry={!passwordVisible}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.passwordIcon}
                >
                  <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={22} color="#3b82f6" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={24} color="#3b82f6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={Strings.register.placeHolderConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={value => handleChange('confirmPassword', value)}
                  secureTextEntry={!confirmPasswordVisible}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                  onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  style={styles.passwordIcon}
                >
                  <Ionicons
                    name={confirmPasswordVisible ? 'eye-off' : 'eye'}
                    size={22}
                    color="#3b82f6"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonLoading]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" style={styles.loadingSpinner} />
                  <Text style={styles.buttonText}>
                    {Strings.register.registerProcess || 'Creating account...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {Strings.register.register || 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <HorizontalRule />
            </View>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>
                {Strings.register.alreadyHaveAccount || 'Already have an account?'}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>{Strings.register.signIn || 'Sign In'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast Notification */}
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
  keyboardView: {
    flex: 1,
    backgroundColor: 'white',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
  },
  inputIcon: {
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  passwordIcon: {
    paddingHorizontal: 10,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
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
  submitButtonLoading: {
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
  loadingSpinner: {
    marginRight: 10,
  },
  divider: {
    marginTop: 20,
  },
  loginLinkContainer: {
    marginTop: 24,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    textAlign: 'center',
    color: '#4b5563',
  },
  loginLink: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default RegisterScreen;
