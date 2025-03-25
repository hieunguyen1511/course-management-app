import { View, Text, Button } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'

import register from '../screens/register'

const index = () => {
  return (
    <Button title="Register" onPress={() => register()} />
  )
}


export default index