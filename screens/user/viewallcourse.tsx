import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import { MyScreenProps } from "@/types/MyScreenProps";

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

// Mock data generator
const generateMockCourses = (startId: number, count: number): Course[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    category_id: Math.floor(Math.random() * 5) + 1,
    name: `Course ${startId + index}: ${
      [
        "React Native",
        "JavaScript",
        "UI/UX Design",
        "Web Development",
        "Python",
      ][Math.floor(Math.random() * 5)]
    }`,
    description: `This is a detailed description for course ${
      startId + index
    }. Learn everything you need to know about this topic.`,
    status: 1,
    price: Math.floor(Math.random() * 150) + 50,
    discount: Math.random() > 0.5 ? Math.floor(Math.random() * 30) : 0,
    image: "course-image.jpg",
    total_rating: Math.random() * 2 + 3, // Random rating between 3.0 and 5.0
    category: {
      id: Math.floor(Math.random() * 3) + 1,
      name: ["Programming", "Design", "Business"][
        Math.floor(Math.random() * 3)
      ],
    },
  }));
};

// Total mock courses to simulate
const TOTAL_MOCK_COURSES = 45;

const UserViewAllCourse: React.FC<
  MyScreenProps["UserViewAllCourseScreenProps"]
> = ({ navigation, route }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  const fetchMockCourses = async (pageNumber: number, refresh = false) => {
    if (!hasMore && !refresh) return;

    // Simulate API call delay
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
    const remainingItems = TOTAL_MOCK_COURSES - startIndex;
    const itemsToGenerate = Math.min(ITEMS_PER_PAGE, remainingItems);

    if (itemsToGenerate <= 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    const newCourses = generateMockCourses(startIndex + 1, itemsToGenerate);

    if (refresh) {
      setCourses(newCourses);
      setPage(1);
      setHasMore(true);
    } else {
      setCourses((prev) => [...prev, ...newCourses]);
    }

    setHasMore(startIndex + itemsToGenerate < TOTAL_MOCK_COURSES);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMockCourses(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMockCourses(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchMockCourses(page + 1);
      setPage((prev) => prev + 1);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} className="text-yellow-400 text-sm mr-0.5">
            {rating >= star ? "★" : "☆"}
          </Text>
        ))}
        <Text className="text-gray-600 text-xs ml-1">
          {Number(rating).toFixed(1)}
        </Text>
      </View>
    );
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      className="flex-row bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100"
      onPress={() => {
        console.log("Navigate to course detail:", item.id);
      }}
    >
      <Image
        source={require("../../assets/images/course.jpg")}
        className="w-24 h-24 rounded-lg"
      />
      <View className="flex-1 ml-4">
        <Text
          className="text-lg font-bold text-gray-800 mb-1"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text className="text-red-600 text-sm mb-1">{item.category.name}</Text>
        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <View>
            {item.discount > 0 ? (
              <View className="flex-row items-center">
                <Text className="text-green-600 font-bold mr-2">
                  ${(item.price - item.discount).toFixed(2)}
                </Text>
                <Text className="text-gray-400 line-through">
                  ${item.price.toFixed(2)}
                </Text>
              </View>
            ) : (
              <Text className="text-green-600 font-bold">
                ${item.price.toFixed(2)}
              </Text>
            )}
          </View>
          {renderRatingStars(item.total_rating)}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#4a6ee0" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-gray-500 text-lg">
          {/* {Strings.courses?.no_courses_found || "No courses found"} */}
          No courses found
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          {/* {Strings.courses?.all_courses || "All Courses"} */}
          All Courses
        </Text>
      </View>

      {/* Course List */}
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};



export default UserViewAllCourse;
