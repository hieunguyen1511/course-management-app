import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, TextInput, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

import {
  NavigationContainer,
  NavigationIndependentTree,
  useFocusEffect,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/RootStackParamList";
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';
import MessageAlert from '@/components/MessageAlert';
import AddCourse from '@/screens/admin/course/addCourse';
const Stack = createNativeStackNavigator<RootStackParamList>();
type CourseScreenProps = NativeStackScreenProps<RootStackParamList, "Course">;

import { Category } from '@/types/category';
import { Course } from '@/types/course';

const CourseScreen: React.FC<CourseScreenProps> = ({ navigation, route }) => {
  // State for courses and UI
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`);
      if (response.status === 200) {
        // Thêm phần tử "All" vào đầu danh sách
        const allCategory: Category = {
          id: 0,
          name: "Tất cả",
          description: "Hiển thị tất cả khóa học",
          courseCount: 0
        };
        setCategories([allCategory, ...response.data.categories]);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_COURSES}`);
      if (response.status === 200) {
        console.log('fetch data cources successfull!');
        setCourses(response.data.courses);
        setFilteredCourses(response.data.courses);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filter = (categoryId: number, text: string, courses: Course[]) => {
    let filtered = courses;
    // Lọc theo category nếu đã chọn
    if (searchText.trim() === '' && categoryId === 0) {
      setFilteredCourses(courses);
      return;
    }
    if (categoryId !== 0) {
      filtered = filtered.filter(course => course.category.id === categoryId);
    }
    
    // Lọc theo text tìm kiếm nếu có
    if (text.trim() !== '') {
      filtered = filtered.filter(course => 
        course.id.toString().includes(text) ||
        course.name.toLowerCase().includes(text.toLowerCase()) ||
        course.description.toLowerCase().includes(text.toLowerCase())
      );
    }
    
    setFilteredCourses(filtered);
  }

  const filterCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
    filter(categoryId, searchText, courses);
  }

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCourses(courses);
      return;
    }
    filter(selectedCategory, text, courses);
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCourses();
    }, [])
  );

  useEffect(() => {
    const routeMessage = route.params?.message;
    if (typeof routeMessage === 'string' && routeMessage.length > 0) {
      setMessage({ text: routeMessage, type: 'success' });
    }
  }, [route.params?.message]);

  // Handle delete course
  const handleDeleteCourse = async ()  => {
    if (selectedCourse) {
      try {
        const response = await axiosInstance.delete(
          `${process.env.EXPO_PUBLIC_API_DELETE_COURSE}`.replace(":id", String(selectedCourse.id))
        );
        
        if (response.status === 200) {
          console.log('Delete item course successful!');
          const updatedCourses = courses.filter(cat => cat.id !== selectedCourse.id);
          setCourses(updatedCourses);
          // Giữ nguyên điều kiện tìm kiếm
          filter(selectedCategory, searchText, updatedCourses);
          setDeleteModalVisible(false);
          setSelectedCourse(null);
          setMessage({ text: Strings.courses.deleteSuccess, type: 'success' });
        } else {
          console.log(`Failed to delete item. Status: ${response.status}`);
          setMessage({ text: Strings.courses.deleteError, type: 'error' });
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
        setMessage({ text: Strings.courses.deleteError, type: 'error' });
      }
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (course: Course) => {
    setSelectedCourse(course);
    setDeleteModalVisible(true);
  };

  // Render rating stars
  // const renderRatingStars = (rating: number) => {
  //   return (
  //     <View style={styles.ratingContainer}>
  //       {[1, 2, 3, 4, 5].map((star) => (
  //         <Text key={star} style={styles.starIcon}>
  //           {rating >= star ? '★' : '☆'}
  //         </Text>
  //       ))}
  //       <Text style={styles.ratingText}>
  //         {rating !== undefined && rating !== null ? rating.toFixed(1) : "N/A"}
  //       </Text>
  //     </View>
  //   );
  // };

  // Render course item
  const renderCourseItem = ({ item }: { item: Course }) => {
    const price = Number(item.price);
    const enrollmentCount = Number(item.enrollment_count);
    
    return (
      <View style={styles.courseCard}>
        <Image 
          source={{ uri: `asset:/assets/images/courses/${item.image}` }} 
          style={styles.courseImage} 
        />
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.name}</Text>
          <Text style={styles.courseCategory}>{item.category.name}</Text>
          <Text style={styles.courseDescription} numberOfLines={3}>
            {item.description}
          </Text>
          <View style={styles.courseDetails}>
            <Text style={styles.coursePrice}>
              {price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`}
            </Text>
            <Text style={styles.courseStudents}>
              {enrollmentCount} học viên
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.courseRating}>{item.total_rating}</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('ViewCourse', { courseId: Number(item.id) })}
          >
            <Ionicons name="eye" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditCourse', { courseId: Number(item.id) })}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => confirmDelete(item)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            value={searchText}
            onChangeText={handleSearch}
          />
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCourse', { message: 'Hello' })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => filterCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.courseList}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={32} color="#F44336" />
              <Text style={styles.modalTitle}>Xác nhận xóa</Text>
            </View>
            <Text style={styles.modalMessage}>
              Bạn có chắc chắn muốn xóa khóa học "{selectedCourse?.name}" không?
              Hành động này không thể hoàn tác.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteCourse}
              >
                <Text style={styles.confirmButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  courseList: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
    maxHeight: 60,
    overflow: 'hidden',
  },
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  courseStudents: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  viewButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#FFC107',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});


const CourseTabLayout = () => {
  return (
    <NavigationIndependentTree>
    <Stack.Navigator initialRouteName="Course" screenOptions={{ headerShown: false }}>
      <Stack.Screen 
          name="Course" 
          component={CourseScreen} 
        />
      <Stack.Screen 
        name="AddCourse" 
        component={AddCourse} 
      />
    </Stack.Navigator>
  </NavigationIndependentTree>
  );
}

export default CourseTabLayout