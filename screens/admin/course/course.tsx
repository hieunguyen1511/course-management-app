import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { NavigationIndependentTree, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';
import AddCourse from '@/screens/admin/course/addCourse';
import UpdateCourse from '@/screens/admin/course/updateCourse';
import ViewCourse from '@/screens/admin/course/viewCourse';
import AddSection from './section/addSection';
import UpdateSection from './section/updateSection';
import AddLesson from './section/lesson/addLesson';
import UpdateLesson from './section/lesson/updateLesson';

import { Category } from '@/types/category';
import { Course } from '@/types/course';
import { deleteImagefromCloudinary } from '@/components/Cloudinary';
import DeleteModal from '@/components/deleteModal';

const Stack = createNativeStackNavigator<RootStackParamList>();
type CourseScreenProps = NativeStackScreenProps<RootStackParamList, 'Course'>;

const CourseScreen: React.FC<CourseScreenProps> = ({ navigation, route }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});

  // State for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ course: Course } | undefined>(undefined);

  const filter = useCallback(
    (categoryId: number, text: string, courses: Course[]) => {
      let filtered = courses;

      if (searchText.trim() === '' && categoryId === 0) {
        setFilteredCourses(courses);
        return;
      }
      if (categoryId !== 0) {
        filtered = filtered.filter(course => course.category.id === categoryId);
      }

      if (text.trim() !== '') {
        filtered = filtered.filter(
          course =>
            course.id.toString().includes(text) ||
            course.name.toLowerCase().includes(text.toLowerCase()) ||
            course.description.toLowerCase().includes(text.toLowerCase())
        );
      }

      setFilteredCourses(filtered);
    },
    [searchText]
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetchCategories = async () => {
        try {
          const response = await axiosInstance.get(
            `${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`
          );
          if (response.status === 200) {
            const allCategory: Category = {
              id: 0,
              name: 'Tất cả',
              description: 'Hiển thị tất cả khóa học',
              courseCount: 0,
            };
            setCategories([allCategory, ...response.data.categories]);
          } else {
            console.log(`Failed to fetch. Status: ${response.status}`);
            Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          Alert.alert('Lỗi', `Failed fetching categories: ${error}`, [{ text: 'OK' }]);
        }
      };

      const fetchCourses = async () => {
        try {
          const response = await axiosInstance.get(
            `${process.env.EXPO_PUBLIC_API_GET_ALL_COURSES}`
          );
          if (response.status === 200) {
            console.log('fetch data cources successfull!');
            setCourses(response.data.courses);
            setFilteredCourses(response.data.courses);
            filter(selectedCategory, searchText, response.data.courses);
          } else {
            console.log(`Failed to fetch. Status: ${response.status}`);
            Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
          }
        } catch (error) {
          console.error('Error fetching courses:', error);
          Alert.alert('Lỗi', `Failed fetching courses: ${error}`, [{ text: 'OK' }]);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
      fetchCourses();
    }, [filter, searchText, selectedCategory])
  );

  const filterCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
    filter(categoryId, searchText, courses);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCourses(courses);
      return;
    }
    filter(selectedCategory, text, courses);
  };

  const handleDelete = (course: Course) => {
    setItemToDelete({ course: course });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_COURSE}`.replace(
          ':id',
          String(itemToDelete.course.id)
        )
      );
      if (response.status === 200) {
        if (itemToDelete.course.image) {
          const response = await deleteImagefromCloudinary(itemToDelete.course.image);
          if (!response) {
            Alert.alert('Lỗi', 'Không thể xoá ảnh khỏi Cloudinary');
          }
        }
        const updatedCourses = courses.filter(cat => cat.id !== itemToDelete.course.id);
        setCourses(updatedCourses);
        filter(selectedCategory, searchText, updatedCourses);
        setDeleteModalVisible(false);
        Alert.alert('Thành công', Strings.courses.deleteSuccess, [{ text: 'OK' }]);
      } else {
        console.log(`Failed to delete item. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to delete item. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      Alert.alert('Lỗi', Strings.courses.deleteError, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setItemToDelete(undefined);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(undefined);
  };

  const handleEditCourse = (course: Course) => {
    navigation.navigate('UpdateCourse', { courseId: course.id });
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    return (
      <View style={styles.courseCard}>
        <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
          {loadingMap[item.id] && (
            <ActivityIndicator
              size="small"
              color="#4a6ee0"
              style={{ position: 'absolute', zIndex: 1 }}
            />
          )}

          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.courseImage}
              onLoadStart={() => setLoadingMap(prev => ({ ...prev, [item.id]: true }))}
              onLoad={() => setLoadingMap(prev => ({ ...prev, [item.id]: false }))}
              onError={() => setLoadingMap(prev => ({ ...prev, [item.id]: false }))}
            />
          )}
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{item.name}</Text>
          <Text style={styles.courseCategory}>{item.category.name}</Text>
          <Text style={styles.courseDescription} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.statusContainer}>
            <Ionicons
              name={item.status === 0 ? 'close-circle' : 'checkmark-circle'}
              size={16}
              color={item.status === 0 ? 'red' : 'green'}
            />
            <Text style={[styles.courseStatus, { color: item.status === 0 ? 'red' : 'green' }]}>
              {item.status === 0 ? 'Không hoạt động' : 'Hoạt động'}
            </Text>
          </View>

          <View style={styles.courseDetails}>
            {item.discount !== 0 ? (
              <Text style={styles.coursePrice}>
                <Text style={[styles.oldPrice, { textDecorationLine: 'line-through' }]}>
                  {item.price.toLocaleString('vi-VN')}đ
                </Text>{' '}
                <Text style={styles.discountedPrice}>
                  {(item.price * (1 - item.discount / 100)).toLocaleString('vi-VN')}đ
                </Text>{' '}
                <Text style={styles.discountText}>(-{item.discount}%)</Text>{' '}
              </Text>
            ) : (
              <Text style={styles.coursePrice}>
                {item.price === 0 ? 'Miễn phí ' : `${item.price.toLocaleString('vi-VN')}đ`}{' '}
              </Text>
            )}

            <Text style={styles.courseStudents}>{`${item.enrollment_count} học viên`}</Text>

            {item.total_rating != null && item.total_rating !== 0 && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
                <Text style={styles.courseRating}>{item.total_rating}</Text>
              </View>
            )}
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
            onPress={() => handleEditCourse(item)}
          >
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
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

      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => filterCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>{Strings.courses.loading}...</Text>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.courseList}
          showsVerticalScrollIndicator={false}
        />
      )}
      <DeleteModal
        visible={deleteModalVisible}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa khóa học "${itemToDelete?.course.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  categoryWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryContainer: {
    padding: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
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
  oldPrice: {
    textDecorationLine: 'line-through',
    color: 'gray',
    fontSize: 14,
  },
  discountedPrice: {
    color: 'red',
  },
  discountText: {
    color: 'green',
    fontSize: 14,
    fontWeight: 'bold',
  },
  courseStudents: {
    marginRight: 8,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  courseStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },

  starIcon: {
    marginRight: 4,
  },
});

const CourseTabLayout = () => {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Course" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Course" component={CourseScreen} />
        <Stack.Screen name="AddCourse" component={AddCourse} />
        <Stack.Screen name="UpdateCourse" component={UpdateCourse} />
        <Stack.Screen name="ViewCourse" component={ViewCourse} />
        <Stack.Screen name="AddSection" component={AddSection} />
        <Stack.Screen name="UpdateSection" component={UpdateSection} />
        <Stack.Screen name="AddLesson" component={AddLesson} />
        <Stack.Screen name="UpdateLesson" component={UpdateLesson} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default CourseTabLayout;
