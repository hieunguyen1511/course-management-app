import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import { MyScreenProps } from '@/types/MyScreenProps';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/api/axiosInstance';

// Types
interface Course {
  id: number;
  name: string;
  description: string;
  status: string;
  total_rating: number;
  image: string;
  price: number;
  discount: number;
  category_id: number;
  createdAt: string;
  updatedAt: string;
}

interface UserEnrollment {
  id: number;
  course_id: number;
  user_id: number;
  total_lesson: number;
  complete_lesson: number;
  progress: number;
  price: number;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
  course: Course;
}

interface CourseInProgress {
  id: number;
  enrollment_id: number;
  title: string;
  category: string;
  image: string;
  rating: number;
  progress: number;
  lastAccessed: string;
  totalLessons: number;
  completedLessons: number;
}

interface CourseCompleted {
  id: number;
  enrollment_id: number;
  title: string;
  category: string;
  image: string;
  rating: number;
  completedDate: string;
  hasReviewed: boolean;
}

// API functions
const getUserIdFromSecureStore = async (): Promise<string | null> => {
  try {
    const user = await SecureStore.getItemAsync('user');
    const userData = user ? JSON.parse(user) : null;
    return userData?.id || null;
  } catch (error) {
    console.error('Error retrieving user ID from SecureStore:', error);
    return null;
  }
};

const getUserEnrollments = async (userId: string): Promise<UserEnrollment[] | null> => {
  try {
    const url = `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID}`.replace(':user_id', userId);
    const response = await axiosInstance.get(url);
    
    if (response.status === 200 && response.data?.enrollments) {
      return response.data.enrollments.map((enrollment: UserEnrollment) => ({
        ...enrollment,
        progress: Math.round((enrollment.complete_lesson / enrollment.total_lesson) * 100)
      }));
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user enrollments:', error);
    return null;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getLastAccessedTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return 'Hôm nay';
  } else if (diffInHours < 48) {
    return 'Hôm qua';
  } else if (diffInHours < 72) {
    return '2 ngày trước';
  } else if (diffInHours < 96) {
    return '3 ngày trước';
  } else {
    return formatDate(dateString);
  }
};

const Course: React.FC<MyScreenProps["UserCourseScreenProps"]> = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'completed'>('progress');
  const [inProgressCourses, setInProgressCourses] = useState<CourseInProgress[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CourseCompleted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await getUserIdFromSecureStore();
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      const enrollments = await getUserEnrollments(userId);
      if (!enrollments) {
        setError('Không thể lấy danh sách khóa học');
        return;
      }

      // Process in-progress courses  
      const inProgress = enrollments
        .filter(enrollment => enrollment.progress < 100)
        .map(enrollment => ({
          id: enrollment.course.id,
          enrollment_id: enrollment.id,
          title: enrollment.course.name,
          category: enrollment.course.description.substring(0, 30) + '...',
          image: enrollment.course.image,
          rating: enrollment.course.total_rating,
          progress: enrollment.progress,
          lastAccessed: getLastAccessedTime(enrollment.updatedAt),
          totalLessons: enrollment.total_lesson,
          completedLessons: enrollment.complete_lesson
        }));

      // Process completed courses
      const completed = enrollments
        .filter(enrollment => enrollment.progress === 100)
        .map(enrollment => ({
          id: enrollment.course.id,
          enrollment_id: enrollment.id,
          title: enrollment.course.name,
          category: enrollment.course.description.substring(0, 30) + '...',
          image: enrollment.course.image,
          rating: enrollment.course.total_rating,
          completedDate: enrollment.updatedAt,
          hasReviewed: enrollment.rating !== null
        }));
      setInProgressCourses(inProgress);
      setCompletedCourses(completed);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCourses();
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserCourses();
    setRefreshing(false);
  }, [fetchUserCourses]);

  // Render progress bar
  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'progress' && styles.activeTab
        ]}
        onPress={() => setActiveTab('progress')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'progress' && styles.activeTabText
          ]}
        >
          Đang học
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'completed' && styles.activeTab
        ]}
        onPress={() => setActiveTab('completed')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'completed' && styles.activeTabText
          ]}
        >
          Đã hoàn thành
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render in-progress course
  const renderInProgressCourse = ({ item }: { item: CourseInProgress }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image source={{ uri: item.image }} style={styles.courseImage} />

      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>

        <View style={styles.progressContainer}>
          <ProgressBar progress={item.progress} />
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{item.progress}% Hoàn thành</Text>
            <Text style={styles.lessonCount}>{item.completedLessons}/{item.totalLessons} bài học</Text>
          </View>
        </View>

        <Text style={styles.lastAccessedText}>Truy cập lần cuối: {item.lastAccessed}</Text>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('UserDetailCourseScreen', { enrollmentId: item.enrollment_id, courseId: item.id })}
      >
        <Text style={styles.continueButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render completed course
  const renderCompletedCourse = ({ item }: { item: CourseCompleted }) => (
    <TouchableOpacity style={styles.courseCard} onPress={() =>
      navigation.navigate('UserRatingScreen', { message: "" })}>
      <Image source={{ uri: item.image }} style={styles.courseImage} />

      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>

        <View style={styles.completedInfoContainer}>
          <View style={styles.completedDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.completedDate}>
              Hoàn thành: {formatDate(item.completedDate)}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.reviewButton} >
        <Ionicons
          name={item.hasReviewed ? "star" : "star-outline"}
          size={16}
          color="#4a6ee0"
        />
        <Text style={styles.reviewText}>
          {item.hasReviewed ? "Xem đánh giá" : "Đánh giá"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Đang tải khóa học của bạn...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchUserCourses}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khóa học của tôi</Text>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Course Lists */}
      {activeTab === 'progress' ? (
        <FlatList<CourseInProgress>
          data={inProgressCourses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderInProgressCourse({ item })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Bạn chưa bắt đầu khóa học nào</Text>
              <TouchableOpacity 
                style={styles.exploreCourseButton}
                onPress={() => navigation.navigate('Main', { screen: 'Home' })}
              >
                <Text style={styles.exploreCourseText}>Khám phá khóa học</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4a6ee0"]}
            />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList<CourseCompleted>
          data={completedCourses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderCompletedCourse({ item })}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Bạn chưa hoàn thành khóa học nào</Text>
              <Text style={styles.emptySubText}>Các khóa học đã hoàn thành sẽ hiển thị ở đây</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4a6ee0"]}
            />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4a6ee0',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4a6ee0',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
    flexGrow: 1,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 5,
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
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  lessonCount: {
    fontSize: 12,
    color: '#999',
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  nextLessonText: {
    fontSize: 12,
    color: '#4a6ee0',
    marginLeft: 5,
  },
  continueButton: {
    backgroundColor: '#4a6ee0',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  completedInfoContainer: {
    marginTop: 8,
  },
  completedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  completedDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  reviewButton: {
    flexDirection: 'column',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  reviewText: {
    color: '#4a6ee0',
    fontWeight: '500',
    fontSize: 10,
    marginTop: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  exploreCourseButton: {
    backgroundColor: '#4a6ee0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  exploreCourseText: {
    color: 'white',
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 14,
    color: '#4a6ee0',
    marginBottom: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  lastAccessedText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4a6ee0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Course