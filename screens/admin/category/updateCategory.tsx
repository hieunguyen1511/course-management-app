import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { MyScreenProps } from "@/types/MyScreenProps";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from '@/api/axiosInstance';
import MessageAlert from "@/components/MessageAlert";
import { Strings } from "@/constants/Strings";

interface UpdateCategoryParams {
  categoryId: number;
}

const UpdateCategoryScreen = ({
  navigation,
  route,
}: MyScreenProps["UpdateCategoryScreenProps"]) => {
  const { categoryId } = route.params as UpdateCategoryParams;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchCategoryById = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.EXPO_PUBLIC_API_GET_CATEGORY_BY_ID}`.replace(":id", String(categoryId))
        );
        if (response.status === 200) {
          const category = response.data.category;
          setName(category.name);
          setDescription(category.description);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setMessage({ text: Strings.categories.loadError, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryById();
  }, [categoryId]);

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ text: Strings.categories.nameRequired, type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.put(
        `${process.env.EXPO_PUBLIC_API_UPDATE_CATEGORY}`.replace(":id", String(categoryId)),
        {
          name: name.trim(),
          description: description.trim(),
        }
      );
      
      if (response.status === 200) {
        navigation.navigate('Category', { message: Strings.categories.updateSuccess });
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setMessage({ text: Strings.categories.updateError, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_CATEGORY_BY_ID}`.replace(":id", String(categoryId))
      );
      if (response.status === 200) {
        const category = response.data.category;
        setName(category.name);
        setDescription(category.description);
      }
    } catch (error) {
      console.error('Error resetting category:', error);
      setMessage({ text: Strings.categories.resetError, type: 'error' });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{Strings.categories.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4a6ee0" />
        </TouchableOpacity>
        <Text style={styles.title}>{Strings.categories.update}</Text>
      </View>

      {message && (
        <MessageAlert
          message={message.text}
          type={message.type}
          onHide={() => setMessage(null)}
        />
      )}

      <View style={styles.formContainer}>
        <Text style={styles.label}>{Strings.categories.idLabel}</Text>
        <TextInput 
          value={categoryId.toString()} 
          style={[styles.input, styles.disabledInput]}
          pointerEvents="none"
        />
        <Text style={styles.label}>{Strings.categories.nameLabel}</Text>
        <TextInput 
          value={name} 
          onChangeText={setName} 
          style={styles.input}
          placeholder={Strings.categories.nameLabel}
          pointerEvents="auto"
        />
        <Text style={styles.label}>{Strings.categories.descriptionLabel}</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder={Strings.categories.descriptionLabel}
          pointerEvents="auto"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>{Strings.categories.saveButton}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>{Strings.categories.resetButton}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  disabledInput: {
    backgroundColor: "#e9ecef",
    color: "#6c757d",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#4a6ee0",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UpdateCategoryScreen;
