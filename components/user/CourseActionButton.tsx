import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Course {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  image: string;
  total_rating: number;
  enrollment_count: number;
  category: {
    id: number;
    name: string;
  };
}

interface CourseActionButtonProps {
  course: Course;
  isEnrolled: boolean;
  onEnroll: () => void;
  onContinue: () => void;
}

const CourseActionButton: React.FC<CourseActionButtonProps> = ({
  course,
  isEnrolled,
  onEnroll,
  onContinue,
}) => {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.priceContainer}>
        {course.discount > 0 ? (
          <View style={styles.discountPriceContainer}>
            <Text style={styles.discountPrice}>{formatPrice(course.price - course.discount)}</Text>
            <Text style={styles.originalPrice}>{formatPrice(course.price)}</Text>
          </View>
        ) : (
          <Text style={styles.price}>{formatPrice(course.price)}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={isEnrolled ? onContinue : onEnroll}>
        <Text style={styles.actionButtonText}>
          {isEnrolled ? 'Tiếp tục học' : course.price === 0 ? 'Đăng ký ngay' : 'Mua ngay'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  originalPrice: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default CourseActionButton;
