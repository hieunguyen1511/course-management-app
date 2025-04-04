import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Define types for course
interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  price: number;
  enrollments: number;
  rating: number;
  image: string;
}

const CourseScreen = () => {
  // State for courses and UI
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch courses
  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setCourses([
        {
          id: 1,
          title: 'React Native Fundamentals',
          instructor: 'John Doe',
          category: 'Programming',
          price: 49.99,
          enrollments: 125,
          rating: 4.7,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: 2,
          title: 'UI/UX Design Principles',
          instructor: 'Sarah Smith',
          category: 'Design',
          price: 39.99,
          enrollments: 98,
          rating: 4.5,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: 3,
          title: 'Digital Marketing Strategies',
          instructor: 'Michael Brown',
          category: 'Marketing',
          price: 29.99,
          enrollments: 67,
          rating: 4.2,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: 4,
          title: 'Business Management 101',
          instructor: 'Lisa Johnson',
          category: 'Business',
          price: 59.99,
          enrollments: 45,
          rating: 4.8,
          image: 'https://via.placeholder.com/100',
        },
        {
          id: 5,
          title: 'Data Science & ML Basics',
          instructor: 'Robert Wilson',
          category: 'Data Science',
          price: 69.99,
          enrollments: 112,
          rating: 4.6,
          image: 'https://via.placeholder.com/100',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle delete course
  const handleDeleteCourse = () => {
    if (selectedCourse) {
      // In production, make API call to delete
      setCourses(courses.filter(course => course.id !== selectedCourse.id));
      setDeleteModalVisible(false);
      setSelectedCourse(null);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (course: Course) => {
    setSelectedCourse(course);
    setDeleteModalVisible(true);
  };

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
        {[1, 2, 3, 4, 5].map(star => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? '★' : '☆'}
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  // Render course item
  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.courseItem}>
      <Image source={{ uri: item.image }} style={styles.courseImage} />

      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <Text style={styles.instructorText}>By {item.instructor}</Text>
        <Text style={styles.categoryText}>Category: {item.category}</Text>

        <View style={styles.courseStats}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
          <Text style={styles.enrollmentText}>{item.enrollments} students</Text>
          {renderRatingStars(item.rating)}
        </View>
      </View>

      <View style={styles.actions}>
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
        <Text style={styles.headerTitle}>Courses</Text>
        <AddCourseButton />
      </View>

      {/* Courses list */}
      {loading ? (
        <Text style={styles.loadingText}>Loading courses...</Text>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id.toString()}
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
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete the course "{selectedCourse?.title}"? This action
              cannot be undone.
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
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c9e69',
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
});

export default CourseScreen;
