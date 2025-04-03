import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  RefreshControl,
  ListRenderItem,
  Dimensions,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";

import { Ionicons } from "@expo/vector-icons";

import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/api/axiosInstance";
import { Strings } from "@/constants/Strings";
import { RootStackParamList } from "../../types/RootStackParamList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Types for our courses data
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
  category: {
    id: number;
    name: string;
  };
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
}
interface UserEnrollments {
  id: number;
  user_id: number;
  course_id: number;
  total_lesson: number;
  complete_lesson: number;
  progress: number;
  image: string;
  createdAt: string;
  updatedAt: string;
  course: {
    name: string;
    description: string;
    status: number;
    price: number;
    discount: number;
  };
}

interface CourseInProgress extends Course {
  progress: number; // percentage completed
  nextLesson: string;
  lastAccessed: string;
}

// Helper functions
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

// Function to fetch courses by reference category
async function getCoursesByReferenceCategory(categoryId: number | string) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_COURSES_BY_REFERENCES_CATEOGORY_ID}`;
    url = url.replace(":category_id", categoryId.toString());

    const response = await axiosInstance.get(url);

    if (response.status === 200) {
      const courses = response.data.course.slice(0, 10);
      return courses.sort(
        (a: Course, b: Course) => b.total_rating - a.total_rating
      );
    }
    return [];
  } catch (error) {
    console.error("Error fetching courses by reference category:", error);
    return [];
  }
}

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const Home: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { tmessage } = useLocalSearchParams();
  //console.log("searchParams:", tmessage);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("User");
  const [inProgressCourses, setInProgressCourses] = useState<UserEnrollments[]>(
    []
  );
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referenceCategoryId, setReferenceCategoryId] = useState<
    number | string
  >("NaN");

  // Fetch user enrollments
  const fetchUserEnrollments = useCallback(async (userId: number) => {
    try {
      if (!userId) return;

      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID}`.replace(
          ":user_id",
          userId.toString()
        )
      );

      if (response.data?.enrollments) {
        // get the first enrollment sort by updatedAt
        const sortedEnrollments = response.data.enrollments.sort(
          (a: UserEnrollments, b: UserEnrollments) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        const firstEnrollment = sortedEnrollments.slice(0, 1);
        setReferenceCategoryId(
          firstEnrollment[0].course.category_id || "NaN"
        );
        const mappedData = firstEnrollment.map((item: UserEnrollments) => ({
          id: item.id,
          user_id: item.user_id,
          course_id: item.course_id,
          course: {
            name: item.course?.name || "N/A",
            description: item.course?.description || "N/A",
          },
          total_lesson: item.total_lesson || 0,
          complete_lesson: item.complete_lesson || 0,
          progress:
            Math.round((item.complete_lesson / item.total_lesson) * 100) || 0,
          updatedAt: new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(item.updatedAt)),
        }));
        setInProgressCourses(mappedData);
      }
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
    }
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user info
      const userInfo = await getUserInformation();
      if (userInfo?.fullname) {
        setUserName(userInfo.fullname);
      }

      // Fetch enrollments if user ID exists
      if (userInfo?.id) {
        await fetchUserEnrollments(userInfo.id);
      }

      // Fetch suggested courses (category 1 - Programming)
      const suggestedCoursesData = await getCoursesByReferenceCategory(
        referenceCategoryId
      );
      if (suggestedCoursesData?.length > 0) {
        setSuggestedCourses(suggestedCoursesData);
      }

      // Fetch popular courses (all categories)
      const popularCoursesData = await getCoursesByReferenceCategory("NaN");
      if (popularCoursesData?.length > 0) {
        setPopularCourses(popularCoursesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserEnrollments]);

  // Load data on mount and when route params change
  useEffect(() => {
    if (route.params?.message) {
      setMessage(route.params.message);
    }
    fetchData();
  }, [fetchData, route.params?.message]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // UI Components
  const renderRatingStars = (rating: number) => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={styles.starIcon}>
          {rating >= star ? "★" : "☆"}
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Course card component
  const CourseCard = ({ course }: { course: Course }) => (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() =>
        navigation.navigate("DetailCourseScreen", {
          courseId: course.id,
          message: "",
        })
      }
    >
      <Image
        source={require("../../assets/images/course.jpg")}
        style={styles.courseImage}
      />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle} numberOfLines={2}>
          {course.name}
        </Text>
        <Text style={{ color: "#cf3f3f" }}>{course.category.name}</Text>
        <Text style={styles.instructorName} numberOfLines={1}>
          {course.description}
        </Text>

        <View style={styles.courseCardFooter}>
          {course.price > 0 ? (
            course.discount > 0 ? (
              <Text style={styles.priceText}>
                {course.price * (1 - course.discount / 100)}{" "}
                {Strings.course_section.currency_vnd}{" "}
                <Text
                  style={{ textDecorationLine: "line-through", color: "#999" }}
                >
                  {course.price.toFixed(0)}{" "}
                  {Strings.course_section.currency_vnd}
                </Text>
              </Text>
            ) : (
              <Text style={styles.priceText}>
                {course.price.toFixed(0)} {Strings.course_section.currency_vnd}
              </Text>
            )
          ) : (
            <Text style={styles.priceText}>
              {Strings.course_section.free_courses}
            </Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          {renderRatingStars(course.total_rating || 0)}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Header Component
  const HeaderComponent = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.welcomeText}>{Strings.user_home.welcome_back}</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("Account", { message: "" })}
      >
        <Ionicons name="person-circle-outline" size={40} color="#4a6ee0" />
      </TouchableOpacity>
    </View>
  );

  // In Progress Courses Section
  const InProgressSection = () => (
    <View style={styles.section}>
      {inProgressCourses.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {Strings.user_home.continue_learning}
          </Text>
        </View>
      )}
      <FlatList
        data={inProgressCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={() =>
              navigation.navigate("UserDetailCourseScreen", {
                courseId: item.course_id,
                message: "",
              })
            }
          >
            <Image
              source={require("../../assets/images/course.jpg")}
              style={styles.continueImage}
            />
            <View style={styles.continueContent}>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {item.course.name}
              </Text>
              <Text style={styles.continueLesson} numberOfLines={1}>
                {item.course.description}
              </Text>
              <View style={styles.progressContainer}>
                <ProgressBar progress={item.progress} />
                <Text style={styles.progressText}>
                  {item.progress}% {Strings.user_home.complete}
                </Text>
              </View>
              <Text style={styles.lastAccessed}>
                {Strings.user_home.last_accessed}: {item.updatedAt}
              </Text>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play-circle" size={36} color="#4a6ee0" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noCourses}>
            {Strings.user_home.no_enrolled_courses}
          </Text>
        )}
      />
    </View>
  );

  // Suggested Courses Section
  const SuggestedCoursesSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {Strings.user_home.suggest_courses}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserViewAllCourseScreen", {
              message: "Hello from Home Suggest Course",
              is_suggested: true,
              category_id: parseInt(referenceCategoryId.toString()),
            })
          }
        >
          <Text style={styles.viewAllText}>{Strings.user_home.view_all}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={suggestedCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CourseCard course={item} />}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  // Popular Courses Section
  const PopularCoursesSection = () => (
    <View style={[styles.section, styles.lastSection]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {Strings.user_home.popular_courses}
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserViewAllCourseScreen", {
              message: "Hello from Home Popular Course",
              is_popular: true,
            })
          }
        >
          <Text style={styles.viewAllText}>{Strings.user_home.view_all}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={popularCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CourseCard course={item} />}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );

  // Main render
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={{ marginTop: 10 }}>
          {Strings.user_home.loading_your_courses}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.container}
        ListHeaderComponent={HeaderComponent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4a6ee0"]}
          />
        }
        data={[{ id: "main" }]} // Dummy data để render một lần
        renderItem={() => (
          <>
            <InProgressSection />
            <SuggestedCoursesSection />
            <PopularCoursesSection />
          </>
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingTop: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: "white",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileButton: {
    padding: 5,
  },
  section: {
    padding: 20,
    backgroundColor: "white",
    marginBottom: 12,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  viewAllText: {
    color: "#4a6ee0",
    fontWeight: "600",
  },
  continueCard: {
    flexDirection: "row",
    backgroundColor: "#fdfcfc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: "space-between",
    alignItems: "center",
  },
  continueImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  continueContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  continueLesson: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4a6ee0",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  lastAccessed: {
    fontSize: 12,
    color: "#999",
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  noCourses: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
  horizontalList: {
    marginLeft: -5,
  },
  courseCard: {
    width: 180,
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  courseCardContent: {
    padding: 10,
  },
  courseCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    height: 40,
  },
  instructorName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  courseCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c9e69",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    color: "#ffb100",
    fontSize: 12,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
  sectionList: {
    paddingHorizontal: 20,
  },
  horizontalListContent: {
    paddingHorizontal: 15,
  },
});

export default Home;
