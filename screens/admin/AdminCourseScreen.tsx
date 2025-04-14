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
import AddCourse from '@/screens/admin/course/AddCourseScreen';
import UpdateCourse from '@/screens/admin/course/UpdateCourseScreen';
import ViewCourse from '@/screens/admin/course/AdminViewCourseScreen';
import AddSection from './course/section/AddSectionScreen';
import UpdateSection from './course/section/UpdateSectionScreen';
import AddLesson from './course/section/lesson/AddLessonScreen';

import { Category, Course } from '@/types/apiModels';
import { deleteImagefromCloudinary } from '@/services/Cloudinary';
import DeleteModal from '@/components/deleteModal';

type AdminCourseScreenProps = NativeStackScreenProps<RootStackParamList, 'AdminCourseScreen'>;

const AdminCourseScreen: React.FC<AdminCourseScreenProps> = ({ navigation, route }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`);
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

  const fetchCourses = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_COURSES}`);
      if (response.status === 200) {
        const data = response.data.courses;
        setCourses(data);
        setFilteredCourses(data);
        filter(selectedCategory, searchText, data);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Lỗi', `Failed fetching courses: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, searchText, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
      fetchCourses();
    }, [fetchCourses])
  );

  const filterCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
    filter(categoryId, searchText, courses);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
    fetchCourses();
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
    navigation.navigate('UpdateCourseScreen', { courseId: course.id });
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
            onPress={() =>
              navigation.navigate('AdminViewCourseScreen', { courseId: Number(item.id) })
            }
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
        <Text style={styles.headerTitle}>Danh sách khóa học</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCourseScreen', { message: 'Hello' })}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={Strings.courses.searchPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
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

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6ee0" />
          <Text style={styles.loadingText}>{Strings.courses.loading}...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.courseList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy khóa học nào</Text>
            </View>
          }
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
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
export default AdminCourseScreen;
//const CourseTabLayout = () => {
//return (
//<NavigationIndependentTree>
/*<Stack.Navigator initialRouteName="AdminCourseScreen" screenOptions={{ headerShown: false }}>
  <Stack.Screen name="AdminCourseScreen" component={} />
  <Stack.Screen name="AddCourseScreen" component={AddCourse} />
  <Stack.Screen name="UpdateCourseScreen" component={UpdateCourse} />
  <Stack.Screen name="AdminViewCourseScreen" component={ViewCourseScreen} />
  <Stack.Screen name="AddSectionScreen" component={AddSection} />
  <Stack.Screen name="UpdateSectionScreen" component={UpdateSection} />
  <Stack.Screen name="AddLessonScreen" component={AddLesson} />
  <Stack.Screen name="UpdateLessonScreen" component={UpdateLesson} />
</Stack.Navigator>;
// </NavigationIndependentTree>
//);
//};*/
