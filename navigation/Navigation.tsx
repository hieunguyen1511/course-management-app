import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import UserViewAllEnrollmentScreen from '@/screens/user/UserViewAllEnrollmentScreen';

import IndexScreen from './IndexScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import AdminTabLayout from '@/navigation/AdminTabLayout';
import ChangePassword from '@/screens/user/ChangePasswordScreen';
import EditProfile from '@/screens/user/EditProfileScreen';
import UserViewAllCourseScreen from '@/screens/user/UserViewAllCourseScreen';
import UserRating from '@/screens/user/UserRatingScreen';
import PaymentCheckoutScreen from '@/screens/user/PaymentCheckoutScreen';
import Test4 from '@/screens/test4';
import DetailCourseScreen from '@/screens/user/DetailCourseScreen';
import SearchCourse from '@/screens/user/SearchCourseScreen';
import UserViewLesson from '@/screens/user/UserViewLessonScreen';
import UserDetailCourseScreen from '@/screens/user/UserDetailCourseScreen';
import UserTabLayout from '@/navigation/UserTabLayout';
import AddCategoryScreen from '@/screens/admin/category/AddCategoryScreen';
import UpdateCategoryScreen from '@/screens/admin/category/UpdateCategoryScreen';
import AddLessonScreen from '@/screens/admin/course/section/lesson/AddLessonScreen';
import UpdateLessonScreen from '@/screens/admin/course/section/lesson/UpdateLessonScreen';
import AddCourseScreen from '@/screens/admin/course/AddCourseScreen';
import AddSectionScreen from '@/screens/admin/course/section/AddSectionScreen';
import UpdateSectionScreen from '@/screens/admin/course/section/UpdateSectionScreen';
import ViewCourseScreen from '@/screens/admin/course/ViewCourseScreen';
import UpdateCourseScreen from '@/screens/admin/course/UpdateCourseScreen';
import EditProfileAdminScreen from '@/screens/admin/setting/EditProfileScreen';
import ViewDetailUserScreen from '@/screens/admin/user/ViewUserScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();
const Navigation = () => {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLIC_KEY || ''}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="IndexScreen" screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="IndexScreen"
            component={IndexScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegisterScreen"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          {/* Tab Layout */}
          <Stack.Screen name="UserTabLayout" component={UserTabLayout} />
          <Stack.Screen name="AdminTabLayout" component={AdminTabLayout} />

          {/* User Screen */}

          <Stack.Screen name="ChangePasswordScreen" component={ChangePassword} />
          <Stack.Screen name="EditProfileScreen" component={EditProfile} />
          <Stack.Screen
            name="UserViewAllEnrollmentScreen"
            component={UserViewAllEnrollmentScreen}
          />
          <Stack.Screen name="UserRatingScreen" component={UserRating} />
          <Stack.Screen name="UserViewAllCourseScreen" component={UserViewAllCourseScreen} />
          <Stack.Screen name="UserDetailCourseScreen" component={UserDetailCourseScreen} />
          <Stack.Screen name="UserViewLessonScreen" component={UserViewLesson} />
          <Stack.Screen name="DetailCourseScreen" component={DetailCourseScreen} />
          <Stack.Screen name="SearchCourseScreen" component={SearchCourse} />
          {/* Test Screen */}
          <Stack.Screen name="Test4" component={Test4} />
          <Stack.Screen name="PaymentCheckoutScreen" component={PaymentCheckoutScreen} />

          {/* Admin Screen */}
          <Stack.Screen name="AddCategoryScreen" component={AddCategoryScreen} />
          <Stack.Screen name="UpdateCategoryScreen" component={UpdateCategoryScreen} />

          <Stack.Screen name="AddLessonScreen" component={AddLessonScreen} />
          <Stack.Screen name="UpdateLessonScreen" component={UpdateLessonScreen} />
          <Stack.Screen name="AddSectionScreen" component={AddSectionScreen} />
          <Stack.Screen name="UpdateSectionScreen" component={UpdateSectionScreen} />
          <Stack.Screen name="AddCourseScreen" component={AddCourseScreen} />
          <Stack.Screen name="ViewCourseScreen" component={ViewCourseScreen} />
          <Stack.Screen name="UpdateCourseScreen" component={UpdateCourseScreen} />
          <Stack.Screen name="EditProfileAdminScreen" component={EditProfileAdminScreen} />
          <Stack.Screen name="ViewDetailUserScreen" component={ViewDetailUserScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
};

export default Navigation;
