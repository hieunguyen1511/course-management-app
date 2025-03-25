import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'

const DashboardScreen = () => {
  // State for dashboard data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    // Simulate API call with mock data
    // Replace with actual API calls in production
    setTimeout(() => {
      setStats({
        totalUsers: 245,
        totalCourses: 12,
      });
      
      setRecentActivity([
        { id: 1, type: 'enrollment', user: 'John Doe', course: 'React Native Basics', time: '2 hours ago' },
        { id: 2, type: 'completion', user: 'Sarah Smith', course: 'Advanced JavaScript', time: '5 hours ago' },
        { id: 3, type: 'review', user: 'Mike Johnson', course: 'UI/UX Design', rating: 4.5, time: '1 day ago' },
        { id: 4, type: 'enrollment', user: 'Emma Wilson', course: 'Flutter Development', time: '1 day ago' },
        { id: 5, type: 'completion', user: 'Robert Brown', course: 'Node.js Fundamentals', time: '2 days ago' },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Admin Dashboard</Text>
      
      {loading ? (
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCourses}</Text>
              <Text style={styles.statLabel}>Total Courses</Text>
            </View>
          </View>
          
          {/* Recent Activity */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            
            {recentActivity.map(activity => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Text style={styles.activityIcon}>
                    {activity.type === 'enrollment' ? '📝' : 
                     activity.type === 'completion' ? '🎓' : '⭐'}
                  </Text>
                </View>
                
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    <Text style={styles.userName}>{activity.user}</Text>
                    {activity.type === 'enrollment' ? ' enrolled in ' : 
                     activity.type === 'completion' ? ' completed ' : ' reviewed '}
                    <Text style={styles.courseName}>{activity.course}</Text>
                    {activity.type === 'review' ? ` (${activity.rating}⭐)` : ''}
                  </Text>
                  <Text style={styles.timeText}>{activity.time}</Text>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Activity</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa'
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a6ee0',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
  },
  courseName: {
    fontWeight: '500',
    color: '#4a6ee0',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    borderRadius: 4,
  },
  viewAllText: {
    color: '#4a6ee0',
    fontWeight: '500',
  }
});

export default DashboardScreen