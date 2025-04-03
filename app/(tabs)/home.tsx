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
  progress: number;
  nextLesson: string;
  lastAccessed: string;
}

// Components
import Section from "@/components/user/Section";
import Header from "@/components/user/Header";
import CourseCard from "@/components/user/CourseCard";
import InProgressCourseCard from "@/components/user/InProgressCourseCard";

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
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("User");
  const [inProgressCourses, setInProgressCourses] = useState<UserEnrollments[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referenceCategoryId, setReferenceCategoryId] = useState<number | string>("NaN");

  // Helper functions
  const renderRatingStars = useCallback((rating: number) => (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={styles.starIcon}>
          {rating >= star ? "★" : "☆"}
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  ), []);

  const renderProgressBar = useCallback(({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  ), []);

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
        const sortedEnrollments = response.data.enrollments.sort(
          (a: UserEnrollments, b: UserEnrollments) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        const firstEnrollment = sortedEnrollments.slice(0, 1);
        setReferenceCategoryId(firstEnrollment[0].course.category_id || "NaN");
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
          progress: Math.round((item.complete_lesson / item.total_lesson) * 100) || 0,
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
      const userInfo = await getUserInformation();
      if (userInfo?.fullname) {
        setUserName(userInfo.fullname);
      }

      if (userInfo?.id) {
        await fetchUserEnrollments(userInfo.id);
      }

      const suggestedCoursesData = await getCoursesByReferenceCategory(referenceCategoryId);
      if (suggestedCoursesData?.length > 0) {
        setSuggestedCourses(suggestedCoursesData);
      }

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

  const renderInProgressSection = useCallback(() => (
    <Section
      title={Strings.user_home.continue_learning}
      showViewAll={false}
    >
      <FlatList
        data={inProgressCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <InProgressCourseCard
            item={item}
            onPress={() =>
              navigation.navigate("UserDetailCourseScreen", {
                courseId: item.course_id,
                message: "",
              })
            }
            renderProgressBar={renderProgressBar}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.noCourses}>
            {Strings.user_home.no_enrolled_courses}
          </Text>
        )}
      />
    </Section>
  ), [inProgressCourses, navigation, renderProgressBar]);

  const renderSuggestedCoursesSection = useCallback(() => (
    <Section
      title={Strings.user_home.suggest_courses}
      onViewAllPress={() =>
        navigation.navigate("UserViewAllCourseScreen", {
          message: "Hello from Home Suggest Course",
          is_suggested: true,
          category_id: parseInt(referenceCategoryId.toString()),
        })
      }
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={suggestedCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate("DetailCourseScreen", {
                courseId: item.id,
                message: "",
              })
            }
            renderRatingStars={renderRatingStars}
          />
        )}
        contentContainerStyle={styles.horizontalList}
      />
    </Section>
  ), [suggestedCourses, navigation, renderRatingStars, referenceCategoryId]);

  const renderPopularCoursesSection = useCallback(() => (
    <Section
      title={Strings.user_home.popular_courses}
      onViewAllPress={() =>
        navigation.navigate("UserViewAllCourseScreen", {
          message: "Hello from Home Popular Course",
          is_popular: true,
        })
      }
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={popularCourses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() =>
              navigation.navigate("DetailCourseScreen", {
                courseId: item.id,
                message: "",
              })
            }
            renderRatingStars={renderRatingStars}
          />
        )}
        contentContainerStyle={styles.horizontalList}
      />
    </Section>
  ), [popularCourses, navigation, renderRatingStars]);

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
        ListHeaderComponent={
          <Header
            userName={userName}
            onProfilePress={() => navigation.navigate("Account", { message: "" })}
          />
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4a6ee0"]}
          />
        }
        data={[{ id: "main" }]}
        renderItem={() => (
          <>
            {renderInProgressSection()}
            {renderSuggestedCoursesSection()}
            {renderPopularCoursesSection()}
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
  
  lastSection: {
    marginBottom: 30,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  noCourses: {
    textAlign: "center",
    color: "#666",
    padding: 20,
  },
  horizontalList: {
    marginLeft: -5,
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
