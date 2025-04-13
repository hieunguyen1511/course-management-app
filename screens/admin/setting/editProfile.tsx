import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { User } from '@/types/apiModels';
import { uploadToCloudinary, deleteImagefromCloudinary } from '@/services/Cloudinary';

async function getUserInfo_JWT() {
  try {
    const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_USER_INFO_JWT}`);
    return JSON.stringify(response.data.user);
  } catch (error) {
    console.log(error);
    return JSON.stringify({});
  }
}

async function updateUserInfo_JWT(user: User) {
  try {
    const response = await axiosInstance.put(
      `${process.env.EXPO_PUBLIC_API_UPDATE_USER_INFO_JWT}`,
      {
        fullname: user.fullname,
        phone: user.phone,
        birth: user.birth,
      }
    );
    //console.log('Update user info response', response.status);
    if (response.status === 200) {
      return response;
    }
    throw new Error('Failed to update user info');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to update user info');
  }
}

async function updateUserAvatar_JWT(avatar_url: string) {
  try {
    const response = await axiosInstance.put(
      `${process.env.EXPO_PUBLIC_API_UPDATE_USER_AVATAR_JWT}`,
      {
        avatar: avatar_url,
      }
    );
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to update user avatar');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to update user avatar');
  }
}
const EditProfileAdminScreen: React.FC<MyScreenProps['EditProfileAdminScreenProps']> = ({
  navigation,
  route,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [oldAvatar, setOldAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateOfBirth,
        onChange: handleDateChange,
        mode: 'date',
        is24Hour: true,
        maximumDate: new Date(),
      });
    } else {
      setShowDatePicker(true);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserInfo_JWT();
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFullName(parsedUser.fullname);
        setPhoneNumber(parsedUser.phone);
        setDateOfBirth(new Date(parsedUser.birth));
        setAvatar(parsedUser.avatar);
        setOldAvatar(parsedUser.avatar);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        //const imageUrl = await uploadToCloudinary(result.assets[0].uri);
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const uploadImage = async (uri: string) => {
    const imageUrl = await uploadToCloudinary(uri);
    if (!imageUrl) {
      Alert.alert('Lỗi', 'Upload ảnh thất bại', [{ text: 'OK' }]);
      return;
    }
    return imageUrl;
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      return;
    }

    if (!avatar) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh đại diện');
      return;
    }

    setUpdating(true);
    try {
      const updatedUser: User = {
        ...user,
        fullname: fullName,
        phone: phoneNumber,
        birth: dateOfBirth.toISOString().split('T')[0],
      };

      const response = await updateUserInfo_JWT(updatedUser);
      console.log('Updated user:', response.data);
      if (response.status === 200) {
        if (avatar !== oldAvatar) {
          if (oldAvatar) {
            const response = await deleteImagefromCloudinary(oldAvatar);
            if (!response) {
              Alert.alert('Lỗi', 'Không thể xoá ảnh khỏi Cloudinary');
              return;
            }
          }
          //delete oldImage
          const savedPath = await uploadImage(avatar);
          if (savedPath) {
            await updateUserAvatar_JWT(savedPath);
            setOldAvatar(savedPath);
            setAvatar(savedPath);
          }
        }
        Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
          {
            text: 'OK',
            onPress: () => {
              setUpdating(false);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
        setUpdating(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        </View>

        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#666" />
                </View>
              )}
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarText}>Thay đổi ảnh đại diện</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ngày sinh</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => openDatePicker()}>
                <Text style={styles.dateText}>{dateOfBirth.toLocaleDateString('vi-VN')}</Text>
              </TouchableOpacity>
              {showDatePicker && Platform.OS === 'ios' && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, updating && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4a6ee0',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4a6ee0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileAdminScreen;
