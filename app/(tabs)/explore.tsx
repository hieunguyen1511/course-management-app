import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/RootStackParamList";
import { MyScreenProps } from "@/types/MyScreenProps";
import axiosInstance from "@/api/axiosInstance";

const Stack = createNativeStackNavigator<RootStackParamList>();
// Define types
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
interface Category {
  id: number;
  name: string;
}

async function getAllPopularCourses() {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ALL_COURSES}`;
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      return response.data.courses.sort((a: Course, b: Course) => {
        if (a.total_rating > b.total_rating) return -1;
        if (a.total_rating < b.total_rating) return 1;
        return 0;
      });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}


async function getAllCategories() {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`;
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      return response.data.categories.sort((a: Category, b: Category) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    } else {
      throw new Error("Failed to fetch categories");
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

const SearchHeader: React.FC<{
  onSearchPress: () => void;
}> = ({ onSearchPress }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.searchContainer} onPress={onSearchPress}>
      <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
      <Text style={styles.searchPlaceholder}>Tìm kiếm khóa học...</Text>
    </TouchableOpacity>
  </View>
);

const CategoryList: React.FC<{
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}> = ({ categories, onCategoryPress }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Danh mục khóa học</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map((category) => (
        <CategoryItem 
          key={category.id} 
          category={category} 
          onPress={() => onCategoryPress(category)}
        />
      ))}
    </ScrollView>
  </View>
);

const CategoryItem: React.FC<{
  category: Category;
  onPress: () => void;
}> = ({ category, onPress }) => (
  <TouchableOpacity
    style={[styles.categoryItem, { backgroundColor: "white" }]}
    onPress={onPress}
  >
    <Text style={[styles.categoryName, { color: "#333" }]}>
      {category.name}
    </Text>
  </TouchableOpacity>
);

const formatPrice = (price: number): string => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")}đ`;
};

const CourseRating: React.FC<{ rating: number }> = ({ rating }) => (
  <View style={styles.ratingContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Text key={star} style={styles.starIcon}>
        {rating >= star ? "★" : "☆"}
      </Text>
    ))}
    <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
  </View>
);

const CourseCard: React.FC<{
  course: Course;
  onPress?: (course: Course) => void;
}> = ({ course, onPress }) => (
  <TouchableOpacity 
    style={styles.courseCard}
    onPress={() => onPress?.(course)}
  >
    <Image 
      source={
        course.image 
          ? { uri: course.image }
          : require("../../assets/images/course.jpg")
      } 
      style={styles.courseImage} 
    />
    <View style={styles.courseCardContent}>
      <Text style={styles.courseCardTitle} numberOfLines={2}>
        {course.name}
      </Text>
      <Text style={styles.categoryText}>
        {course.category?.name}
      </Text>
      <View style={styles.courseCardFooter}>
        <View>
          {course.price === 0 ? (
            <Text style={styles.priceText}>Miễn phí</Text>
          ) : course.discount > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.priceText}>
                {formatPrice(course.price - course.discount)}
              </Text>
              <Text style={[styles.priceText, { 
                textDecorationLine: 'line-through',
                color: '#666',
                fontSize: 12,
                marginLeft: 4
              }]}>
                {formatPrice(course.price)}
              </Text>
            </View>
          ) : (
            <Text style={styles.priceText}>
              {formatPrice(course.price)}
            </Text>
          )}
        </View>
        <CourseRating rating={course.total_rating||0} />
      </View>
    </View>
  </TouchableOpacity>
);

const CourseList: React.FC<{
  title: string;
  courses: Course[];
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  onCoursePress?: (course: Course) => void;
  horizontal?: boolean;
}> = ({ title, courses, showViewAll, onViewAllPress, onCoursePress, horizontal }) => (
  <View style={[styles.section, styles.lastSection]}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
    {horizontal ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalList}
      >
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onPress={onCoursePress}
          />
        ))}
      </ScrollView>
    ) : (
      <FlatList
        data={courses}
        renderItem={({ item }) => (
          <CourseCard 
            course={item} 
            onPress={onCoursePress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.courseGrid}
        scrollEnabled={false}
      />
    )}
  </View>
);

const useExploreData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories and popular courses in parallel
      const [categoriesData, coursesData] = await Promise.all([
        getAllCategories(),
        getAllPopularCourses()
      ]);

      if (categoriesData) setCategories(categoriesData);
      if (coursesData) setPopularCourses(coursesData);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching explore data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    categories,
    popularCourses,
    loading,
    error,
    refetch: fetchData
  };
};

const Explore: React.FC<MyScreenProps["ExploreScreenProps"]> = ({
  navigation,
  route,
}) => {
  const { 
    categories, 
    popularCourses, 
    loading, 
    error, 
    refetch 
  } = useExploreData();

  const handleSearchPress = () => {
    navigation.navigate("SearchCourseScreen", {
      message: "Tìm kiếm khóa học",
    });
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate("UserViewAllCourseScreen", {
      message: "Khóa học theo danh mục",
      category_id: category.id,
    });
  };

  const handleViewAllPopularPress = () => {
    navigation.navigate("UserViewAllCourseScreen", {
      message: "Khóa học phổ biến",
      is_popular: true,
    });
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate("DetailCourseScreen", {
      courseId: course.id,
      message: "",
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a6ee0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader onSearchPress={handleSearchPress} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryList
          categories={categories}
          onCategoryPress={handleCategoryPress}
        />

        <CourseList
          title="Khóa học phổ biến"
          courses={popularCourses}
          showViewAll
          onViewAllPress={handleViewAllPopularPress}
          onCoursePress={handleCoursePress}
        />

        <CourseList
          title="Khóa học mới"
          courses={popularCourses.slice(0, 4)}
          horizontal
          onCoursePress={handleCoursePress}
        />
      </ScrollView>
    </View>
  );
};

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
    backgroundColor: "white",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: "#999",
  },
  section: {
    backgroundColor: "white",
    padding: 20,
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
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    minWidth: 100,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  courseGrid: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  horizontalList: {
    marginLeft: -5,
  },
  courseCard: {
    width: 170,
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
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
  categoryText: {
    fontSize: 12,
    color: "#4a6ee0",
    marginBottom: 5,
    fontWeight: "500",
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
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4a6ee0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Explore;
