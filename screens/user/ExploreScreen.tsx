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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';

interface Category {
  id: number;
  name: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  category_id: number;
  total_rating: number;
  enrollment_count: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const getAllPopularCourses = async (): Promise<CourseCard[]> => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ALL_COURSES_FOR_USER_LIMIT_INFO}`;
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      return response.data.courses.slice(0, 10) as CourseCard[];
    }
    return [] as CourseCard[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [] as CourseCard[];
  }
};

const getAllCategories = async (): Promise<Category[]> => {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`;
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      return response.data.categories.sort((a: Category, b: Category) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      });
    }
    return [] as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [] as Category[];
  }
};

// components
import SearchHeader from '@/components/user/SearchHeader';
import CategoryList from '@/components/user/CategoryList';
import CourseList from '@/components/user/CourseList';
import { CourseCard } from '@/types/MyInterfaces';

const useExploreData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularCourses, setPopularCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch categories and popular courses in parallel
      const [categoriesData, coursesData] = await Promise.all([
        getAllCategories(),
        getAllPopularCourses(),
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
    refetch: fetchData,
  };
};

const ExploreScreen: React.FC<MyScreenProps['ExploreScreenProps']> = ({ navigation, route }) => {
  const { categories, popularCourses, loading, error, refetch } = useExploreData();

  const handleSearchPress = () => {
    navigation.navigate('SearchCourseScreen', {
      message: 'Tìm kiếm khóa học',
    });
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('UserViewAllCourseScreen', {
      message: 'Khóa học theo danh mục',
      category_id: category.id,
    });
  };

  const handleViewAllPopularPress = () => {
    navigation.navigate('UserViewAllCourseScreen', {
      message: 'Khóa học phổ biến',
      is_popular: true,
    });
  };

  const handleCoursePress = (course: CourseCard) => {
    navigation.navigate('DetailCourseScreen', {
      courseId: course.courseId,
      message: '',
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
        <CategoryList categories={categories} onCategoryPress={handleCategoryPress} />

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
          onViewAllPress={handleViewAllPopularPress}
          onCoursePress={handleCoursePress}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#4a6ee0',
    fontWeight: '600',
  },

  courseCard: {
    width: 170,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  courseCardContent: {
    padding: 10,
  },
  courseCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    height: 40,
  },
  categoryText: {
    fontSize: 12,
    color: '#4a6ee0',
    marginBottom: 5,
    fontWeight: '500',
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c9e69',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#ffb100',
    fontSize: 12,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
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

export default ExploreScreen;
