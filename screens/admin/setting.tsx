import { View, Text, Button } from 'react-native'
import React from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'


import  login from "@/screens/login"
import  register from "@/screens/register"


const Stack = createNativeStackNavigator()

const SettingScreen = ({navigation}:any) => {
  return (
    <View>
      
      <Button title="Go to Login" onPress={() => navigation.navigate('Login') } />
      <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
    </View>
  )
}

const Routes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Setting" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Setting" component={SettingScreen} />
        <Stack.Screen name="Login" component={login} />
        <Stack.Screen name="Register" component={register} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes