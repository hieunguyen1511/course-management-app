import React from 'react';
import { FlatList, ScrollView, StyleSheet } from 'react-native';
import Section from './Section';
import CourseCard from './CourseCard';

import { Strings } from '@/constants/Strings';

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
const CourseList: React.FC<{
  title: string;
  courses: Course[];
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  onCoursePress?: (course: Course) => void;
  horizontal?: boolean;
}> = ({ title, courses, showViewAll, onViewAllPress, onCoursePress, horizontal }) => (
  <Section title={title} onViewAllPress={onViewAllPress} showViewAll={showViewAll}>
    {horizontal ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {courses.map(course => (
          <CourseCard key={course.id} course={course} onPress={onCoursePress} />
        ))}
      </ScrollView>
    ) : (
      <FlatList
        data={courses}
        renderItem={({ item }) => <CourseCard course={item} onPress={onCoursePress} />}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.courseGrid}
        scrollEnabled={false}
      />
    )}
  </Section>
);

const styles = StyleSheet.create({
  courseGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  horizontalList: {
    marginLeft: -5,
  },
});

export default CourseList;
