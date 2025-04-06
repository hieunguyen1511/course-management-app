import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '@/types/RootStackParamList'
export type MyScreenProps = {
    IndexScreenProps: NativeStackScreenProps<RootStackParamList, 'Index'>;
    LoginScreenProps: NativeStackScreenProps<RootStackParamList, 'Login'>;
    RegisterScreenProps: NativeStackScreenProps<RootStackParamList, 'Register'>;
    HomeScreenProps: NativeStackScreenProps<RootStackParamList, 'Home'>;
    UserViewAllCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'UserViewAllCourse'>;
    DetailCourseScreenProps: NativeStackScreenProps<RootStackParamList, 'DetailCourse'>;
    Test2: NativeStackScreenProps<RootStackParamList, 'Test2'>;
    Test3: NativeStackScreenProps<RootStackParamList, 'Test3'>;

    
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
}