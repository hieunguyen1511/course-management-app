import tokenStorageManager from '@/storage/tokenStorage/tokenStorageManager';
import { Redirect, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

const Index = async () => {
  const token = await tokenStorageManager.getRefreshToken();
  if (token) {
    const user = await SecureStore.getItemAsync('user');
    const userData = user ? JSON.parse(user) : null;
    if (userData.role === 0) {
      router.replace('/admin');
    } else {
      router.replace('/home');
    }
  } else {
    router.replace('/login');
  }

  return <></>;
};

export default Index;
