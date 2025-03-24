import { View, Text, Button } from 'react-native';
import React, { useState } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Test1 from '../../screens/test1';
import { useEffect } from 'react';
import { RootStackParamList } from '../../types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';



const Stack = createNativeStackNavigator<RootStackParamList>();



type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;


const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  // Nhận dữ liệu trả về từ Test1
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (route.params?.message) {
      setMessage(route.params.message);
    }
  }, [route.params?.message]);
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Home Screen</Text>

      {/* Hiển thị thông báo nếu có */}
     
      <Text>{message}</Text>

      {/* Nút chuyển đến Test1 */}
     
      {/* dùng HomeScreenProp */}
      <Button
        title="Go to Test1"
        onPress={() => navigation.navigate('Test1', { userId: 1, userName: 'John' })}
      />
    </View>
  );
};


const Routes = () => {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} />
        <Stack.Screen name="Test1" component={Test1} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default Routes;
