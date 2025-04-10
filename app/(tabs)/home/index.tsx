import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ListRenderItem,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';
import { RootStackParamList } from '../../../types/RootStackParamList';

// Types for our courses data
interface Course {
  id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  category_id: number;
  total_rating: number;
  enrollment_count: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
}

interface UserEnrollments {
  id: number;
  user_id: number;
  course_id: number;
  total_lesson: number;
  complete_lesson: number;
  progress: number;
  image: string;
  last_access: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: number;
    name: string;
    description: string;
    status: number;
    price: number;
    discount: number;
  };
}

interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: string;
  avatar: string;
}

// Components
import Section from '@/components/user/Section';
import Header from '@/components/user/Header';
import CourseCard from '@/components/user/CourseCard';
import InProgressCourseCard from '@/components/user/InProgressCourseCard';

// Helper functions
async function getUserInformation() {
  try {
    const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_USER_INFO_JWT}`);
    if (response.status === 200) {
      console.log('User', response.data);
      return JSON.stringify(response.data.user);
    }
  } catch (e) {
    console.log('Error getting user', e);
    return JSON.stringify({});
  } finally {
    console.log('Finally');
  }
  return JSON.stringify({});
}

const getCoursesByReferenceCategory = async (categoryId: number | string): Promise<Course[]> => {
  try {
    console.log('Category ID', categoryId);
    const url = `${process.env.EXPO_PUBLIC_API_GET_COURSES_BY_REFERENCES_CATEOGORY_ID}`.replace(
      ':category_id',
      categoryId.toString()
    );

    const response = await axiosInstance.get(url);

    if (response.status === 200 && response.data?.course) {
      return response.data.course
        .slice(0, 10)
        .sort((a: Course, b: Course) => b.total_rating - a.total_rating);
    }
    return [];
  } catch (error) {
    console.error('Error fetching courses by reference category:', error);
    return [];
  }
};

const Home: React.FC = ({}) => {
  const [userName, setUserName] = useState('User');
  const [inProgressCourses, setInProgressCourses] = useState<UserEnrollments>();
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referenceCategoryId, setReferenceCategoryId] = useState<number | string>('NaN');

  // Helper functions
  const renderRatingStars = useCallback(
    (rating: number) => (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? '★' : '☆'}
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating ? rating.toFixed(1) : 0}</Text>
      </View>
    ),
    []
  );

  const renderProgressBar = useCallback(
    ({ progress }: { progress: number }) => (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    ),
    []
  );

  // Fetch user enrollments
  const fetchUserEnrollments = useCallback(async (userId: number) => {
    if (!userId) return;

    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID_JWT}`
      );
      console.log('User enrollments response:', userId);
      if (response.data?.enrollments?.length > 0) {
        const sortedEnrollments = response.data.enrollments.sort(
          (a: UserEnrollments, b: UserEnrollments) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        //console.log('User enrollments response:', response.data?.enrollments?.length);
        const firstEnrollment = sortedEnrollments[0];
        if (firstEnrollment) {
          setReferenceCategoryId(firstEnrollment.course.category_id);
          //console.log('User enrollments response:', response.data?.enrollments?.length);
          const mappedData: UserEnrollments = {
            id: firstEnrollment.id,
            user_id: firstEnrollment.user_id,
            course_id: firstEnrollment.course_id,
            course: {
              id: firstEnrollment.course?.id || 0,
              name: firstEnrollment.course?.name || 'N/A',
              description: firstEnrollment.course?.description || 'N/A',
              status: firstEnrollment.course?.status || 0,
              price: firstEnrollment.course?.price || 0,
              discount: firstEnrollment.course?.discount || 0,
            },
            total_lesson: firstEnrollment.total_lesson || 0,
            complete_lesson: firstEnrollment.complete_lesson || 0,
            progress: Math.round(
              ((firstEnrollment.complete_lesson || 0) / (firstEnrollment.total_lesson || 1)) * 100
            ),
            image: firstEnrollment.course?.image || '',
            last_access: firstEnrollment.last_access || '',
            createdAt: firstEnrollment.createdAt || '',
            updatedAt: new Intl.DateTimeFormat('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(firstEnrollment.updatedAt)),
          };
          setInProgressCourses(mappedData);
        }
      }
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
    }
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userInfo = await getUserInformation();
      const parsedUserInfo = JSON.parse(userInfo);
      if (parsedUserInfo) {
        setUserName(parsedUserInfo.fullname || 'User');

        if (parsedUserInfo.id) {
          await fetchUserEnrollments(parsedUserInfo.id);
        }
      }

      // Fetch courses in parallel
      const [suggestedCoursesData, popularCoursesData] = await Promise.all([
        getCoursesByReferenceCategory(referenceCategoryId),
        getCoursesByReferenceCategory('NaN'),
      ]);

      if (suggestedCoursesData?.length > 0) {
        setSuggestedCourses(suggestedCoursesData);
      }
      if (popularCoursesData?.length > 0) {
        setPopularCourses(popularCoursesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserEnrollments, referenceCategoryId]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const renderInProgressSection = useCallback(
    () => (
      <Section title={Strings.user_home.continue_learning} showViewAll={false}>
        <FlatList
          data={inProgressCourses ? [inProgressCourses] : []}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <InProgressCourseCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/course/detail',
                  params: {
                    courseId: item.course_id,
                    message: '',
                    enrollmentId: item.id,
                  },
                })
              }
              renderProgressBar={renderProgressBar}
            />
          )}
          ListEmptyComponent={() => (
            <Text style={styles.noCourses}>{Strings.user_home.no_enrolled_courses}</Text>
          )}
        />
      </Section>
    ),
    [inProgressCourses, renderProgressBar]
  );

  const renderSuggestedCoursesSection = useCallback(
    () => (
      <Section
        title={Strings.user_home.suggest_courses}
        onViewAllPress={() =>
          router.push({
            pathname: '/home/all',
            params: {
              message: 'Hello from Home Suggest Course',
              is_suggested: 1,
              category_id: parseInt(referenceCategoryId.toString()),
            },
          })
        }
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={suggestedCourses}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() =>
                router.push({
                  pathname: '/home/detail',
                  params: {
                    courseId: item.id,
                    message: '',
                  },
                })
              }
              renderRatingStars={renderRatingStars}
            />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </Section>
    ),
    [suggestedCourses, renderRatingStars, referenceCategoryId]
  );

  const renderPopularCoursesSection = useCallback(
    () => (
      <Section
        title={Strings.user_home.popular_courses}
        onViewAllPress={() =>
          router.push({
            pathname: '/home/all',
            params: {
              message: 'Hello from Home Popular Course',
              is_popular: 1,
            },
          })
        }
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCourses}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() =>
                router.push({
                  pathname: '/home/detail',
                  params: {
                    courseId: item.id,
                    message: '',
                  },
                })
              }
              renderRatingStars={renderRatingStars}
            />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </Section>
    ),
    [popularCourses, renderRatingStars]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={{ marginTop: 10 }}>{Strings.user_home.loading_your_courses}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.container}
        ListHeaderComponent={
          <Header
            userName={userName}
            onProfilePress={() => router.push({ pathname: '/account', params: { message: '' } })}
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4a6ee0']} />
        }
        data={[{ id: 'main' }]}
        renderItem={() => (
          <>
            {renderInProgressSection()}
            {renderSuggestedCoursesSection()}
            {renderPopularCoursesSection()}
          </>
        )}
        keyExtractor={item => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingTop: 100,
  },

  lastSection: {
    marginBottom: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a6ee0',
  },
  noCourses: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  horizontalList: {
    marginLeft: -5,
  },

  starIcon: {
    color: '#ffb100',
    fontSize: 12,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  sectionList: {
    paddingHorizontal: 20,
  },
  horizontalListContent: {
    paddingHorizontal: 15,
  },
});

export default Home;
