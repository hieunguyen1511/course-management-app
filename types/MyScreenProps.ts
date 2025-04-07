import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabParamList, RootStackParamList } from '@/types/RootStackParamList';

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

  CategoryScreenProps: NativeStackScreenProps<RootStackParamList, 'Category'>;
  AddCategoryScreenProps: NativeStackScreenProps<RootStackParamList, 'AddCategory'>;
  UpdateCategoryScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateCategory'>;
  CourseScreenProps: NativeStackScreenProps<RootStackParamList, 'Course'>;
  AddCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'AddCourse'>;
  ViewCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'ViewCourse'>;
  UpdateCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateCourse'>;

  AddSectionScreenProps: NativeStackScreenProps<RootStackParamList, 'AddSection'>;
  UpdateSectionScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateSection'>;
  AddLessonScreenProps: NativeStackScreenProps<RootStackParamList, 'AddLesson'>;
  UpdateLessonScreenProps: NativeStackScreenProps<RootStackParamList, 'UpdateLesson'>;
};
