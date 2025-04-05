import { View, Text, Button, Image } from 'react-native';
import React, { useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet } from 'react-native';
import { useState } from 'react';

const uploadToCloudinary = async (imageUri: string) => {
  try {
    const upload_preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_USER_PRESET;
    const cloud_name = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const upload_url = process.env.EXPO_PUBLIC_CLOUDINARY_API_URL;

    if (!upload_preset || !cloud_name || !upload_url) {
      throw new Error('Cloudinary configuration is missing');
    }

    // Create form data
    const formData = new FormData();

    // Get the file extension from the URI
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    // Create the file object
    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `photo.${fileType}`,
    } as any);

    formData.append('upload_preset', upload_preset);
    formData.append('cloud_name', cloud_name);

    const response = await fetch(`${upload_url}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

const Test4 = () => {
  const [localImageUrl, setLocalImageUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  const uploadImage = async (uri: string) => {
    const imageUrl = await uploadToCloudinary(uri);
    if (!imageUrl) {
      console.error('Failed to upload image to Cloudinary');
      return;
    }

    return imageUrl;
  };

  useEffect(() => {
    const uploadImage = async () => {
      if (!localImageUrl) {
        return;
      }

      const imageUrl = await uploadToCloudinary(localImageUrl);
      if (!imageUrl) {
        console.error('Failed to upload image to Cloudinary');
        return;
      }

      setUploadedImageUrl(imageUrl);
    };

    uploadImage();
  }, [localImageUrl]);

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled === true) {
      console.log('Image picker was canceled');
      return;
    }

    setLocalImageUrl(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <Text>test4</Text>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {localImageUrl && (
        <Image source={{ uri: localImageUrl }} style={{ width: 200, height: 200, marginTop: 20 }} />
      )}
      {uploadedImageUrl && (
        <Image
          source={{ uri: uploadedImageUrl }}
          style={{ width: 200, height: 200, marginTop: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
});

export default Test4;
