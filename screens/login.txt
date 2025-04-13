import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { useRouter } from 'expo-router';
import { Strings } from '@/constants/Strings';
import '../global.css';
import Checkbox from '@/components/ui/Checkbox';
import HorizontalRule from '@/components/ui/HorizontalRule';
import * as SecureStore from 'expo-secure-store';
import setAccessToken from '@/api/axiosInstance';

async function saveUserInformation(user: any) {
  try {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
  } catch (e) {
    console.log('Error saving user', e);
  }
}

async function saveRefreshToken(refresh_token: string) {
  try {
    await SecureStore.setItemAsync('refresh_token', refresh_token);
  } catch (e) {
    console.log('Error saving token', e);
  }
}

const Login: FC<MyScreenProps['LoginScreenProps']> = ({ navigation, route }) => {
  const homeRouter = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRemmebermeChecked, setIsRemmebermeChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  //console.log("Login screen 1", route.params);
  useEffect(() => {
    if (route.params?.message) {
      console.log('Login message:', route.params.message);
    }
  }, []);

  const handleLogin = async () => {
    try {
      if (username === '' || password === '') {
        console.log('Username or password is empty');
        return;
      }

      setIsLoading(true);

      try {
        const res = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_LOGIN}`, {
          username: username,
          password: password,
        });

        if (res.status === 200) {
          console.log('Login successful');
          console.log('Access token', res.data.access_token);
          await setAccessToken(res.data.access_token);

          if (isRemmebermeChecked) {
            await saveRefreshToken(res.data.refresh_token);
            await saveUserInformation(res.data.user);
          }
          // run on web browser not working
          //console.log("refresh token", SecureStore.getItemAsync("refresh_token"));
          // const resAny = await axiosInstance.get(
          //   `${process.env.EXPO_PUBLIC_API_GET_ALL_USERS}`
          // );
          //console.log("All users", resAny.data);

          const userRole = res.data.user.role;
          if (userRole === 1) {
            homeRouter.replace({
              pathname: '/(tabs)/home',
              params: { tmessage: 'Hello from Login' },
            });
          }
          if (userRole === 0) {
            homeRouter.replace({
              pathname: '/admin',
              params: { tmessage: 'Hello from Login' },
            });
          }
        }
      } catch (e) {
        console.log('Error in login attempt', e);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Login failed');
      setIsLoading(false);
    }
  };
  return (
    <View className="flex justify-center bg-blue-500">
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      > */}
      {/* <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-blue-600 h-dvh"
      > */}
      <View className="bg-white h-screen p-5 mt-8 rounded-tl-[48] rounded-tr-[48]">
        <Text className="text-3xl font-bold text-blue-600 mb-8 text-center">
          {Strings.login.title}
        </Text>
        <Image
          source={require('../assets/images/course-bg-login.png')}
          style={{ width: 150, height: 150, alignSelf: 'center' }}
          className="rounded-xl mb-6"
        />
        <View className="mb-5">
          {/* <Text className="text-base text-gray-700 mb-1">
            {Strings.login.username}
          </Text> */}
          <View className="flex-row items-center border border-gray-300 rounded-lg">
            <Ionicons
              className="border-r border-gray-300"
              name="person"
              size={24}
              color="gray"
              style={styles.inputIcon}
            />
            <TextInput
              className="w-full placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
              placeholder={Strings.login.placeHolderUsername}
              value={username}
              onChangeText={setUsername}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="mb-5">
          {/* <Text className="text-base text-gray-700 mb-1">
            {Strings.login.password}
          </Text> */}
          <View className="flex-row items-center border border-gray-300 rounded-lg">
            <Ionicons
              className="border-r border-gray-300"
              name="lock-closed"
              size={24}
              color="gray"
              style={styles.inputIcon}
            />
            <TextInput
              className="flex-1 placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
              placeholder={Strings.login.placeHolderPassword}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordIcon}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-5">
          <TouchableOpacity>
            <Checkbox
              checked={isRemmebermeChecked}
              onCheck={setIsRemmebermeChecked}
              label={Strings.login.rememberMe}
            />
            {/* <Text className="text-gray-700 text-sm">
            {Strings.login.rememberMe}
          </Text> */}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`${
            isLoading ? 'bg-blue-400' : 'bg-blue-500'
          } p-4 rounded-lg shadow-sm items-center mt-2`}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <View className="flex-row items-center justify-center">
              <View className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <Text className="text-white font-bold text-base">{Strings.login.loggingin}</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-base">{Strings.login.login}</Text>
          )}
        </TouchableOpacity>

        <View>
          <HorizontalRule />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 p-3 rounded-lg"
          onPress={() => {
            console.log('Google sign in pressed');
            // Add your Google sign-in logic here
          }}
        >
          <Image
            source={require('../assets/images/google.png')}
            style={{ width: 24, height: 24 }}
            className="mr-2"
          />
          <Text className="text-gray-700 font-bold">{Strings.login.signInByGoogle}</Text>
        </TouchableOpacity>

        <View className="mt-4 flex-row items-center justify-center">
          <Text className="text-center mt-6">{Strings.login.dontHaveAccount} </Text>
          <TouchableOpacity
            className="text-blue-500 text-sm mt-6"
            onPress={() => {
              navigation.navigate('Register', {
                message: 'Hello from Login',
              });
            }}
          >
            <Text className="text-blue-500 text-md"> {Strings.login.register}</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity className="mt-4 items-center">
            <Text className="text-blue-500 text-sm">
              {Strings.login.forgotPassword}
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
      {/* </ScrollView> */}
      {/* </KeyboardAvoidingView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  inputIcon: {
    paddingHorizontal: 5,
    color: '#3b82f6',
  },
  passwordIcon: {
    paddingHorizontal: 10,
  },
});

export default Login;
