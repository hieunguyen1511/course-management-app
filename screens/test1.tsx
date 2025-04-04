import { View, Text, Button } from 'react-native';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/RootStackParamList';
import { NavigationIndependentTree } from '@react-navigation/native';

import { MyScreenProps } from '../types/MyScreenProps';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();
type Test1ScreenProps = NativeStackScreenProps<RootStackParamList, 'Test1'>;

const Test1: React.FC<Test1ScreenProps> = ({ route, navigation }) => {
  const { userId, userName } = route.params || {};
  const [message, setMessage] = useState('');
  useState(() => {
    setMessage('Hello from Test1');
  });
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl font-bold">Test1 Screen</Text>
      <Text>User ID: {userId}</Text>
      <Text>User Name: {userName}</Text>

      {/* Nút quay về HomeScreen và gửi dữ liệu */}
      <Button
        title="Go Back to Home"
        onPress={() => {
          navigation.setParams({ message: 'Hello from Test1' });
          navigation.goBack();
        }}
      />
      {/* Nút chuyển sang Test2 */}
      <Button
        title="Go to Test2"
        onPress={() => {
          navigation.navigate('Test2', { message: 'Hello from Test1' });
        }}
      />
      {/* Nút chuyển sang Test3 */}
      <Button
        title="Go to Test3"
        onPress={() => {
          navigation.navigate('Test3', { message: 'Hello from Test1' });
        }}
      />
    </View>
  );
};

import test2 from './test2';
//import test3 from "./test3";
function TestLayout() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Test1" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Test1" component={Test1} />
        <Stack.Screen name="Test2" component={test2} />
        {/* <Stack.Screen name="Test3" component={test3} /> */}
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

export default TestLayout;
