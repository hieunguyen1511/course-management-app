import axiosInstance from '@/api/axiosInstance';
import tokenStorageManager from '@/storage/tokenStorage/tokenStorageManager';
import { MyScreenProps } from '@/types/MyScreenProps';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

async function getUserInformation() {
  try {
    const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_USER_INFO_JWT}`);
    if (response.status === 200) {
      console.log('User', response.data);
      return JSON.stringify(response.data.user);
    }
  } catch (e) {
    console.log('Error getting user', e);
    return JSON.stringify({});
  } finally {
    console.log('Finally');
  }
  return JSON.stringify({});
}

async function refreshToken() {
  try {
    const refresh_token = await tokenStorageManager.getRefreshToken();
    if (refresh_token) {
      console.log('Refresh token', refresh_token);
      return refresh_token;
    } else {
      console.log('No refresh token');
      return null;
    }
  } catch (e) {
    console.log('Error getting token', e);
    return null;
  }
}

async function processLogin(navigation: any, router: any) {
  const refresh_token = await refreshToken();
  const user = await getUserInformation();
  const jsonUser = JSON.parse(user);

  try {
    const refreshTokenResponse = await axiosInstance.post(
      `${process.env.EXPO_PUBLIC_API_REFRESH_TOKEN}`,
      {
        refresh_token: refresh_token,
      }
    );

    console.log('Refresh token response', refreshTokenResponse.data);
    if (refreshTokenResponse.data.access_token) {
      tokenStorageManager.setAccessToken(refreshTokenResponse.data.access_token);
      if (jsonUser.role === 1) {
        navigation.replace('UserTabLayout', {
          message: 'Hello from Login',
        });
        // homeRouter.push({
        //   pathname: "/(tabs)/home",
        //   params: { tmessage: "Hello from Login" },
        // });
      }
      if (jsonUser.role === 0) {
        navigation.replace('AdminTabLayout', {
          message: 'Hello from Login',
        });
        // homeRouter.push({
        //   pathname: "/admin",
        //   params: { tmessage: "Hello from Login" },
        // });
      }
    }
  } catch (err) {
    console.log('Error refreshing token', err);
    navigation.replace('LoginScreen', { message: 'Please login' });
    // navigation.replace('AdminLayout', {
    //   message: 'Hello from Login',
    // });
  }
}

const IndexScreen: React.FC<MyScreenProps['IndexScreenProps']> = ({ navigation, route }) => {
  //const homeRouter = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  useEffect(() => {
    if (isProcessing) {
      processLogin(navigation, route);
      setIsProcessing(false);
      console.log('Processing login');
    }
  }, [isProcessing]);
  return (
    <View className="flex justify-center items-center h-full">
      <Text>Index Screen</Text>
    </View>
  );
};

export default IndexScreen;
