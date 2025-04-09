import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Strings } from '@/constants/Strings';
import axiosInstance from '@/api/axiosInstance';
import { useFocusEffect } from '@react-navigation/native';
import AddCategory from '@/screens/admin/category/addCategory';
import UpdateCategory from '@/screens/admin/category/updateCategory';

import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/types/RootStackParamList';
import { Category } from '@/types/category';
import DeleteModal from '@/components/deleteModal';

const Stack = createNativeStackNavigator<RootStackParamList>();
type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'Category'>;

const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // State for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ category: Category } | undefined>(undefined);

  const filter = useCallback(
    (text: string, categories: Category[]) => {
      let filtered = categories;
      if (searchText.trim() === '') {
        setFilteredCategories(categories);
        return;
      }
      if (text.trim() !== '') {
        filtered = filtered.filter(
          category =>
            category.id.toString().includes(text) ||
            category.name.toLowerCase().includes(text.toLowerCase()) ||
            category.description.toLowerCase().includes(text.toLowerCase())
        );
      }
      setFilteredCategories(filtered);
    },
    [searchText]
  );

  useFocusEffect(
    useCallback(() => {
      const fetchCategories = async () => {
        try {
          const response = await axiosInstance.get(
            `${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`
          );
          if (response.status === 200) {
            setCategories(response.data.categories);
            setFilteredCategories(response.data.categories);
            filter(searchText, response.data.categories);
          } else {
            Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
          }
        } catch (error) {
          Alert.alert('Lỗi', `Failed fetching categories: ${error}`, [{ text: 'OK' }]);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }, [filter, searchText])
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCategories(categories);
      return;
    }
    filter(text, categories);
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
    navigation.navigate('UpdateCategory', { categoryId: category.id });
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
    navigation.navigate('AddCategory', {});
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

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={Strings.categories.searchPlaceholder}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>{Strings.categories.loading}...</Text>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
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
  messageContainer: {
    backgroundColor: '#4a6ee0',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
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

const CategoryTabLayout = () => {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Category" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="AddCategory" component={AddCategory} />
        <Stack.Screen name="UpdateCategory" component={UpdateCategory} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default CategoryTabLayout;
