import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/api/axiosInstance';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// Define interfaces
interface StatData {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  totalRevenue: number;
  categoryStats: {
    name: string;
    count: number;
    revenue: number;
  }[];
}
interface TimeRangeStats {
  enrollments: number;
  users: number;
  revenue: number;
}

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statData, setStatData] = useState<StatData>({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    categoryStats: [],
  });
  const [timeRangeStats, setTimeRangeStats] = useState<TimeRangeStats>({
    enrollments: 0,
    users: 0,
    revenue: 0,
  });

  // Date range state
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
  ); // Default to last 30 days
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Fetch statistics data
  const fetchStatistics = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_STATISTICS_ADMIN}`
      );
      if (response.status === 200) {
        setStatData(response.data);
      } else {
        Alert.alert('Lỗi', `Failed to fetch. Status: ${response.status}`, [{ text: 'OK' }]);
      }
      /*
      const response = await axiosInstance.get('/api/statistics', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      setStatData(response.data);
      */
    } catch (error) {
      console.error('Error fetching statistics:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTimeRangeStats = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_TIME_RANGE_STATS}`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }
      );
      if (response.status === 200) {
        setTimeRangeStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching time range stats:', error);
      Alert.alert('Lỗi', 'Không thể tải thống kê theo khoảng thời gian.');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchTimeRangeStats();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const handleStartConfirm = (date: Date) => {
    setStartDate(date);
    setShowStartDatePicker(false);
  };

  const handleEndConfirm = (date: Date) => {
    setEndDate(date);
    setShowEndDatePicker(false);
  };

  const createSummarySheet = () => {
    const data = [
      ['Thống kê tổng quan', '', ''],
      ['Chỉ số', 'Giá trị', ''],
      ['Tổng số khóa học', statData.totalCourses, ''],
      ['Tổng số người dùng', statData.totalUsers, ''],
      ['Tổng số đăng ký', statData.totalEnrollments, ''],
      ['Tổng doanh thu', formatCurrency(statData.totalRevenue), ''],
      [],
      ['Thống kê theo khoảng thời gian', '', ''],
      ['Khoảng thời gian', `${formatDate(startDate)} - ${formatDate(endDate)}`, ''],
      ['Số đăng ký mới', timeRangeStats.enrollments, ''],
      ['Số người dùng mới', timeRangeStats.users, ''],
      ['Doanh thu', formatCurrency(timeRangeStats.revenue), ''],
      [],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } },
    ];
    return ws;
  };

  const createCategorySheet = () => {
    const data = [
      ['Phân bố khóa học theo danh mục', '', ''],
      ['Danh mục', 'Số lượng', 'Doanh thu'],
      ...statData.categoryStats.map(item => [item.name, item.count, formatCurrency(item.revenue)]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    return ws;
  };

  // Function to export data to Excel
  const exportToExcel = async () => {
    try {
      // Tạo workbook mới
      const wb = XLSX.utils.book_new();

      // Tạo và thêm các sheet vào workbook
      const wsSummary = createSummarySheet();
      const wsCategory = createCategorySheet();
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');
      XLSX.utils.book_append_sheet(wb, wsCategory, 'Phân bố danh mục');

      // Xuất workbook ra base64
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // Tạo tên file
      const date = new Date();
      const fileName = `thong_ke_${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.xlsx`;

      // Lưu file tạm
      const tempFilePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(tempFilePath, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Chia sẻ file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Lưu file thống kê',
          UTI: 'com.microsoft.excel.xlsx',
        });
        await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
        Alert.alert('Thành công', `Đã lưu file thống kê thành công!\nTên file: ${fileName}`);
      } else {
        Alert.alert('Lỗi', 'Chức năng chia sẻ không khả dụng trên thiết bị này.');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu. Vui lòng thử lại sau.');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Đang tải dữ liệu thống kê...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={exportToExcel}>
            <Ionicons name="document-outline" size={24} color="#4a6ee0" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#4a6ee0']} />
        }
      >
        {/* Date Range Selection */}
        <View style={styles.dateRangeContainer}>
          <Text style={styles.sectionTitle}>Chọn khoảng thời gian</Text>
          <View style={styles.datePickerContainer}>
            {/* Chọn ngày bắt đầu */}
            <View style={styles.datePicker}>
              <Text style={styles.dateLabel}>Từ ngày:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#4a6ee0" />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showStartDatePicker}
                mode="date"
                date={startDate}
                onConfirm={handleStartConfirm}
                onCancel={() => setShowStartDatePicker(false)}
              />
            </View>

            {/* Chọn ngày kết thúc */}
            <View style={styles.datePicker}>
              <Text style={styles.dateLabel}>Đến ngày:</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                <Ionicons name="calendar-outline" size={20} color="#4a6ee0" />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showEndDatePicker}
                mode="date"
                date={endDate}
                onConfirm={handleEndConfirm}
                onCancel={() => setShowEndDatePicker(false)}
              />
            </View>
          </View>

          {/* Nút Lọc */}
          <TouchableOpacity style={styles.filterButton} onPress={fetchTimeRangeStats}>
            <Text style={styles.filterButtonText}>Lọc</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thống kê theo khoảng thời gian</Text>
          <View style={styles.timeRangeInfo}>
            <Text style={styles.timeRangeText}>
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(74, 110, 224, 0.1)' }]}
              >
                <Ionicons name="school-outline" size={24} color="#4a6ee0" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Đăng ký mới</Text>
                <Text style={styles.statsValue}>{timeRangeStats.enrollments}</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 99, 132, 0.1)' }]}
              >
                <Ionicons name="people-outline" size={24} color="#FF6384" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Người dùng mới</Text>
                <Text style={styles.statsValue}>{timeRangeStats.users}</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 206, 86, 0.1)' }]}
              >
                <Ionicons name="cash-outline" size={24} color="#FFCE56" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Doanh thu</Text>
                <Text style={styles.statsValue}>{formatCurrency(timeRangeStats.revenue)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Overall Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(74, 110, 224, 0.1)' }]}
              >
                <Ionicons name="book-outline" size={24} color="#4a6ee0" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Tổng số khóa học</Text>
                <Text style={styles.statsValue}>{statData.totalCourses}</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 99, 132, 0.1)' }]}
              >
                <Ionicons name="people-outline" size={24} color="#FF6384" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Tổng số người dùng</Text>
                <Text style={styles.statsValue}>{statData.totalUsers}</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(75, 192, 192, 0.1)' }]}
              >
                <Ionicons name="school-outline" size={24} color="#4BC0C0" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Tổng số đăng ký</Text>
                <Text style={styles.statsValue}>{statData.totalEnrollments}</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <View
                style={[styles.statsIconContainer, { backgroundColor: 'rgba(255, 206, 86, 0.1)' }]}
              >
                <Ionicons name="cash-outline" size={24} color="#FFCE56" />
              </View>
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsLabel}>Tổng doanh thu</Text>
                <Text style={styles.statsValue}>{formatCurrency(statData.totalRevenue)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Statistics */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Phân bố theo danh mục</Text>

          <View style={styles.categoryTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Danh mục</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Số lượng</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Doanh thu</Text>
            </View>

            {statData.categoryStats.map((category, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{category.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{category.count}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {formatCurrency(category.revenue)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 50 : 20,
  },
  headerButton: {
    marginLeft: 16,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  dateRangeContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    marginTop: 10,
    alignSelf: 'stretch', // hoặc 'center' nếu wrap bằng View canh giữa
    backgroundColor: '#4a6ee0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center', // căn giữa nội dung trong button
  },

  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  sectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  timeRangeInfo: {
    marginBottom: 16,
  },
  timeRangeText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsTextContainer: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTable: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    fontSize: 14,
    color: '#333',
  },
});

export default DashboardScreen;
