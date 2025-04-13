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

import { useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';
import { RootStackParamList } from '../../types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ContinueCourse, CourseCard, UserHeader } from '@/types/MyInterfaces';

// Components
import Section from '@/components/user/Section';
import Header from '@/components/user/Header';
import CourseCardComponent from '@/components/user/CourseCardComponent';
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

const getCoursesByReferenceCategory = async (
  categoryId: number | string
): Promise<CourseCard[]> => {
  try {
    const url =
      `${process.env.EXPO_PUBLIC_API_GET_COURSES_BY_REFERENCES_CATEOGORY_ID_LIMIT_INFO}`.replace(
        ':category_id',
        categoryId.toString()
      );

    const response = await axiosInstance.get(url);

    if (response.status === 200 && response.data?.courses) {
      return response.data.courses
        .slice(0, 10)
        .sort((a: CourseCard, b: CourseCard) => b.rating - a.rating);
    }
    return [] as CourseCard[];
  } catch (error) {
    console.error('Error fetching courses by reference category:', error);
    return [] as CourseCard[];
  }
};

const getContinueCourses = async (): Promise<ContinueCourse> => {
  try {
    const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_CONTINUE_COURSES}`);
    if (response.status === 200) {
      return response.data.enrollment as ContinueCourse;
    }
    return {} as ContinueCourse;
  } catch (error) {
    console.error('Error fetching continue courses:', error);
    return {} as ContinueCourse;
  }
};
type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
const Home: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { tmessage } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('User');
  const [inProgressCourses, setInProgressCourses] = useState<ContinueCourse>({} as ContinueCourse);
  const [suggestedCourses, setSuggestedCourses] = useState<CourseCard[]>([]);
  const [popularCourses, setPopularCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referenceCategoryId, setReferenceCategoryId] = useState<number | string>('NaN');

  // Fetch user enrollments
  const fetchContinueCourses = useCallback(async () => {
    try {
      const data = await getContinueCourses();
      if (data) {
        setReferenceCategoryId(data.categoryId);
        setInProgressCourses(data);
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
          await fetchContinueCourses();
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
  }, [fetchContinueCourses, referenceCategoryId]);

  useEffect(() => {
    if (route.params?.message) {
      setMessage(route.params.message);
    }
    fetchData();
  }, [fetchData, route.params?.message]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

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
    ({ progress }: { progress?: number }) => (
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress ? progress : 0}%` }]} />
      </View>
    ),
    []
  );
  const renderInProgressSection = useCallback(
    () => (
      <Section title={Strings.user_home.continue_learning} showViewAll={false}>
        <InProgressCourseCard
          item={inProgressCourses ? inProgressCourses : null}
          onPress={() =>
            navigation.navigate('UserDetailCourseScreen', {
              courseId: inProgressCourses.courseId,
              message: '',
              enrollmentId: inProgressCourses.enrollmentId,
            })
          }
          renderProgressBar={renderProgressBar}
        />
      </Section>
    ),
    [inProgressCourses, navigation, renderProgressBar]
  );

  const renderSuggestedCoursesSection = useCallback(
    () => (
      <Section
        title={Strings.user_home.suggest_courses}
        onViewAllPress={() =>
          navigation.navigate('UserViewAllCourseScreen', {
            message: 'Hello from Home Suggest Course',
            is_suggested: true,
            category_id: parseInt(referenceCategoryId.toString()),
          })
        }
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={suggestedCourses}
          keyExtractor={item => item.courseId.toString()}
          renderItem={({ item }) => (
            <CourseCardComponent
              course={item}
              onPress={() =>
                navigation.navigate('DetailCourseScreen', {
                  courseId: item.courseId,
                  message: '',
                })
              }
              renderRatingStars={renderRatingStars}
            />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </Section>
    ),
    [suggestedCourses, navigation, renderRatingStars, referenceCategoryId]
  );

  const renderPopularCoursesSection = useCallback(
    () => (
      <Section
        title={Strings.user_home.popular_courses}
        onViewAllPress={() =>
          navigation.navigate('UserViewAllCourseScreen', {
            message: 'Hello from Home Popular Course',
            is_popular: true,
          })
        }
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={popularCourses}
          keyExtractor={item => item.courseId.toString()}
          renderItem={({ item }) => (
            <CourseCardComponent
              course={item}
              onPress={() =>
                navigation.navigate('DetailCourseScreen', {
                  courseId: item.courseId,
                  message: '',
                })
              }
              renderRatingStars={renderRatingStars}
            />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </Section>
    ),
    [popularCourses, navigation, renderRatingStars]
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
            onProfilePress={() => navigation.navigate('Account', { message: '' })}
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
