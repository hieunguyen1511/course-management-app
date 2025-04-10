import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MyScreenProps } from '@/types/MyScreenProps';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import axiosInstance from '@/api/axiosInstance';
import { Lesson, Question } from '@/types/apiModels';
import { router, useLocalSearchParams } from 'expo-router';

const UserViewLesson: React.FC<MyScreenProps['UserViewLessonScreenProps']> = ({
  navigation,
  route,
}) => {
  const { lessonId, enrollmentId } = useLocalSearchParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [disableCompleteButton, setDisableCompleteButton] = useState(true);

  const fetchLesson = async () => {
    setLoading(true);
    const response = await axiosInstance.get(
      process.env.EXPO_PUBLIC_API_GET_LESSON_BY_ID!.replace(':lesson_id', lessonId.toString())
    );

    setLesson(response.data.lesson);
    setLoading(false);
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const getYouTubeEmbedUrl = (url: string) => {
    // Extract video ID from YouTube URL
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) return url;

    // Return embed URL for WebView playback
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (showResults) return;

    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleShowResults = () => {
    if (selectedAnswers.length === lesson?.questions?.length) {
      setShowResults(true);
      setDisableCompleteButton(false);
    }
  };

  const handleCompleteLesson = async () => {
    await axiosInstance.post(process.env.EXPO_PUBLIC_API_COMPLETE_LESSON || '', {
      lesson_id: lessonId,
      enrollment_id: enrollmentId,
    });
    // Navigate back to course detail
    router.back();
  };

  const renderQuizQuestion = (question: Question, index: number) => (
    <View key={question.id} style={styles.questionContainer}>
      <Text style={styles.questionText}>
        {index + 1}. {question.content}
      </Text>
      {question.answers.map((answer, answerIndex) => (
        <TouchableOpacity
          key={answerIndex}
          style={[
            styles.optionButton,
            selectedAnswers[index] === answerIndex && styles.selectedOption,
            showResults && answer.is_correct && styles.correctOption,
            showResults &&
              selectedAnswers[index] === answerIndex &&
              !answer.is_correct &&
              styles.wrongOption,
          ]}
          onPress={() => handleAnswerSelect(index, answerIndex)}
          disabled={showResults}
        >
          <Text
            style={[
              styles.optionText,
              selectedAnswers[index] === answerIndex && styles.selectedOptionText,
              showResults && answer.is_correct && styles.correctOptionText,
            ]}
          >
            {answer.content}
          </Text>
        </TouchableOpacity>
      ))}
      {showResults && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Giải thích:</Text>
          <Text style={styles.explanationText}>{question.note}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải nội dung bài học...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy bài học</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.videoContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl(lesson.video_url)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <WebView
              source={{ uri: getYouTubeEmbedUrl(lesson.video_url) }}
              style={styles.video}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              scalesPageToFit={true}
            />
          )}
        </View>

        {/* Lesson Content */}
        <Text style={styles.contentText}>{lesson.content}</Text>

        {/* Quiz Section - Only shown for quiz type lessons */}
        {lesson.is_quizz && lesson.questions && (
          <View style={styles.quizContainer}>
            {lesson.questions.map((question, index) => renderQuizQuestion(question, index))}
            {!showResults && (
              <TouchableOpacity
                style={[
                  styles.showResultsButton,
                  selectedAnswers.length !== lesson.questions.length && styles.disabledButton,
                ]}
                onPress={handleShowResults}
                disabled={selectedAnswers.length !== lesson.questions.length}
              >
                <Text style={styles.showResultsButtonText}>Xem kết quả</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {/* <TouchableOpacity style={styles.navButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#666" />
          <Text style={styles.navButtonText}>Bài trước</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          disabled={lesson.is_quizz ? disableCompleteButton : false}
          style={styles.completeButton}
          onPress={handleCompleteLesson}
        >
          <Text style={styles.completeButtonText}>Hoàn thành</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 50,
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
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 16,
  },
  quizContainer: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
  },
  correctOption: {
    backgroundColor: '#c8e6c9',
  },
  wrongOption: {
    backgroundColor: '#ffcdd2',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#1976d2',
  },
  correctOptionText: {
    color: '#2e7d32',
  },
  explanationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  showResultsButton: {
    backgroundColor: '#4a6ee0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  showResultsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  navButtonText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 4,
  },
  completeButton: {
    backgroundColor: '#4a6ee0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '80%',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UserViewLesson;
