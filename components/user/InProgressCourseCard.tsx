import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Strings } from '@/constants/Strings';
import { ContinueCourse } from '@/types/MyInterfaces';
import { formatDateTime } from '@/utils/datetime';

const InProgressCourseCard: React.FC<{
  item: ContinueCourse | null;
  onPress: () => void;
  renderProgressBar: (props: { progress?: number }) => React.ReactNode;
}> = ({ item, onPress, renderProgressBar }) => (
  <TouchableOpacity style={styles.continueCard} onPress={onPress}>
    {item?.image ? (
      <Image source={{ uri: item?.image }} style={styles.continueImage} />
    ) : (
      <Image source={require('../../assets/images/course.jpg')} style={styles.continueImage} />
    )}
    <View style={styles.continueContent}>
      <Text style={styles.continueTitle} numberOfLines={1}>
        {item?.name}
      </Text>
      <Text style={styles.continueLesson} numberOfLines={1}>
        {item?.description}
      </Text>
      <View style={styles.progressContainer}>
        {renderProgressBar({ progress: item?.progress })}
        <Text style={styles.progressText}>
          {item?.progress}% {Strings.user_home.complete}
        </Text>
      </View>
      <Text style={styles.lastAccessed}>
        {Strings.user_home.last_accessed}: {formatDateTime(item?.last_accessed || '')}
      </Text>
    </View>
    <TouchableOpacity style={styles.playButton}>
      <Ionicons name="play-circle" size={36} color="#4a6ee0" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  continueCard: {
    flexDirection: 'row',
    backgroundColor: '#fdfcfc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  continueContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  continueLesson: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a6ee0',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  lastAccessed: {
    fontSize: 12,
    color: '#999',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});

export default InProgressCourseCard;
