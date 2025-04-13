import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { useFocusEffect } from '@react-navigation/native';

import { formatDateOrRelative } from '@/utils/datetime';
import { MyCompletedCourse } from '@/types/MyInterfaces';
import { MyProgressCourse } from '@/types/MyInterfaces';

const getMyInProgressEnrollments = async (): Promise<MyProgressCourse[]> => {
  const response = await axiosInstance.get(
    `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_IN_PROGRESS_LIMIT_INFO}`
  );
  return response.data.enrollments as MyProgressCourse[];
};

const getMyCompletedEnrollments = async (): Promise<MyCompletedCourse[]> => {
  const response = await axiosInstance.get(
    `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_COMPLETED_LIMIT_INFO}`
  );
  return response.data.enrollments as MyCompletedCourse[];
};

const Course: React.FC<MyScreenProps['UserCourseScreenProps']> = ({ navigation, route }) => {
  // State variables
  const [activeTab, setActiveTab] = useState<'progress' | 'completed'>('progress');
  const [inProgressEnrollments, setInProgressEnrollments] = useState<MyProgressCourse[]>([]);
  const [completedEnrollments, setCompletedEnrollments] = useState<MyCompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    const [inProgressEnrollments, completedEnrollments] = await Promise.all([
      getMyInProgressEnrollments(),
      getMyCompletedEnrollments(),
    ]);
    setInProgressEnrollments(inProgressEnrollments);
    setCompletedEnrollments(completedEnrollments);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

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
        style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
        onPress={() => setActiveTab('progress')}
      >
        <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
          Đang học
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
        onPress={() => setActiveTab('completed')}
      >
        <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
          Đã hoàn thành
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render in-progress course
  const renderInProgressCourse = ({ item }: { item: MyProgressCourse }) => (
    <TouchableOpacity style={styles.courseCard}>
      <View style={styles.courseImageContainer}>
        {item?.image ? (
          <Image source={{ uri: item?.image }} style={styles.courseImage} />
        ) : (
          <Image source={require('../../assets/images/course.jpg')} style={styles.courseImage} />
        )}
      </View>

      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {item?.name}
        </Text>
        <Text style={styles.categoryText}>{item?.categoryName}</Text>

        <View style={styles.progressContainer}>
          <ProgressBar progress={item.progress ?? 0} />
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{item.progress ?? 0}% Hoàn thành</Text>
            <Text style={styles.lessonCount}>
              {item.total_lesson_completed}/{item.total_lesson ?? 0} bài học
            </Text>
          </View>
        </View>

        {item.last_accessed && (
          <Text style={styles.lastAccessedText}>
            Truy cập lần cuối: {formatDateOrRelative(item.last_accessed)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() =>
          navigation.navigate('UserDetailCourseScreen', {
            enrollmentId: item.enrollmentId,
            courseId: item.courseId,
          })
        }
      >
        <Text style={styles.continueButtonText}>Tiếp tục</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Render completed course
  const renderCompletedCourse = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() =>
        navigation.navigate('UserDetailCourseScreen', {
          enrollmentId: item.enrollmentId,
          courseId: item.courseId,
        })
      }
    >
      <View style={styles.courseImageContainer}>
        {item?.image ? (
          <Image source={{ uri: item.image }} style={styles.courseImage} />
        ) : (
          <Image source={require('../../assets/images/course.jpg')} style={styles.courseImage} />
        )}
      </View>

      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>
          {item?.name}
        </Text>
        <Text style={styles.categoryText}>{item?.categoryName}</Text>

        <View style={styles.completedInfoContainer}>
          <View style={styles.completedDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.completedDate}>Hoàn thành: {formatDate(item.completed_at)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() =>
          item.rating !== null
            ? navigation.navigate('UserRatingScreen', {
                message: '',
                enrollmentId: item.enrollmentId,
                is_rated: true,
                courseName: item.name,
                categoryName: item.categoryName,
              })
            : navigation.navigate('UserRatingScreen', {
                message: '',
                enrollmentId: item.enrollmentId,
                is_rated: false,
                courseName: item.name,
                categoryName: item.categoryName,
              })
        }
      >
        <Ionicons name={item.rating !== null ? 'star' : 'star-outline'} size={16} color="#fdd700" />
        <Text style={styles.reviewText}>{item.rating > 0 ? 'Xem đánh giá' : 'Đánh giá'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải khóa học của bạn...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'progress' ? (
          <>
            {inProgressEnrollments.length > 0 ? (
              inProgressEnrollments.map(enrollment => (
                <View key={enrollment.enrollmentId.toString()}>
                  {renderInProgressCourse({ item: enrollment })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Bạn chưa bắt đầu khóa học nào</Text>
                <TouchableOpacity style={styles.exploreCourseButton}>
                  <Text style={styles.exploreCourseText}>Khám phá khóa học</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {completedEnrollments.length > 0 ? (
              completedEnrollments.map(enrollment => (
                <View key={enrollment.enrollmentId.toString()}>
                  {renderCompletedCourse({ item: enrollment })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Bạn chưa hoàn thành khóa học nào</Text>
                <Text style={styles.emptySubText}>
                  Các khóa học đã hoàn thành sẽ hiển thị ở đây
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

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
  courseImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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

export default Course;
