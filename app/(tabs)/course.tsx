import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

// Define course interface
interface Course {
  id: number;
  title: string;
  instructor: string;
  category: string;
  image: string;
  rating: number;
}

// Interface for in-progress courses
interface CourseInProgress extends Course {
  progress: number;
  nextLesson: string;
  lastAccessed: string;
  totalLessons: number;
  completedLessons: number;
}

// Interface for completed courses
interface CourseCompleted extends Course {
  completedDate: string;
  certificateUrl?: string;
  finalScore?: number;
}

const CourseScreen = () => {
  // State variables
  const [activeTab, setActiveTab] = useState<'progress' | 'completed'>('progress');
  const [inProgressCourses, setInProgressCourses] = useState<CourseInProgress[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CourseCompleted[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user courses
  useEffect(() => {
    // Simulated API call - replace with actual API in production
    setTimeout(() => {
      // Mock data for in-progress courses
      setInProgressCourses([
        {
          id: 1,
          title: 'React Native Fundamentals',
          instructor: 'John Doe',
          category: 'Programming',
          image: 'https://via.placeholder.com/100',
          rating: 4.7,
          progress: 65,
          nextLesson: 'Navigation in React Native',
          lastAccessed: '2 days ago',
          totalLessons: 12,
          completedLessons: 8
        },
        {
          id: 2,
          title: 'UI/UX Design Principles',
          instructor: 'Sarah Smith',
          category: 'Design',
          image: 'https://via.placeholder.com/100',
          rating: 4.5,
          progress: 32,
          nextLesson: 'Color Theory Basics',
          lastAccessed: 'Yesterday',
          totalLessons: 10,
          completedLessons: 3
        },
        {
          id: 3,
          title: 'Digital Marketing Strategies',
          instructor: 'Michael Brown',
          category: 'Marketing',
          image: 'https://via.placeholder.com/100',
          rating: 4.2,
          progress: 78,
          nextLesson: 'Social Media Campaigns',
          lastAccessed: '3 hours ago',
          totalLessons: 8,
          completedLessons: 6
        }
      ]);

      // Mock data for completed courses
      setCompletedCourses([
        {
          id: 4,
          title: 'JavaScript Basics',
          instructor: 'Robert Wilson',
          category: 'Programming',
          image: 'https://via.placeholder.com/100',
          rating: 4.6,
          completedDate: '2023-05-15',
          certificateUrl: 'https://example.com/cert/123',
          finalScore: 95
        },
        {
          id: 5,
          title: 'Introduction to HTML & CSS',
          instructor: 'Jennifer Davis',
          category: 'Web Development',
          image: 'https://via.placeholder.com/100',
          rating: 4.8,
          completedDate: '2023-03-20',
          certificateUrl: 'https://example.com/cert/456',
          finalScore: 92
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  // Render progress bar
  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'progress' && styles.activeTab
        ]}
        onPress={() => setActiveTab('progress')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'progress' && styles.activeTabText
          ]}
        >
          In Progress
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'completed' && styles.activeTab
        ]}
        onPress={() => setActiveTab('completed')}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'completed' && styles.activeTabText
          ]}
        >
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render in-progress course
  const renderInProgressCourse = ({ item }: { item: CourseInProgress }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar progress={item.progress} />
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{item.progress}% Complete</Text>
            <Text style={styles.lessonCount}>{item.completedLessons}/{item.totalLessons} lessons</Text>
          </View>
        </View>
        
        <View style={styles.lessonContainer}>
          <Ionicons name="play-circle-outline" size={16} color="#4a6ee0" />
          <Text style={styles.nextLessonText} numberOfLines={1}>Next: {item.nextLesson}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Render completed course
  const renderCompletedCourse = ({ item }: { item: CourseCompleted }) => (
    <TouchableOpacity style={styles.courseCard}>
      <Image source={{ uri: item.image }} style={styles.courseImage} />
      
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        
        <View style={styles.completedInfoContainer}>
          <View style={styles.completedDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.completedDate}>
              Completed: {formatDate(item.completedDate)}
            </Text>
          </View>
          
          {item.finalScore && (
            <View style={styles.scoreContainer}>
              <Ionicons name="ribbon-outline" size={14} color="#666" />
              <Text style={styles.scoreText}>Score: {item.finalScore}%</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.certificateUrl && (
        <TouchableOpacity style={styles.certificateButton}>
          <Ionicons name="document-text-outline" size={16} color="#4a6ee0" />
          <Text style={styles.certificateText}>Certificate</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#4a6ee0" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      {renderTabs()}
      
      {/* Course Lists */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'progress' ? (
          <>
            {inProgressCourses.length > 0 ? (
              inProgressCourses.map(course => (
                <View key={course.id.toString()}>
                  {renderInProgressCourse({ item: course })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="book-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>You haven't started any courses yet</Text>
                <TouchableOpacity style={styles.exploreCourseButton}>
                  <Text style={styles.exploreCourseText}>Explore Courses</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {completedCourses.length > 0 ? (
              completedCourses.map(course => (
                <View key={course.id.toString()}>
                  {renderCompletedCourse({ item: course })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="trophy-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>You haven't completed any courses yet</Text>
                <Text style={styles.emptySubText}>Your completed courses will appear here</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginLeft: 4,
    color: '#4a6ee0',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4a6ee0',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4a6ee0',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseImage: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 5,
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
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  lessonCount: {
    fontSize: 12,
    color: '#999',
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  nextLessonText: {
    fontSize: 12,
    color: '#4a6ee0',
    marginLeft: 5,
  },
  continueButton: {
    backgroundColor: '#4a6ee0',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  completedInfoContainer: {
    marginTop: 8,
  },
  completedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  completedDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  certificateButton: {
    flexDirection: 'column',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  certificateText: {
    color: '#4a6ee0',
    fontWeight: '500',
    fontSize: 10,
    marginTop: 3,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  exploreCourseButton: {
    backgroundColor: '#4a6ee0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
  },
  exploreCourseText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CourseScreen