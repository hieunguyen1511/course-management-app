import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';

interface Enrollment {
  id: string;
  courseId: string;
  courseName: string;
  category: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  thumbnail: string;
}

const UserViewAllEnrollment: React.FC<MyScreenProps['UserViewAllEnrollmentScreenProps']> = ({
  navigation,
  route,
}) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch enrollments
    setTimeout(() => {
      setEnrollments([
        {
          id: '1',
          courseId: '1',
          courseName: 'React Native Cơ Bản',
          category: 'Lập trình di động',
          enrollmentDate: '2024-03-15',
          status: 'active',
          progress: 60,
          thumbnail: 'https://via.placeholder.com/150',
        },
        {
          id: '2',
          courseId: '2',
          courseName: 'JavaScript Nâng Cao',
          category: 'Lập trình Web',
          enrollmentDate: '2024-03-10',
          status: 'completed',
          progress: 100,
          thumbnail: 'https://via.placeholder.com/150',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDelete = (enrollmentId: string) => {
    Alert.alert('Xác nhận hủy đăng ký', 'Bạn có chắc chắn muốn hủy đăng ký khóa học này?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xác nhận',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement API call to delete enrollment
          setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    Alert.alert('Xác nhận hủy tất cả', 'Bạn có chắc chắn muốn hủy đăng ký tất cả các khóa học?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xác nhận',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement API call to delete all enrollments
          setEnrollments([]);
        },
      },
    ]);
  };

  const getStatusColor = (status: Enrollment['status']) => {
    switch (status) {
      case 'active':
        return '#4a6ee0';
      case 'completed':
        return '#2c9e69';
      case 'cancelled':
        return '#e04a4a';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: Enrollment['status']) => {
    switch (status) {
      case 'active':
        return 'Đang học';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải danh sách khóa học...</Text>
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
        <Text style={styles.headerTitle}>Khóa học của tôi</Text>
      </View>

      {/* Enrollment List */}
      <ScrollView style={styles.content}>
        {enrollments.map(enrollment => (
          <TouchableOpacity
            key={enrollment.id}
            style={styles.enrollmentCard}
            onPress={() =>
              navigation.navigate('UserDetailCourseScreen', {
                courseId: parseInt(enrollment.courseId),
                enrollmentId: parseInt(enrollment.id),
              })
            }
          >
            <View style={styles.enrollmentContent}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName} numberOfLines={2}>
                  {enrollment.courseName}
                </Text>
                <Text style={styles.category}>{enrollment.category}</Text>
                <Text style={styles.enrollmentDate}>
                  Ngày đăng ký: {new Date(enrollment.enrollmentDate).toLocaleDateString('vi-VN')}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, { color: getStatusColor(enrollment.status) }]}>
                  {getStatusText(enrollment.status)}
                </Text>
                {enrollment.status === 'active' && (
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${enrollment.progress}%` }]} />
                    <Text style={styles.progressText}>{enrollment.progress}%</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(enrollment.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#e04a4a" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteAllButton: {
    padding: 8,
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
  enrollmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enrollmentContent: {
    flex: 1,
  },
  courseInfo: {
    marginBottom: 12,
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
    marginBottom: 4,
  },
  enrollmentDate: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a6ee0',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
});

export default UserViewAllEnrollment;
