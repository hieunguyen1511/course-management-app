import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';

export type MyScreenProps = {
  IndexScreenProps: NativeStackScreenProps<RootStackParamList, 'Index'>;
  LoginScreenProps: NativeStackScreenProps<RootStackParamList, 'Login'>;
  RegisterScreenProps: NativeStackScreenProps<RootStackParamList, 'Register'>;
  // User Bottom Tab
  HomeScreenProps: NativeStackScreenProps<RootStackParamList, 'Home'>;
  UserCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'Course'>;
  AccountScreenProps: NativeStackScreenProps<RootStackParamList, 'Account'>;
  ExploreScreenProps: NativeStackScreenProps<RootStackParamList, 'Explore'>;

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
  ViewUserScreenProps: NativeStackScreenProps<RootStackParamList, 'ViewUserScreen'>;
};
