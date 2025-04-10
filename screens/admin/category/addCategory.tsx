import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React from 'react';

import { MyScreenProps } from '@/types/MyScreenProps';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';
import { Strings } from '@/constants/Strings';

const AddCategoryScreen = ({ navigation }: MyScreenProps['AddCategoryScreenProps']) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', Strings.categories.nameRequired, [{ text: 'OK' }]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_CATEGORY}`, {
        name: name.trim(),
        description: description.trim(),
      });

      if (response.status === 201) {
        Alert.alert('Thành công', `${Strings.categories.addSuccess} ${response.data.category.id}`, [
          { text: 'OK' },
        ]);
        navigation.navigate('CategoryScreen', {
          message: `${Strings.categories.addSuccess} ${response.data.category.id}`,
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', `Error creating category: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          disabled={loading}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {Strings.categories.addNew}
          {'    '}
        </Text>
        {loading && <ActivityIndicator size="large" color="#4a6ee0" />}
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>{Strings.categories.nameLabel}</Text>
        <TextInput
          value={name}
          readOnly={loading}
          onChangeText={setName}
          style={[styles.input, { pointerEvents: 'auto' }]}
          placeholder={Strings.categories.nameLabel}
        />
        <Text style={styles.label}>{Strings.categories.descriptionLabel}</Text>
        <TextInput
          value={description}
          readOnly={loading}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea, { pointerEvents: 'auto' }]}
          multiline
          numberOfLines={4}
          placeholder={Strings.categories.descriptionLabel}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.submitButtonText}>{Strings.categories.saveButton}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
});

export default AddCategoryScreen;
