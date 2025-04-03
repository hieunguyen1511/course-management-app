import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { MyScreenProps } from '@/types/MyScreenProps'
import axiosInstance from '@/api/axiosInstance';
import * as SecureStore from 'expo-secure-store';

export interface Course {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  image: string;
  total_rating: number;
  count_enrollment: number;
  category: {
    id: number;
    name: string;
  };
}

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface Section {
  id: number;
  course_id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  section_id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

async function getEnrollment(course_id: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_COURSE_ID}`
    url = url.replace(':course_id', course_id.toString())
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      const data = response.data as Enrollment[];
      return data;
    }
  }
  catch (error) {
    console.error('Error fetching enrollment:', error);
    return [];
  }
}

async function getSections(course_id: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_SECTION_BY_COURSE_ID_WITH_LESSON}`
    url = url.replace(':course_id', course_id.toString())
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      const data = response.data as Section[];
      return data;
    }
  }
  catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

async function getUserInformation() {
  try {
    const user = await SecureStore.getItemAsync("user");
    if (user) {
      return JSON.parse(user);
    }
    return {};
  } catch (e) {
    console.log("Error getting user", e);
    return {};
  }
}

const UserDetailCourseScreen: React.FC<MyScreenProps["UserDetailCourseScreenProps"]> = ({ navigation, route }) => {
  const { courseId } = route.params || 1;
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sectionsData, enrollmentsData] = await Promise.all([
          getSections(courseId),
          getEnrollment(courseId)
        ]);

        if (sectionsData) {
          setSections(sectionsData);
        }
        if (enrollmentsData) {
          setEnrollments(enrollmentsData);
        }

        // Check if current user is enrolled
        const userInfo = await getUserInformation();
        if (enrollmentsData && userInfo?.id) {
          const isUserEnrolled = enrollmentsData.some(enrollment => enrollment.user_id === userInfo.id);
          setIsEnrolled(isUserEnrolled);
        }

        // Fetch course details
        const courseResponse = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_COURSE_BY_ID}`.replace(':id', courseId.toString()));
        if (courseResponse.status === 200) {
          setCourse(courseResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleLessonPress = (lesson: Lesson) => {
    if (!isEnrolled) {
      // Show message that user needs to enroll
      return;
    }
    // Navigate to lesson content
    navigation.navigate('UserViewLessonScreen', {
      lessonId: lesson.id,
      courseId: courseId,
    });
  };

  const handleEnroll = async () => {
    try {
      const userInfo = await getUserInformation();
      if (!userInfo?.id) {
        console.error('User not found');
        return;
      }
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_ENROLL_COURSE}`, {
        course_id: courseId,
        user_id: userInfo.id
      });

      if (response.status === 200) {
        setIsEnrolled(true);
        // Refresh enrollments
        const enrollmentsData = await getEnrollment(courseId);
        if (enrollmentsData) {
          setEnrollments(enrollmentsData);
        }
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    // TODO: Implement review submission
    setNewComment('');
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải nội dung khóa học...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{course.name}</Text>
          <Text style={styles.headerSubtitle}>{course.category.name}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      {isEnrolled && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '0%' }]} />
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>0% Hoàn thành</Text>
            <Text style={styles.lessonCount}>0/{sections.reduce((acc, section) => acc + section.lessons.length, 0)} bài học</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
            Nội dung
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
          onPress={() => setActiveTab('discussion')}
        >
          <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
            Thảo luận
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'content' ? (
        <ScrollView style={styles.contentContainer}>
          {sections.map((section) => (
            <View key={section.id} style={styles.chapterContainer}>
              <View style={styles.chapterHeader}>
                <View style={styles.chapterTitleContainer}>
                  <Text style={styles.chapterTitle}>{section.name}</Text>
                  <Text style={styles.chapterProgress}>
                    {section.lessons.length} bài học
                  </Text>
                </View>
              </View>

              {section.lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    !isEnrolled && styles.lockedLesson
                  ]}
                  onPress={() => handleLessonPress(lesson)}
                  disabled={!isEnrolled}
                >
                  <View style={styles.lessonContent}>
                    <View style={styles.lessonIconContainer}>
                      {!isEnrolled ? (
                        <Ionicons name="lock-closed" size={24} color="#999" />
                      ) : (
                        <Ionicons name="play-circle" size={24} color="#4a6ee0" />
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[
                        styles.lessonTitle,
                        !isEnrolled && styles.lockedText
                      ]}>
                        {lesson.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.discussionContainer}>
          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Viết bình luận..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleCommentSubmit}
            >
              <Text style={styles.submitButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView style={styles.commentsList}>
            {enrollments.map(enrollment => (
              <View key={enrollment.id} style={styles.commentContainer}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentInfo}>
                    <Text style={styles.userName}>{enrollment.user.name}</Text>
                    <Text style={styles.timestamp}>
                      {new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
                {enrollment.review && (
                  <Text style={styles.commentContent}>{enrollment.review}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Enroll/Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={isEnrolled ? () => handleLessonPress(sections[0]?.lessons[0]) : handleEnroll}
        >
          <Text style={styles.enrollButtonText}>
            {isEnrolled ? 'Tiếp tục học' : 'Đăng ký khóa học'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
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
    fontSize: 14,
    color: '#666',
  },
  lessonCount: {
    fontSize: 14,
    color: '#999',
  },
  contentContainer: {
    flex: 1,
  },
  chapterContainer: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  chapterHeader: {
    marginBottom: 12,
  },
  chapterTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chapterProgress: {
    fontSize: 14,
    color: '#666',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lockedLesson: {
    opacity: 0.7,
  },
  lessonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIconContainer: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  lockedText: {
    color: '#999',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
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
  discussionContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  submitButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: '#4a6ee0',
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  replyContainer: {
    marginLeft: 40,
    backgroundColor: '#f8f9fa',
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  replyButton: {
    marginTop: 4,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#4a6ee0',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  enrollButton: {
    backgroundColor: '#4a6ee0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserDetailCourseScreen;