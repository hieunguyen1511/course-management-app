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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';
import { router, useLocalSearchParams } from 'expo-router';

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

async function getAllSuggestedCourses(category_id: number | string) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_COURSES_BY_REFERENCES_CATEOGORY_ID}`;
    url = url.replace(':category_id', category_id?.toString() || 'NaN');

    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      const courses = response.data.course;
      return courses.sort((a: Course, b: Course) => {
        if (a.total_rating > b.total_rating) return -1;
        if (a.total_rating < b.total_rating) return 1;
        return 0;
      });
    } else {
      throw new Error('Failed to fetch courses');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
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
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function getAllCoursesByCategoryId(category_id: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_COURSES_BY_CATEGORY_ID}`;
    url = url.replace(':id', category_id.toString());
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      return response.data.courses.sort((a: Course, b: Course) => {
        if (a.total_rating > b.total_rating) return -1;
        if (a.total_rating < b.total_rating) return 1;
        return 0;
      });
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
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
      throw new Error('Failed to fetch categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Format price to VND
const formatPrice = (price: number): string => {
  if (price === 0) return 'Miễn phí';
  return `${price.toLocaleString('vi-VN')}đ`;
};

// components/course/CourseHeader.tsx
const CourseHeader: React.FC<{
  title: string;
  onBack: () => void;
}> = ({ title, onBack }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Ionicons name="arrow-back" size={24} color="#333" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

// components/course/CourseRating.tsx
const CourseRating: React.FC<{ rating: number }> = ({ rating }) => (
  <View style={styles.ratingContainer}>
    {[1, 2, 3, 4, 5].map(star => (
      <Text key={star} style={styles.starText}>
        {rating >= star ? '★' : '☆'}
      </Text>
    ))}
    <Text style={styles.ratingNumber}>{Number(rating).toFixed(1)}</Text>
  </View>
);

// components/course/CoursePrice.tsx
const CoursePrice: React.FC<{
  price: number;
  discount: number;
}> = ({ price, discount }) => {
  if (price === 0) return <Text style={styles.freePrice}>Miễn phí</Text>;

  if (discount > 0) {
    return (
      <View style={styles.priceContainer}>
        <Text style={styles.discountPrice}>{formatPrice(price - discount)}</Text>
        <Text style={styles.originalPrice}>{formatPrice(price)}</Text>
      </View>
    );
  }

  return <Text style={styles.price}>{formatPrice(price)}</Text>;
};

// components/course/CategoryFilter.tsx
const CategoryFilter: React.FC<{
  categories: Category[];
  selectedCategory: number;
  onSelectCategory: (id: number) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => (
  <View style={styles.categoryFilter}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScrollView}
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategoryButton,
          ]}
          onPress={() => onSelectCategory(category.id)}
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
  </View>
);

// components/course/CourseItem.tsx
const CourseItem: React.FC<{
  course: Course;
  onPress: (courseId: number) => void;
}> = ({ course, onPress }) => (
  <TouchableOpacity style={styles.courseItem} onPress={() => onPress(course.id)}>
    <Image source={require('@/assets/images/course.jpg')} style={styles.courseImage} />
    <View style={styles.courseContent}>
      <Text style={styles.courseTitle} numberOfLines={2}>
        {course.name}
      </Text>
      <Text style={styles.categoryText}>{course.category.name}</Text>
      <Text style={styles.descriptionText} numberOfLines={2}>
        {course.description}
      </Text>
      <View style={styles.priceRatingContainer}>
        <CoursePrice price={course.price} discount={course.discount} />
      </View>
      <CourseRating rating={course.total_rating} />
    </View>
  </TouchableOpacity>
);

