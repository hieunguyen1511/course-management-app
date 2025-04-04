import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';

interface Course {
  id: string;
  courseId: string;
  courseName: string;
  category: string;
  thumbnail: string;
  rating: number;
  comment: string;
}

const UserRating: React.FC<MyScreenProps['UserRatingScreenProps']> = ({ navigation, route }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch completed courses
    setTimeout(() => {
      setCourses([
        {
          id: '1',
          courseId: '1',
          courseName: 'React Native Cơ Bản',
          category: 'Lập trình di động',
          thumbnail: 'https://via.placeholder.com/150',
          rating: 0,
          comment: '',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRating = (courseId: string, rating: number) => {
    setCourses(prev =>
      prev.map(course => (course.id === courseId ? { ...course, rating } : course))
    );
  };

  const handleComment = (courseId: string, comment: string) => {
    setCourses(prev =>
      prev.map(course => (course.id === courseId ? { ...course, comment } : course))
    );
  };

  const handleSubmit = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course?.rating) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!course?.comment.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nhận xét');
      return;
    }

    // TODO: Implement API call to submit rating
    Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá khóa học!', [
      {
        text: 'OK',
        onPress: () => {
          setCourses(prev => prev.filter(c => c.id !== courseId));
        },
      },
    ]);
  };

  const renderStars = (courseId: string, currentRating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => handleRating(courseId, star)}>
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={24}
              color="#ffb100"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải danh sách khóa học...</Text>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={64} color="#4a6ee0" />
        <Text style={styles.emptyText}>Bạn đã đánh giá tất cả các khóa học!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá khóa học</Text>
      </View>

      {/* Course List */}
      <ScrollView style={styles.content}>
        {courses.map(course => (
          <View key={course.id} style={styles.courseCard}>
            <View style={styles.courseInfo}>
              <Text style={styles.courseName} numberOfLines={2}>
                {course.courseName}
              </Text>
              <Text style={styles.category}>{course.category}</Text>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
              {renderStars(course.id, course.rating)}
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Nhận xét:</Text>
              <TextInput
                style={styles.commentInput}
                value={course.comment}
                onChangeText={text => handleComment(course.id, text)}
                placeholder="Nhập nhận xét của bạn về khóa học..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit(course.id)}>
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseInfo: {
    marginBottom: 16,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentSection: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4a6ee0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserRating;
