import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MyScreenProps } from "@/types/MyScreenProps";
import { RootStackParamList } from "@/types/RootStackParamList";

interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  duration: string;
  isCompleted?: boolean;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

// Mock data for testing
const mockCourse = {
  id: 1,
  title: "Complete React Native Developer Course",
  category: "Programming",
  description:
    "Learn React Native by building real-world applications. This comprehensive course covers everything from the basics to advanced topics, including Redux, Navigation, and API integration.",
  price: 99.99,
  discount: 20,
  rating: 4.8,
  totalStudents: 1234,
  totalReviews: 456,
  instructor: "John Doe",
  image: "course-image.jpg",
  sections: [
    {
      id: 1,
      title: "Getting Started",
      lessons: [
        {
          id: 1,
          title: "Introduction to React Native",
          duration: "10:30",
          isCompleted: true,
        },
        { id: 2, title: "Setting Up Your Environment", duration: "15:45" },
        { id: 3, title: "Your First App", duration: "20:15" },
      ],
    },
    {
      id: 2,
      title: "Core Concepts",
      lessons: [
        { id: 4, title: "Components and Props", duration: "25:00" },
        { id: 5, title: "State Management", duration: "30:20" },
        { id: 6, title: "Navigation Basics", duration: "22:15" },
      ],
    },
  ],
};

const mockReviews: Review[] = [
  {
    id: 1,
    userName: "Alice Smith",
    rating: 5,
    comment: "Excellent course! Very well explained and practical examples.",
    date: "2024-03-15",
  },
  {
    id: 2,
    userName: "Bob Johnson",
    rating: 4,
    comment: "Good content but some sections could be more detailed.",
    date: "2024-03-10",
  },
];

const DetailCourse: React.FC<MyScreenProps["DetailCourseScreenProps"]> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<"content" | "reviews">("content");
  const screenWidth = Dimensions.get("window").width;

  const renderRatingStars = (rating: number) => {
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} className="text-yellow-400 text-lg mr-0.5">
            {rating >= star ? "★" : "☆"}
          </Text>
        ))}
        <Text className="text-gray-600 text-sm ml-2">{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const renderSection = ({ item }: { item: Section }) => (
    <View className="mb-4 bg-white rounded-lg p-4">
      <Text className="text-lg font-bold text-gray-800 mb-2">{item.title}</Text>
      {item.lessons.map((lesson) => (
        <View
          key={lesson.id}
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
        >
          <View className="flex-row items-center flex-1">
            {lesson.isCompleted ? (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            ) : (
              <Ionicons name="play-circle-outline" size={20} color="#666" />
            )}
            <Text className="ml-3 text-gray-700 flex-1">{lesson.title}</Text>
          </View>
          <Text className="text-gray-500 text-sm">{lesson.duration}</Text>
        </View>
      ))}
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View className="bg-white p-4 mb-3 rounded-lg">
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
          <Text className="text-gray-600 font-bold">
            {item.userName.charAt(0)}
          </Text>
        </View>
        <View className="ml-3">
          <Text className="font-bold text-gray-800">{item.userName}</Text>
          {renderRatingStars(item.rating)}
        </View>
      </View>
      <Text className="text-gray-600 mt-2">{item.comment}</Text>
      <Text className="text-gray-400 text-sm mt-2">
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white">
        <Image
          source={require("../../assets/images/course.jpg")}
          style={{ width: screenWidth, height: 200 }}
          className="w-full h-48"
        />
        <TouchableOpacity
          className="absolute top-12 left-4 bg-white rounded-full p-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        <View className="p-4 bg-white">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {mockCourse.title}
          </Text>
          <Text className="text-red-600 mb-2">{mockCourse.category}</Text>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              {renderRatingStars(mockCourse.rating)}
              <Text className="text-gray-600 ml-2">
                ({mockCourse.totalReviews} reviews)
              </Text>
            </View>
            <Text className="text-gray-600">
              {mockCourse.totalStudents} students
            </Text>
          </View>

          <Text className="text-gray-600 mb-4">{mockCourse.description}</Text>

          <View className="flex-row items-center mb-4">
            <Image
              source={require("../../assets/images/course.jpg")}
              className="w-10 h-10 rounded-full"
            />
            <Text className="ml-2 text-gray-700">
              Instructor: {mockCourse.instructor}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white mb-2">
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "content" ? "border-b-2 border-blue-500" : ""
            }`}
            onPress={() => setActiveTab("content")}
          >
            <Text
              className={`text-center ${
                activeTab === "content"
                  ? "text-blue-500 font-bold"
                  : "text-gray-600"
              }`}
            >
              Course Content
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 ${
              activeTab === "reviews" ? "border-b-2 border-blue-500" : ""
            }`}
            onPress={() => setActiveTab("reviews")}
          >
            <Text
              className={`text-center ${
                activeTab === "reviews"
                  ? "text-blue-500 font-bold"
                  : "text-gray-600"
              }`}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="p-4">
          {activeTab === "content" ? (
            <FlatList
              data={mockCourse.sections}
              renderItem={renderSection}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <FlatList
              data={mockReviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          {mockCourse.discount > 0 ? (
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-green-600">
                ${(mockCourse.price - mockCourse.discount).toFixed(2)}
              </Text>
              <Text className="text-gray-400 line-through ml-2">
                ${mockCourse.price.toFixed(2)}
              </Text>
            </View>
          ) : (
            <Text className="text-2xl font-bold text-green-600">
              ${mockCourse.price.toFixed(2)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          className="bg-blue-500 py-4 rounded-lg"
          onPress={() => {
            console.log("Enroll/Buy course");
          }}
        >
          <Text className="text-white text-center font-bold text-lg">
            {mockCourse.price === 0 ? "Enroll Now" : "Buy Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailCourse;
