import Section from './Section';
import CategoryItem from './CategoryItem';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
interface Category {
  id: number;
  name: string;
}

const CategoryList: React.FC<{
  categories: Category[];
  onCategoryPress: (category: Category) => void;
}> = ({ categories, onCategoryPress }) => (
  <Section title="Danh mục khóa học" showViewAll={false}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      {categories.map(category => (
        <CategoryItem
          key={category.id}
          category={category}
          onPress={() => onCategoryPress(category)}
        />
      ))}
    </ScrollView>
  </Section>
);
const styles = StyleSheet.create({
  categoriesContainer: {
    paddingBottom: 10,
  },
});
export default CategoryList;
