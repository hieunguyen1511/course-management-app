import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MyScreenProps } from '@/types/MyScreenProps'
import { Ionicons } from '@expo/vector-icons'
import { WebView } from 'react-native-webview'

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Lesson {
  id: number;
  title: string;
  type: 'video' | 'quiz';
  content: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  duration: string;
}

const UserViewLesson: React.FC<MyScreenProps["UserViewLessonScreenProps"]> = ({ navigation, route }) => {
  const { lessonId, courseId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch lesson details
    setTimeout(() => {
      // Sample lesson data - can be either video or quiz type
      const mockLesson: Lesson = {
        id: lessonId,
        title: '1.1 Giới thiệu về React Native',
        type: 'video', // Change to 'video' for video lessons
        content: 'React Native là một framework phát triển ứng dụng di động được tạo bởi Facebook...',
        duration: '15:00',
        // Video URL - only needed for video type lessons
        videoUrl: 'https://www.youtube.com/watch?v=gvkqT_Uoahw',
        // Quiz questions - only needed for quiz type lessons
        questions: [
          {
            id: 1,
            question: 'React Native được phát triển bởi công ty nào?',
            options: [
              'Google',
              'Facebook',
              'Microsoft',
              'Apple'
            ],
            correctAnswer: 1,
            explanation: 'React Native được phát triển bởi Facebook vào năm 2015, cho phép phát triển ứng dụng di động đa nền tảng sử dụng JavaScript và React.'
          },
          {
            id: 2,
            question: 'React Native có thể phát triển ứng dụng cho những nền tảng nào?',
            options: [
              'Chỉ iOS',
              'Chỉ Android',
              'iOS và Android',
              'Tất cả các nền tảng di động'
            ],
            correctAnswer: 2,
            explanation: 'React Native cho phép phát triển ứng dụng cho cả iOS và Android từ một codebase duy nhất.'
          },
          {
            id: 3,
            question: 'Ngôn ngữ lập trình chính được sử dụng trong React Native là gì?',
            options: [
              'Java',
              'Swift',
              'JavaScript/TypeScript',
              'Python'
            ],
            correctAnswer: 2,
            explanation: 'React Native sử dụng JavaScript hoặc TypeScript làm ngôn ngữ lập trình chính, kết hợp với React để xây dựng giao diện người dùng.'
          }
        ]
      };
      setLesson(mockLesson);
      setLoading(false);
    }, 1000);
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
    }
  };

  const handleCompleteLesson = () => {
    // Navigate back to course detail
    navigation.goBack();
  };

  const renderQuizQuestion = (question: QuizQuestion, index: number) => (
    <View key={question.id} style={styles.questionContainer}>
      <Text style={styles.questionText}>{index + 1}. {question.question}</Text>
      {question.options.map((option, optionIndex) => (
        <TouchableOpacity
          key={optionIndex}
          style={[
            styles.optionButton,
            selectedAnswers[index] === optionIndex && styles.selectedOption,
            showResults && optionIndex === question.correctAnswer && styles.correctOption,
            showResults && selectedAnswers[index] === optionIndex && optionIndex !== question.correctAnswer && styles.wrongOption
          ]}
          onPress={() => handleAnswerSelect(index, optionIndex)}
          disabled={showResults}
        >
          <Text style={[
            styles.optionText,
            selectedAnswers[index] === optionIndex && styles.selectedOptionText,
            showResults && optionIndex === question.correctAnswer && styles.correctOptionText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
      {showResults && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Giải thích:</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Video Player Section - Only shown for video type lessons */}
        {lesson.type === 'video' && lesson.videoUrl && (
          <View style={styles.videoContainer}>
            <WebView
              source={{ uri: getYouTubeEmbedUrl(lesson.videoUrl) }}
              style={styles.video}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              scalesPageToFit={true}
            />
          </View>
        )}

        {/* Lesson Content */}
        <Text style={styles.contentText}>{lesson.content}</Text>

        {/* Quiz Section - Only shown for quiz type lessons */}
        {lesson.type === 'quiz' && lesson.questions && (
          <View style={styles.quizContainer}>
            {lesson.questions.map((question, index) => renderQuizQuestion(question, index))}
            {!showResults && (
              <TouchableOpacity
                style={[
                  styles.showResultsButton,
                  selectedAnswers.length !== lesson.questions.length && styles.disabledButton
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
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#666" />
          <Text style={styles.navButtonText}>Bài trước</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.completeButton}
          onPress={handleCompleteLesson}
        >
          <Text style={styles.completeButtonText}>Hoàn thành</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.navButtonText}>Bài tiếp</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
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
    flexDirection: 'row',
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
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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