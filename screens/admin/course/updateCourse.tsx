import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Image,
  Switch,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MyScreenProps } from '@/types/MyScreenProps';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '@/api/axiosInstance';
import { Category, Section, Lesson, Question, Answer } from '@/types/apiModels';
import { Strings } from '@/constants/Strings';
import { uploadToCloudinary, deleteImagefromCloudinary } from '@/components/Cloudinary';

interface DeleteModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="warning-outline" size={32} color="#FF3B30" />
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={onConfirm}>
              <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const UpdateCourseScreen = ({ navigation, route }: MyScreenProps['UpdateCourseScreenProps']) => {
  const courseId = route.params.courseId;
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(1);
  const [total_rating, setTotalRating] = useState(0);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');

  const [oldSections, setOldSections] = useState<Section[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [newIdSection, setNewIdSection] = useState(1);

  const [refreshing, setRefreshing] = useState(false);
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
    }
  };
  const fetchCourseById = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_COURSE_BY_ID}`.replace(':id', String(courseId))
      );
      if (response.status === 200) {
        const course = response.data.course;
        setName(course.name);
        setCategoryId(course.category_id);
        setDescription(course.description);
        setPrice(course.price);
        setIsFree(course.price === 0);
        setDiscount(course.discount);
        setHasDiscount(course.discount !== 0);
        setStatus(course.status);
        setTotalRating(course.total_rating);
        setImage(course.image);
        setOldImage(course.image);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      Alert.alert('Lỗi', Strings.courses.loadError, [{ text: 'OK' }]);
    }
  }, [courseId]);

  const fetchSectionsByCourseId = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_SECTION_BY_COURSE_ID}`.replace(':id', String(courseId))
      );
      if (response.status === 200) {
        const tempSections = response.data.sections;
        tempSections.sort((a: Section, b: Section) => a.id - b.id);
        tempSections.forEach((section: Section) => {
          section.lessons.sort((a, b) => a.id - b.id);
          section.lessons.forEach(lesson => {
            lesson.questions.sort((a, b) => a.id - b.id);
            lesson.questions.forEach(question => {
              question.answers.sort((a, b) => a.id - b.id);
            });
          });
        });

        const lenSections = tempSections.length;
        for (let index = 0; index < lenSections; index++) {
          const lenLessons = tempSections[index].lessons.length;
          tempSections[index].save = true;
          for (let j = 0; j < lenLessons; j++) {
            const lenQuestions = tempSections[index].lessons[j].questions.length;
            tempSections[index].lessons[j].save = true;
            if (lenQuestions !== 0) {
              tempSections[index].lessons[j].newIdQuestion =
                tempSections[index].lessons[j].questions[lenQuestions - 1].id + 1;
            } else {
              tempSections[index].lessons[j].newIdQuestion = 1;
            }
            for (let k = 0; k < lenQuestions; k++) {
              const lenAnswers = tempSections[index].lessons[j].questions[k].answers.length;
              tempSections[index].lessons[j].questions[k].save = true;
              if (lenAnswers !== 0) {
                tempSections[index].lessons[j].questions[k].newIdAnswer =
                  tempSections[index].lessons[j].questions[k].answers[lenAnswers - 1].id + 1;
              } else {
                tempSections[index].lessons[j].questions[k].newIdAnswer = 1;
              }
              for (let l = 0; l < lenAnswers; l++) {
                tempSections[index].lessons[j].questions[k].answers[l].save = true;
              }
            }
          }

          if (lenLessons !== 0) {
            tempSections[index].newIdLesson = tempSections[index].lessons[lenLessons - 1].id + 1;
          } else {
            tempSections[index].newIdLesson = 1;
          }
        }
        if (lenSections !== 0) {
          setNewIdSection(tempSections[lenSections - 1].id + 1);
        }
        setOldSections(tempSections);
        setSections(tempSections);
      } else {
        console.log(`Failed to fetch. Status: ${response.status}`);
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      Alert.alert('Lỗi', `Error fetching sections: ${error}`, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);
  useEffect(() => {
    fetchCategories();
    fetchCourseById();
    fetchSectionsByCourseId();
  }, [fetchCourseById, fetchSectionsByCourseId]); // Chỉ gọi một lần khi component mount

  // State for delete modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<
    { type: 'section' | 'lesson'; id: number } | undefined
  >(undefined);

  const handleAddSection = () => {
    navigation.navigate('AddSectionScreen', {
      courseId: 1,
      newId: newIdSection,
      onSectionAdded: (newSection: Section) => {
        setSections([...sections, newSection]);
        setNewIdSection(newSection.id + 1);
      },
    });
  };

  const handleEditSection = (sectionData: Section) => {
    navigation.navigate('UpdateSectionScreen', {
      courseId: 1,
      sectionData,
      onSectionUpdated: (updatedSection: Section) => {
        setSections(
          sections.map(section => (section.id === updatedSection.id ? updatedSection : section))
        );
      },
    });
  };

  const handleDeleteSection = (sectionId: number) => {
    setItemToDelete({ type: 'section', id: sectionId });
    setDeleteModalVisible(true);
  };

  const handleAddLesson = (section: Section) => {
    navigation.navigate('AddLessonScreen', {
      sectionData: section,
      onLessonAdded: (newLesson: Lesson) => {
        setSections(
          sections.map(sec => {
            if (sec.id === section.id) {
              return {
                ...sec,
                newIdLesson: newLesson.id + 1,
                lessons: [...sec.lessons, newLesson],
              };
            }
            return sec;
          })
        );
      },
    });
  };

  const handleEditLesson = (section: Section, lessonData: Lesson) => {
    navigation.navigate('UpdateLessonScreen', {
      sectionData: section,
      lessonData,
      onLessonUpdated: (updatedLesson: Lesson) => {
        setSections(
          sections.map(sec => {
            if (sec.id === section.id) {
              return {
                ...sec,
                lessons: sec.lessons.map(lesson =>
                  lesson.id === updatedLesson.id ? updatedLesson : lesson
                ),
              };
            }
            return sec;
          })
        );
      },
    });
  };

  const handleDeleteLesson = (sectionId: number, lessonId: number) => {
    setItemToDelete({ type: 'lesson', id: lessonId });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'section') {
      setSections(sections.filter(section => section.id !== itemToDelete.id));
    } else {
      setSections(
        sections.map(section => ({
          ...section,
          lessons: section.lessons.filter(lesson => lesson.id !== itemToDelete.id),
        }))
      );
    }
    setDeleteModalVisible(false);
    setItemToDelete(undefined);
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(undefined);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'info') {
      fetchCategories();
      fetchCourseById();
    } else {
      fetchSectionsByCourseId();
    }
    setRefreshing(false);
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

  const uploadImage = async (uri: string) => {
    const imageUrl = await uploadToCloudinary(uri);
    if (!imageUrl) {
      Alert.alert('Lỗi', Strings.courses.uploadError, [{ text: 'OK' }]);
      return;
    }
    return imageUrl;
  };

  const handleUpdate = async () => {
    if (activeTab === 'info') {
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
        const response = await axiosInstance.put(
          `${process.env.EXPO_PUBLIC_API_UPDATE_COURSE}`.replace(':id', String(courseId)),
          {
            category_id: categoryId,
            name: name.trim(),
            description: description.trim(),
            status: status,
            total_rating: total_rating,
            image: oldImage,
            price: isFree ? 0 : price,
            discount: hasDiscount ? discount : 0,
          }
        );

        if (response.status === 200) {
          if (image && image !== oldImage) {
            console.log(oldImage);
            if (oldImage) {
              const response = await deleteImagefromCloudinary(oldImage);
              if (!response) {
                Alert.alert('Lỗi', 'Không thể xoá ảnh khỏi Cloudinary');
                return;
              }
            }
            //delete oldImage
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
                setOldImage(savedPath);
                setImage(savedPath);
                console.log('Thành công lưu ảnh');
              } else {
                console.error('Thất bại lưu ảnh');
              }
            }
          }
          Alert.alert('Thành công', `${Strings.courses.updateSuccess} ${response.data.course.id}`, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error: any) {
        console.error('Error updatting course:', error);
        Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra.', [{ text: 'OK' }]);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        for (let index = 0; index < oldSections.length; index++) {
          const oldSection = oldSections[index];
          const foundSection = sections.find(s => s.id === oldSection.id);

          if (!foundSection) {
            //delete
            const rsSection = await deleteSection(oldSection);
            if (!rsSection) {
              throw new Error(`Error deleting section ${oldSection.id}`);
            }
          } else {
            for (let j = 0; j < oldSection.lessons.length; j++) {
              const oldLesson = oldSection.lessons[j];
              const foundLesson = foundSection.lessons.find(s => s.id === oldLesson.id);
              if (!foundLesson) {
                //delete
                const rsLesson = await deleteLesson(oldLesson);
                if (!rsLesson) {
                  throw new Error(`Error deleting lesson ${oldLesson.id}`);
                }
              } else {
                for (let k = 0; k < oldLesson.questions.length; k++) {
                  const oldQuestion = oldLesson.questions[k];
                  const foundQuestion = foundLesson.questions.find(s => s.id === oldQuestion.id);
                  if (!foundQuestion) {
                    //delete
                    const rsQuestion = await deleteQuestion(oldQuestion);
                    if (!rsQuestion) {
                      throw new Error(`Error deleting question ${oldQuestion.id}`);
                    }
                  } else {
                    for (let l = 0; l < oldQuestion.answers.length; l++) {
                      const oldAnswer = oldQuestion.answers[l];
                      const foundAnswer = foundQuestion.answers.find(s => s.id === oldAnswer.id);
                      if (!foundAnswer) {
                        //delete
                        const rsAnswer = await deleteAnswer(oldAnswer);
                        if (!rsAnswer) {
                          throw new Error(`Error deleting answer ${oldAnswer.id}`);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Có lỗi xảy ra:', error.message);
        Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra.', [{ text: 'OK' }]);
      }

      for (let index = 0; index < sections.length; index++) {
        const section = sections[index];
        const foundSection = oldSections.find(s => s.id === section.id);
        if (foundSection) {
          if (!section.save) {
            const rsSection = await updateSection(section);
            if (!rsSection) {
              throw new Error(`Error updating section ${section.id}`);
            }
            sections[index].save = true;
          }
        } else {
          const rsSection = await addSection(section);
          if (!rsSection) {
            throw new Error(`Error creating section ${section.id}`);
          }
          sections[index].save = true;
          sections[index].id = rsSection.id;
          section.id = rsSection.id;
        }
        for (let j = 0; j < section.lessons.length; j++) {
          section.lessons[j].section_id = section.id;
          const lesson = section.lessons[j];
          const oldLessons = foundSection?.lessons;
          const foundLesson = oldLessons?.find(s => s.id === lesson.id);
          if (foundLesson) {
            if (!lesson.save) {
              const rsLesson = await updateLesson(lesson);
              if (!rsLesson) {
                throw new Error(`Error updating lesson ${lesson.id}`);
              }
              sections[index].lessons[j].save = true;
            }
          } else {
            const rsLesson = await addLesson(lesson);
            if (!rsLesson) {
              throw new Error(`Error creating lesson ${lesson.id}`);
            }
            sections[index].lessons[j].save = true;
            sections[index].lessons[j].id = rsLesson.id;
            lesson.id = rsLesson.id;
          }
          for (let k = 0; k < lesson.questions.length; k++) {
            lesson.questions[k].lesson_id = lesson.id;
            const question = lesson.questions[k];
            const oldQuestions = foundLesson?.questions;
            const foundQuestion = oldQuestions?.find(s => s.id === question.id);
            if (foundQuestion) {
              if (!question.save) {
                const rsQuestion = await updateQuestion(question);
                if (!rsQuestion) {
                  throw new Error(`Error updating question ${question.id}`);
                }
                sections[index].lessons[j].questions[k].save = true;
              }
            } else {
              const rsQuestion = await addQuestion(question);
              if (!rsQuestion) {
                throw new Error(`Error creating question ${question.id}`);
              }
              sections[index].lessons[j].questions[k].save = true;
              sections[index].lessons[j].questions[k].id = rsQuestion.id;
              question.id = rsQuestion.id;
            }
            for (let l = 0; l < question.answers.length; l++) {
              question.answers[l].question_id = question.id;
              const answer = question.answers[l];
              const oldAnswers = foundQuestion?.answers;
              const foundAnswer = oldAnswers?.find(s => s.id === answer.id);
              if (foundAnswer) {
                if (!answer.save) {
                  const rsAnswer = await updateAnswer(answer);
                  if (!rsAnswer) {
                    throw new Error(`Error updating answer ${answer.id}`);
                  }
                  sections[index].lessons[j].questions[k].answers[l].save = true;
                }
              } else {
                const rsAnswer = await addAnswer(answer);
                if (!rsAnswer) {
                  throw new Error(`Error creating answer ${answer.id}`);
                }
                sections[index].lessons[j].questions[k].answers[l].save = true;
                sections[index].lessons[j].questions[k].answers[l].id = rsAnswer.id;
                answer.id = rsAnswer.id;
              }
            }
          }
        }
      }
      setOldSections(sections);
      setLoading(false);
      Alert.alert('Thành công', `${Strings.courses.updateSuccess} ${courseId}`, [{ text: 'OK' }]);
    }
  };

  const addSection = async (section: Section) => {
    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_SECTION}`, {
        course_id: courseId,
        name: section.name,
        description: section.description,
      });
      if (response.status === 201) {
        return response.data.section;
      }
    } catch (error: any) {
      console.error('Error creating section:', error);
    }
  };

  const updateSection = async (section: Section) => {
    try {
      const response = await axiosInstance.put(
        `${process.env.EXPO_PUBLIC_API_UPDATE_SECTION}`.replace(':id', String(section.id)),
        {
          course_id: courseId,
          name: section.name,
          description: section.description,
        }
      );
      if (response.status === 200) {
        return response.data.section;
      }
    } catch (error: any) {
      console.error('Error updating section:', error);
    }
  };

  const deleteSection = async (section: Section) => {
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_SECTION}`.replace(':id', String(section.id))
      );
      if (response.status === 200) {
        return true;
      }
    } catch (error: any) {
      console.error('Error deleting section:', error);
    }
  };

  const addLesson = async (lesson: Lesson) => {
    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_LESSON}`, {
        section_id: lesson.section_id,
        title: lesson.title,
        content: lesson.content,
        is_quizz: lesson.is_quizz,
        video_url: lesson.video_url,
      });
      if (response.status === 201) {
        return response.data.lesson;
      }
    } catch (error: any) {
      console.error('Error creating lesson:', error);
    }
  };

  const updateLesson = async (lesson: Lesson) => {
    try {
      const response = await axiosInstance.put(
        `${process.env.EXPO_PUBLIC_API_UPDATE_LESSON}`.replace(':id', String(lesson.id)),
        {
          section_id: lesson.section_id,
          title: lesson.title,
          content: lesson.content,
          is_quizz: lesson.is_quizz,
          video_url: lesson.video_url,
        }
      );
      if (response.status === 200) {
        return response.data.lesson;
      }
    } catch (error: any) {
      console.error('Error updating lesson:', error);
    }
  };

  const deleteLesson = async (lesson: Lesson) => {
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_LESSON}`.replace(':id', String(lesson.id))
      );
      if (response.status === 200) {
        return true;
      }
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
    }
  };

  const addQuestion = async (question: Question) => {
    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_QUESTION}`, {
        lesson_id: question.lesson_id,
        content: question.content,
        note: question.note || '',
      });
      if (response.status === 201) {
        return response.data.question;
      }
    } catch (error: any) {
      console.error('Error creating question:', error);
    }
  };

  const updateQuestion = async (question: Question) => {
    try {
      const response = await axiosInstance.put(
        `${process.env.EXPO_PUBLIC_API_UPDATE_QUESTION}`.replace(':id', String(question.id)),
        {
          lesson_id: question.lesson_id,
          content: question.content,
          note: question.note,
        }
      );
      if (response.status === 200) {
        return response.data.question;
      }
    } catch (error: any) {
      console.error('Error updating question:', error);
    }
  };

  const deleteQuestion = async (question: Question) => {
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_QUESTION}`.replace(':id', String(question.id))
      );
      if (response.status === 200) {
        return true;
      }
    } catch (error: any) {
      console.error('Error delete question:', error);
    }
  };
  const addAnswer = async (answer: Answer) => {
    try {
      const response = await axiosInstance.post(`${process.env.EXPO_PUBLIC_API_CREATE_ANSWER}`, {
        question_id: answer.question_id,
        content: answer.content,
        is_correct: answer.is_correct,
      });
      if (response.status === 201) {
        return response.data.answer;
      }
    } catch (error: any) {
      console.error('Error creating answer:', error);
    }
  };

  const updateAnswer = async (answer: Answer) => {
    try {
      const response = await axiosInstance.put(
        `${process.env.EXPO_PUBLIC_API_UPDATE_ANSWER}`.replace(':id', String(answer.id)),
        {
          question_id: answer.question_id,
          content: answer.content,
          is_correct: answer.is_correct,
        }
      );
      if (response.status === 200) {
        return response.data.answer;
      }
    } catch (error: any) {
      console.error('Error updating answer:', error);
    }
  };

  const deleteAnswer = async (answer: Answer) => {
    try {
      const response = await axiosInstance.delete(
        `${process.env.EXPO_PUBLIC_API_DELETE_ANSWER}`.replace(':id', String(answer.id))
      );
      if (response.status === 200) {
        return true;
      }
    } catch (error: any) {
      console.error('Error delete answer:', error);
    }
  };

  const renderInfoTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4a6ee0']} />
      }
    >
      <TouchableOpacity
        style={styles.imageContainer}
        disabled={loading}
        onPress={() => pickImage(false)}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.courseImage} />
        ) : (
          <Image style={styles.courseImage} />
        )}
        <View style={styles.imageOverlay}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.imageText}>Thay đổi ảnh</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên khóa học</Text>
        <TextInput
          style={styles.input}
          value={name}
          readOnly={loading}
          onChangeText={value => setName(value)}
          placeholder="Nhập tên khóa học"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Danh mục</Text>
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          readOnly={loading}
          onChangeText={value => setDescription(value)}
          placeholder="Nhập mô tả khóa học"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Giá Khóa Học</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioButton}
            disabled={loading}
            onPress={() => setIsFree(true)}
          >
            <View style={styles.radio}>{isFree && <View style={styles.radioSelected} />}</View>
            <Text style={styles.radioLabel}>Miễn phí</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            disabled={loading}
            onPress={() => setIsFree(false)}
          >
            <View style={styles.radio}>{!isFree && <View style={styles.radioSelected} />}</View>
            <Text style={styles.radioLabel}>Có phí</Text>
          </TouchableOpacity>
        </View>

        {!isFree && (
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.input}
              readOnly={loading}
              value={price.toString()}
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
              placeholder="Nhập giá khóa học"
              keyboardType="numeric"
            />
            <Text style={styles.currency}>đ</Text>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.toggleContainer}>
          <Text style={styles.label}>Giảm giá</Text>
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
        <View style={styles.inputContainer}>
          <View style={styles.toggleContainer}>
            <Text style={styles.label}>Trạng thái hoạt động</Text>
            <Switch
              disabled={loading}
              value={status === 1}
              onValueChange={active => {
                if (active) {
                  setStatus(1);
                } else {
                  setStatus(0);
                }
              }}
              trackColor={{ false: '#ccc', true: '#4CAF50' }}
              thumbColor={status ? '#4CAF50' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.statusText}>{status ? 'Hoạt động' : 'Không hoạt động'}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderContentTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4a6ee0']} />
      }
    >
      <TouchableOpacity
        style={styles.addSectionButton}
        onPress={handleAddSection}
        disabled={loading}
      >
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.addSectionButtonText}>Thêm Section Mới</Text>
      </TouchableOpacity>

      {sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có nội dung bài học</Text>
        </View>
      ) : (
        sections?.map(section => (
          <View key={section.id} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  disabled={loading}
                  onPress={() => handleEditSection(section)}
                >
                  <Ionicons name="pencil-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  disabled={loading}
                  onPress={() => handleDeleteSection(section.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.lessonsContainer}>
              {section.lessons?.map(lesson => (
                <View key={lesson.id} style={styles.lessonItem}>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDuration}>{lesson.video_url ? 'Video' : ''}</Text>
                  </View>
                  <View style={styles.lessonActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      disabled={loading}
                      onPress={() => handleEditLesson(section, lesson)}
                    >
                      <Ionicons name="pencil-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      disabled={loading}
                      onPress={() => handleDeleteLesson(section.id, lesson.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.addLessonButton}
              disabled={loading}
              onPress={() => handleAddLesson(section)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.addLessonButtonText}>Thêm Lesson</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          disabled={loading}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh Sửa Khóa Học</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          disabled={loading}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Thông tin chung
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          disabled={loading}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
            Nội dung
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? renderInfoTab() : renderContentTab()}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.updateButton]}
          disabled={loading}
          onPress={handleUpdate}
        >
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.updateButtonText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>

      <DeleteModal
        visible={deleteModalVisible}
        title="Xác nhận xóa"
        message={
          itemToDelete?.type === 'section'
            ? 'Bạn có chắc chắn muốn xóa section này?'
            : 'Bạn có chắc chắn muốn xóa lesson này?'
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
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
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
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
  updateButton: {
    backgroundColor: '#007AFF',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  sectionActions: {
    flexDirection: 'row',
  },
  lessonsContainer: {
    marginBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  lessonDuration: {
    fontSize: 14,
    color: '#666',
  },
  lessonActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
  addLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addLessonButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addSectionButtonText: {
    marginLeft: 8,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountInput: {
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

// function UpdateCourseLayout() {
//     return (
//         <NavigationIndependentTree>
//           <Stack.Navigator initialRouteName='UpdateCourse' screenOptions={{ headerShown: false }}>
//             <Stack.Screen name='UpdateCourse' component={UpdateCourse} options={{ headerShown: false }} />

//           </Stack.Navigator>
//         </NavigationIndependentTree>
//     )
// }
// export default UpdateCourseLayout;
export default UpdateCourseScreen;
