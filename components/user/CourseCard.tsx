import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { StyleSheet } from "react-native";
import { Strings } from "@/constants/Strings";

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
    category: {
      id: number;
      name: string;
    };
  }

const CourseCard: React.FC<{
  course: Course;
  onPress: () => void;
  renderRatingStars: (rating: number) => React.ReactNode;
}> = ({ course, onPress, renderRatingStars }) => (
  <TouchableOpacity style={styles.courseCard} onPress={onPress}>
    <Image
      source={require("../../assets/images/course.jpg")}
      style={styles.courseImage}
    />
    <View style={styles.courseCardContent}>
      <Text style={styles.courseCardTitle} numberOfLines={2}>
        {course.name}
      </Text>
      <Text style={{ color: "#cf3f3f" }}>{course.category.name}</Text>
      <Text style={styles.instructorName} numberOfLines={1}>
        {course.description}
      </Text>
      <View style={styles.courseCardFooter}>
        {course.price > 0 ? (
          course.discount > 0 ? (
            <Text style={styles.priceText}>
              {course.price * (1 - course.discount / 100)}{" "}
              {Strings.course_section.currency_vnd}{" "}
              <Text
                style={{ textDecorationLine: "line-through", color: "#999" }}
              >
                {course.price.toFixed(0)} {Strings.course_section.currency_vnd}
              </Text>
            </Text>
          ) : (
            <Text style={styles.priceText}>
              {course.price.toFixed(0)} {Strings.course_section.currency_vnd}
            </Text>
          )
        ) : (
          <Text style={styles.priceText}>
            {Strings.course_section.free_courses}
          </Text>
        )}
      </View>
      <View style={styles.ratingContainer}>
        {renderRatingStars(course.total_rating || 0)}
      </View>
    </View>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  courseCard: {
    width: 180,
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 5,
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
    marginBottom: 4,
    height: 40,
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
  instructorName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  courseCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
});

export default CourseCard;
