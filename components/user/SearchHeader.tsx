import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchHeader: React.FC<{
  onSearchPress: () => void;
}> = ({ onSearchPress }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.searchContainer} onPress={onSearchPress}>
      <Ionicons
        name="search"
        size={20}
        color="#666"
        style={styles.searchIcon}
      />
      <Text style={styles.searchPlaceholder}>Tìm kiếm khóa học...</Text>
    </TouchableOpacity>
  </View>
);
const styles = StyleSheet.create({
    header: {
        backgroundColor: "white",
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      },
      searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
      },
      searchIcon: {
        marginRight: 8,
      },
      searchPlaceholder: {
        flex: 1,
        fontSize: 16,
        color: "#999",
      },
});
export default SearchHeader;