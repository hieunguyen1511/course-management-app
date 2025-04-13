import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { ToastType } from '@/components/NotificationToast';
import NotificationToast from '@/components/NotificationToast';

interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  total_lesson: number;
  complete_lesson: number;
  price: number;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
  course: {
    id: number;
    name: string;
    description: string;
    category: {
      id: number;
      name: string;
    };
  };
}

async function updateEnrollmentRating(enrollmentId: number, rating: number, review: string) {
  try {
    const response = await axiosInstance.post(
      `${process.env.EXPO_PUBLIC_API_UPDATE_ENROLLMENT_WITH_RATING_REVIEW}`,
      {
        id: enrollmentId,
        rating: rating,
        review: review,
      }
    );
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to update enrollment rating');
    }
  } catch (error) {
    console.error('Error updating enrollment rating:', error);
    throw error;
  }
}

async function getEnrollment(enrollmentId: number) {
  try {
    let url = `${process.env.EXPO_PUBLIC_API_GET_ENROLLMENT_BY_ID}`.replace(
      ':id',
      enrollmentId.toString()
    );
    const response = await axiosInstance.get(url);
    if (response.status === 200) {
      return response.data.enrollment;
    } else {
      throw new Error('Failed to fetch enrollment data');
    }
  } catch (error) {
    console.error('Error fetching enrollment data:', error);
    return null;
  }
}

const UserRatingScreen: React.FC<MyScreenProps['UserRatingScreenProps']> = ({
  navigation,
  route,
}) => {
  const { enrollmentId = 1 } = route.params || {};
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, [enrollmentId]);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      const data = await getEnrollment(enrollmentId);
      if (data) {
        setEnrollment(data);
        if (data.rating) {
          setRating(data.rating);
        }
        if (data.review) {
          setReview(data.review);
        }
      } else {
        showToast('Không thể tải thông tin khóa học', ToastType.ERROR);
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      showToast('Có lỗi xảy ra khi tải dữ liệu', ToastType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (!rating) {
      showToast('Vui lòng chọn số sao đánh giá', ToastType.INFO);
      return;
    }
    if (!review.trim()) {
      showToast('Vui lòng nhập nhận xét', ToastType.INFO);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateEnrollmentRating(enrollmentId, rating, review);
      showToast('Cảm ơn bạn đã đánh giá khóa học!', ToastType.SUCCESS);
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('Có lỗi xảy ra khi gửi đánh giá', ToastType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRating(star)}
            disabled={enrollment?.rating !== null}
          >
            <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={24} color="#ffb100" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Đang tải thông tin khóa học...</Text>
      </View>
    );
  }

  if (!enrollment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không thể tải thông tin khóa học</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchEnrollmentData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
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

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.courseCard}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseName} numberOfLines={2}>
              {enrollment.course.name}
            </Text>
            <Text style={styles.category}>{enrollment.course.category.name}</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Đánh giá của bạn:</Text>
            {renderStars()}
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Nhận xét:</Text>
            <TextInput
              style={styles.commentInput}
              value={review}
              onChangeText={setReview}
              placeholder="Nhập nhận xét của bạn về khóa học..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              editable={enrollment.rating === null}
            />
          </View>

          {enrollment.rating === null && (
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4a6ee0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserRatingScreen;
