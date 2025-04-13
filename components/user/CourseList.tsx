import React from 'react';
import { FlatList, ScrollView, StyleSheet } from 'react-native';
import Section from './Section';
import CourseCardComponent from './CourseCardComponent';

import { CourseCard } from '@/types/MyInterfaces';

const CourseList: React.FC<{
  title: string;
  courses: CourseCard[];
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  onCoursePress?: (course: CourseCard) => void;
  horizontal?: boolean;
}> = ({ title, courses, showViewAll, onViewAllPress, onCoursePress, horizontal }) => (
  <Section title={title} onViewAllPress={onViewAllPress} showViewAll={showViewAll}>
    {horizontal ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
        {courses.map(course => (
          <CourseCardComponent key={course.courseId} course={course} onPress={onCoursePress} />
        ))}
      </ScrollView>
    ) : (
      <FlatList
        data={courses}
        renderItem={({ item }) => <CourseCardComponent course={item} onPress={onCoursePress} />}
        keyExtractor={item => item.courseId.toString()}
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
