import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refresh_token';

class TokenStorageManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  getAccessToken() {
    return this.accessToken;
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  async setRefreshToken(refreshToken: string, isNotPersistent: boolean = false) {
    this.refreshToken = refreshToken;
    if (isNotPersistent) {
      return;
    }
    return await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  async getRefreshToken() {
    if (this.refreshToken) {
      return this.refreshToken;
    }

    this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

    return this.refreshToken;
  }

  async deleteRefreshToken() {
    this.refreshToken = null;
    return await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

export const tokenStorageManager = new TokenStorageManager();

export default tokenStorageManager;
