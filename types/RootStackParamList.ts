import { Lesson, Section } from './course';

export type RootStackParamList = {
  Main: { screen: keyof RootStackParamList };

  Index: { message?: string };
  Login: { message?: string; message_from_register?: string | '' };
  Register: { message?: string };
  //User Bottom Tab
  Home: { message?: string };
  Account: { message?: string };
  Explore: { message?: string };
  Course: { message?: string };

  //Tab Layout
  UserTabLayout: { message?: string };
  AdminLayout: { message?: string };

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

  Category: { message?: string };
  AddCategory: { message?: string };
  UpdateCategory: { categoryId: number; message?: string };

  AddCourse: { message?: string };
  ViewCourse: { courseId: number; message?: string };
  UpdateCourse: { courseId: number; message?: string };

  AddSection: {
    courseId: number;
    newId: number;
    onSectionAdded?: (newSection: Section) => void;
    message?: string;
  };
  UpdateSection: {
    courseId: number;
    sectionData: Section;
    onSectionUpdated?: (updatedSection: Section) => void;
    message?: string;
  };
  AddLesson: {
    sectionData: Section;
    onLessonAdded?: (newLesson: Lesson) => void;
    message?: string;
  };
  UpdateLesson: {
    sectionData: Section;
    lessonData: Lesson;
    onLessonUpdated?: (updatedLesson: Lesson) => void;
    message?: string;
  };
};

export type BottomTabParamList = {
  home: { message?: string };
  explore: { message?: string };
  course: { message?: string };
  account: { message?: string };
};
