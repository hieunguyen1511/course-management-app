import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { MyScreenProps } from '@/types/MyScreenProps';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';

const ForgotPasswordScreen: React.FC<MyScreenProps['ForgotPasswordScreenProps']> = ({
  navigation,
  route,
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_SEND_OTP}`, {
        email: email,
      });
      if (response.status === 200) {
        navigation.navigate('InputOTPScreen', { email: email });
      } else {
        console.error('Failed to send OTP:', response.data);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
    }

    console.log('Email:', email);
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerText}>QUÊN MẬT KHẨU</Text>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={24} color="#3b82f6" style={styles.inputIcon} />
              <TextInput
                value={email}
                onChangeText={text => setEmail(text)}
                placeholder="Nhập địa chỉ email của bạn"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
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
  formContainer: {
    backgroundColor: 'white',
    height: '100%',
    padding: 20,
    marginTop: 32,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingTop: 16,
    textAlign: 'center',
    color: '#3b82f6',
  },
});

export default ForgotPasswordScreen;