interface UserViewAllCourseScreenProps {
  viewDeailCourseHandle: (courseId: number) => void;
}
const UserViewAllCourseScreen: React.FC<UserViewAllCourseScreenProps> = ({
  viewDeailCourseHandle,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);

  const { is_suggested, is_popular, category_id } = useLocalSearchParams();

  // State để xác định loại hiển thị
  const [isSuggested, setIsSuggested] = useState<boolean>(false);
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  // Thêm state để lưu tên danh mục hiện tại
  const [currentCategoryName, setCurrentCategoryName] = useState<string>('');

  // Fetch courses dựa trên params
  const fetchCourses = async (refresh = false) => {
    if (loading && !refresh) return;

    setLoading(true);
    try {
      let fetchedCourses: Course[] = [];

      if (isSuggested) {
        // Fetch suggested courses với categoryId đúng
        fetchedCourses = await getAllSuggestedCourses(categoryId || 'NaN');
      } else if (isPopular) {
        if (selectedCategory !== 0) {
          fetchedCourses = (await getAllCoursesByCategoryId(selectedCategory)) || [];
        } else {
          fetchedCourses = (await getAllPopularCourses()) || [];
        }
      } else if (categoryId) {
        fetchedCourses = (await getAllCoursesByCategoryId(categoryId)) || [];
      } else if (selectedCategory !== 0) {
        fetchedCourses = (await getAllCoursesByCategoryId(selectedCategory)) || [];
      } else {
        fetchedCourses = (await getAllPopularCourses()) || [];
      }

      setCourses(fetchedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getAllCategories();
      if (fetchedCategories) {
        setCategories([{ id: 0, name: Strings.user_view_all_course.all }, ...fetchedCategories]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const loadData = async () => {
    const isSuggested = is_suggested === '1';
    const isPopular = is_popular === '1';
    const categoryId = parseInt(category_id as string);
    if (category_id && (isSuggested || isPopular)) {
      setIsSuggested(isSuggested);
      setIsPopular(isPopular);
      setCategoryId(categoryId);

      let fetchedCourses: Course[] = [];

      if (isSuggested) {
        fetchedCourses = await getAllSuggestedCourses(categoryId);
      } else if (isPopular) {
        fetchedCourses = (await getAllPopularCourses()) || [];
      } else if (categoryId) {
        // Khi chỉ có category_id, fetch courses theo category và lấy tên category
        fetchedCourses = (await getAllCoursesByCategoryId(categoryId)) || [];

        // Lấy tên category từ API hoặc từ danh sách categories
        try {
          const allCategories = await getAllCategories();
          if (allCategories) {
            // const category = allCategories.find(category_id);
            // if (category) {
            //   setCurrentCategoryName(category.name);
            // }
          }
        } catch (error) {
          console.error('Error fetching category name:', error);
        }
      } else {
        fetchedCourses = (await getAllPopularCourses()) || [];
      }

      setCourses(fetchedCourses);

      // Chỉ fetch categories khi không phải suggested và không có category_id
      if (!is_suggested && !category_id) {
        fetchCategories();
      }
    } else {
      const allCourses = (await getAllPopularCourses()) || [];
      setCourses(allCourses);
      fetchCategories();
    }
  };
  useEffect(() => {
    loadData();
  }, []);

  // Cập nhật useEffect cho việc thay đổi category
  useEffect(() => {
    if (is_suggested) {
      return;
    }
    // Chỉ fetch lại khi thay đổi category trong trường hợp popular hoặc mặc định
    else if (!isSuggested && !categoryId) {
      fetchCourses();
    }
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses(true);
  };

  const handleCoursePress = (courseId: number) => {
    viewDeailCourseHandle(courseId);
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  const getScreenTitle = () => {
    if (isSuggested) return `${Strings.user_view_all_course.suggested_courses}`;
    if (isPopular) return `${Strings.user_view_all_course.popular_courses}`;
    if (categoryId && currentCategoryName)
      return `${Strings.user_view_all_course.course_by_category}: ${currentCategoryName}`;
    return `${Strings.user_view_all_course.all_courses}`;
  };

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{Strings.user_view_all_course.no_course}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 16 }}>
      <View style={styles.container}>
        <CourseHeader title={getScreenTitle()} onBack={() => router.back()} />

        {!isSuggested && !categoryId && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        <View style={styles.listContainer}>
          <FlatList
            data={courses}
            renderItem={({ item }) => <CourseItem course={item} onPress={handleCoursePress} />}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              courses.length === 0 && styles.emptyListContent,
            ]}
            ListEmptyComponent={renderEmptyState}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4a6ee0" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  courseItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 4,
  },
  descriptionText: {
    color: '#4b5563',
    fontSize: 14,
    marginBottom: 8,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freePrice: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discountPrice: {
    color: '#059669',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  originalPrice: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    fontSize: 14,
  },
  price: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    color: '#fbbf24',
    fontSize: 14,
    marginRight: 2,
  },
  ratingNumber: {
    color: '#4b5563',
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    width: '100%',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 18,
  },
  categoryFilter: {
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    width: '100%',
  },
  categoryButton: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 20,
    height: 32,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#4a6ee0',
  },
  categoryButtonText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  categoryScrollView: {
    width: '100%',
  },
});

export default UserViewAllCourseScreen;
