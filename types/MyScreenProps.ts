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
}