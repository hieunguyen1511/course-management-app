import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Enrollment, Lesson, Section } from '@/types/apiModels';
import axiosInstance from '@/api/axiosInstance';
import { useFocusEffect } from '@react-navigation/native';
import { ToastType } from '@/components/NotificationToast';
import NotificationToast from '@/components/NotificationToast';
import { formatDateOrRelative, formatDateTimeRelative } from '@/utils/datetime';
import { UserComment } from '@/types/MyInterfaces';

const UserDetailCourseScreen: React.FC<MyScreenProps['UserDetailCourseScreenProps']> = ({
  navigation,
  route,
}) => {
  const { enrollmentId, courseId } = route.params || { courseId: 1, enrollmentId: 1 };
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<string>('');

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  const flatListRef = useRef<FlatList<UserComment>>(null); // Create a ref for the FlatList

  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const fetchEnrollmentByID = async (eID: number) => {
    try {
      const response = await axiosInstance.get(
        process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_ID_LIMIT_INFO?.replace(
          ':id',
          eID.toString()
        ) || ''
      );
      return response?.data?.enrollment;
    } catch (error) {
      console.error('Error fetching enrollment by ID:', error);
      throw error;
    }
  };

  const fetchCommentsByCourseID = async (cID: number) => {
    try {
      const response = await axiosInstance.get(
        process.env.EXPO_PUBLIC_API_GET_ALL_COMMENT_BY_COURSE_ID?.replace(
          ':course_id',
          cID.toString()
        ) || ''
      );
      const comments = response.data.comments.map((item: any) => ({
        ...item,
        role: item.user.role || 0,
        fullname: item.user.fullname || '',
        avatar: item.user.avatar || 'https://via.placeholder.com/150',
      }));
      const parentComments = comments.filter((item: UserComment) => item.parent_id === null);
      parentComments.forEach((comment: UserComment) => {
        comment.replies = comments.filter((item: UserComment) => item.parent_id === comment.id);
      });

      return parentComments;
    } catch (error) {
      console.error('Error fetching comments by course ID:', error);
      throw error;
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    const [enrollment, comments] = await Promise.all([
      await fetchEnrollmentByID(enrollmentId),
      await fetchCommentsByCourseID(courseId),
    ]);
    setEnrollment(enrollment);
    setComments(comments);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [enrollmentId, courseId])
  );

  const handleLessonPress = (lesson: Lesson) => {
    // Navigate to lesson content
    navigation.navigate('UserViewLessonScreen', {
      lessonId: lesson.id,
      enrollmentId: enrollmentId,
    });
  };

  const submitComment = async (content: string, parentId: number | null) => {
    try {
      const url = `${process.env.EXPO_PUBLIC_API_POST_COMMENT}`;
      const response = await axiosInstance.post(url, {
        course_id: courseId,
        content: content,
        parent_id: parentId,
      });

      if (response.status === 201 && response.data?.comment) {
        setNewComment('');
        setLoading(false);
        const newComments = await fetchCommentsByCourseID(courseId);
        setComments(newComments);
        showToast('Bình luận đã được gửi', ToastType.SUCCESS);
      } else {
        showToast('Không thể gửi bình luận', ToastType.ERROR);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      showToast('Có lỗi xảy ra khi gửi bình luận', ToastType.ERROR);
    }
  };

  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim()) {
      showToast('Vui lòng nhập nội dung bình luận', ToastType.INFO);
      return;
    }

    submitComment(newComment, null);
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [courseId, newComment, replyingTo, showToast]);

  const getAvatarOrDefault = (avatar: string | null | undefined) => {
    return avatar || 'https://via.placeholder.com/150';
  };

  const handleChangeReply = (commentId: number) => {
    setReplyingTo(commentId);
    //console.log(commentId);

    const fullname = comments.find(comment => comment.id === commentId)?.fullname;
    if (fullname) {
      setReplyingToComment(`@${fullname} `);
    } else {
      const reply = comments.find(comment => comment.replies.find(reply => reply.id === commentId));
      setReplyingToComment(`@${reply?.replies.find(reply => reply.id === commentId)?.fullname} `);
      console.log(reply);
    }
  };

  const handleReplySubmit = (replyingToCommentId: number) => {
    if (!replyingToComment.trim()) {
      showToast('Vui lòng nhập nội dung bình luận', ToastType.INFO);
      return;
    }

    submitComment(replyingToComment, replyingToCommentId);

    setReplyingToComment('');
  };

  const renderComment = useCallback(
    ({ item: comment }: { item: UserComment }) => (
      <View key={comment.id} style={[styles.commentContainer]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentInfo}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: getAvatarOrDefault(comment.avatar) }} style={styles.avatar} />
              <View style={{ paddingLeft: 10 }}>
                <Text style={styles.userName}>{comment.fullname || 'Người dùng'}</Text>
                <Text style={styles.timestamp}>{formatDateOrRelative(comment.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <TouchableOpacity style={styles.replyButton} onPress={() => handleChangeReply(comment.id)}>
          <Text style={styles.replyButtonText}>Trả lời</Text>
        </TouchableOpacity>
        {comment.replies && comment.replies.length > 0 && (
          <FlatList
            data={comment.replies}
            keyExtractor={reply => reply.id.toString()}
            renderItem={({ item: reply }) => (
              <View style={[styles.commentContainer, styles.replyContainer]}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentInfo}>
                    <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: getAvatarOrDefault(reply.avatar) }}
                        style={styles.avatar}
                      />
                      <View style={{ paddingLeft: 10 }}>
                        <Text style={styles.userName}>{reply.fullname || 'Người dùng'}</Text>
                        <Text style={styles.timestamp}>
                          {formatDateOrRelative(reply.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.commentContent}>{reply.content}</Text>
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => handleChangeReply(reply.id)}
                >
                  <Text style={styles.replyButtonText}>Trả lời</Text>
                </TouchableOpacity>
                {replyingTo === reply.id && (
                  <View style={styles.replyInputContainer}>
                    <TextInput
                      style={styles.replyInput}
                      placeholder="Viết phản hồi..."
                      value={replyingToComment}
                      onChangeText={setReplyingToComment}
                    />
                    <TouchableOpacity onPress={() => handleReplySubmit(comment.id)}>
                      <Text style={styles.submitButtonText}>Gửi</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
        {replyingTo === comment.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Viết phản hồi..."
              value={replyingToComment}
              onChangeText={setReplyingToComment}
            />
            <TouchableOpacity onPress={() => handleReplySubmit(comment.id)}>
              <Text style={styles.submitButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [replyingTo, newComment, replyingToComment]
  );

  // Render function for each section
  const renderSection = ({ item: section }: { item: Section }) => (
    <View key={section.id} style={styles.chapterContainer}>
      <View style={styles.chapterHeader}>
        <View style={styles.chapterTitleContainer}>
          <Text style={styles.chapterTitle}>{section.name}</Text>
          <Text style={styles.chapterProgress}>
            {section.lessons.filter(l =>
              enrollment?.enrollment_lessons.find(el => el.completed_at && el.lesson_id === l.id)
            ).length ?? 0}
            /{section.lessons.length ?? 0} bài học
          </Text>
        </View>
        <View style={styles.chapterProgressBarContainer}>
          <View
            style={[
              ((section.lessons.filter(l =>
                enrollment?.enrollment_lessons.find(el => el.completed_at && el.lesson_id === l.id)
              ).length ?? 0) /
                (section.lessons.length > 1 ? section.lessons.length : 1)) *
                100 ===
              100
                ? styles.completedProgress
                : styles.chapterProgressBar,
              {
                width: `${
                  ((section.lessons.filter(l =>
                    enrollment?.enrollment_lessons.find(
                      el => el.completed_at && el.lesson_id === l.id
                    )
                  ).length ?? 0) /
                    (section.lessons.length > 1 ? section.lessons.length : 1)) *
                  100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      {section.lessons.map(lesson => {
        lesson.lesson_status = getLessonStatus(lesson.id);
        return (
          <TouchableOpacity
            key={lesson.id}
            style={[styles.lessonItem, lesson.lesson_status === 'locked' && styles.lockedLesson]}
            onPress={() => handleLessonPress(lesson)}
            disabled={lesson.lesson_status === 'locked'}
          >
            <View style={styles.lessonContent}>
              <View style={styles.lessonIconContainer}>
                {lesson.lesson_status === 'completed' ? (
                  <Ionicons name="checkmark-circle" size={24} color="#2c9e69" />
                ) : lesson.lesson_status === 'locked' ? (
                  <Ionicons name="lock-closed" size={24} color="#999" />
                ) : (
                  <Ionicons name="play-circle" size={24} color="#4a6ee0" />
                )}
              </View>
              <View style={styles.lessonInfo}>
                <Text
                  style={[
                    styles.lessonTitle,
                    lesson.lesson_status === 'locked' && styles.lockedText,
                  ]}
                >
                  {lesson.title}
                </Text>
              </View>
            </View>
            {lesson.lesson_status !== 'locked' && (
              <Ionicons
                name={lesson.lesson_status === 'completed' ? 'checkmark-circle' : 'chevron-forward'}
                size={20}
                color={lesson.lesson_status === 'completed' ? '#2c9e69' : '#666'}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Đang tải nội dung khóa học...</Text>
      </View>
    );
  }

  if (!enrollment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải nội dung khóa học</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  let isPreviousCompleted = true;
  const isLessonCompleted = (lessonID: number) => {
    return enrollment.enrollment_lessons.some(l => l.lesson_id === lessonID && l.completed_at);
  };

  const getLessonStatus = (lessonID: number): string => {
    if (isLessonCompleted(lessonID)) {
      isPreviousCompleted = true;
      return 'completed';
    } else {
      if (isPreviousCompleted) {
        isPreviousCompleted = false;
        return 'unlocked';
      } else {
        isPreviousCompleted = false;
        return 'locked';
      }
    }
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{enrollment.course.name}</Text>
            <Text style={styles.headerSubtitle}>{enrollment.course.category.name}</Text>
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
          <FlatList
            style={styles.contentContainer}
            data={enrollment.course.sections}
            keyExtractor={section => section.id.toString()}
            renderItem={renderSection}
          />
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
              <TouchableOpacity style={styles.submitButton} onPress={handleCommentSubmit}>
                <Text style={styles.submitButtonText}>Gửi</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              ref={flatListRef}
              style={styles.commentsList}
              data={comments}
              keyExtractor={comment => comment.id.toString()}
              renderItem={renderComment}
            />
          </View>
        )}
      </View>
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={2000}
        onDismiss={() => setToastVisible(false)}
      />
    </>
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
  completedProgress: {
    backgroundColor: '#28a745',
    height: '100%',
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
    borderRadius: 8,
    backgroundColor: 'rgb(223, 249, 255)',
    marginTop: 8,
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentInfo: {
    flex: 1,
    paddingLeft: 0,
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
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#4a6ee0',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  avatarContainer: {
    marginRight: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
});

export default UserDetailCourseScreen;
