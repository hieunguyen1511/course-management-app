import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Image, Alert, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axiosInstance from '@/api/axiosInstance';
import { Category } from '@/types/category';
import { Course } from '@/types/course';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const AddCourse = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);

  const handleDiscountChange = (text: string) => {
    if (text === '')
    {
      setDiscount(0);
      return;
    }
    // Chỉ cho phép nhập số
    const numericValue = text.replace(/[^0-9]/g, '');

    if (numericValue[0] == '0') {
      
      setDiscount(parseInt(numericValue[1]));
      return;
    }
    
    // Chuyển đổi sang số và kiểm tra giá trị
    const value = parseInt(numericValue);
    if (value >= 0 && value <= 100) {
      setDiscount(value);
    } else if (value > 100) {
      setDiscount(100);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`);
      if (response.status === 200) {
        setCategories(response.data.categories);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Chỉ gọi một lần khi component mount

  const pickImage = async (useCamera = false) => {
    try {
      console.log('Starting image picker...');
      
      // Request permission
      console.log('Requesting permissions...');
      const { status } = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('Permission not granted');
        Alert.alert(
          'Cần quyền truy cập',
          useCamera 
            ? 'Vui lòng cấp quyền truy cập camera để có thể chụp ảnh khóa học.'
            : 'Vui lòng cấp quyền truy cập thư viện ảnh để có thể chọn ảnh khóa học.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('Launching image picker...');
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
          });

      console.log('Image picker result:', result);

      if (!result.canceled) {
        console.log('Image selected:', result.assets[0].uri);
        setImage(result.assets[0].uri);
      } else {
        console.log('Image picker cancelled');
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi chọn ảnh. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCreateCourse = async () => {
    try {
      // Kiểm tra các trường bắt buộc
      if (!name.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tên khóa học');
        console.log('Vui lòng nhập tên khóa học');
        return;
      }

      let imagePath = image;
      if (image) {
        try {
          // Tạo tên file duy nhất với timestamp
          const fileName = `course_${Date.now()}.jpg`;
          const destination = `${FileSystem.documentDirectory}assets/images/courses/${fileName}`;
          
          console.log('Source image path:', image);
          console.log('Destination path:', destination);
          
          // Kiểm tra và tạo thư mục nếu chưa tồn tại
          const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}assets/images/courses`);
          if (!dirInfo.exists) {
            console.log('Creating directory...');
            await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}assets/images/courses`, { intermediates: true });
          }
          
          // Copy ảnh vào thư mục assets
          console.log('Copying image...');
          await FileSystem.copyAsync({
            from: image,
            to: destination
          });
          
          console.log('Image copied successfully');
          // Lưu đường dẫn tương đối để hiển thị
          imagePath = `assets/images/courses/${fileName}`;
        } catch (error) {
          console.error('Error handling image:', error);
          Alert.alert(
            'Lỗi',
            'Có lỗi xảy ra khi xử lý ảnh. Vui lòng thử lại.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Chuẩn bị dữ liệu
      const courseData = {
        category_id: categoryId,
        name: name.trim(),
        description: description.trim(),
        status: status,
        price: price,
        discount: discount,
        image: imagePath
      };

      console.log('Sending course data:', courseData);

      // Gọi API tạo khóa học
      const response = await axiosInstance.post(
        `${process.env.EXPO_PUBLIC_API_CREATE_COURSE}`,
        courseData
      );

      if (response.status === 200) {
        Alert.alert(
          'Thành công',
          'Khóa học đã được tạo thành công',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  const setIsFree = (isFree: boolean) => {
    if (isFree) {
      setPrice(0);
      setDiscount(0);
    }
    else {
      setPrice(1000);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Khóa Học Mới</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Course Image */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ảnh Khóa Học</Text>
          <TouchableOpacity style={styles.imagePreview} onPress={() => pickImage(false)}>
            {image ? (
              <Image source={{ uri: image }} style={styles.courseImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#666" />
                <Text style={styles.imagePlaceholderText}>Chọn ảnh khóa học</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Course Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên Khóa Học</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên khóa học"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Danh Mục</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoryId}
              onValueChange={(itemValue: number) => setCategoryId(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô Tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Nhập mô tả khóa học"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Price Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Giá Khóa Học</Text>
          <View style={styles.priceContainer}>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioButton}
                onPress={() => setIsFree(true)}
              >
                <View style={styles.radioCircle}>
                  {price === 0 && <View style={styles.selectedRb} />}
                </View>
                <Text style={styles.radioLabel}>Miễn phí</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.radioButton}
                onPress={() => setIsFree(false)}
              >
                <View style={styles.radioCircle}>
                  {price !== 0 && <View style={styles.selectedRb} />}
                </View>
                <Text style={styles.radioLabel}>Có phí</Text>
              </TouchableOpacity>
            </View>

            {price !== 0 && (
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.input}
                  value={price.toString()}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    if (numericValue === '') {
                      setPrice(0);
                    } else {
                      if (numericValue[0] == '0')
                        setPrice(parseInt(numericValue[1]));
                      else
                        setPrice(parseInt(numericValue));
                    }
                  }}
                  placeholder="Nhập giá"
                  keyboardType="numeric"
                />
                <Text style={styles.currency}>đ</Text>
              </View>
            )}
          </View>
        </View>

        {/* Discount Section */}
        <View style={styles.inputGroup}>
          <View style={styles.discountHeader}>
            <Text style={styles.label}>Giảm Giá</Text>
            <Switch
              value={hasDiscount}
              onValueChange={setHasDiscount}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={discount !== 0 ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          
          {hasDiscount && (
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.input}
                value={discount.toString()}
                onChangeText={handleDiscountChange}
                placeholder="Nhập % giảm giá (0-100)"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.currency}>%</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleCreateCourse}
        >
          <Text style={styles.submitButtonText}>Tạo Khóa Học</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  picker: {
    height: 50,
  },
  priceContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  discountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
});

export default AddCourse