import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Enrollment, User } from '@/types/apiModels';
import { formatDate } from '@/components/formatDate';

const ViewDetailUserScreen: React.FC<MyScreenProps['ViewDetailUserScreenProps']> = ({
  navigation,
  route,
}) => {
  const { userId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user details

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch user details
      const userResponse = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_USER_BY_ID}`.replace(':id', String(userId))
      );
      setUser(userResponse.data.user);

      // Fetch user enrollments
      const enrollmentsResponse = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID_WITH_COURSE_AND_CATEGORY}`.replace(
          ':id',
          String(userId)
        )
      );
      setEnrollments(enrollmentsResponse.data.enrollments);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserDetails();
  };

  // Render enrollment item
  const renderEnrollmentItem = ({ item }: { item: Enrollment }) => (
    <View style={styles.courseCard}>
      <View style={styles.reviewAvatar}>
        {item.user?.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>
            {item.user?.fullname
              ?.split(' ')
              .map(n => n[0])
              .join('')}
          </Text>
        )}
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseName} numberOfLines={2}>
          {item.course?.name}
        </Text>
        <Text style={styles.courseCategory}>{item.course?.category?.name}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.round(((item.enrollment_lessons?.length * 100) / item.total_lesson, 0))}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(((item.enrollment_lessons?.length * 100) / item.total_lesson, 0))}% hoàn
            thành
          </Text>
        </View>

        <Text style={styles.lessonCount}>
          {item.enrollment_lessons?.length}/{item.total_lesson} bài học
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin người dùng</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4a6ee0']} />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.reviewAvatar}>
            {user?.avatar ? (
              <Image source={{ uri: user?.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.fullname
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </Text>
            )}
          </View>
          <Text style={styles.userName}>{user?.fullname}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>

        {/* User Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={20} color="#4a6ee0" />
            <Text style={styles.detailText}>{user?.email}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={20} color="#4a6ee0" />
            <Text style={styles.detailText}>{user?.phone}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color="#4a6ee0" />
            <Text style={styles.detailText}>{formatDate(user?.birth)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="book-outline" size={20} color="#4a6ee0" />
            <Text style={styles.detailText}>{user?.totalCourses} khóa học</Text>
          </View>
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <Text style={styles.sectionTitle}>Khóa học đã đăng ký</Text>

          {enrollments.length > 0 ? (
            <FlatList
              data={enrollments}
              renderItem={renderEnrollmentItem}
              keyExtractor={item => String(item.id)}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="book-outline" size={50} color="#ccc" />
                  <Text style={styles.emptyText}>Chưa đăng ký khóa học nào</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Chưa đăng ký khóa học nào</Text>
            </View>
          )}
        </View>
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
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },

  detailsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  coursesSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  courseImage: {
    width: 100,
    height: 100,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 8,
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
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  lessonCount: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  reviewAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
});

export default ViewDetailUserScreen;
