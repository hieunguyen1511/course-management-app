import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Switch } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MyScreenProps } from '@/types/MyScreenProps'
import { Ionicons } from '@expo/vector-icons'
import { Lesson, Question, Answer } from '@/types/course'

const AddLessonScreen: React.FC<MyScreenProps['AddLessonScreenProps']> = ({ 
  navigation, 
  route 
}) => {
  const { sectionData, onLessonAdded } = route.params;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_quizz: false,
    video_url: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [newIdQuestion, setNewIdQuestion] = useState(1);

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: newIdQuestion,
      lesson_id: sectionData.newIdLesson,
      content: '',
      note: '',
      answers: [{
        id: 1,
        question_id: newIdQuestion,
        content: '',
        is_correct: true,
        save: false,
      }],
      newIdAnswer: 2,
      save: false,
    };
    setQuestions([...questions, newQuestion]);
    setNewIdQuestion(newIdQuestion + 1);
  };

  const addNewAnswer = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          newIdAnswer: q.newIdAnswer + 1,
          answers: [...q.answers, {
            id: q.newIdAnswer,
            question_id: q.id,
            content: '',
            is_correct: false,
            save: false,
          }]
        };
      }
      return q;
    }));
  };

  const handleQuestionChange = (questionId: number, field: 'content' | 'note', value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const handleAnswerChange = (questionId: number, answerId: number, content: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => 
            a.id === answerId ? { ...a, content } : a
          )
        };
      }
      return q;
    }));
  };

  const toggleAnswerCorrect = (questionId: number, answerId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => 
            a.id === answerId ? { ...a, is_correct: !a.is_correct } : a
          )
        };
      }
      return q;
    }));
  };

  const handleDeleteAnswer = (questionId: number, answerId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.filter(a => a.id !== answerId)
        };
      }
      return q;
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bài học');
      return;
    }
    if (!formData.content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài học');
      return;
    }

    if (formData.is_quizz) {
      if (questions.length === 0) {
        Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một câu hỏi');
        return;
      }
      if (questions.some(n => n.content === '')) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ nội dung cho các câu hỏi');
        return;
      }
      for (const question of questions) {
        if (question.answers.length === 0 || !question.answers.some(n => n.is_correct)) {
          Alert.alert('Lỗi', 'Mỗi câu hỏi phải có ít nhất một đáp án và có ít nhất một đáp án đúng');
          return;
        }
        if (question.answers.some(n => n.content === '')) {
          Alert.alert('Lỗi', 'Vui lòng điền đầy đủ nội dung cho các đáp án');
          return;
        }
      }
    }

    const lessonToSave: Lesson = {
      id: sectionData.newIdLesson,
      section_id: sectionData.id,
      title: formData.title,
      content: formData.content,
      video_url: formData.video_url.trim(),
      is_quizz: formData.is_quizz,
      questions: formData.is_quizz ? questions : [],
      save: false,
      newIdQuestion: newIdQuestion,
    };

    onLessonAdded?.(lessonToSave);

    navigation.goBack();
  };

  const handleDeleteQuestion = (questionId: number) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const renderQuestions = () => {
    if (!formData.is_quizz) return null;

    return (
      <View style={styles.questionsContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.sectionTitle}>Câu hỏi</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addNewQuestion}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.addButtonText}>Thêm câu hỏi</Text>
          </TouchableOpacity>
        </View>

        {questions.map((question, qIndex) => (
          <View key={question.id} style={styles.questionBox}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionLabel}>Câu hỏi {qIndex + 1}</Text>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteQuestion(question.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={question.content}
              onChangeText={(value) => handleQuestionChange(question.id, 'content', value)}
              placeholder="Nhập nội dung câu hỏi"
            />

            <View style={styles.answersContainer}>
              <View style={styles.answerHeader}>
                <Text style={styles.answerLabel}>Đáp án</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => addNewAnswer(question.id)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
                  <Text style={styles.addButtonText}>Thêm đáp án</Text>
                </TouchableOpacity>
              </View>

              {question.answers.map((answer, aIndex) => (
                <View key={answer.id} style={styles.answerRow}>
                  <Switch
                    value={answer.is_correct}
                    onValueChange={() => toggleAnswerCorrect(question.id, answer.id)}
                  />
                  <TextInput
                    style={[styles.input, styles.answerInput]}
                    value={answer.content}
                    onChangeText={(value) => handleAnswerChange(question.id, answer.id, value)}
                    placeholder={`Đáp án ${aIndex + 1}`}
                  />
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAnswer(question.id, answer.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Giải thích đáp án</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={question.note}
                onChangeText={(value) => handleQuestionChange(question.id, 'note', value)}
                placeholder="Nhập giải thích cho đáp án đúng"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {'Thêm Bài Học Mới'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên bài học</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Nhập tên bài học"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nội dung</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.content}
            onChangeText={(value) => handleInputChange('content', value)}
            placeholder="Nhập nội dung bài học"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Đường dẫn video (tùy chọn)</Text>
          <TextInput
            style={styles.input}
            value={formData.video_url}
            onChangeText={(value) => handleInputChange('video_url', value)}
            placeholder="Nhập đường dẫn video"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Bài kiểm tra</Text>
            <Switch
              value={formData.is_quizz}
              onValueChange={(value) => handleInputChange('is_quizz', value)}
            />
          </View>
        </View>

        {renderQuestions()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton]} 
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {'Thêm mới'}
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
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
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionsContainer: {
    marginTop: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addButtonText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  questionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  answersContainer: {
    marginTop: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerInput: {
    flex: 1,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noteContainer: {
    marginTop: 16,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  deleteButton: {
    padding: 8,
  },
});

export default AddLessonScreen;