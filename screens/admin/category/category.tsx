import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Strings } from "@/constants/Strings";
import axiosInstance from '@/api/axiosInstance';
import { MyScreenProps } from '@/types/MyScreenProps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MessageAlert from "@/components/MessageAlert";
import AddCategory from '@/screens/admin/category/addCategory';
import UpdateCategory from '@/screens/admin/category/updateCategory';

import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/RootStackParamList";
const Stack = createNativeStackNavigator<RootStackParamList>();
type CategoryScreenProps = NativeStackScreenProps<RootStackParamList, "Category">;
import { Category } from '@/types/category';

// Define type for category


const CategoryScreen: React.FC<CategoryScreenProps> = ({ navigation, route }) => {
  // State for categories and UI
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`);
      if (response.status === 200) {
        console.log('fetch data categories successfull!');
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCategories(categories);
      return;
    }
    
    const filtered = categories.filter(category => 
      category.id.toString().includes(text) ||
      category.name.toLowerCase().includes(text.toLowerCase()) ||
      category.description.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Fetch categories when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, [])
  );

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle message from route params
  useEffect(() => {
    const routeMessage = route.params?.message;
    if (typeof routeMessage === 'string' && routeMessage.length > 0) {
      setMessage({ text: routeMessage, type: 'success' });
    }
  }, [route.params?.message]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (selectedCategory) {
      try {
        const response = await axiosInstance.delete(
          `${process.env.EXPO_PUBLIC_API_DELETE_CATEGORY}`.replace(":id", String(selectedCategory.id))
        );
        
        if (response.status === 200) {
          console.log('Delete item category successful!');
          const updatedCategories = categories.filter(cat => cat.id !== selectedCategory.id);
          setCategories(updatedCategories);
          
          // Giữ nguyên điều kiện tìm kiếm
          if (searchText.trim() === '') {
            setFilteredCategories(updatedCategories);
          } else {
            const filtered = updatedCategories.filter(category => 
              category.id.toString().includes(searchText) ||
              category.name.toLowerCase().includes(searchText.toLowerCase()) ||
              category.description.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredCategories(filtered);
          }
          
          setDeleteModalVisible(false);
          setSelectedCategory(null);
          setMessage({ text: Strings.categories.deleteSuccess, type: 'success' });
        } else {
          console.log(`Failed to delete item. Status: ${response.status}`);
          setMessage({ text: Strings.categories.deleteError, type: 'error' });
        }
      } catch (error) {
        console.error('Failed to delete item:', error);
        setMessage({ text: Strings.categories.deleteError, type: 'error' });
      }
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalVisible(true);
  };

  // Handle edit category (navigate to edit screen)
  const handleEditCategory = (category: Category) => {
    navigation.navigate('UpdateCategory', { categoryId: category.id });
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>ID: {item.id} - {item.name}</Text>
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
          onPress={() => confirmDelete(item)}
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

  // Add category button for header
  const AddCategoryButton = () => (
    <TouchableOpacity 
      style={styles.addButton} 
      onPress={handleAddCategory}
    >
      <Ionicons name="add" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    
    <View style={styles.container}>
      {/* Header with title and add button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{Strings.categories.title}</Text>
        <AddCategoryButton />
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
      
      {/* Categories list */}
      {loading ? (
        <Text style={styles.loadingText}>{Strings.categories.loading}...</Text>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
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
            <Text style={styles.modalTitle}>{Strings.categories.confirmDelete}</Text>
            <Text style={styles.modalMessage}>
              {Strings.categories.questionConfirmDelete} "{selectedCategory?.name}"?
              {Strings.categories.warningConfirmDelete}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{Strings.categories.cancelButton}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteConfirmButton]} 
                onPress={handleDeleteCategory}
              >
                <Text style={styles.deleteButtonText}>{Strings.categories.deleteButton}</Text>
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
      <Stack.Screen 
          name="Category" 
          component={CategoryScreen} 
        />
      <Stack.Screen 
        name="AddCategory" 
        component={AddCategory} 
      />
      <Stack.Screen 
        name="UpdateCategory" 
        component={UpdateCategory} 
      />
    </Stack.Navigator>
  </NavigationIndependentTree>
  );
}

export default CategoryTabLayout