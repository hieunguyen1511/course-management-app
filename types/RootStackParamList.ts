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
    UpdateCourse: { courseId: number, message?: string };

    AddSection: { 
        courseId: number, 
        newId: number,
        onSectionAdded?: (newSection: Section) => void, 
        message?: string };
    UpdateSection: { 
        courseId: number, 
        sectionData: Section
        onSectionUpdated?: (updatedSection: Section) => void, 
        message?: string };
    AddLesson: { 
        sectionData: Section,
        onLessonAdded?: (newLesson: Lesson) => void,
        message?: string };
    UpdateLesson: { 
        sectionData: Section,
        lessonData: Lesson,
        onLessonUpdated?: (updatedLesson: Lesson) => void,
        message?: string };
    AdminLayout: { message?: string };
}