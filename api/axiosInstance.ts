import axios from "axios";
import { Platform } from "react-native";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_DEV_BACKEND_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});



export default axiosInstance;