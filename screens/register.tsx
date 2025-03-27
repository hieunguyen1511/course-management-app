import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MyScreenProps } from "@/types/MyScreenProps";
import { Strings } from "@/constants/Strings";
import "../global.css";
import HorizontalRule from "@/components/ui/HorizontalRule";

interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen: React.FC<MyScreenProps["RegisterScreenProps"]> = ({
  navigation,
  route,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = Strings.register.requireFullname;
      isValid = false;
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = Strings.register.requireUsername;
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = Strings.register.requireEmail;
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = Strings.register.invalidEmail;
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = Strings.register.requirePassword;
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = Strings.register.minimumPassword;
      isValid = false;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = Strings.register.passwordNotMatch;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to login or home page after successful registration
        console.log("Registration successful", formData);
      }, 1500);
    }
  };
  return (
    <View className="flex justify-center bg-blue-500">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white h-max">
          <View className="bg-white h-screen p-5 mt-8 rounded-tl-[48] rounded-tr-[48]">
            <Text className="text-3xl font-bold text-blue-600 mb-4 text-center">
              {Strings.register.title}
            </Text>

            <Text className="text-gray-500 text-center mb-6">
              {Strings.register.descripton}
            </Text>
            <Image
              source={require("../assets/images/course-bg-login.svg")}
              style={{ width: 150, height: 150, alignSelf: "center" }}
              className="rounded-xl"
            />
            {/* Full Name Input */}
            <View className="mb-4">
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Ionicons
                  name="person"
                  size={24}
                  color="#3b82f6"
                  className="border-r border-gray-300"
                  style={{ paddingHorizontal: 5 }}
                />
                <TextInput
                  className="flex-1 placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
                  placeholder={Strings.register.placeHolderFullname}
                  value={formData.name}
                  onChangeText={(value) => handleChange("name", value)}
                  autoCapitalize="words"
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Username Input */}
            <View className="mb-4">
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Ionicons
                  name="at"
                  size={24}
                  color="#3b82f6"
                  className="border-r border-gray-300"
                  style={{ paddingHorizontal: 5 }}
                />
                <TextInput
                  className="flex-1 placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
                  placeholder={Strings.register.placeHolderUsername}
                  value={formData.username}
                  onChangeText={(value) => handleChange("username", value)}
                  autoCapitalize="none"
                />
              </View>
              {errors.username && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.username}
                </Text>
              )}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Ionicons
                  name="mail"
                  size={24}
                  color="#3b82f6"
                  className="border-r border-gray-300"
                  style={{ paddingHorizontal: 5 }}
                />
                <TextInput
                  className="flex-1 placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
                  placeholder={Strings.register.placeHolderEmail}
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.email}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Ionicons
                  name="lock-closed"
                  size={24}
                  color="#3b82f6"
                  className="border-r border-gray-300"
                  style={{ paddingHorizontal: 5 }}
                />
                <TextInput
                  className="flex-1 placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
                  placeholder={Strings.register.placeHolderPassword}
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
                  secureTextEntry={!passwordVisible}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={{ paddingHorizontal: 10 }}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-off" : "eye"}
                    size={22}
                    color="#3b82f6"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <View className="flex-row items-center border border-gray-300 rounded-lg">
                <Ionicons
                  name="lock-closed"
                  size={24}
                  color="#3b82f6"
                  className="border-r border-gray-300"
                  style={{ paddingHorizontal: 5 }}
                />
                <TextInput
                  className="flex-1 placeholder:text-gray-300 ml-1 rounded-lg p-3 text-base"
                  placeholder={Strings.register.placeHolderConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleChange("confirmPassword", value)
                  }
                  secureTextEntry={!confirmPasswordVisible}
                />
                <TouchableOpacity
                  onPress={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                  style={{ paddingHorizontal: 10 }}
                >
                  <Ionicons
                    name={confirmPasswordVisible ? "eye-off" : "eye"}
                    size={22}
                    color="#3b82f6"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`${
                isLoading ? "bg-blue-400" : "bg-blue-500"
              } p-4 rounded-lg shadow-sm items-center mt-2`}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="flex-row items-center justify-center">
                  <View className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <Text className="text-white font-bold text-base">
                    {Strings.register.registerProcess || "Creating account..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-base">
                  {Strings.register.register || "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            <View>
              <HorizontalRule />
            </View>

            {/* Login Link */}
            <View className="mt-6 mb-10">
              <Text className="text-center text-gray-600">
                {Strings.register.alreadyHaveAccount ||
                  "Already have an account?"}{" "}
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login", {})}
                >
                  <Text className="text-blue-500 font-medium">
                    {Strings.register.signIn || "Sign In"}
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
export default RegisterScreen;
