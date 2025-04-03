import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";


import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@/api/axiosInstance";
import { Strings } from "@/constants/Strings";
import { useNavigation } from "expo-router";
import { RootStackParamList } from "../../types/RootStackParamList";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator<RootStackParamList>();

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
  //nextLesson: string;
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




async function getUserInformation() {
  try {
    const user = await SecureStore.getItemAsync("user");
    if (user) {
      console.log("User", user);
      return user;
    } else {
      console.log("No user");
      return JSON.stringify({});
    }
  } catch (e) {
    console.log("Error getting user", e);
    return JSON.stringify({});
  }
}

async function getUserEnrollments() {
  try {
    const user = await getUserInformation();
    const jsonUser = JSON.parse(user);
    axiosInstance
      .get(
        `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID}`.replace(
          ":user_id",
          jsonUser.id
        )
      )
      .then((res) => {
        console.log("User enrollments", res.data);
        return res.data;
      });
  } catch (e) {
    console.log("Error getting user enrollments", e);
    return JSON.stringify({});
  }
}


async function getReferenceCourse(){
  
}

// Add this function to fetch courses by reference category ID
async function getCoursesByReferenceCategory(categoryId?: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_COURSES_BY_REFERENCES_CATEOGORY_ID}`;
    
    // Replace the category_id parameter in URL if provided
    if (categoryId) {
      url = url.replace(':category_id', categoryId.toString());
    } else {
      url = url.replace(':category_id', 'NaN');
    }
    
    const response = await axiosInstance.get(url);
    
    if (response.status === 200) {
      return response.data.course;
    } else {
      console.error("Failed to fetch courses:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching courses by reference category:", error);
    return [];
  }
}

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

const Home: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const { tmessage } = useLocalSearchParams();
  console.log("searchParams:", tmessage);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("User");
  const [inProgressCourses, setInProgressCourses] = useState<UserEnrollments[]>(
    []
  );

  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const expoNavigation = useNavigation();

  const fectchUserInfo = async () => {
    const user = await getUserInformation();
    const jsonUser = JSON.parse(user);
    setUserName(jsonUser.fullname);
    console.log("User information", jsonUser);
  };

  const fetchUserEnrollments = async () => {
    try {
      const user = await getUserInformation();
      const jsonUser = JSON.parse(user);

      const respone = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_USER_ID}`.replace(
          ":user_id",
          jsonUser.id
        )
      );
      console.log("User enrollments", respone.data);
      //const jsonResponse = JSON.parse(JSON.stringify(respone.data));

      const mapData = respone.data.enrollments.map((item: UserEnrollments) => ({
        id: item.id,
        user_id: item.user_id,
        course_id: item.course_id,
        course: {
          name: item.course?.name || "N/A", // Kiểm tra có course không
          description: item.course?.description || "N/A", // Kiểm tra có course không
        },
        //courseTitle: item.course?.title || "N/A", // Kiểm tra có course không
        //nextLesson: item.nextLesson || "Chưa có",
        total_lesson: item.total_lesson || 0,
        complete_lesson: item.complete_lesson || 0,
        progress:
          Math.round((item.complete_lesson / item.total_lesson) * 100) || 0, // Tính phần trăm tiến độ
        //image: item.course?.image || "", // Kiểm tra ảnh khóa học
        updatedAt: new Intl.DateTimeFormat("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(item.updatedAt)), //item.updatedAt,
      }));
      setInProgressCourses(mapData);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
    }
  };

  const fetchCourse = async () => {
    try {
      const respone = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ALL_COURSES}`
      );
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };
  useEffect(() => {
    if (route.params?.message) {
      setMessage(route.params.message);
    }

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch user info
      await fectchUserInfo();
      
      // Fetch suggested courses (category ID 1 for Programming)
      const suggestedCoursesData = await getCoursesByReferenceCategory(1);
      if (suggestedCoursesData && suggestedCoursesData.length > 0) {
        setSuggestedCourses(suggestedCoursesData);
      }
      
      // Fetch popular courses (no specific category to get all courses sorted by creation date)
      const popularCoursesData = await getCoursesByReferenceCategory();
      if (popularCoursesData && popularCoursesData.length > 0) {
        setRelatedCourses(popularCoursesData);
      }
      
      // Try to fetch user enrollments
      try {
        await fetchUserEnrollments();
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [route.params?.message]);

  // Render stars for ratings
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

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Course card for suggested and related courses
  const CourseCard = ({ course }: { course: Course }) => (
    <TouchableOpacity style={styles.courseCard} 
      onPress={() => {
        console.log("Navigate to course detail:", course.id);
        navigation.navigate("DetailCourseScreen", {
          courseId: course.id,
          message: "",
        });
      }}
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
        <Text style={styles.instructorName}>{course.description}</Text>
        <View style={styles.courseCardFooter}>
          {course.discount > 0 ? (
            <Text style={styles.priceText}>
              {course.price.toFixed(2)}{" "}
              <Text
                style={{ textDecorationLine: "line-through", color: "#999" }}
              >
                {course.discount.toFixed(2)}
              </Text>
            </Text>
          ) : (
            <Text style={styles.priceText}>{course.price.toFixed(2)}</Text>
          )}

          {renderRatingStars(course.total_rating? course.total_rating : 0)}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>{Strings.user_home.loading_your_courses}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>
            {Strings.user_home.welcome_back}
          </Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => {
            console.log("Profile button pressed");
            expoNavigation.navigate("account" as never);
          }}
        >
          <Ionicons name="person-circle-outline" size={40} color="#4a6ee0" />
        </TouchableOpacity>
      </View>

      {/* Continue Learning Section */}
      <View style={styles.section}>
        {inProgressCourses.length > 0 ? (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {Strings.user_home.continue_learning}
            </Text>
          </View>
        ) : (
          <View style={styles.sectionHeader}></View>
        )}

        {inProgressCourses.map((course) => (
          <TouchableOpacity key={course.id} style={styles.continueCard}>
            <Image
              source={require("../../assets/images/course.jpg")}
              style={styles.continueImage}
            />

            <View style={styles.continueContent}>
              <Text style={styles.continueTitle} numberOfLines={1}>
                {course.course.name}
              </Text>
              <Text style={styles.continueLesson} numberOfLines={1}>
                {/* Next: {course.nextLesson} */}
                {course.course.description}
              </Text>

              <View style={styles.progressContainer}>
                <ProgressBar progress={course.progress} />
                <Text style={styles.progressText}>
                  {course.progress}% {Strings.user_home.complete}
                </Text>
              </View>

              <Text style={styles.lastAccessed}>
                {Strings.user_home.last_accessed}
                {": "} {course.updatedAt}
              </Text>
            </View>

            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play-circle" size={36} color="#4a6ee0" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {inProgressCourses.length === 0 && (
          <Text style={styles.noCourses}>
            {Strings.user_home.no_enrolled_courses}
          </Text>
        )}
      </View>

      {/* Suggested Courses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {Strings.user_home.suggest_courses}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("UserViewAllCourseScreen", { message: "" })
            }
          >
            <Text style={styles.viewAllText}>{Strings.user_home.view_all}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          {suggestedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      </View>

      {/* Related Courses Section */}
      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {Strings.user_home.popular_courses}
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>{Strings.user_home.view_all}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        >
          {relatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

// const Routes = () => {
//   return (
//     <NavigationIndependentTree>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{ headerShown: false }}
//         />
//         {/* <Stack.Screen name="Test1" component={Test1} /> */}
//       </Stack.Navigator>
//     </NavigationIndependentTree>
//   );
// };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  continueImage: {
    width: 80,
    height: 80,
    justifyContent: "center",
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
});

// function HomeRoutes() {
//   return (
//     <NavigationIndependentTree>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen
//           name="Home"
//           component={HomeScreen}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="UserViewAllCourse"
//           component={UserViewAllCourse}
//           options={{ 
//             headerShown: false
//           }}
//         />
//         <Stack.Screen
//           name="DetailCourse"
//           component={DetailCourseLayout}
//           options={{ 
//             headerShown: false
//           }}
//         />
//         <Stack.Screen
//           name="UserViewAllEnrollment"
//           component={UserViewAllEnrollment}
//           options={{ 
//             headerShown: false
//           }}
//         />
//       </Stack.Navigator>
//     </NavigationIndependentTree>
//   );
// }

export default Home;
