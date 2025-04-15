import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import axiosInstance from '@/api/axiosInstance';
import { Category } from '@/types/apiModels';
import { Strings } from '@/constants/Strings';
import { MyScreenProps } from '@/types/MyScreenProps';
import { uploadToCloudinary } from '@/services/Cloudinary';

const AddCourseScreen = ({ navigation }: MyScreenProps['AddCourseScreenProps']) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [description, setDescription] = useState('');
  const status = 1;
  const total_rating = 0;
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.EXPO_PUBLIC_API_GET_ALL_CATEGORIES}`);
      if (response.status === 200) {
        setCategories(response.data.categories);
        if (response.data.categories && response.data.categories.length > 0) {
          setCategoryId(response.data.categories[0].id);
        }
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Lỗi', `Error fetching categories: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Chỉ gọi một lần khi component mount

  // ********Show danh sách ảnh local
  // const listStoredImages = async () => {
  //   try {
  //     const courseDir = `${FileSystem.documentDirectory}courses/`;
  //     const files = await FileSystem.readDirectoryAsync(courseDir);
  //     console.log("Stored images:", files);
  //     return files; // Trả về danh sách file
  //   } catch (error) {
  //     console.error("Error listing stored images:", error);
  //     return [];
  //   }
  // };

  // ********Xóa tất cả ảnh local
  // const deleteAllImages = async () => {
  //   try {
  //     const courseDir = `${FileSystem.documentDirectory}courses/`;
  //     const files = await FileSystem.readDirectoryAsync(courseDir);

  //     for (const file of files) {
  //       await FileSystem.deleteAsync(courseDir + file);
  //       console.log(`Deleted: ${file}`);
  //     }

  //     console.log("All images deleted successfully!");
  //   } catch (error) {
  //     console.error("Error deleting all images:", error);
  //   }
  // };
  // deleteAllImages();
  // listStoredImages();

  // ********Save image local
  // const saveImage = async (imageUri: string): Promise<string | null> => {
  //   try {
  //     await FileSystem.makeDirectoryAsync(COURSE_FOLDER, { intermediates: true });

  //     // Lưu ảnh với tên tạm
  //     const tempFileName = `course_${Date.now()}.jpg`;
  //     const newPath = COURSE_FOLDER + tempFileName;

  //     await FileSystem.moveAsync({
  //       from: imageUri,
  //       to: newPath,
  //     });

  //     console.log("Saved image to:", newPath);
  //     return newPath;
  //   } catch (error) {
  //     console.error("Error saving image:", error);
  //     return null;
  //   }
  // };

  const uploadImage = async (uri: string) => {
    const imageUrl = await uploadToCloudinary(uri);
    if (!imageUrl) {
      Alert.alert('Lỗi', Strings.courses.uploadError, [{ text: 'OK' }]);
      return;
    }
    return imageUrl;
  };

  const pickImage = async (useCamera = false) => {
    try {
      const { status } = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập để tiếp tục.', [
          { text: 'OK' },
        ]);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [16, 9], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
          });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert('Lỗi', Strings.courses.pickImageError, [{ text: 'OK' }]);
    }
  };

  const handleCreateCourse = async () => {
    try {
      if (!name.trim()) {
        Alert.alert('Lỗi', Strings.courses.nameRequired, [{ text: 'OK' }]);
        return;
      }

      if (!categoryId) {
        Alert.alert('Lỗi', Strings.courses.categoryRequired, [{ text: 'OK' }]);
        return;
      }

      setLoading(true);
      // 1️⃣ Gửi request tạo khóa học (chưa có ảnh)
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_COURSE}`, {
        category_id: categoryId,
        name: name.trim(),
        description: description.trim(),
        status: status,
        total_rating: total_rating,
        image: '',
        price: isFree ? 0 : price,
        discount: hasDiscount ? discount : 0,
      });

      if (response.status === 201) {
        if (image) {
          const savedPath = await uploadImage(image);
          if (savedPath) {
            const responseUp = await axiosInstance.put(
              `${process.env.EXPO_PUBLIC_API_UPDATE_COURSE}`.replace(
                ':id',
                String(response.data.course.id)
              ),
              {
                category_id: categoryId,
                name: name.trim(),
                description: description.trim(),
                status: status,
                total_rating: total_rating,
                image: savedPath,
                price: isFree ? 0 : price,
                discount: hasDiscount ? discount : 0,
              }
            );
            if (responseUp.status === 200) {
              console.log('Thành công lưu ảnh');
            } else {
              console.error('Thất bại lưu ảnh');
            }
          }
        }
        Alert.alert('Thành công', `${Strings.courses.addSuccess} ${response.data.course.id}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('Error creating course:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          disabled={loading}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {Strings.courses.addNew}
          {'    '}
        </Text>
        {loading && <ActivityIndicator size="large" color="#4a6ee0" />}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ảnh Khóa Học</Text>
            <TouchableOpacity
              style={styles.imagePreview}
              onPress={() => pickImage(false)}
              disabled={loading}
            >
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên Khóa Học</Text>
            <TextInput
              style={styles.input}
              value={name}
              readOnly={loading}
              onChangeText={setName}
              placeholder="Nhập tên khóa học"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Danh Mục</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(itemValue: number) => setCategoryId(itemValue)}
                style={styles.picker}
                enabled={!loading}
              >
                {categories.map(cat => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô Tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              readOnly={loading}
              onChangeText={setDescription}
              placeholder="Nhập mô tả khóa học"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Giá Khóa Học</Text>
            <View style={styles.priceContainer}>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioButton}
                  disabled={loading}
                  onPress={() => setIsFree(true)}
                >
                  <View style={styles.radioCircle}>
                    {isFree && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioLabel}>Miễn phí</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.radioButton}
                  disabled={loading}
                  onPress={() => setIsFree(false)}
                >
                  <View style={styles.radioCircle}>
                    {!isFree && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioLabel}>Có phí</Text>
                </TouchableOpacity>
              </View>

              {!isFree && (
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={styles.input}
                    value={price.toString()}
                    readOnly={loading}
                    onChangeText={text => {
                      const numericValue = text.replace(/[^0-9]/g, '');
                      // Nếu rỗng, set 0
                      if (numericValue === '') {
                        setPrice(0);
                        return;
                      }
                      // Chuyển thành số
                      let value = parseInt(numericValue, 10);
                      setPrice(value);
                    }}
                    placeholder="Nhập giá"
                    keyboardType="numeric"
                  />
                  <Text style={styles.currency}>đ</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.discountHeader}>
              <Text style={styles.label}>Giảm Giá</Text>
              <Switch
                value={hasDiscount}
                onValueChange={setHasDiscount}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={discount !== 0 ? '#007AFF' : '#f4f3f4'}
                disabled={loading}
              />
            </View>

            {hasDiscount && (
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.input}
                  value={discount.toString()}
                  readOnly={loading}
                  onChangeText={text => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    // Nếu rỗng, set 0
                    if (numericValue === '') {
                      setDiscount(0);
                      return;
                    }

                    // Chuyển thành số
                    let value = parseInt(numericValue, 10);

                    // Nếu giá trị ngoài khoảng 0 - 100, điều chỉnh lại
                    if (value > 100) {
                      value = 100;
                    }

                    setDiscount(value);
                  }}
                  placeholder="Nhập % giảm giá (0-100)"
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.currency}>%</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.addButton]}
          disabled={loading}
          onPress={handleCreateCourse}
        >
          <Text style={styles.addButtonText}>Tạo Khóa Học</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

export default AddCourseScreen;
