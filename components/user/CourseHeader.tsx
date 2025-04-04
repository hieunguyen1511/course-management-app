import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

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

interface CourseHeaderProps {
  course: Course;
  onBackPress: () => void;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course, onBackPress }) => {
  const screenWidth = Dimensions.get("window").width;

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? "★" : "☆"}
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating ? rating.toFixed(1) : 0}</Text>
      </View>
    );
  };

  return (
    <View style={styles.headerContainer}>
      <Image
        source={{ uri: course.image }}
        style={[styles.headerImage, { width: screenWidth, height: 200 }]}
      />
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.name}</Text>
        <Text style={styles.categoryText}>{course.category.name}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.ratingInfo}>
            {renderRatingStars(course.total_rating)}
            {/* <Text style={styles.reviewCount}>
              ({course.enrollment_count} đánh giá)
            </Text> */}
          </View>
          <Text style={styles.studentCount}>
            {course.enrollment_count} học viên
          </Text>
        </View>
        <Text style={styles.description}>{course.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "white",
  },
  headerImage: {
    width: "100%",
    height: 200,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
  },
  courseInfo: {
    padding: 16,
    backgroundColor: "white",
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  categoryText: {
    color: "#dc2626",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    color: "#fbbf24",
    fontSize: 18,
    marginRight: 2,
  },
  ratingText: {
    color: "#4b5563",
    fontSize: 14,
    marginLeft: 8,
  },
  reviewCount: {
    color: "#4b5563",
    marginLeft: 8,
  },
  studentCount: {
    color: "#4b5563",
  },
  description: {
    color: "#4b5563",
    marginBottom: 16,
  },
});

export default CourseHeader; 