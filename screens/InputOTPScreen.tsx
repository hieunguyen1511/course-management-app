import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MyScreenProps } from '@/types/MyScreenProps';
import { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';

const InputOTPScreen: React.FC<MyScreenProps['InputOTPScreenProps']> = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [email, setEmail] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [reSendOtp, setResendOtp] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (route.params && route.params.email) {
      setEmail(route.params.email);
      const tmp = email.substring(0, route.params.email.indexOf('@'));
      const tmp2 = email.substring(route.params.email.indexOf('@'));
      const tmp3 = tmp.substring(0, 2) + '****' + tmp.substring(tmp.length - 2, tmp.length);
      setSubEmail(tmp3 + tmp2);
    }
  }, [route.params, email]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    //console.log('OTP:', newOtp.join(''));
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const { key } = e.nativeEvent;
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const otpCode = otp.join('');
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_VERIFY_OTP}`, {
        email: email,
        otp: otpCode,
      });
      if (response.status === 200) {
        setIsLoading(false);
        const userId = response.data.userId;
        navigation.replace('NewPasswordScreen', {
          message: 'Nhập mật khẩu mới',
          userId: userId,
        });
      } else {
        setIsLoading(false);
        console.error('Failed to verify OTP:', response.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error submitting OTP:', error);
    }
  };

  const handleResendOtp = async () => {
    setResendOtp(true);

    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_SEND_OTP}`, {
        email: email,
      });
      if (response.status === 200) {
        setCountdown(60);
        const interval = await setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setResendOtp(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setCountdown(0);
        setResendOtp(false);
        console.error('Failed to send OTP:', response.data);
      }
    } catch (error) {
      setCountdown(0);
      setResendOtp(false);
      console.error('Error sending OTP:', error);
    }
  };

  const RenderResendOtp = useCallback(() => {
    return (
      <SafeAreaView>
        <TouchableOpacity
          disabled={reSendOtp}
          onPress={() => {
            handleResendOtp();
          }}
        >
          {reSendOtp ? (
            <Text style={{ color: '#7dafff', fontWeight: 'bold' }}>
              Gửi lại mã sau {countdown}s
            </Text>
          ) : (
            <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Gửi lại mã OTP</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    );
  }, [reSendOtp, countdown]);

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.headerText}>NHẬP OTP</Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          1 mã OTP đã được gửi đến email {subEmail}. Vui lòng kiểm tra email và nhập mã OTP bên
          dưới.
        </Text>
        <View style={styles.RowInput}>
          {otp.map((value, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={styles.InputNumber}
              keyboardType="numeric"
              maxLength={1}
              value={value}
              onFocus={() => {
                handleChangeText('', index);
              }}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
            />
          ))}
        </View>
        <View
          style={{
            marginTop: 40,
            marginBottom: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text>Chưa nhận được mã OTP? </Text>
          <RenderResendOtp />
        </View>
        {isLoading ? (
          <TouchableOpacity
            disabled
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: '#95bdff' }]}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Đang xử lý</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Tiếp tục</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: 'white',
  },
  RowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  InputNumber: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#3b82f6',
  },
  formContainer: {
    backgroundColor: 'white',
    height: '100%',
    padding: 20,
    marginTop: 32,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
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
});

export default InputOTPScreen;
