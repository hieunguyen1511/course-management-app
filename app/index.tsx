import { View, Text, Button } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'

import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack'
import { useNavigation } from 'expo-router'

import Login from '@/screens/login'
import Category from '@/screens/admin/category';
import Register from '@/screens/register'
import UserTabLayout from './(tabs)/_layout'
import { RootStackParamList } from '@/types/RootStackParamList'
import { MyScreenProps } from '@/types/MyScreenProps'


const Stack = createNativeStackNavigator<RootStackParamList>()

const IndexScreen: React.FC<MyScreenProps['IndexScreenProps']> = ({ navigation, route }) => {
  if(true){
    navigation.navigate('Login', {message: 'Hello from Index'})
  }
  return null
}


function IndexLayout() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Category" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Index" component={IndexScreen} options={{headerShown:false}} />
        <Stack.Screen name="Login" component={Login} options={{headerShown:false}}  />
        <Stack.Screen name="Category" component={Category} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{headerShown:false}}  />
        <Stack.Screen name="UserTabLayout" component={UserTabLayout} options={{headerShown:false}}  />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}



export default IndexLayout