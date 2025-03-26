import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Strings } from "@/constants/Strings";
import axiosInstance from '@/api/axiosInstance';

// Define type for category
interface Category {
  id: number;
  name: string;
  description: string;
  courseCount: number;
}
const CategoryScreen = () => {
  // State for categories and UI
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        axiosInstance
        .get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`, {

        })
        .then((res) => {
          try {
            if (res.status === 200) {
              console.log('fetch data categories successfull!');
              setCategories(res.data.categories); // Giả sử API trả về danh sách categories
            }
            else {
              console.log(`Failed to fetch. Status: ${res.status}`);
            }
          }
          catch (error) {
            console.error('Error fetching categories:', error);
          }
        })
      }
      catch (error) {
        console.error('Error fetching categories:', error);
      }
      finally {
        setLoading(false);
      }
    };
    fetchCategories();
    
    // Mock data - replace with actual API call
    // setTimeout(() => {
    //   setCategories([
    //     { id: 1, name: 'Programming', description: 'Software development courses', courseCount: 12 },
    //     { id: 2, name: 'Design', description: 'UI/UX and graphic design', courseCount: 8 },
    //     { id: 3, name: 'Marketing', description: 'Digital marketing strategies', courseCount: 5 },
    //     { id: 4, name: 'Business', description: 'Entrepreneurship and management', courseCount: 7 },
    //     { id: 5, name: 'Data Science', description: 'Data analysis and machine learning', courseCount: 9 },
    //   ]);
    //   setLoading(false);
    // }, 1000);
  }, []);

  // Handle delete category
  const handleDeleteCategory = () => {
    if (selectedCategory) {
      // In production, make API call to delete

      const deleteCategory = async () => {
        try {
          axiosInstance
          .delete(`${process.env.EXPO_PUBLIC_API_DELETE_CATEGORY}`.replace(":id", String(selectedCategory.id)), {
          })
          .then((res) => {
            try {
              if (res.status === 200) {
                console.log('Delete item category successfull!');
              }
              else {
                console.log(`Failed to delete item. Status: ${res.status}`);
              }
            }
            catch (error) {
              console.error('Failed to delete item:', error);
            }
          })
        }
        catch (error) {
          console.error('Failed to delete item:', error);
        }
      };
      deleteCategory();

      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      setDeleteModalVisible(false);
      setSelectedCategory(null);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteModalVisible(true);
  };

  // Handle edit category (navigate to edit screen)
  const handleEditCategory = (category: Category) => {
    // In a real app, you would navigate to an edit screen
    console.log('Edit category:', category);
    // navigation.navigate('EditCategory', { categoryId: category.id });
  };

  // Render category item
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
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

  // Add category button for header
  const AddCategoryButton = () => (
    <TouchableOpacity style={styles.addButton}>
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
      
      {/* Categories list */}
      {loading ? (
        <Text style={styles.loadingText}>{Strings.categories.loading}...</Text>
      ) : (
        <FlatList
          data={categories}
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
  }
});

export default CategoryScreen