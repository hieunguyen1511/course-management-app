import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

const Test2 = () => {
  const [courseName, setCourseName] = useState("");
  const [category, setCategory] = useState("Lập trình");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState("");
  const [courseImage, setCourseImage] = useState<string | null>(null);

  const categories = [
    "Lập trình",
    "Thiết kế",
    "Kinh doanh",
    "Marketing",
    "Ngoại ngữ",
    "Phát triển cá nhân",
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log(status);
    if (status !== "granted") {
      console.log("Permission to access camera roll is required!");
      return;
    }
    // const result = await ImagePicker.launchCameraAsync({
    //   allowsEditing: true,
    //   aspect: [16, 9],
    //   quality: 1,
    // });
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    console.log(result);

    if (!result.canceled) {
      setCourseImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thêm Khóa Học Mới</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Course Image */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ảnh Khóa Học</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={pickImage}
          >
            {courseImage ? (
              <Image source={{ uri: courseImage }} style={styles.courseImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color="#666" />
                <Text style={styles.imagePlaceholderText}>
                  Chọn ảnh khóa học
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Course Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên Khóa Học</Text>
          <TextInput
            style={styles.input}
            value={courseName}
            onChangeText={setCourseName}
            placeholder="Nhập tên khóa học"
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Danh Mục</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue: string) => setCategory(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
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
                  {isFree && <View style={styles.selectedRb} />}
                </View>
                <Text style={styles.radioLabel}>Miễn phí</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
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
                  value={price}
                  onChangeText={setPrice}
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
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={hasDiscount ? "#007AFF" : "#f4f3f4"}
            />
          </View>

          {hasDiscount && (
            <View style={styles.priceInputContainer}>
              <TextInput
                style={styles.input}
                value={discountPrice}
                onChangeText={setDiscountPrice}
                placeholder="Nhập giá giảm"
                keyboardType="numeric"
              />
              <Text style={styles.currency}>đ</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Tạo Khóa Học</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 50,
  },
  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currency: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  discountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageUploadButton: {
    width: "100%",
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
});

export default Test2;
