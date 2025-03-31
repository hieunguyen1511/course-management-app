export type RootStackParamList = {
    Main: {screen: keyof RootStackParamList};
   
    Index: { message?: string };
    Login: { message?: string };
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
    UserViewAllCourseScreen: { message?: string };
    DetailCourseScreen: { courseId: number; message?: string };
    SearchCourseScreen: { message?: string };
    UserViewAllEnrollmentScreen: { message?: string };    
    UserRatingScreen: { message?: string };
    UserDetailCourseScreen: { courseId: number; message?: string };
    UserViewLessonScreen: { courseId: number; lessonId: number; message?: string };
    ChangePasswordScreen: { message?: string };
    EditProfileScreen: { message?: string };
    
    //AccountScreen: { message?: string };
    
    
}


export type BottomTabParamList = {
    home: { message?: string };
    explore: { message?: string };
    course: { message?: string };
    account: { message?: string };
};

