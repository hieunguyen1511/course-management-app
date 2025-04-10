import * as SecureStore from 'expo-secure-store';
import * as AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'refresh_token';

const asyncStorage = AsyncStorage.useAsyncStorage('access_token');

class TokenStorageManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async getAccessToken() {
    if (this.accessToken) {
      return this.accessToken;
    }

    this.accessToken = await asyncStorage.getItem();

    return this.accessToken;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    asyncStorage.setItem(accessToken);
  }

  async setRefreshToken(refreshToken: string, isNotPersistent: boolean = false) {
    this.refreshToken = refreshToken;
    if (isNotPersistent) {
      return;
    }
    if (Platform.OS != 'web') {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  async getRefreshToken() {
    if (this.refreshToken) {
      return this.refreshToken;
    }

    if (Platform.OS != 'web') {
      this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    }

    return this.refreshToken;
  }

  async deleteRefreshToken() {
    this.refreshToken = null;
    if (Platform.OS != 'web') {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  }

  async deleteAccessToken() {
    this.accessToken = null;
    return await asyncStorage.removeItem();
  }
}

export const tokenStorageManager = new TokenStorageManager();

export default tokenStorageManager;
