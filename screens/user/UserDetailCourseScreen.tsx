import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { MyScreenProps } from '@/types/MyScreenProps'
import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import UserViewLesson from './UserViewLessonScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  replies: Comment[];
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
  totalLessons: number;
  completedLessons: number;
}

interface CourseDetail {
  id: number;
  title: string;
  category: string;
  image: string;
  rating: number;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  chapters: Chapter[];
  comments: Comment[];
}

const UserDetailCourseScreen: React.FC<MyScreenProps["UserDetailCourseScreenProps"]> = ({ navigation, route }) => {
  const { courseId } = route.params || 1;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    // Simulate API call to fetch course details
    setTimeout(() => {
      const mockCourse: CourseDetail = {
        id: courseId,
        title: 'Lập trình React Native cơ bản',
        category: 'Lập trình',
        image: 'https://via.placeholder.com/100',
        rating: 4.7,
        progress: 65,
        totalLessons: 12,
        completedLessons: 8,
        chapters: [
          {
            id: 1,
            title: 'Chương 1: Giới thiệu về React Native',
            totalLessons: 3,
            completedLessons: 3,
            lessons: [
              {
                id: 1,
                title: '1.1 Giới thiệu về React Native',
                duration: '15:00',
                isCompleted: true,
                isLocked: false
              },
              {
                id: 2,
                title: '1.2 Cài đặt môi trường phát triển',
                duration: '20:00',
                isCompleted: true,
                isLocked: false
              },
              {
                id: 3,
                title: '1.3 Tạo ứng dụng đầu tiên',
                duration: '25:00',
                isCompleted: true,
                isLocked: false
              }
            ]
          },
          {
            id: 2,
            title: 'Chương 2: Các thành phần cơ bản',
            totalLessons: 4,
            completedLessons: 2,
            lessons: [
              {
                id: 4,
                title: '2.1 View và Text',
                duration: '18:00',
                isCompleted: true,
                isLocked: false
              },
              {
                id: 5,
                title: '2.2 Image và Button',
                duration: '20:00',
                isCompleted: true,
                isLocked: false
              },
              {
                id: 6,
                title: '2.3 TextInput và Form',
                duration: '25:00',
                isCompleted: false,
                isLocked: false
              },
              {
                id: 7,
                title: '2.4 ScrollView và FlatList',
                duration: '30:00',
                isCompleted: false,
                isLocked: true
              }
            ]
          },
          {
            id: 3,
            title: 'Chương 3: Navigation và State Management',
            totalLessons: 5,
            completedLessons: 0,
            lessons: [
              {
                id: 8,
                title: '3.1 React Navigation cơ bản',
                duration: '25:00',
                isCompleted: false,
                isLocked: true
              },
              {
                id: 9,
                title: '3.2 Stack Navigation',
                duration: '30:00',
                isCompleted: false,
                isLocked: true
              },
              {
                id: 10,
                title: '3.3 Tab Navigation',
                duration: '25:00',
                isCompleted: false,
                isLocked: true
              },
              {
                id: 11,
                title: '3.4 State Management với Context',
                duration: '35:00',
                isCompleted: false,
                isLocked: true
              },
              {
                id: 12,
                title: '3.5 Redux trong React Native',
                duration: '40:00',
                isCompleted: false,
                isLocked: true
              }
            ]
          }
        ],
        comments: [
          {
            id: 1,
            userId: 1,
            userName: 'Nguyễn Văn A',
            userAvatar: 'https://via.placeholder.com/40',
            content: 'Khóa học rất hay và dễ hiểu!',
            timestamp: '2 giờ trước',
            replies: [
              {
                id: 2,
                userId: 2,
                userName: 'Trần Thị B',
                userAvatar: 'https://via.placeholder.com/40',
                content: 'Đồng ý với bạn!',
                timestamp: '1 giờ trước',
                replies: []
              }
            ]
          },
          {
            id: 3,
            userId: 3,
            userName: 'Lê Văn C',
            userAvatar: 'https://via.placeholder.com/40',
            content: 'Có ai đang học chương 2 không?',
            timestamp: '3 giờ trước',
            replies: []
          }
        ]
      };
      setCourse(mockCourse);
      setLoading(false);
    }, 1000);
  }, [courseId]);

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.isLocked) {
      // Show message that lesson is locked
      return;
    }
    // Navigate to lesson content
    navigation.navigate('UserViewLessonScreen', { 
      lessonId: lesson.id,
      courseId: courseId,
    });
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now(),
      userId: 4, // Current user ID
      userName: 'Bạn',
      userAvatar: 'https://via.placeholder.com/40',
      content: newComment,
      timestamp: 'Vừa nãy',
      replies: []
    };

    if (replyingTo) {
      // Add reply to existing comment
      setCourse(prev => {
        if (!prev) return prev;
        const updatedComments = prev.comments.map(comment => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [...comment.replies, newCommentObj]
            };
          }
          return comment;
        });
        return { ...prev, comments: updatedComments };
      });
    } else {
      // Add new comment
      setCourse(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [newCommentObj, ...prev.comments]
        };
      });
    }

    setNewComment('');
    setReplyingTo(null);
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <View key={comment.id} style={[styles.commentContainer, isReply && styles.replyContainer]}>
      <View style={styles.commentHeader}>
        <View style={styles.commentInfo}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.timestamp}>{comment.timestamp}</Text>
        </View>
      </View>
      <Text style={styles.commentContent}>{comment.content}</Text>
      <TouchableOpacity 
        style={styles.replyButton}
        onPress={() => setReplyingTo(comment.id)}
      >
        <Text style={styles.replyButtonText}>Trả lời</Text>
      </TouchableOpacity>
      {comment.replies.map(reply => renderComment(reply, true))}
    </View>
  );

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
          <Text style={styles.headerTitle}>{course.title}</Text>
          <Text style={styles.headerSubtitle}>{course.category}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${course.progress}%` }]} />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{course.progress}% Hoàn thành</Text>
          <Text style={styles.lessonCount}>{course.completedLessons}/{course.totalLessons} bài học</Text>
        </View>
      </View>

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
          {course.chapters.map((chapter) => (
            <View key={chapter.id} style={styles.chapterContainer}>
              <View style={styles.chapterHeader}>
                <View style={styles.chapterTitleContainer}>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                  <Text style={styles.chapterProgress}>
                    {chapter.completedLessons}/{chapter.totalLessons} bài học
                  </Text>
                </View>
                <View style={styles.chapterProgressBarContainer}>
                  <View 
                    style={[
                      styles.chapterProgressBar, 
                      { width: `${(chapter.completedLessons / chapter.totalLessons) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {chapter.lessons.map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    lesson.isLocked && styles.lockedLesson
                  ]}
                  onPress={() => handleLessonPress(lesson)}
                  disabled={lesson.isLocked}
                >
                  <View style={styles.lessonContent}>
                    <View style={styles.lessonIconContainer}>
                      {lesson.isCompleted ? (
                        <Ionicons name="checkmark-circle" size={24} color="#2c9e69" />
                      ) : lesson.isLocked ? (
                        <Ionicons name="lock-closed" size={24} color="#999" />
                      ) : (
                        <Ionicons name="play-circle" size={24} color="#4a6ee0" />
                      )}
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[
                        styles.lessonTitle,
                        lesson.isLocked && styles.lockedText
                      ]}>
                        {lesson.title}
                      </Text>
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                  </View>
                  {!lesson.isLocked && (
                    <Ionicons 
                      name={lesson.isCompleted ? "checkmark-circle" : "chevron-forward"} 
                      size={20} 
                      color={lesson.isCompleted ? "#2c9e69" : "#666"} 
                    />
                  )}
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
            {course.comments.map(comment => renderComment(comment))}
          </ScrollView>
        </View>
      )}
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
  chapterProgressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  chapterProgressBar: {
    height: '100%',
    backgroundColor: '#4a6ee0',
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
  lessonDuration: {
    fontSize: 12,
    color: '#666',
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
});

// function UserDetailCourseLayout() {
//   return (
//     <NavigationIndependentTree>
//       <Stack.Navigator initialRouteName="UserDetailCourse" screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="UserDetailCourse" component={UserDetailCourse} />
//         <Stack.Screen name="UserViewLesson" component={UserViewLesson} />
//       </Stack.Navigator>
//     </NavigationIndependentTree>
//   )
// }

export default UserDetailCourseScreen;