import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import tokenStorageManager from '@/storage/tokenStorage/tokenStorageManager';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '@/api/axiosInstance';
import { User } from '@/types/apiModels';
import { useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '@/types/RootStackParamList';

type SettingScreenProps = {
  navigation: DrawerNavigationProp<RootStackParamList, 'SettingScreen'>;
  route: any;
};

async function getUserInfo_JWT() {
  try {
    console.log('getUserInfo_JWT');
    const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_USER_INFO_JWT}`);
    return JSON.stringify(response.data.user);
  } catch (error) {
    console.log(error);
    return JSON.stringify({});
  }
}

const SettingScreen: React.FC<SettingScreenProps> = ({ navigation, route }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useFocusEffect(
    useCallback(() => {
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

      // Optional cleanup
      return () => {};
    }, [])
  );

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('user');
    await tokenStorageManager.deleteRefreshToken();
    navigation.navigate('LoginScreen', {
      message: 'Đăng xuất thành công',
    });
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
              {user?.avatar ? (
                <Image source={{ uri: user?.avatar }} style={styles.avatar} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.fullname
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </Text>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullname}</Text>
              <Text style={styles.userUsername}>@{user?.username}</Text>

              <Text style={styles.userDetail}>Số điện thoại: {user?.phone}</Text>
              <Text style={styles.userDetail}>Email: {user?.email.slice(0, 20)}...</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role === 0 ? 'Quản trị' : 'Người dùng'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfileAdminScreen', { message: '' })}
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
    paddingTop: Platform.OS === 'android' ? 50 : 0,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4a6ee0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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

export default SettingScreen;
