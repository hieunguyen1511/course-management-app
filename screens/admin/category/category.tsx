import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Strings } from '@/constants/Strings';
import axiosInstance from '@/api/axiosInstance';
import AddCategory from '@/screens/admin/category/addCategory';
import UpdateCategory from '@/screens/admin/category/updateCategory';

import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/RootStackParamList';
import { Category } from '@/types/apiModels';
import DeleteModal from '@/components/deleteModal';

const Stack = createNativeStackNavigator<RootStackParamList>();
type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'CategoryScreen'>;

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ category: Category } | undefined>(undefined);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`);
      if (response.status === 200) {
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories);
      } else {
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Lỗi', `Failed fetching categories: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        category =>
          category.id.toString().includes(searchText) ||
          category.name.toLowerCase().includes(searchText.toLowerCase()) ||
          category.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchText, categories]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleDelete = (category: Category) => {
    setItemToDelete({ category: category });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_CATEGORY}`.replace(
          ':id',
          String(itemToDelete.category.id)
        )
      );

      if (response.status === 200) {
        const updatedCategories = categories.filter(cat => cat.id !== itemToDelete.category.id);
        setCategories(updatedCategories);

        if (searchText.trim() === '') {
          setFilteredCategories(updatedCategories);
        } else {
          const filtered = updatedCategories.filter(
            category =>
              category.id.toString().includes(searchText) ||
              category.name.toLowerCase().includes(searchText.toLowerCase()) ||
              category.description.toLowerCase().includes(searchText.toLowerCase())
          );
          setFilteredCategories(filtered);
        }

        setDeleteModalVisible(false);
        Alert.alert('Thành công', Strings.categories.deleteSuccess, [{ text: 'OK' }]);
      } else {
        console.error(`Failed to delete item. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to delete item. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      Alert.alert('Lỗi', Strings.categories.deleteError, [{ text: 'OK' }]);
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

  const handleEditCategory = (category: Category) => {
    navigation.navigate('UpdateCategoryScreen', { categoryId: category.id });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>
          ID: {item.id} - {item.name}
        </Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.courseCount}>{item.courseCount} courses</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => handleEditCategory(item)}
        >
          <Ionicons name="create-outline" size={20} color="#4a6ee0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#e04a4a" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddCategory = () => {
    console.log(navigation.getState());
    navigation.navigate('AddCategoryScreen', {});
  };

  const AddCategoryButton = () => (
    <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
      <Ionicons name="add" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{Strings.categories.title}</Text>
        <AddCategoryButton />
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={Strings.categories.searchPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6ee0" />
          <Text style={styles.loadingText}>{Strings.categories.loading}...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="pricetags-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy chủ đề nào</Text>
            </View>
          }
        />
      )}
      <DeleteModal
        visible={deleteModalVisible}
        title={Strings.categories.confirmDelete}
        message={`${Strings.categories.questionConfirmDelete} ${itemToDelete?.category?.name}? ${Strings.categories.warningConfirmDelete}`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

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
  listContainer: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseCount: {
    fontSize: 12,
    color: '#4a6ee0',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#e8f0fe',
  },
  deleteButton: {
    backgroundColor: '#fee8e8',
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
});

const CategoryTabLayout = () => {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="CategoryScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
        <Stack.Screen name="AddCategoryScreen" component={AddCategory} />
        <Stack.Screen name="UpdateCategoryScreen" component={UpdateCategory} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default CategoryTabLayout;
