import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import * as ImagePicker from 'expo-image-picker';

import tokenStorageManager from '@/storage/tokenStorage/tokenStorageManager';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/api/axiosInstance';

// Define user interface
interface User {
  id: string;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  birth: string;
  avatar: string;
  totalCourses?: number;
  name?: string;
}

async function getUserInfo_JWT() {
  try {
    const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_USER_INFO_JWT}`);
    return JSON.stringify(response.data.user);
  } catch (error) {
    console.log(error);
    return JSON.stringify({});
  }
}

const Account: React.FC<MyScreenProps['AccountScreenProps']> = ({ navigation, route }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserInfo_JWT();
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user');
    await tokenStorageManager.deleteRefreshToken();
    navigation.replace('Login', {
      message: 'Đăng xuất thành công',
    });
    // In a real app, you would clear tokens, user data, etc.
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thông tin tài khoản...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.container}>
        {/* User Info Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user?.avatar }} style={styles.avatar} />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullname}</Text>
              <Text style={styles.userUsername}>@{user?.username}</Text>

              <Text style={styles.userDetail}>Số điện thoại: {user?.phone}</Text>
              <Text style={styles.userDetail}>Email: {user?.email.slice(0, 20)}...</Text>
            </View>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfileScreen', { message: '' })}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={22} color="#4a6ee0" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Hồ sơ</Text>
              <Text style={styles.menuSubtext}>Chỉnh sửa thông tin cá nhân</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('UserViewAllEnrollmentScreen', { message: '' })}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="book-outline" size={22} color="#4a6ee0" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Khóa học của tôi</Text>
              <Text style={styles.menuSubtext}>Quản lý khóa học đã đăng ký</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          {/* Doi mat khau */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePasswordScreen', { message: '' })}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#4a6ee0" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Đổi mật khẩu</Text>
              <Text style={styles.menuSubtext}>Đổi mật khẩu tài khoản</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#e04a4a" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#e04a4a',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 30,
  },
});

// function AccountScreenRoutes() {
//   return (
//     <NavigationIndependentTree>
//       <Stack.Navigator
//         initialRouteName="AccountScreen"
//         screenOptions={{ headerShown: false }}
//       >
//         <Stack.Screen name="AccountScreen" component={AccountScreen} />

//         {/* Add other screens here if needed */}
//       </Stack.Navigator>
//     </NavigationIndependentTree>
//   );
// }

export default Account;
