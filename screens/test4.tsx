import { View, Text, Button, Image } from "react-native";
import React from "react";
import * as ImagePicker from "expo-image-picker";
import { StyleSheet } from "react-native";
import { useState } from "react";
import * as FileSystem from "expo-file-system";
const uploadToCloudinary = async (imageUri: any) => {
  try {
    //const response = await fetch(imageUri);
    //console.log("response", response);

    //console.log("blob", blob);
    const upload_preset = `${process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET}`; // Replace with your Cloudinary upload preset
    const cloud_name = `${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}`; // Replace with your Cloudinary cloud name
    // const data = new FormData();

    // const response = await fetch(`data:image/png;base64,${base64Img}`);
    // const blob = await response.blob();
    // data.append("file", blob , "image.jpeg"); // Use the last part of the URI as the filename
    // data.append("upload_preset", upload_preset); // Replace with your Cloudinary upload preset
    // data.append("cloud_name", cloud_name); // Replace with your Cloudinary cloud name
    // //console.log("data", data);
    // const res = await fetch(`${process.env.EXPO_PUBLIC_CLOUDINARY_API_URL}`, {
    //   method: "POST",
    //   body: data,
    //   mode: "cors",
    //   //   headers: {
    //   //         "Content-Type": "application/json",
    //   //       },
    // });

    const base64Img = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const data = {
      filename: "image.jpeg", // Tên tệp tin bạn muốn lưu trên Cloudinary
      file: `data:image/jpeg;base64,${base64Img}`, // Định dạng ảnh Base64
      upload_preset: "courseapp",
      cloud_name: cloud_name,
    };

    const res = await fetch(`${process.env.EXPO_PUBLIC_CLOUDINARY_API_URL}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    console.log(result);
    return result.url;
  } catch (error) {
    console.log("Error uploading image:", error);
    return null;
  }
};

const test4 = () => {
  const [imageUrl, setImageUrl] = useState("");
  return (
    <View style={styles.container}>
      <Text>test4</Text>
      <Button
        title="Pick an image from camera roll"
        onPress={async () => {
          let permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (permissionResult.granted === false) {
            alert("Permission to access camera roll is required!");
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          if (result.canceled === true) {
            console.log("Image picker was canceled");
            return;
          }

          console.log(result.assets[0].uri);
          setImageUrl(result.assets[0].uri);
          const imageUri = result.assets[0].uri;
          const imageUrl = await uploadToCloudinary(imageUri);
          if (!imageUrl) {
            console.error("Failed to upload image to Cloudinary");
            return;
          }

          setImageUrl(imageUrl);
        }}
      />
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 200, height: 200, marginTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
});

export default test4;
