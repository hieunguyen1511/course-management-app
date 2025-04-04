import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Text,
} from "react-native";
import { MyScreenProps } from "@/types/MyScreenProps";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/api/axiosInstance";
//components
import CourseHeader from "@/components/user/CourseHeader";
import CourseContent from "@/components/user/CourseContent";
import CourseReviews from "@/components/user/CourseReviews";
import CourseActionButton from "@/components/user/CourseActionButton";

interface Course {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  image: string;
  total_rating: number;
  enrollment_count: number;
  category: {
    id: number;
    name: string;
  };
}

interface User {
  id: number;
  fullname: string;
  username: string;
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

// API Functions
const getDetailCourse = async (course_id: number): Promise<Course | null> => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_COURSE_BY_ID_WITH_COUNT_ENROLLMENT}`;
    url = url.replace(":id", course_id.toString());
    const response = await axiosInstance.get(url);
    if (response.status === 200 && response.data?.course) {
      return response.data.course;
    }
    return null;
  } catch (error) {
    console.error("Error fetching course details:", error);
    return null;
  }
};

const getEnrollment = async (course_id: number): Promise<Enrollment[]> => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_COURSE_ID}`;
    url = url.replace(":course_id", course_id.toString());
    const response = await axiosInstance.get(url);
    return response.status === 200 ? response.data.enrollments || [] : [];
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return [];
  }
};

const getSections = async (course_id: number): Promise<Section[]> => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_SECTION_BY_COURSE_ID_WITH_LESSON}`;
    url = url.replace(":course_id", course_id.toString());
    const response = await axiosInstance.get(url);
    return response.status === 200 ? response.data.sections || [] : [];
  } catch (error) {
    console.error("Error fetching sections:", error);
    return [];
  }
};

const getUserInformation = async (): Promise<any> => {
  try {
    const user = await SecureStore.getItemAsync("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

const getUserInformationById = async (user_id: number): Promise<any> => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_USER_BY_ID}`;
    url = url.replace(":id", user_id.toString());
    const response = await axiosInstance.get(url);
    return response.status === 200 ? response.data.user : null;
  } catch (error) {
    console.error("Error fetching user information:", error);
    return null;
  }
};

async function getTotalLessonFromSections(
  sections: Section[]
): Promise<number> {
  let totalLesson = 0;
  for (const section of sections) {
    if (section.lessons) {
      totalLesson += section.lessons.length;
    }
  }
  return totalLesson;
}

// Components
const UpdateProfileModal = ({
  visible,
  onClose,
  onUpdate,
}: {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) => (
  <Modal visible={visible} transparent={true} animationType="fade">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Cập nhật thông tin</Text>
        <Text style={styles.modalText}>
          Vui lòng cập nhật đầy đủ thông tin cá nhân (số điện thoại và ngày
          sinh) trước khi đăng ký khóa học.
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.updateButton]}
            onPress={onUpdate}
          >
            <Text style={styles.updateButtonText}>Cập nhật</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const DetailCourseScreen: React.FC<
  MyScreenProps["DetailCourseScreenProps"]
> = ({ navigation, route }) => {
  const { courseId } = route.params || 1;
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"content" | "reviews">("content");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<number>(0);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sectionsData, enrollmentsData, courseData] = await Promise.all([
        getSections(courseId),
        getEnrollment(courseId),
        getDetailCourse(courseId),
      ]);

      if (sectionsData) setSections(sectionsData);
      if (enrollmentsData) setEnrollments(enrollmentsData);
      if (courseData) setCourse(courseData);

      const userInfo = await getUserInformation();
      if (enrollmentsData && userInfo?.id) {
        setIsEnrolled(
          enrollmentsData.some(
            (enrollment) => enrollment.user_id === userInfo.id
          )
        );
        setEnrollmentId(
          enrollmentsData.find(
            (enrollment) => enrollment.user_id === userInfo.id
          )?.id || 0
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const checkUserInfo = async (): Promise<boolean> => {
    try {
      const userInfo = await getUserInformation();
      if (!userInfo?.id) {
        console.error("User not found");
        return false;
      }

      const userDetails = await getUserInformationById(userInfo.id);
      if (
        !userDetails ||
        userDetails.phone === "" ||
        userDetails.birth === null
      ) {
        setShowUpdateProfileModal(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking user info:", error);
      return false;
    }
  };

  const handleEnroll = async () => {
    try {
      if (course?.price === 0) {
        let url = `${process.env.EXPO_PUBLIC_API_CREATE_ENROLLMENT}`;
        const totalLesson = await getTotalLessonFromSections(sections);
        const price = course?.price - (course?.price * course?.discount) / 100;
        const response = await axiosInstance.post(url, {
          course_id: courseId,
          user_id: 1,
          total_lesson: totalLesson,
          complete_lesson: 0,
          price: price,
          rating: null,
          review: null,
        });
        if (response.status === 201) {
          setIsEnrolled(true);
          const enrollmentsData = await getEnrollment(courseId);
          if (enrollmentsData) setEnrollments(enrollmentsData);
          navigation.replace("UserDetailCourseScreen", {
            courseId: courseId,
            enrollmentId: response.data.enrollment.id,
            message_from_detail_course_screen:
              "Đăng ký khóa học thành công, chào mừng bạn!",
          });
        } else {
          console.error("Error enrolling in course:", response.data);
          return;
        }
        //console.log("Enrollment response:", response.data);

        // console.log("Total lesson:", totalLesson);
        // console.log("Price:", price);
      } else {
        console.log("Chua xu ly thanh toan cho khoa hoc khong mien phi");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  const handleLessonPress = (lesson: any) => {
    if (!isEnrolled) return;
    navigation.navigate("UserDetailCourseScreen", {
      enrollmentId: enrollmentId,
      courseId: courseId,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
      <CourseHeader course={course} onBackPress={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "content" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("content")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "content" && styles.activeTabText,
              ]}
            >
              Nội dung khóa học
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "reviews" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reviews" && styles.activeTabText,
              ]}
            >
              Đánh giá
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "content" ? (
            <CourseContent
              sections={sections}
              isEnrolled={isEnrolled}
              onLessonPress={handleLessonPress}
            />
          ) : (
            <CourseReviews enrollments={enrollments} />
          )}
        </View>
      </ScrollView>

      <CourseActionButton
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
        onContinue={() => handleLessonPress(courseId)}
      />

      <UpdateProfileModal
        visible={showUpdateProfileModal}
        onClose={() => setShowUpdateProfileModal(false)}
        onUpdate={() => {
          setShowUpdateProfileModal(false);
          navigation.navigate("EditProfileScreen", {
            message:
              "Vui lòng cập nhật đầy đủ thông tin cá nhân (số điện thoại và ngày sinh) trước khi đăng ký khóa học.",
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    textAlign: "center",
    color: "#4b5563",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  tabContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  updateButton: {
    backgroundColor: "#3b82f6",
  },
  cancelButtonText: {
    color: "#4b5563",
    textAlign: "center",
    fontWeight: "bold",
  },
  updateButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default DetailCourseScreen;
