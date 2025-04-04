import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MyScreenProps } from "@/types/MyScreenProps";

import { ToastType } from "@/components/NotificationToast";
import NotificationToast from "@/components/NotificationToast";
import axiosInstance from "@/api/axiosInstance";


interface Course{
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  total_rating: number | null;
  image: string | null;
  price: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  total_lesson: number;
  complete_lesson: number;
  price: number;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
  course: Course;
}

interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  avatar?: string | null;
}

interface Comment {
  id: number;
  user_id: number;
  course_id: number;
  content: string;
  parent_id: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  replies?: Comment[];
}

interface Lesson {
  id: number;
  section_id: number;
  title: string;
  duration?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
  createdAt: string;
  updatedAt: string;
  order?: number;
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





// api function
async function getSectionByCourseId_withLesson(course_id: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_SECTION_BY_COURSE_ID_WITH_LESSON}`;
    url = url.replace(":course_id", course_id.toString());
    const response = await axiosInstance.get(url);
    const mapdata = response.data.sections.map((item: Section) => {
      return {
        ...item,
        id: item.id,
        course_id: item.course_id,
        name: item.name,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        lessons: item.lessons,
      };
    });
    return mapdata;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getCommentByCourseWithUser(course_id: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_COMMENT_BY_COURSE_ID_WITH_USER}`;
    url = url.replace(":course_id", course_id.toString());
    const response = await axiosInstance.get(url);
    const mapdata = response.data.comments.map((item: Comment) => {
      return {
        ...item,
        id: item.id,
        user_id: item.user_id,
        course_id: item.course_id,
        content: item.content,
        parent_id: item.parent_id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user,
        replies: item.replies,
      };
    });
    return mapdata;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getEnrollmentByIdWithCourse(enrollment_id: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_ID_WITH_COURSE}`;
    url = url.replace(":id", enrollment_id.toString());
    const response = await axiosInstance.get(url);
    const data = {
      id: response.data.enrollment.id,
      course_id: response.data.enrollment.course_id,
      user_id: response.data.enrollment.user_id,
      total_lesson: response.data.enrollment.total_lesson,
      complete_lesson: response.data.enrollment.complete_lesson,
      price: response.data.enrollment.price,
      rating: response.data.enrollment.rating,
      review: response.data.enrollment.review,
      createdAt: response.data.enrollment.createdAt,
      updatedAt: response.data.enrollment.updatedAt,
      course: response.data.enrollment.course,
    };
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const UserDetailCourseScreen: React.FC<
  MyScreenProps["UserDetailCourseScreenProps"]
> = ({ navigation, route }) => {
  const { courseId, enrollmentId } = route.params || { courseId: 1, enrollmentId: 1 };
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "discussion">("content");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  }, []);

  const processLessons = useCallback((lessons: Lesson[], totalCompleted: number, currentIndex: number) => {
    // Sort lessons by order
    const sortedLessons = [...lessons].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    // Update lesson locked status based on total completed lessons
    return sortedLessons.map((lesson, index) => ({
      ...lesson,
      // Unlock lessons based on total completed lessons across all sections
      isLocked: (currentIndex + index) >= totalCompleted
    }));
  }, []);

  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      const [sectionsData, commentsData, enrollmentData] = await Promise.all([
        getSectionByCourseId_withLesson(courseId),
        getCommentByCourseWithUser(courseId),
        getEnrollmentByIdWithCourse(enrollmentId)
      ]);
      
      if (sectionsData && commentsData && enrollmentData) {
        setEnrollment(enrollmentData);
        
        // Process lessons for each section based on total completed lessons
        let currentIndex = -1;
        const processedSections = sectionsData.map((section: Section) => {
          const processedSection = {
            ...section,
            lessons: processLessons(section.lessons, enrollmentData.complete_lesson, currentIndex)
          };
          currentIndex += section.lessons.length;
          return processedSection;
        });
        
        setSections(processedSections);
        setComments(commentsData);
      } else {
        showToast("Không thể tải thông tin khóa học", ToastType.ERROR);
      }
    } catch (error) {
      console.error("Error fetching course detail:", error);
      showToast("Có lỗi xảy ra khi tải dữ liệu", ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  }, [courseId, enrollmentId, showToast, processLessons]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCourseDetail();
    setRefreshing(false);
  }, [fetchCourseDetail]);

  useEffect(() => {
    if (route.params?.message_from_detail_course_screen) {
      setTimeout(() => {
        showToast(
          route.params.message_from_detail_course_screen || "",
          ToastType.INFO
        );
      }, 300);
    }
    fetchCourseDetail();
  }, [
    fetchCourseDetail,
    route.params?.message_from_detail_course_screen,
    showToast,
  ]);

  const handleLessonPress = useCallback(
    (lesson: Lesson) => {
      if (lesson.isLocked) {
        showToast(
          "Bạn cần hoàn thành các bài học trước đó trước",
          ToastType.INFO
        );
        return;
      }
      navigation.navigate("UserViewLessonScreen", {
        lessonId: lesson.id,
        courseId: courseId,
      });
    },
    [courseId, navigation, showToast]
  );

  const handleCommentSubmit = useCallback(async () => {
    if (!newComment.trim()) {
      showToast("Vui lòng nhập nội dung bình luận", ToastType.INFO);
      return;
    }

    try {
      const url = `${process.env.EXPO_PUBLIC_API_POST_COMMENT}`;
      const response = await axiosInstance.post(url, {
        course_id: courseId,
        content: newComment,
        parent_id: replyingTo,
      });

      if (response.status === 201 && response.data?.comment) {
        const newCommentObj: Comment = {
          ...response.data.comment,
          user: response.data.comment.user || {
            id: 0,
            username: "Bạn",
            fullname: "Bạn",
            email: "",
            avatar: "https://via.placeholder.com/40",
          },
        };

        setComments((prev) => {
          if (replyingTo) {
            const updatedComments = prev.map((comment) => {
              if (comment.id === replyingTo) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newCommentObj],
                };
              }
              return comment;
            });
            return updatedComments;
          } else {
            return [newCommentObj, ...prev];
          }
        });

        setNewComment("");
        setReplyingTo(null);
        showToast("Bình luận đã được gửi", ToastType.SUCCESS);
      } else {
        showToast("Không thể gửi bình luận", ToastType.ERROR);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      showToast("Có lỗi xảy ra khi gửi bình luận", ToastType.ERROR);
    }
  }, [courseId, newComment, replyingTo, showToast]);

  const renderChapter = useCallback(
    ({ item }: { item: Section }) => {
      return (
        <View key={item.id} style={styles.chapterContainer}>
          <View style={styles.chapterHeader}>
            <View style={styles.chapterTitleContainer}>
              <Text style={styles.chapterTitle}>{item.name}</Text>
              <Text style={styles.chapterProgress}>
                {item.lessons.filter(lesson => !lesson.isLocked).length}/{item.lessons.length} bài học
              </Text>
            </View>
            <View style={styles.chapterProgressBarContainer}>
              <View
                style={[
                  styles.chapterProgressBar,
                  {
                    width: `${
                      (item.lessons.filter(lesson => !lesson.isLocked).length / item.lessons.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <FlatList
            data={item.lessons}
            keyExtractor={(lesson) => lesson.id.toString()}
            renderItem={({ item: lesson }) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonItem,
                  lesson.isLocked && styles.lockedLesson,
                ]}
                onPress={() => handleLessonPress(lesson)}
                disabled={lesson.isLocked}
              >
                <View style={styles.lessonContent}>
                  <View style={styles.lessonIconContainer}>
                    {!lesson.isLocked ? (
                      <Ionicons
                        name="play-circle"
                        size={24}
                        color="#4a6ee0"
                      />
                    ) : (
                      <Ionicons name="lock-closed" size={24} color="#999" />
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text
                      style={[
                        styles.lessonTitle,
                        lesson.isLocked && styles.lockedText,
                      ]}
                    >
                      {lesson.title}
                    </Text>
                    <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                  </View>
                </View>
                {!lesson.isLocked && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#666"
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      );
    },
    [handleLessonPress]
  );

  const renderComment = useCallback(
    ({ item: comment }: { item: Comment }) => (
      <View key={comment.id} style={[styles.commentContainer]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentInfo}>
            <Text style={styles.userName}>
              {comment.user?.fullname || "Người dùng"}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(comment.createdAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => setReplyingTo(comment.id)}
        >
          <Text style={styles.replyButtonText}>Trả lời</Text>
        </TouchableOpacity>
        {comment.replies && comment.replies.length > 0 && (
          <FlatList
            data={comment.replies}
            keyExtractor={(reply) => reply.id.toString()}
            renderItem={({ item: reply }) => (
              <View style={[styles.commentContainer, styles.replyContainer]}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentInfo}>
                    <Text style={styles.userName}>
                      {reply.user?.fullname || "Người dùng"}
                    </Text>
                    <Text style={styles.timestamp}>
                      {new Date(reply.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{reply.content}</Text>
              </View>
            )}
          />
        )}
      </View>
    ),
    []
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchCourseDetail}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{enrollment.course.name}</Text>
          <Text style={styles.headerSubtitle}>{enrollment.course.description}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${(enrollment.complete_lesson / enrollment.total_lesson) * 100}%` }]}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>{Math.round((enrollment.complete_lesson / enrollment.total_lesson) * 100)}% Hoàn thành</Text>
          <Text style={styles.lessonCount}>
            {enrollment.complete_lesson}/{enrollment.total_lesson} bài học
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "content" && styles.activeTab]}
          onPress={() => setActiveTab("content")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "content" && styles.activeTabText,
            ]}
          >
            Nội dung
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "discussion" && styles.activeTab]}
          onPress={() => setActiveTab("discussion")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "discussion" && styles.activeTabText,
            ]}
          >
            Thảo luận
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "content" ? (
        <FlatList
          style={styles.contentContainer}
          data={sections}
          keyExtractor={(section) => section.id.toString()}
          renderItem={renderChapter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4a6ee0"]}
              tintColor="#4a6ee0"
            />
          }
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
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCommentSubmit}
            >
              <Text style={styles.submitButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            style={styles.commentsList}
            data={comments}
            keyExtractor={(comment) => comment.id.toString()}
            renderItem={renderComment}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4a6ee0"]}
                tintColor="#4a6ee0"
              />
            }
          />
        </View>
      )}
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  progressContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4a6ee0",
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
  },
  lessonCount: {
    fontSize: 14,
    color: "#999",
  },
  contentContainer: {
    flex: 1,
  },
  chapterContainer: {
    backgroundColor: "white",
    marginBottom: 12,
    padding: 16,
  },
  chapterHeader: {
    marginBottom: 12,
  },
  chapterTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  chapterProgress: {
    fontSize: 14,
    color: "#666",
  },
  chapterProgressBarContainer: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
  },
  chapterProgressBar: {
    height: "100%",
    backgroundColor: "#4a6ee0",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  lockedLesson: {
    opacity: 0.7,
  },
  lessonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  lessonIconContainer: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  lockedText: {
    color: "#999",
  },
  lessonDuration: {
    fontSize: 12,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4a6ee0",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4a6ee0",
    fontWeight: "bold",
  },
  discussionContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  submitButton: {
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  submitButtonText: {
    color: "#4a6ee0",
    fontWeight: "bold",
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  replyContainer: {
    marginLeft: 40,
    backgroundColor: "#f8f9fa",
  },
  commentHeader: {
    marginBottom: 8,
  },
  commentInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  replyButton: {
    marginTop: 4,
  },
  replyButtonText: {
    fontSize: 12,
    color: "#4a6ee0",
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#4a6ee0",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default UserDetailCourseScreen;
