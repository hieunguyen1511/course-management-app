import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

interface User {
  id: number;
  fullname: string;
  username: string;
  avatar: string;
}
interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}


interface CourseReviewsProps {
  enrollments: Enrollment[];
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ enrollments }) => {
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

  const renderReview = ({ item }: { item: Enrollment }) => (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.user.username.charAt(0)}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewerName}>{item.user.username}</Text>
          {item.rating && renderRatingStars(item.rating)}
        </View>
      </View>
      {item.review && <Text style={styles.reviewComment}>{item.review}</Text>}
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={enrollments.filter((e) => e.review)}
      renderItem={renderReview}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#4b5563",
    fontWeight: "bold",
  },
  reviewInfo: {
    marginLeft: 12,
  },
  reviewerName: {
    fontWeight: "bold",
    color: "#1f2937",
  },
  reviewComment: {
    color: "#4b5563",
    marginTop: 8,
  },
  reviewDate: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
  },
  ratingContainer: {
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
});

export default CourseReviews; 