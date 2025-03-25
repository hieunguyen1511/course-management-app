import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import Test1 from '../../screens/test1';
import { RootStackParamList } from '../../types/RootStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Types for our courses data
interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  price: number;
  image: string;
  rating: number;
}

interface CourseInProgress extends Course {
  progress: number; // percentage completed
  nextLesson: string;
  lastAccessed: string;
}

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('Hieu Nguyen');
  const [inProgressCourses, setInProgressCourses] = useState<CourseInProgress[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.message) {
      setMessage(route.params.message);
    }
    
    // Fetch user courses in progress - Mock data
    setInProgressCourses([
      {
        id: 1, 
        title: 'React Native Fundamentals', 
        instructor: 'John Doe', 
        category: 'Programming',
        price: 49.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.7,
        progress: 65,
        nextLesson: 'Navigation in React Native',
        lastAccessed: '2 days ago'
      },
      {
        id: 2, 
        title: 'UI/UX Design Principles', 
        instructor: 'Sarah Smith', 
        category: 'Design',
        price: 39.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.5,
        progress: 32,
        nextLesson: 'Color Theory Basics',
        lastAccessed: 'Yesterday'
      }
    ]);
    
    // Fetch suggested courses - Mock data
    setSuggestedCourses([
      {
        id: 3, 
        title: 'Advanced React Native', 
        instructor: 'Jane Wilson', 
        category: 'Programming',
        price: 59.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.8
      },
      {
        id: 4, 
        title: 'Flutter Development', 
        instructor: 'Mike Johnson', 
        category: 'Programming',
        price: 49.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.6
      },
      {
        id: 5, 
        title: 'Mobile App Design', 
        instructor: 'Emma Brown', 
        category: 'Design',
        price: 45.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.4
      }
    ]);
    
    // Fetch related courses - Mock data
    setRelatedCourses([
      {
        id: 6, 
        title: 'JavaScript for Beginners', 
        instructor: 'Robert Wilson', 
        category: 'Programming',
        price: 29.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.3
      },
      {
        id: 7, 
        title: 'Redux State Management', 
        instructor: 'Susan Miller', 
        category: 'Programming',
        price: 39.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.7
      },
      {
        id: 8, 
        title: 'Responsive Web Design', 
        instructor: 'Alex Thompson', 
        category: 'Design',
        price: 34.99,
        image: 'https://via.placeholder.com/100',
        rating: 4.5
      }
    ]);
    
    setLoading(false);
  }, [route.params?.message]);

  // Render stars for ratings
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

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Course card for suggested and related courses
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading your courses...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={40} color="#4a6ee0" />
        </TouchableOpacity>
      </View>
      
      {/* Continue Learning Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        
        {inProgressCourses.map((course) => (
          <TouchableOpacity key={course.id} style={styles.continueCard}>
            <Image source={{ uri: course.image }} style={styles.continueImage} />
            
            <View style={styles.continueContent}>
              <Text style={styles.continueTitle} numberOfLines={1}>{course.title}</Text>
              <Text style={styles.continueLesson} numberOfLines={1}>Next: {course.nextLesson}</Text>
              
              <View style={styles.progressContainer}>
                <ProgressBar progress={course.progress} />
                <Text style={styles.progressText}>{course.progress}% complete</Text>
              </View>
              
              <Text style={styles.lastAccessed}>Last accessed {course.lastAccessed}</Text>
            </View>
            
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play-circle" size={36} color="#4a6ee0" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        
        {inProgressCourses.length === 0 && (
          <Text style={styles.noCourses}>You haven't started any courses yet.</Text>
        )}
      </View>
      
      {/* Suggested Courses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested For You</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {suggestedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      </View>
      
      {/* Related Courses Section */}
      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Related To Your Interests</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {relatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const Routes = () => {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} />
        <Stack.Screen name="Test1" component={Test1} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 5,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
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
  continueCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  continueImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  continueContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  continueLesson: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a6ee0',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  lastAccessed: {
    fontSize: 12,
    color: '#999',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  noCourses: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  horizontalList: {
    marginLeft: -5,
  },
  courseCard: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 5,
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

export default Routes;
