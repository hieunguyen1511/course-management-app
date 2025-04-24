import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl,
  TextInput,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Enrollment } from '@/types/apiModels';
import axiosInstance from '@/api/axiosInstance';
import { formatDate } from '@/components/FormatDate';
import { formatPrice } from '@/components/FormatPrice';

const UserViewAllEnrollmentScreen: React.FC<MyScreenProps['UserViewAllEnrollmentScreenProps']> = ({
  navigation,
  route,
}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID_WITH_CATEGORY_JWT}`;
      const response = await axiosInstance.get(url);
      if (response.status === 200) {
        setEnrollments(response.data.enrollments);
        setFilteredEnrollments(response.data.enrollments);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter users based on search query
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredEnrollments(enrollments);
    } else {
      const filtered = enrollments.filter(
        enrollment =>
          enrollment.course.name.toLowerCase().includes(searchText) ||
          enrollment.course.category.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredEnrollments(filtered);
    }
  }, [searchText, enrollments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải danh sách khóa học...</Text>
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
        <Text style={styles.headerTitle}>Khóa học của tôi</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khóa học của tôi..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {/* Enrollment List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredEnrollments.map(enrollment => (
          <TouchableOpacity
            key={enrollment.id}
            style={styles.enrollmentCard}
            onPress={() =>
              navigation.navigate('UserDetailCourseScreen', {
                courseId: enrollment.course_id,
                enrollmentId: enrollment.id,
              })
            }
          >
            <View style={styles.enrollmentContent}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName} numberOfLines={2}>
                  {enrollment.course.name}
                </Text>
                <Text style={styles.category}>{enrollment.course.category.name}</Text>
                <Text style={styles.price}>
                  Học phí:{' '}
                  {enrollment.price === 0 ? 'Miễn phí ' : formatPrice(enrollment.price)}{' '}
                </Text>
                <View style={styles.rating}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <FontAwesome
                      key={index}
                      name={index < enrollment.rating ? 'star' : 'star-o'}
                      size={16}
                      color="#f1c40f"
                    />
                  ))}
                </View>
                <Text style={styles.enrollmentDate}>
                  Ngày đăng ký: {formatDate(enrollment.createdAt)}
                </Text>
                <Text
                  style={styles.courseStudents}
                >{`${enrollment.enrollment_lessons.length} học viên`}</Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.round(
                          ((enrollment.enrollment_lessons
                            ? enrollment.enrollment_lessons.length
                            : 0) *
                            100) /
                            enrollment.total_lesson || 100
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {((enrollment.enrollment_lessons ? enrollment.enrollment_lessons.length : 0) *
                    100) /
                    enrollment.total_lesson || 100}
                  % hoàn thành
                </Text>

                <Text style={styles.lessonCount}>
                  {enrollment.enrollment_lessons ? enrollment.enrollment_lessons.length : 0}/
                  {enrollment.total_lesson} bài học
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteAllButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
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
  enrollmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enrollmentContent: {
    flex: 1,
  },
  courseInfo: {
    marginBottom: 12,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#FF6B00',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  enrollmentDate: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
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
    marginTop: 5,
    fontSize: 12,
    color: '#999',
  },
  courseStudents: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
});

export default UserViewAllEnrollmentScreen;
