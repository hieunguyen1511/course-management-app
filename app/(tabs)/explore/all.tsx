import UserViewAllCourseScreen from '@/components/user/screens/UserAllCourseScreen';
import { router } from 'expo-router';

const All = () => {
  return (
    <UserViewAllCourseScreen
      viewDeailCourseHandle={courseId => {
        router.push({ pathname: '/explore/detail', params: { courseId } });
      }}
    />
  );
};

export default All;
