import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Lesson {
  id: number;
  section_id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  id: number;
  course_id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
}

interface CourseContentProps {
  sections: Section[];
  isEnrolled: boolean;
  onLessonPress: (lesson: any) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({ sections, isEnrolled, onLessonPress }) => {
  const renderSection = ({ item }: { item: Section }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{item.name}</Text>
      {item.lessons.map(lesson => (
        <TouchableOpacity
          key={lesson.id}
          style={[styles.lessonContainer, !isEnrolled && styles.lockedLesson]}
          onPress={() => onLessonPress(lesson)}
          disabled={!isEnrolled}
        >
          <View style={styles.lessonContent}>
            {!isEnrolled ? (
              <Ionicons name="lock-closed" size={20} color="#999" />
            ) : (
              <Ionicons name="play-circle-outline" size={20} color="#666" />
            )}
            <Text style={[styles.lessonTitle, !isEnrolled && styles.lockedText]}>
              {lesson.title}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <FlatList
      data={sections}
      renderItem={renderSection}
      keyExtractor={item => item.id.toString()}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  lessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonTitle: {
    marginLeft: 12,
    color: '#4b5563',
    flex: 1,
  },
  lockedLesson: {
    opacity: 0.5,
  },
  lockedText: {
    color: '#999',
  },
});

export default CourseContent;
