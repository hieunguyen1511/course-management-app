import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let accessToken: string | null = null;


const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_DEV_BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
axiosInstance.interceptors.request.use(
  async (config) => {
    // Do something before request is sent
    console.log("Request interceptor", config);
    
    const token = await getAccessToken();
    console.log(token)
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    // Do something with request error
    console.log("Request interceptor error", error);
    return Promise.reject(error);
  }
);


async function setAccessToken(token: string) {
  accessToken = token;
  await AsyncStorage.setItem("access_token", token);
}

async function getAccessToken() {
  if (!accessToken) {
    accessToken = await AsyncStorage.getItem("access_token");
  }
  return accessToken;
}
export default axiosInstance;
export { setAccessToken, getAccessToken };