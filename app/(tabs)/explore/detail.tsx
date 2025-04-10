import DetailCourseScreen from '@/components/user/screens/DetailCourseScreen';
import { router } from 'expo-router';

const Detail = () => {
  return (
    <DetailCourseScreen
      paymentCheckoutHandler={courseId => {
        router.push({ pathname: '/explore/payment', params: { courseId } });
      }}
    />
  );
};

export default Detail;
