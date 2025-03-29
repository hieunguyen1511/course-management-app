import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image, TextInput } from 'react-native'
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
const Stack = createNativeStackNavigator<RootStackParamList>();
type CourseScreenProps = NativeStackScreenProps<RootStackParamList, "Course">;

// Define types for course
interface Category {
  id: number;
  name: string;
}

interface Course {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  total_rating: number;
  image: string;  
  price: number;
  discount: number;
  category: Category;
  enrollment_count: number;
}

const Course: React.FC<CourseScreenProps> = ({ navigation, route }) => {
  // State for courses and UI
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const filter = (text: string, cources: Course[]) => {
    const filtered = courses.filter(course => 
      course.id.toString().includes(text) ||
      course.name.toLowerCase().includes(text.toLowerCase()) ||
      course.description.toLowerCase().includes(text.toLowerCase()) ||
      course.category.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCourses(filtered);
  }

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCourses(courses);
      return;
    }
    filter(text, courses);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCourses();
    }, [])
  );
  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, []);

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
          `${process.env.EXPO_PUBLIC_API_DELETE_CATEGORY}`.replace(":id", String(selectedCourse.id))
        );
        
        if (response.status === 200) {
          console.log('Delete item category successful!');
          const updatedCourses = courses.filter(cat => cat.id !== selectedCourse.id);
          setCourses(updatedCourses);
          
          // Giữ nguyên điều kiện tìm kiếm
          if (searchText.trim() === '') {
            setFilteredCourses(updatedCourses);
          } else {
            filter(searchText, updatedCourses);
          }
          
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

  const handleViewCourse = (course: Course) => {
    console.log('View course:', course);
  }

  // Handle edit course (navigate to edit screen)
  const handleEditCourse = (course: Course) => {
    // In a real app, you would navigate to an edit screen
    console.log('Edit course:', course);
    // navigation.navigate('EditCourse', { courseId: course.id });
  };

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? '★' : '☆'}
          </Text>
        ))}
        <Text style={styles.ratingText}>
          {rating !== undefined && rating !== null ? rating.toFixed(1) : "N/A"}
        </Text>
      </View>
    );
  };

  // Render course item
  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.courseItem}>
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.name}</Text>
        <Text style={styles.categoryText}>Category: {item.category.name}</Text>
        
        <View style={styles.courseStats}>
          <View style={styles.priceContainer}>
            {item.discount > 0 && (
              <Text style={styles.originalPrice}>
                ${item.price.toFixed(2)}
              </Text>
            )}
            <Text style={styles.discountedPrice}>
              ${item.price && item.discount !== undefined
                ? (item.price * (1 - item.discount / 100)).toFixed(2)
                : item.price
                  ? item.price.toFixed(2)
                  : "N/A"}
            </Text>
          </View>
          <Text style={styles.enrollmentText}>{item.enrollment_count} students</Text>
          {renderRatingStars(item.total_rating)}
        </View>
      </View>
      
      <View style={styles.actions}>
        {/* Nút Xem */}
        <TouchableOpacity 
          style={[styles.iconButton, styles.viewButton]} 
          onPress={() => handleViewCourse(item)}
        >
          <Ionicons name="eye-outline" size={20} color="#2c9e69" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, styles.editButton]} 
          onPress={() => handleEditCourse(item)}
        >
          <Ionicons name="create-outline" size={20} color="#4a6ee0" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.iconButton, styles.deleteButton]} 
          onPress={() => confirmDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#e04a4a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Add course button for header
  const AddCourseButton = () => (
    <TouchableOpacity style={styles.addButton}>
      <Ionicons name="add" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with title and add button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{Strings.courses.title}</Text>
        <AddCourseButton />
      </View>

      {message && (
        <MessageAlert
          message={message.text}
          type={message.type}
          onHide={() => setMessage(null)}
        />
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={Strings.courses.searchPlaceholder}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Courses list */}
      {loading ? (
        <Text style={styles.loadingText}>{Strings.courses.loading}...</Text>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Delete confirmation modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{Strings.courses.confirmDelete}</Text>
            <Text style={styles.modalMessage}>
            {Strings.courses.questionConfirmDelete} "{selectedCourse?.name}"?
            {Strings.courses.warningConfirmDelete}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteConfirmButton]} 
                onPress={handleDeleteCourse}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4a6ee0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  courseItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  instructorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#4a6ee0',
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'line-through', // Gạch ngang giá gốc
    marginRight: 6,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c9e69', // Màu xanh nổi bật
  },
  discountPercentage: {
    fontSize: 12,
    color: '#d9534f', // Màu đỏ để nhấn mạnh giảm giá
    marginLeft: 6,
  },
  enrollmentText: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#ffb100',
    fontSize: 14,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  viewButton: {
    backgroundColor: '#e8f6f0',
  },
  editButton: {
    backgroundColor: '#e8f0fe',
  },
  deleteButton: {
    backgroundColor: '#fee8e8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  deleteConfirmButton: {
    backgroundColor: '#e04a4a',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
  },
});

// const CourseTabLayout = () => {
//   return (
//     <NavigationIndependentTree>
//     <Stack.Navigator initialRouteName="Course" screenOptions={{ headerShown: false }}>
//       <Stack.Screen 
//           name="Course" 
//           component={Course} 
//         />
//       <Stack.Screen 
//         name="AddCategory" 
//         component={AddCategory} 
//       />
//       <Stack.Screen 
//         name="UpdateCategory" 
//         component={UpdateCategory} 
//       />
//     </Stack.Navigator>
//   </NavigationIndependentTree>
//   );
// }

export default Course