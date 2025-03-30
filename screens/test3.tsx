// import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native'
// import React, { useState } from 'react'
// import { MyScreenProps } from '@/app/types/MyScreenProps';
// import { NavigationIndependentTree } from '@react-navigation/native';
// import { RootStackParamList } from '@/app/types/RootStackParamList';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AddCourse from './AddCourse';
// import ViewCourse from './ViewCourse';
// import EditCourse from './EditCourse';
// import { Ionicons } from '@expo/vector-icons';

// const Stack = createNativeStackNavigator<RootStackParamList>();

// // Mock data
// const mockCategories = ['All', 'Programming', 'Design', 'Business', 'Marketing'];
// const mockCourses = [
//   {
//     id: '1',
//     title: 'React Native Development',
//     category: 'Programming',
//     price: 49.99,
//     enrolledStudents: 1250,
//     rating: 4.8,
//     image: 'https://picsum.photos/300/200',
//   },
//   {
//     id: '2',
//     title: 'UI/UX Design Fundamentals',
//     category: 'Design',
//     price: 0,
//     enrolledStudents: 850,
//     rating: 4.6,
//     image: 'https://picsum.photos/300/201',
//   },
//   {
//     id: '3',
//     title: 'Digital Marketing Strategy',
//     category: 'Marketing',
//     price: 79.99,
//     enrolledStudents: 2100,
//     rating: 4.9,
//     image: 'https://picsum.photos/300/202',
//   },
// ];

// const Course: React.FC<MyScreenProps['CourseScreenProps']> = ({ navigation }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [courseToDelete, setCourseToDelete] = useState<typeof mockCourses[0] | null>(null);

//   const filteredCourses = mockCourses.filter(course => {
//     const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const handleDeletePress = (course: typeof mockCourses[0]) => {
//     setCourseToDelete(course);
//     setDeleteModalVisible(true);
//   };

//   const handleConfirmDelete = () => {
//     // TODO: Implement actual delete logic here
//     console.log('Deleting course:', courseToDelete?.id);
//     setDeleteModalVisible(false);
//     setCourseToDelete(null);
//   };

//   const handleCancelDelete = () => {
//     setDeleteModalVisible(false);
//     setCourseToDelete(null);
//   };

//   const renderCourseItem = ({ item }: { item: typeof mockCourses[0] }) => (
//     <View style={styles.courseCard}>
//       <Image source={{ uri: item.image }} style={styles.courseImage} />
//       <View style={styles.courseInfo}>
//         <Text style={styles.courseTitle}>{item.title}</Text>
//         <Text style={styles.courseCategory}>{item.category}</Text>
//         <View style={styles.courseDetails}>
//           <Text style={styles.coursePrice}>
//             {item.price === 0 ? 'Free' : `$${item.price}`}
//           </Text>
//           <Text style={styles.courseStudents}>
//             {item.enrolledStudents} students
//           </Text>
//           <View style={styles.ratingContainer}>
//             <Ionicons name="star" size={16} color="#FFD700" />
//             <Text style={styles.courseRating}>{item.rating}</Text>
//           </View>
//         </View>
//       </View>
//       <View style={styles.actionButtons}>
//         <TouchableOpacity 
//           style={[styles.actionButton, styles.viewButton]}
//           onPress={() => navigation.navigate('ViewCourse', { courseId: parseInt(item.id) })}
//         >
//           <Ionicons name="eye" size={20} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.actionButton, styles.editButton]}
//           onPress={() => navigation.navigate('EditCourse', { courseId: parseInt(item.id) })}
//         >
//           <Ionicons name="pencil" size={20} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity 
//           style={[styles.actionButton, styles.deleteButton]}
//           onPress={() => handleDeletePress(item)}
//         >
//           <Ionicons name="trash" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.searchContainer}>
//           <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search courses..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>
//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => navigation.navigate('AddCourse', { message: 'Hello' })}
//         >
//           <Ionicons name="add" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         horizontal 
//         showsHorizontalScrollIndicator={false}
//         style={styles.categoryContainer}
//       >
//         {mockCategories.map((category) => (
//           <TouchableOpacity
//             key={category}
//             style={[
//               styles.categoryButton,
//               selectedCategory === category && styles.selectedCategory
//             ]}
//             onPress={() => setSelectedCategory(category)}
//           >
//             <Text style={[
//               styles.categoryText,
//               selectedCategory === category && styles.selectedCategoryText
//             ]}>
//               {category}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       <FlatList
//         data={filteredCourses}
//         renderItem={renderCourseItem}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.courseList}
//       />

//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={deleteModalVisible}
//         onRequestClose={handleCancelDelete}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Ionicons name="warning" size={32} color="#F44336" />
//               <Text style={styles.modalTitle}>Xác nhận xóa</Text>
//             </View>
//             <Text style={styles.modalMessage}>
//               Bạn có chắc chắn muốn xóa khóa học "{courseToDelete?.title}" không?
//               Hành động này không thể hoàn tác.
//             </Text>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={handleCancelDelete}
//               >
//                 <Text style={styles.cancelButtonText}>Hủy</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.confirmButton]}
//                 onPress={handleConfirmDelete}
//               >
//                 <Text style={styles.confirmButtonText}>Xóa</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     padding: 16,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   searchContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginRight: 12,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 8,
//     fontSize: 16,
//   },
//   addButton: {
//     backgroundColor: '#007AFF',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   categoryContainer: {
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   categoryButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     marginRight: 8,
//   },
//   selectedCategory: {
//     backgroundColor: '#007AFF',
//   },
//   categoryText: {
//     color: '#666',
//   },
//   selectedCategoryText: {
//     color: '#fff',
//   },
//   courseList: {
//     padding: 16,
//   },
//   courseCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   courseImage: {
//     width: '100%',
//     height: 200,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   courseInfo: {
//     padding: 16,
//   },
//   courseTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   courseCategory: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   courseDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   coursePrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#007AFF',
//   },
//   courseStudents: {
//     fontSize: 14,
//     color: '#666',
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   courseRating: {
//     fontSize: 14,
//     color: '#666',
//     marginLeft: 4,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     padding: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   actionButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   viewButton: {
//     backgroundColor: '#4CAF50',
//   },
//   editButton: {
//     backgroundColor: '#FFC107',
//   },
//   deleteButton: {
//     backgroundColor: '#F44336',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 24,
//     width: '80%',
//     maxWidth: 400,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginLeft: 12,
//   },
//   modalMessage: {
//     fontSize: 16,
//     color: '#444',
//     lineHeight: 24,
//     marginBottom: 24,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 12,
//   },
//   modalButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#f5f5f5',
//   },
//   confirmButton: {
//     backgroundColor: '#F44336',
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   confirmButtonText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

// function CourseLayout() {
//     return (
//         <NavigationIndependentTree>
//             <Stack.Navigator initialRouteName='Course' screenOptions={{ headerShown: false }}>
//                 <Stack.Screen name='Course' component={Course} />
//                 <Stack.Screen name='AddCourse' component={AddCourse} />
//                 <Stack.Screen name='ViewCourse' component={ViewCourse} />
//                 <Stack.Screen name='EditCourse' component={EditCourse} />
//             </Stack.Navigator>
//         </NavigationIndependentTree>
//     )
// }

// export default CourseLayout