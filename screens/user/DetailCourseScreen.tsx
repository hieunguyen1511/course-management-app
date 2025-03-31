import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MyScreenProps } from "@/types/MyScreenProps";
import { RootStackParamList } from "@/types/RootStackParamList";
import { NavigationIndependentTree } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UserViewLesson from "@/screens/user/UserViewLessonScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted?: boolean;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

// Mock data for testing
const mockCourse = {
  id: 1,
  title: "Khóa học Lập trình React Native từ A đến Z",
  category: "Lập trình",
  description:
    "Học lập trình React Native thông qua việc xây dựng các ứng dụng thực tế. Khóa học toàn diện này bao gồm mọi thứ từ cơ bản đến nâng cao, bao gồm Redux, Navigation và tích hợp API.",
  price: 1999000,
  discount: 200000,
  rating: 4.8,
  totalStudents: 1234,
  totalReviews: 456,
  image: "course-image.jpg",
  sections: [
    {
      id: 1,
      title: "Bắt đầu",
      lessons: [
        {
          id: 1,
          title: "Giới thiệu về React Native",
          duration: "10:30",
          isCompleted: true,
        },
        { id: 2, title: "Thiết lập môi trường phát triển", duration: "15:45" },
        { id: 3, title: "Ứng dụng đầu tiên của bạn", duration: "20:15" },
      ],
    },
    {
      id: 2,
      title: "Khái niệm cốt lõi",
      lessons: [
        { id: 4, title: "Components và Props", duration: "25:00" },
        { id: 5, title: "Quản lý State", duration: "30:20" },
        { id: 6, title: "Cơ bản về Navigation", duration: "22:15" },
      ],
    },
  ],
};

const mockReviews: Review[] = [
  {
    id: 1,
    userName: "Nguyễn Thị An",
    rating: 5,
    comment: "Khóa học rất tuyệt vời! Giải thích rõ ràng và có nhiều ví dụ thực tế.",
    date: "2024-03-15",
  },
  {
    id: 2,
    userName: "Trần Văn Bình",
    rating: 4,
    comment: "Nội dung tốt nhưng một số phần có thể chi tiết hơn.",
    date: "2024-03-10",
  },
];

const DetailCourseScreen: React.FC<MyScreenProps["DetailCourseScreenProps"]> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<"content" | "reviews">("content");
  const screenWidth = Dimensions.get("window").width;

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? "★" : "☆"}
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderSection = ({ item }: { item: Section }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{item.title}</Text>
      {item.lessons.map((lesson) => (
        <View
          key={lesson.id}
          style={styles.lessonContainer}
        >
          <View style={styles.lessonContent}>
            {lesson.isCompleted ? (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            ) : (
              <Ionicons name="play-circle-outline" size={20} color="#666" />
            )}
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
          </View>
          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
        </View>
      ))}
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.userName.charAt(0)}
          </Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewerName}>{item.userName}</Text>
          {renderRatingStars(item.rating)}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </View>
  );

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../../assets/images/course.jpg")}
          style={[styles.headerImage, { width: screenWidth, height: 200 }]}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>
            {mockCourse.title}
          </Text>
          <Text style={styles.categoryText}>{mockCourse.category}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingInfo}>
              {renderRatingStars(mockCourse.rating)}
              <Text style={styles.reviewCount}>
                ({mockCourse.totalReviews} đánh giá)
              </Text>
            </View>
            <Text style={styles.studentCount}>
              {mockCourse.totalStudents} học viên
            </Text>
          </View>

          <Text style={styles.description}>{mockCourse.description}</Text>
        </View>

        {/* Tabs */}
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

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "content" ? (
            <FlatList
              data={mockCourse.sections}
              renderItem={renderSection}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <FlatList
              data={mockReviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          {mockCourse.discount > 0 ? (
            <View style={styles.discountPriceContainer}>
              <Text style={styles.discountPrice}>
                {formatPrice(mockCourse.price - mockCourse.discount)}
              </Text>
              <Text style={styles.originalPrice}>
                {formatPrice(mockCourse.price)}
              </Text>
            </View>
          ) : (
            <Text style={styles.price}>
              {formatPrice(mockCourse.price)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log("Đăng ký/Mua khóa học");
          }}
        >
          <Text style={styles.actionButtonText}>
            {mockCourse.price === 0 ? "Đăng ký ngay" : "Mua ngay"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerContainer: {
    backgroundColor: 'white',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  courseInfo: {
    padding: 16,
    backgroundColor: 'white',
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  categoryText: {
    color: '#dc2626',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#fbbf24',
    fontSize: 18,
    marginRight: 2,
  },
  ratingText: {
    color: '#4b5563',
    fontSize: 14,
    marginLeft: 8,
  },
  reviewCount: {
    color: '#4b5563',
    marginLeft: 8,
  },
  studentCount: {
    color: '#4b5563',
  },
  description: {
    color: '#4b5563',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    textAlign: 'center',
    color: '#4b5563',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonTitle: {
    marginLeft: 12,
    color: '#4b5563',
    flex: 1,
  },
  lessonDuration: {
    color: '#6b7280',
    fontSize: 14,
  },
  reviewContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#4b5563',
    fontWeight: 'bold',
  },
  reviewInfo: {
    marginLeft: 12,
  },
  reviewerName: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  reviewComment: {
    color: '#4b5563',
    marginTop: 8,
  },
  reviewDate: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  originalPrice: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

// function DetailCourseLayout() {
//   return (
//     <NavigationIndependentTree>
//       <Stack.Navigator initialRouteName='DetailCourse' screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="DetailCourse" component={DetailCourse} />
//         <Stack.Screen name="UserViewLesson" component={UserViewLesson} />
//       </Stack.Navigator>
//     </NavigationIndependentTree>
//   )
// }
export default DetailCourseScreen;
