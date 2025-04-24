import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

export type MyScreenProps = {
  IndexScreenProps: NativeStackScreenProps<RootStackParamList, 'IndexScreen'>;
  LoginScreenProps: NativeStackScreenProps<RootStackParamList, 'LoginScreen'>;
  RegisterScreenProps: NativeStackScreenProps<RootStackParamList, 'RegisterScreen'>;
  ForgotPasswordScreenProps: NativeStackScreenProps<RootStackParamList, 'ForgotPasswordScreen'>;
  InputOTPScreenProps: NativeStackScreenProps<RootStackParamList, 'InputOTPScreen'>;
  NewPasswordScreenProps: NativeStackScreenProps<RootStackParamList, 'NewPasswordScreen'>;
  // User Bottom Tab
  HomeScreenProps: NativeStackScreenProps<RootStackParamList, 'HomeScreen'>;
  UserCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'UserCourseScreen'>;
  AccountScreenProps: NativeStackScreenProps<RootStackParamList, 'AccountScreen'>;
  ExploreScreenProps: NativeStackScreenProps<RootStackParamList, 'ExploreScreen'>;

  // User Screen Props
  Test2: NativeStackScreenProps<RootStackParamList, 'Test2'>;
  Test3: NativeStackScreenProps<RootStackParamList, 'Test3'>;
  UserViewAllCourseScreenProps: NativeStackScreenProps<
    RootStackParamList,
    'UserViewAllCourseScreen'
  >;
  DetailCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'DetailCourseScreen'>;
  SearchCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'SearchCourseScreen'>;
  UserDetailCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'UserDetailCourseScreen'>;
  UserViewLessonScreenProps: NativeStackScreenProps<RootStackParamList, 'UserViewLessonScreen'>;
  EditProfileScreenProps: NativeStackScreenProps<RootStackParamList, 'EditProfileScreen'>;
  ChangePasswordScreenProps: NativeStackScreenProps<RootStackParamList, 'ChangePasswordScreen'>;
  UserViewAllEnrollmentScreenProps: NativeStackScreenProps<
    RootStackParamList,
    'UserViewAllEnrollmentScreen'
  >;
  UserRatingScreenProps: NativeStackScreenProps<RootStackParamList, 'UserRatingScreen'>;
  PaymentCheckoutScreenProps: NativeStackScreenProps<RootStackParamList, 'PaymentCheckoutScreen'>;

  CategoryScreenProps: NativeStackScreenProps<RootStackParamList, 'CategoryScreen'>;
  AddCategoryScreenProps: NativeStackScreenProps<RootStackParamList, 'AddCategoryScreen'>;
  UpdateCategoryScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateCategoryScreen'>;
  CourseScreenProps: NativeStackScreenProps<RootStackParamList, 'CourseScreen'>;
  AddCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'AddCourseScreen'>;
  ViewCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'ViewCourseScreen'>;
  UpdateCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateCourseScreen'>;

  AddSectionScreenProps: NativeStackScreenProps<RootStackParamList, 'AddSectionScreen'>;
  UpdateSectionScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateSectionScreen'>;
  AddLessonScreenProps: NativeStackScreenProps<RootStackParamList, 'AddLessonScreen'>;
  UpdateLessonScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateLessonScreen'>;

  UserScreenProps: NativeStackScreenProps<RootStackParamList, 'UserScreen'>;
  ViewDetailUserScreenProps: NativeStackScreenProps<RootStackParamList, 'ViewDetailUserScreen'>;
  SettingScreenProps: NativeStackScreenProps<RootStackParamList, 'SettingScreen'>;
  EditProfileAdminScreenProps: NativeStackScreenProps<RootStackParamList, 'EditProfileAdminScreen'>;
};
