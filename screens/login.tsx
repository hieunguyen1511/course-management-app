import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { FC, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MyScreenProps } from "@/types/MyScreenProps";
import axiosInstance from "@/api/axiosInstance";
import { useRouter } from "expo-router";
import { Strings } from "@/constants/Strings";
import "../global.css";
import Checkbox from "@/components/ui/Checkbox";
import HorizontalRule from "@/components/ui/HorizontalRule";
import * as SecureStore from "expo-secure-store";
import { setAccessToken } from "@/api/axiosInstance";

import NotificationToast from "@/components/NotificationToast";
import { ToastType } from "@/components/NotificationToast";

async function saveUserInformation(user: any) {
  try {
    await SecureStore.deleteItemAsync("user");
    await SecureStore.setItemAsync("user", JSON.stringify(user));
  } catch (e) {
    console.log("Error saving user", e);
  }
}

async function saveRefreshToken(refresh_token: string) {
  try {
    await SecureStore.setItemAsync("refresh_token", refresh_token);
  } catch (e) {
    console.log("Error saving token", e);
  }
}

const Login: FC<MyScreenProps["LoginScreenProps"]> = ({
  navigation,
  route,
}) => {
  const homeRouter = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRemmebermeChecked, setIsRemmebermeChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  const showToast = async (message: string | "", type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    if (route.params?.message) {
      console.log("Login message:", route.params.message);
    }

    if (route.params?.message_from_register) {
      console.log(
        "Login message from register:",
        route.params.message_from_register
      );
      setTimeout(() => {
        showToast(route.params.message_from_register || "", ToastType.SUCCESS);
      }, 300);
    }
  }, [route.params]);

  const handleLogin = async () => {
    try {
      if (username === "" || password === "") {
        console.log("Username or password is empty");
        return;
      }

      setIsLoading(true);

      try {
        const res = await axiosInstance.post(
          `${process.env.EXPO_PUBLIC_API_LOGIN}`,
          {
            username: username,
            password: password,
          }
        );

        if (res.status === 200) {
          console.log("Login successful");
          console.log("Access token", res.data.access_token);
          await setAccessToken(res.data.access_token);

          if (isRemmebermeChecked) {
            await saveRefreshToken(res.data.refresh_token);
            await saveUserInformation(res.data.user);
          }

          const userRole = res.data.user.role;
          if (userRole === 1) {
            navigation.replace("UserTabLayout", {
              message: "Hello from Login",
            });
          }
          if (userRole === 0) {
            navigation.replace("AdminLayout", {
              message: "Hello from Login",
            });
          }
        }
      } catch (e: any) {
        console.log("Error in login attempt", e.response.data.message);
        setTimeout(() => {
          showToast(e.response.data.message || "", ToastType.ERROR);
        }, 300);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Login failed");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>{Strings.login.title}</Text>

          <Image
            source={require("../assets/images/course-bg-login.png")}
            style={styles.logoImage}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person"
                size={24}
                color="gray"
                style={[styles.inputIcon, styles.inputIconBorder]}
              />
              <TextInput
                style={styles.input}
                placeholder={Strings.login.placeHolderUsername}
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed"
                size={24}
                color="gray"
                style={[styles.inputIcon, styles.inputIconBorder]}
              />
              <TextInput
                style={styles.input}
                placeholder={Strings.login.placeHolderPassword}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#3b82f6"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              checked={isRemmebermeChecked}
              onCheck={setIsRemmebermeChecked}
              label={Strings.login.rememberMe}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading ? styles.loginButtonLoading : null,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.loadingIndicator}
                />
                <Text style={styles.buttonText}>{Strings.login.loggingin}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{Strings.login.login}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <HorizontalRule />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              console.log("Google sign in pressed");
              // Add your Google sign-in logic here
            }}
          >
            <Image
              source={require("../assets/images/google.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>
              {Strings.login.signInByGoogle}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {Strings.login.dontHaveAccount}{" "}
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Register", {
                  message: "Hello from Login",
                });
              }}
            >
              <Text style={styles.registerLink}>{Strings.login.register}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#3b82f6",
  },
  formContainer: {
    backgroundColor: "white",
    height: "100%",
    padding: 20,
    marginTop: 32,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3b82f6",
    marginBottom: 32,
    textAlign: "center",
  },
  logoImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
    borderRadius: 12,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 4,
  },
  inputIcon: {
    paddingHorizontal: 5,
    color: "#3b82f6",
  },
  inputIconBorder: {
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  passwordIcon: {
    paddingHorizontal: 10,
  },
  checkboxContainer: {
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  loginButtonLoading: {
    backgroundColor: "#60a5fa",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 20,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  googleButtonText: {
    color: "#4b5563",
    fontWeight: "bold",
  },
  registerContainer: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
  },
  registerText: {
    color: "#4b5563",
    textAlign: "center",
  },
  registerLink: {
    color: "#3b82f6",
    fontWeight: "500",
    fontSize: 16,
  },
});

export default Login;
