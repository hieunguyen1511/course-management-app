import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

// Define types
interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  price: number;
  image: string;
  rating: number;
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch data
  useEffect(() => {
    // Mock categories data
    setCategories([
      { id: 1, name: 'Programming', icon: 'code-slash', color: '#4a6ee0' },
      { id: 2, name: 'Design', icon: 'color-palette', color: '#e04a76' },
      { id: 3, name: 'Business', icon: 'briefcase', color: '#e0a64a' },
      { id: 4, name: 'Marketing', icon: 'megaphone', color: '#4ae076' },
      { id: 5, name: 'Photography', icon: 'camera', color: '#8e4ae0' },
      { id: 6, name: 'Music', icon: 'musical-notes', color: '#e04a4a' },
      { id: 7, name: 'Data Science', icon: 'analytics', color: '#4acde0' },
    ]);

    // Mock courses data
    setSuggestedCourses([
      {
        id: 1, 
        title: 'React Native Fundamentals', 
        instructor: 'John Doe', 
        category: 'Programming',
        price: 49.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.7
      },
      {
        id: 2, 
        title: 'UI/UX Design Principles', 
        instructor: 'Sarah Smith', 
        category: 'Design',
        price: 39.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.5
      },
      {
        id: 3, 
        title: 'Digital Marketing Strategies', 
        instructor: 'Michael Brown', 
        category: 'Marketing',
        price: 29.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.2
      },
      {
        id: 4, 
        title: 'Business Management 101', 
        instructor: 'Lisa Johnson', 
        category: 'Business',
        price: 59.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.8
      },
      {
        id: 5, 
        title: 'Data Science & ML Basics', 
        instructor: 'Robert Wilson', 
        category: 'Data Science',
        price: 69.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.6
      },
      {
        id: 6, 
        title: 'Mobile Photography Masterclass', 
        instructor: 'Emma Davis', 
        category: 'Photography',
        price: 34.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.4
      },
    ]);

    setLoading(false);
  }, []);

  // Handle category selection
  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    // In a real app, you would filter courses based on the selected category
  };

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? '★' : '☆'}
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  // Course card component
  const CourseCard = ({ course }: { course: Course }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image source={{ uri: course.image }} style={styles.courseImage} />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.instructorName}>{course.instructor}</Text>
        <View style={styles.courseCardFooter}>
          <Text style={styles.priceText}>${course.price.toFixed(2)}</Text>
          {renderRatingStars(course.rating)}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Category item component
  const CategoryItem = ({ category }: { category: Category }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        { backgroundColor: category.id === selectedCategory ? category.color : 'white' }
      ]}
      onPress={() => handleCategoryPress(category.id)}
    >
      <Ionicons 
        name={category.icon as any} 
        size={24} 
        color={category.id === selectedCategory ? 'white' : category.color} 
      />
      <Text 
        style={[
          styles.categoryName, 
          { color: category.id === selectedCategory ? 'white' : '#333' }
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for courses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </ScrollView>
        </View>

        {/* Popular Courses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Courses</Text>
          <FlatList
            data={suggestedCourses}
            renderItem={({ item }) => <CourseCard course={item} />}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.courseGrid}
            scrollEnabled={false}
          />
        </View>

        {/* New Courses Section */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Courses</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
            {suggestedCourses.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
  },
  lastSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#4a6ee0',
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minWidth: 100,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  courseGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  horizontalList: {
    marginLeft: -5,
  },
  courseCard: {
    width: 170,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 5,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  courseCardContent: {
    padding: 10,
  },
  courseCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    height: 40,
  },
  instructorName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  courseCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c9e69',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#ffb100',
    fontSize: 12,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
});

export default Explore