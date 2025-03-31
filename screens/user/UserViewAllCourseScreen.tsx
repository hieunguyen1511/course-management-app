import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ScrollView,
  SafeAreaView,
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

const CATEGORIES = [
  { id: 0, name: "Tất cả" },
  { id: 1, name: "Lập trình" },
  { id: 2, name: "Thiết kế" },
  { id: 3, name: "Kinh doanh" },
];

const COURSE_NAMES = [
  "Lập trình React Native",
  "JavaScript cơ bản đến nâng cao",
  "Thiết kế UI/UX chuyên nghiệp",
  "Phát triển Web Full Stack",
  "Python cho người mới bắt đầu",
];

// Format price to VND
const formatPrice = (price: number): string => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")}đ`;
};

// Mock data generator
const generateMockCourses = (startId: number, count: number): Course[] => {
  return Array.from({ length: count }, (_, index) => {
    // 20% chance of being a free course
    const isFree = Math.random() < 0.2;
    const price = isFree ? 0 : Math.floor(Math.random() * 1500000) + 500000; // Random price between 500k and 2M VND
    const discount =
      !isFree && Math.random() > 0.5 ? Math.floor(Math.random() * 300000) : 0; // Random discount up to 300k VND

    return {
      id: startId + index,
      category_id: Math.floor(Math.random() * 3) + 1,
      name: `Khóa học ${startId + index}: ${
        COURSE_NAMES[Math.floor(Math.random() * COURSE_NAMES.length)]
      }`,
      description: `Đây là mô tả chi tiết cho khóa học ${
        startId + index
      }. Học mọi thứ bạn cần biết về chủ đề này.`,
      status: 1,
      price,
      discount,
      image: "course-image.jpg",
      total_rating: Math.random() * 2 + 3,
      category: {
        id: Math.floor(Math.random() * 3) + 1,
        name: ["Lập trình", "Thiết kế", "Kinh doanh"][
          Math.floor(Math.random() * 3)
        ],
      },
    };
  });
};

// Total mock courses to simulate
const TOTAL_MOCK_COURSES = 45;

const UserViewAllCourseScreen: React.FC<
  MyScreenProps["UserViewAllCourseScreenProps"]
> = ({ navigation, route }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchMockCourses = async (pageNumber: number, refresh = false) => {
    if (!hasMore && !refresh) return;

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

  useEffect(() => {
    if (selectedCategory === 0) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(
        (course) => course.category_id === selectedCategory
      );
      setFilteredCourses(filtered);
    }
  }, [courses, selectedCategory]);

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

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategoryButton,
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.starText}>
            {rating >= star ? "★" : "☆"}
          </Text>
        ))}
        <Text style={styles.ratingNumber}>{Number(rating).toFixed(1)}</Text>
      </View>
    );
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => {
        console.log("Navigate to course detail:", item.id);
      }}
    >
      <Image
        source={require("../../assets/images/course.jpg")}
        style={styles.courseImage}
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.categoryText}>{item.category.name}</Text>
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.priceRatingContainer}>
          <View>
            {item.price === 0 ? (
              <Text style={styles.freePrice}>Miễn phí</Text>
            ) : item.discount > 0 ? (
              <View style={styles.priceContainer}>
                <Text style={styles.discountPrice}>
                  {formatPrice(item.price - item.discount)}
                </Text>
                <Text style={styles.originalPrice}>
                  {formatPrice(item.price)}
                </Text>
              </View>
            ) : (
              <Text style={styles.price}>{formatPrice(item.price)}</Text>
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
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#4a6ee0" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No courses found</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tất cả khóa học</Text>
        </View>

        {renderCategoryFilter()}

        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  listContent: {
    padding: 16,
  },
  courseItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  courseImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
  },
  courseContent: {
    flex: 1,
    marginLeft: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  categoryText: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 4,
  },
  descriptionText: {
    color: "#4b5563",
    fontSize: 14,
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  freePrice: {
    color: "#059669",
    fontWeight: "bold",
    fontSize: 16,
  },
  discountPrice: {
    color: "#059669",
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 16,
  },
  originalPrice: {
    color: "#9ca3af",
    textDecorationLine: "line-through",
    fontSize: 14,
  },
  price: {
    color: "#059669",
    fontWeight: "bold",
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starText: {
    color: "#fbbf24",
    fontSize: 14,
    marginRight: 2,
  },
  ratingNumber: {
    color: "#4b5563",
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 18,
  },
  categoryFilter: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoryButton: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 20,
    height: 32,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: "#4a6ee0",
  },
  categoryButtonText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "white",
  },
});

export default UserViewAllCourseScreen;
