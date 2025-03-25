import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

// Define user interface
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalCourses: number;
}

const AccountScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    // Mock API call - replace with actual API in production
    setTimeout(() => {
      setUser({
        id: '123456',
        name: 'Hieu Nguyen',
        email: 'hieu.nguyen@example.com',
        avatar: 'https://via.placeholder.com/150',
        totalCourses: 5
      });
      setLoading(false);
    }, 800);
  }, []);

  const handleLogout = () => {
    // Handle logout functionality
    console.log('Logging out...');
    // In a real app, you would clear tokens, user data, etc.
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading account information...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.avatar }} 
            style={styles.avatar} 
          />
          {/*<TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={18} color="white" />
          </TouchableOpacity>*/}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user?.totalCourses}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            {/* You can add more stats here if needed */}
          </View>
        </View>
      </View>
      
      {/* Action Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="person-outline" size={22} color="#4a6ee0" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Profile</Text>
            <Text style={styles.menuSubtext}>Edit your personal information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="book-outline" size={22} color="#4a6ee0" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Enrollments</Text>
            <Text style={styles.menuSubtext}>Manage your course enrollments</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="notifications-outline" size={22} color="#4a6ee0" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuSubtext}>Configure notification preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="settings-outline" size={22} color="#4a6ee0" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.menuSubtext}>App preferences and account settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.separator} />
      
      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={22} color="#e04a4a" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4a6ee0',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  stat: {
    alignItems: 'center',
    padding: 10,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a6ee0',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: '#999',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#e04a4a',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 30,
  },
});

export default AccountScreen