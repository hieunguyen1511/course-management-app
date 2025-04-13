import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';
import { User } from '@/types/apiModels';
import { RootStackParamList } from '@/types/RootStackParamList';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationIndependentTree } from '@react-navigation/native';
import ViewUserScreen from './viewUser';
import DeleteModal from '@/components/deleteModal';
import { uploadToCloudinary, deleteImagefromCloudinary } from '@/services/Cloudinary';

const Stack = createNativeStackNavigator<RootStackParamList>();
type UserScreenProps = NativeStackScreenProps<RootStackParamList, 'UserScreen'>;

const UserScreen: React.FC<UserScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ user: User } | undefined>(undefined);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_ALL_USERS_WITHOUT_ADMIN}`
      );
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Lỗi', `Failed fetching users: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDelete = (user: User) => {
    setItemToDelete({ user: user });
    setDeleteModalVisible(true);
  };
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_USER}`.replace(':id', String(itemToDelete.user.id))
      );
      if (response.status === 200) {
        if (itemToDelete.user.avatar) {
          const response = await deleteImagefromCloudinary(itemToDelete.user.avatar);
          if (!response) {
            Alert.alert('Lỗi', 'Không thể xoá ảnh khỏi Cloudinary');
          }
        }
        const updatedUsers = users.filter(cat => cat.id !== itemToDelete.user.id);
        setUsers(updatedUsers);
        setDeleteModalVisible(false);
        Alert.alert('Thành công', 'Xóa thành công người dùng', [{ text: 'OK' }]);
      } else {
        console.log(`Failed to delete item. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to delete item. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
      Alert.alert('Lỗi', 'Xóa người dùng thất bại', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setItemToDelete(undefined);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(undefined);
  };

  // Render user item
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('ViewUserScreen', { userId: item.id })}
    >
      <View style={styles.reviewAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>
            {item.fullname
              .split(' ')
              .map(n => n[0])
              .join('')}
          </Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullname}</Text>
        <Text style={styles.username}>@{item.username}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={16} color="#4a6ee0" />
            <Text style={styles.statText}>{item.totalCourses} khóa học</Text>
          </View>
        </View>
      </View>
      {/* Nút icon xóa */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={20} color="#e04a4a" />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách người dùng</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* User List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6ee0" />
          <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          }
        />
      )}
      <DeleteModal
        visible={deleteModalVisible}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa người dùng "${itemToDelete?.user.fullname}"@"${itemToDelete?.user.username}" không? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

const UserTabLayout = () => {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="UserScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="UserScreen" component={UserScreen} />
        <Stack.Screen name="ViewUserScreen" component={ViewUserScreen} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
};

export default UserTabLayout;
