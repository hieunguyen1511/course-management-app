import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/RootStackParamList";
import { MyScreenProps } from "@/types/MyScreenProps";

const Stack = createNativeStackNavigator<RootStackParamList>();
// Define types
interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  price: number;
  image: string;
  rating: number;
}

const Explore: React.FC<MyScreenProps["ExploreScreenProps"]> = ({
  navigation,
  route,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Format price to VND
  const formatPrice = (price: number): string => {
    if (price === 0) return "Miễn phí";
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  // Fetch data
  useEffect(() => {
    // Mock categories data
    setCategories([
      { id: 1, name: "Lập trình", icon: "code-slash", color: "#4a6ee0" },
      { id: 2, name: "Thiết kế", icon: "color-palette", color: "#e04a76" },
      { id: 3, name: "Kinh doanh", icon: "briefcase", color: "#e0a64a" },
      { id: 4, name: "Marketing", icon: "megaphone", color: "#4ae076" },
      { id: 5, name: "Nhiếp ảnh", icon: "camera", color: "#8e4ae0" },
      { id: 6, name: "Âm nhạc", icon: "musical-notes", color: "#e04a4a" },
      { id: 7, name: "Khoa học dữ liệu", icon: "analytics", color: "#4acde0" },
    ]);

    // Mock courses data
    setSuggestedCourses([
      {
        id: 1,
        title: "Lập trình React Native cơ bản",
        instructor: "Nguyễn Văn A",
        category: "Lập trình",
        price: 1499000,
        image: "https://via.placeholder.com/100",
        rating: 4.7,
      },
      {
        id: 2,
        title: "Nguyên tắc thiết kế UI/UX",
        instructor: "Trần Thị B",
        category: "Thiết kế",
        price: 999000,
        image: "https://via.placeholder.com/100",
        rating: 4.5,
      },
      {
        id: 3,
        title: "Chiến lược Marketing số",
        instructor: "Lê Văn C",
        category: "Marketing",
        price: 799000,
        image: "https://via.placeholder.com/100",
        rating: 4.2,
      },
      {
        id: 4,
        title: "Quản trị kinh doanh cơ bản",
        instructor: "Phạm Thị D",
        category: "Kinh doanh",
        price: 1599000,
        image: "https://via.placeholder.com/100",
        rating: 4.8,
      },
      {
        id: 5,
        title: "Khoa học dữ liệu & ML cơ bản",
        instructor: "Hoàng Văn E",
        category: "Khoa học dữ liệu",
        price: 1999000,
        image: "https://via.placeholder.com/100",
        rating: 4.6,
      },
      {
        id: 6,
        title: "Nhiếp ảnh điện thoại chuyên nghiệp",
        instructor: "Mai Thị F",
        category: "Nhiếp ảnh",
        price: 899000,
        image: "https://via.placeholder.com/100",
        rating: 4.4,
      },
    ]);

    setLoading(false);
  }, []);

  // Handle category selection
  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Render rating stars
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

  // Course card component
  const CourseCard = ({ course }: { course: Course }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image source={{ uri: course.image }} style={styles.courseImage} />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.categoryText}>{course.category}</Text>
        <View style={styles.courseCardFooter}>
          <Text style={styles.priceText}>{formatPrice(course.price)}</Text>
          {renderRatingStars(course.rating)}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Category item component
  const CategoryItem = ({ category }: { category: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor:
            category.id === selectedCategory ? category.color : "white",
        },
      ]}
      onPress={() => handleCategoryPress(category.id)}
    >
      <Ionicons
        name={category.icon as any}
        size={24}
        color={category.id === selectedCategory ? "white" : category.color}
      />
      <Text
        style={[
          styles.categoryName,
          { color: category.id === selectedCategory ? "white" : "#333" },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() =>
            navigation.navigate("SearchCourseScreen", {
              message: "Tìm kiếm khóa học",
            })
          }
        >
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <Text style={styles.searchPlaceholder}>Tìm kiếm khóa học...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục khóa học</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khóa học phổ biến</Text>
          <FlatList
            data={suggestedCourses}
            renderItem={({ item }) => <CourseCard course={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.courseGrid}
            scrollEnabled={false}
          />
        </View>

        {/* New Courses Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa học mới</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalList}
          >
            {suggestedCourses.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </ScrollView>
        </View>
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
});

// function ExploreLayout() {
//   return (
//     <NavigationIndependentTree>
//      <Stack.Navigator initialRouteName='Explore' screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Explore" component={Explore} />
//       <Stack.Screen name="SearchCourse" component={SearchCourse} />
//      </Stack.Navigator>
//     </NavigationIndependentTree>
//   )
// }

export default Explore;
