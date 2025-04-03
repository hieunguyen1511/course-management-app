import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Course } from '@/types/Course';
import { Strings } from '@/constants/Strings';

interface CourseCardProps {
  course: Course;
  onPress?: (course: Course) => void;
  renderRatingStars?: (rating: number) => React.ReactNode;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, renderRatingStars }) => {
  const formatPrice = (price: number): string => {
    if (price === 0) return "Miễn phí";
    return `${price.toLocaleString("vi-VN")}đ`;
  };

  return (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => onPress?.(course)}
    >
      <Image 
        source={
          course.image 
            ? { uri: course.image }
            : require("../../assets/images/course.jpg")
        } 
        style={styles.courseImage} 
      />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle} numberOfLines={2}>
          {course.name}
        </Text>
        <Text style={styles.courseCardDescription}>
          {course.description.substring(0, 25)+"..." }
        </Text>

        <Text style={styles.categoryText}>
          {course.category?.name}
        </Text>
        <View style={styles.courseCardFooter}>
          <View>
            {course.price === 0 ? (
              <Text style={styles.priceText}>{Strings.course_section.free_courses}</Text>
            ) : course.discount > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.priceText}>
                  {formatPrice(course.price - course.discount)}
                </Text>
                <Text style={[styles.priceText, { 
                  textDecorationLine: 'line-through',
                  color: '#666',
                  fontSize: 12,
                  marginLeft: 4
                }]}>
                  {formatPrice(course.price)}
                </Text>
              </View>
            ) : (
              <Text style={styles.priceText}>
                {formatPrice(course.price)}
              </Text>
            )}
          </View>
         
        </View>
        <View style={styles.ratingContainer}>
            {renderRatingStars ? renderRatingStars(course.total_rating) : (
              <>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={styles.starIcon}>
                    {course.total_rating >= star ? "★" : "☆"}
                  </Text>
                ))}
                <Text style={styles.ratingText}>{course.total_rating?course.total_rating.toFixed(1):0}</Text>
              </>
            )}
          </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    width: 180,
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  courseCardContent: {
    padding: 10,
  },
  courseCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 0,
  },
  courseCardDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },

  categoryText: {
    fontSize: 12,
    color: "#e04a4a",
    marginBottom: 5,
    fontWeight: "500",
  },
  courseCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c9e69",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    color: "#ffb100",
    fontSize: 12,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 2,
  },
});

export default CourseCard;
