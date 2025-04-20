import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Category, Enrollment, Section, Comment, User } from '@/types/apiModels';
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';
import * as SecureStore from 'expo-secure-store';
import DeleteModal from '@/components/deleteModal';
import { formatDate } from '@/components/formatDate';

const AdminViewCourseScreen = ({ navigation, route }: MyScreenProps['ViewCourseScreenProps']) => {
  const courseId = route.params.courseId;
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [total_rating, setTotalRating] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [enrollment_count, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sections, setSections] = useState<Section[]>([]);

  const [activeTab, setActiveTab] = useState<'content' | 'students' | 'reviews' | 'comments'>(
    'content'
  );
  const [newComment, setNewComment] = useState('');

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // const [countLessons, setCountLessons] = useState(0);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number } | undefined>(undefined);

  const [refreshing, setRefreshing] = useState(false);

  const fetchCourseById = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_COURSE_BY_ID_WITH_COUNT_ENROLLMENT}`.replace(
          ':id',
          String(courseId)
        )
      );
      if (response.status === 200) {
        const course = response.data.course;
        setName(course.name);
        setCategory(course.category);
        setDescription(course.description);
        setPrice(course.price);
        setDiscount(course.discount);
        setStatus(course.status);
        setTotalRating(course.total_rating);
        setImage(course.image);
        setEnrollmentCount(course.enrollment_count);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      Alert.alert('Lỗi', Strings.courses.loadError, [{ text: 'OK' }]);
    }
  }, [courseId]);

  const fetchSectionsByCourseId = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_SECTION_BY_COURSE_ID_WITH_LESSONS}`.replace(
          ':id',
          String(courseId)
        )
      );
      if (response.status === 200) {
        response.data.sections.sort((a: Section, b: Section) => a.id - b.id);
        response.data.sections.forEach((section: Section) => {
          section.lessons.sort((a, b) => a.id - b.id);
        });
        setSections(response.data.sections);
        // setCountLessons(
        //   response.data.sections.reduce((count: number, section: Section) => {
        //     return count + section.lessons.length;
        //   }, 0)
        // );
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Lỗi', `Error fetching sections: ${error}`, [{ text: 'OK' }]);
    }
  }, [courseId]);

  const fetchEnrollmentsByCourseId = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_COURSE_ID_WITH_USER_ENROLLMENT_LESSONS}`.replace(
          ':course_id',
          String(courseId)
        )
      );
      if (response.status === 200) {
        setEnrollments(response.data.enrollments);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      Alert.alert('Lỗi', `Error fetching sections: ${error}`, [{ text: 'OK' }]);
    }
  }, [courseId]);

  const fetchCommentsByCourseId = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_COMMENT_BY_COURSE_ID_WITH_USER}`.replace(
          ':course_id',
          String(courseId)
        )
      );
      if (response.status === 200) {
        setComments(response.data.comments);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Lỗi', `Error fetching comments: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseById();
    fetchSectionsByCourseId();
    fetchEnrollmentsByCourseId();
    fetchCommentsByCourseId();
  }, [
    fetchCommentsByCourseId,
    fetchCourseById,
    fetchEnrollmentsByCourseId,
    fetchSectionsByCourseId,
  ]); // Chỉ gọi một lần khi component mount

  const getUserInformation = async (): Promise<User | null> => {
    try {
      const user = await SecureStore.getItemAsync('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'content') {
      fetchSectionsByCourseId();
    } else if (activeTab === 'students' || activeTab === 'reviews') {
      fetchEnrollmentsByCourseId();
    } else {
      fetchCommentsByCourseId();
    }
    setRefreshing(false);
  };

  // Hàm xử lý xóa bình luận
  const handleDeleteComment = (commentId: number) => {
    setItemToDelete({ id: commentId });
    setDeleteModalVisible(true);
  };
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_COMMENT}`.replace(':id', String(itemToDelete.id))
      );
      if (response.status === 200) {
        setComments(comments.filter(comment => comment.id !== itemToDelete.id));
      }
    } catch (error: any) {
      console.error('Error deleting comment:', error);
    }
    setDeleteModalVisible(false);
    setItemToDelete(undefined);
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(undefined);
  };

  const postComment = async () => {
    if (!newComment || newComment.length === 0) return;
    try {
      const user = await getUserInformation();
      if (user) {
        const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_COMMENT}`, {
          user_id: user?.id,
          course_id: courseId,
          content: newComment,
        });
        if (response.status === 201) {
          const res = await axiosInstance.get(
            `${process.env.EXPO_PUBLIC_API_GET_COMMENT_BY_ID_WITH_USER}`.replace(
              ':id',
              String(response.data.comment.id)
            )
          );
          if (res.status === 200) {
            setComments(comments => [res.data.comment, ...comments]);
            setNewComment('');
          } else {
            console.log(`Failed to get new comment. Status: ${res.status}`);
            Alert.alert('Lỗi', `Failed to get new comment. Status: ${res.status}`, [
              { text: 'OK' },
            ]);
          }
        } else {
          console.log(`Failed to post new comment. Status: ${response.status}`);
          Alert.alert('Lỗi', `Failed to post new comment. Status: ${response.status}`, [
            { text: 'OK' },
          ]);
        }
      } else {
        console.error('You are not logging');
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
    }
  };

  const renderContent = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4a6ee0']} />
      }
    >
      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có nội dung bài học</Text>
        </View>
      ) : (
        sections.map(section => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.name}</Text>
            {section.lessons.map(lesson => (
              <View key={lesson.id} style={styles.lesson}>
                <Ionicons name="play-circle-outline" size={24} color="#007AFF" />
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderReviews = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4a6ee0']} />
      }
    >
      {enrollment_count === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="happy-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
      ) : (
        enrollments.map(
          enroll =>
            enroll.rating && (
              <View key={enroll.id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  {/* Avatar */}
                  <View style={styles.reviewAvatar}>
                    {enroll.user.avatar ? (
                      <Image source={{ uri: enroll.user.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>
                        {enroll.user.fullname
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </Text>
                    )}
                  </View>

                  <View style={styles.ratingInfo}>
                    <Text style={styles.userName}>
                      {enroll.user.fullname} {`@${enroll.user.username}`}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.rating}>{enroll.rating}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.reviewComment}>{enroll.review}</Text>
                <Text style={styles.date}>{formatDate(enroll.updatedAt)}</Text>
              </View>
            )
        )
      )}
    </ScrollView>
  );

  const renderComments = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={comments}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.comment, item.user.role === 0 && styles.adminComment]}>
            <View style={styles.commentHeader}>
              {/* Avatar */}
              <View style={styles.commentAvatar}>
                {item.user.avatar ? (
                  <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {item.user.fullname
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </Text>
                )}
              </View>

              <View style={styles.commentDetails}>
                <Text style={styles.userName}>
                  {item.user.username} {`@${item.user.fullname}`}
                </Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                disabled={loading}
                onPress={() => handleDeleteComment(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
              </TouchableOpacity>
            </View>

            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        )}
      />
      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          value={newComment}
          readOnly={loading}
          onChangeText={setNewComment}
          placeholder="Nhập bình luận..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} disabled={loading} onPress={postComment}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEnrolledStudents = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsValue}>{enrollment_count}</Text>
          <Text style={styles.statsLabel}>Tổng số học viên</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsValue}>
            {Math.round(
              enrollments.reduce((acc, student) => {
                // Kiểm tra để đảm bảo enrollment_lessons là mảng hợp lệ và có độ dài hợp lý
                const lessonsLength = Array.isArray(student.enrollment_lessons)
                  ? student.enrollment_lessons.length
                  : 0;

                // Kiểm tra countLessons và đảm bảo không chia cho 0
                const validCountLessons = student.total_lesson > 0 ? student.total_lesson : 1; // Nếu countLessons = 0, sử dụng 1 để tránh chia cho 0.

                // Tính toán tổng, đảm bảo không có NaN
                return acc + (lessonsLength * 100) / validCountLessons;
              }, 0) / (enrollment_count > 0 ? enrollment_count : 1) // Đảm bảo không chia cho 0
            )}
            %
          </Text>
          <Text style={styles.statsLabel}>Tiến độ trung bình</Text>
        </View>
      </View>

      <FlatList
        data={enrollments}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có học viên nào</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>
                  {item.user.avatar ? (
                    <Image source={{ uri: item.user.avatar }} style={styles.courseImage} />
                  ) : (
                    item.user.fullname
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                  )}
                </Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>
                  {item.user.fullname} {`@${item.user.username}`}
                </Text>
                <Text style={styles.studentEmail}>{item.user.email}</Text>
              </View>
            </View>

            <View style={styles.studentProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round((item.enrollment_lessons.length / item.total_lesson, 0))}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(((item.enrollment_lessons.length * 100) / item.total_lesson, 0))}%
              </Text>
            </View>

            <View style={styles.studentMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.metaText}>Đăng ký: {formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.metaText}>Truy cập: {formatDate(item.last_access)}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          disabled={loading}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        {image ? (
          <Image source={{ uri: image }} style={styles.courseImage} />
        ) : (
          <Image style={styles.courseImage} />
        )}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{name}</Text>
          <Text style={styles.courseCategory}>{category?.name}</Text>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {description}
          </Text>
          <View style={styles.statusContainer}>
            <Ionicons
              name={status === 0 ? 'close-circle' : 'checkmark-circle'}
              size={16}
              color={status === 0 ? 'red' : 'green'}
            />
            <Text style={[styles.courseStatus, { color: status === 0 ? 'red' : 'green' }]}>
              {status === 0 ? 'Không hoạt động' : 'Hoạt động'}
            </Text>
          </View>
          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {discount !== 0
                  ? `${(price * (1 - discount / 100)).toLocaleString('vi-VN')}đ`
                  : price === 0
                    ? 'Miễn phí'
                    : `${price.toLocaleString()}đ`}
              </Text>
              <Text style={styles.statLabel}>Giá</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{enrollment_count}</Text>
              <Text style={styles.statLabel}>Học viên</Text>
            </View>
            {total_rating != null && total_rating !== 0 && (
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statValue}>{total_rating}</Text>
                </View>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
            Nội dung
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
            Học viên
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            Đánh giá
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
          onPress={() => setActiveTab('comments')}
        >
          <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>
            Bình luận
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'content' && renderContent()}
      {activeTab === 'students' && renderEnrolledStudents()}
      {activeTab === 'reviews' && renderReviews()}
      {activeTab === 'comments' && renderComments()}

      <DeleteModal
        visible={deleteModalVisible}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa comment này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  courseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  lessonTitle: {
    fontSize: 16,
    color: '#444',
    marginLeft: 12,
  },
  review: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  comment: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  adminComment: {
    backgroundColor: '#f8f9fa',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  commentInput: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  studentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#666',
  },
  studentProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    minWidth: 40,
  },
  studentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  ratingInfo: {
    flex: 1,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentDetails: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  courseStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonModal: {
    backgroundColor: '#FF3B30',
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
});

export default AdminViewCourseScreen;
