import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';
import { Course } from '@/types/apiModels';
import { ResultCourse } from '@/types/MyInterfaces';

const getResults = async (keyword: string): Promise<ResultCourse[]> => {
  try {
    const response = await axiosInstance.get(
      `${process.env.EXPO_PUBLIC_API_SEARCH_COURSE_BY_KEYWORD}?keyword=${keyword}`
    );
    return response.data.courses as ResultCourse[];
  } catch (error) {
    console.error('Error getting results', error);
    return [] as ResultCourse[];
  }
};

const SearchCourseScreen: React.FC<MyScreenProps['SearchCourseScreenProps']> = ({
  navigation,
  route,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ResultCourse[]>([]);
  const [loading, setLoading] = useState(false);

  // Format price to VND
  const formatPrice = (price: number): string => {
    if (price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Text key={star} style={styles.starIcon}>
            {rating >= star ? '★' : '☆'}
          </Text>
        ))}
        <Text style={styles.ratingText}>{rating?.toFixed(1)}</Text>
      </View>
    );
  };

  // Handle search input change
  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const results = await getResults(text);
        if (results.length > 0) {
          console.log('Results', results);
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching courses:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: ResultCourse }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => navigation.navigate('DetailCourseScreen', { courseId: item.courseId })}
    >
      <View style={styles.courseImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.courseImage} />
        ) : (
          <Image source={require('../../assets/images/course.jpg')} style={styles.courseImage} />
        )}
      </View>

      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
        <Text style={styles.categoryText}>{item.categoryName}</Text>
        <View style={styles.courseFooter}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
          {renderRatingStars(item.rating)}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
            autoFocus
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => {
                handleSearchChange('');
              }}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.courseId.toString()}
          contentContainerStyle={styles.searchResultsList}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>Không tìm thấy kết quả</Text>
        </View>
      ) : null}
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
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  searchResultsList: {
    padding: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#4a6ee0',
    marginBottom: 8,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c9e69',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    color: '#ffb100',
    fontSize: 14,
    marginRight: 1,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default SearchCourseScreen;
