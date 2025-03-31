import { Lesson, Section } from './course';

export type RootStackParamList = {
    Index: { message?: string };
    Login: { message?: string };
    Register: { message?: string };
    Home: { message?: string };
    Test1: { userId?: number; userName?: string; message?: string };
    UserTabLayout: { message?: string };

    UserViewAllCourse: { message?: string };
    DetailCourse: { courseId: number; message?: string };

    Test2: { message?: string };
    Test3: { message?: string };
    
    Category: { message?: string };
    AddCategory: { message?: string };
    UpdateCategory: { categoryId: number, message?: string };
    Course: { message?: string };
    AddCourse: { message?: string };
    ViewCourse: { courseId: number, message?: string };
    EditCourse: { courseId: number, message?: string };
    AddSection: { message?: string };
    EditSection: { section: Section, message?: string };
    AddLesson: { message?: string };
    EditLesson: { lesson: Lesson, message?: string };
    AdminLayout: { message?: string };
}