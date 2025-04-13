import { Lesson, Section } from './apiModels';

export type RootStackParamList = {
  //Main: { screen: keyof RootStackParamList };

  IndexScreen: { message?: string };
  LoginScreen: { message?: string; message_from_register?: string | '' };
  RegisterScreen: { message?: string };
  //User Bottom Tab
  HomeScreen: { message?: string };
  AccountScreen: { message?: string };
  ExploreScreen: { message?: string };
  UserCourseScreen: { message?: string };

  //Tab Layout
  UserTabLayout: { message?: string };
  AdminTabLayout: { message?: string };

  //Admin Screen

  //User Screen

  Test1: { userId?: number; userName?: string; message?: string };
  Test2: { message?: string };
  Test3: { message?: string };
  Test4: { message?: string };
  UserViewAllCourseScreen: {
    message?: string;
    is_suggested?: boolean;
    is_popular?: boolean;
    category_id?: number;
  };
  DetailCourseScreen: { courseId: number; message?: string };
  SearchCourseScreen: { message?: string };
  UserViewAllEnrollmentScreen: { message?: string };
  UserRatingScreen: {
    message?: string;
    enrollmentId?: number;
    is_rated?: boolean;
    courseName?: string;
    categoryName?: string;
  };
  UserDetailCourseScreen: {
    enrollmentId: number;
    courseId: number;
    message?: string;
    message_from_detail_course_screen?: string;
  };
  UserViewLessonScreen: { enrollmentId: number; lessonId: number; message?: string };
  ChangePasswordScreen: { message?: string };
  EditProfileScreen: { message?: string };
  PaymentCheckoutScreen: { courseId: number; message?: string };
  //AccountScreen: { message?: string };

  UserViewAllCourse: { message?: string };
  DetailCourse: { courseId: number; message?: string };

  CategoryScreen: { message?: string };
  AddCategoryScreen: { message?: string };
  UpdateCategoryScreen: { categoryId: number; message?: string };

  AdminCourseScreen: { message?: string };
  AddCourseScreen: { message?: string };
  AdminViewCourseScreen: { courseId: number; message?: string };
  UpdateCourseScreen: { courseId: number; message?: string };

  DashboardScreen: { message?: string };

  AddSectionScreen: {
    courseId: number;
    newId: number;
    onSectionAdded?: (newSection: Section) => void;
    message?: string;
  };
  UpdateSectionScreen: {
    courseId: number;
    sectionData: Section;
    onSectionUpdated?: (updatedSection: Section) => void;
    message?: string;
  };
  AddLessonScreen: {
    sectionData: Section;
    onLessonAdded?: (newLesson: Lesson) => void;
    message?: string;
  };
  UpdateLessonScreen: {
    sectionData: Section;
    lessonData: Lesson;
    onLessonUpdated?: (updatedLesson: Lesson) => void;
    message?: string;
  };

  UserScreen: { message?: string };
  ViewDetailUserScreen: { userId: number; message?: string };
  SettingScreen: { message?: string };
  EditProfileAdminScreen: { message?: string };
};

// export type BottomTabParamList = {
//   home: { message?: string };
//   explore: { message?: string };
//   course: { message?: string };
//   account: { message?: string };
// };
