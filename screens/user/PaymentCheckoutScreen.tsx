import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { MyScreenProps } from '@/types/MyScreenProps';
import axiosInstance from '@/api/axiosInstance';
import { Course } from '@/types/apiModels';
import { Ionicons } from '@expo/vector-icons';
import { ToastType } from '@/components/NotificationToast';
import NotificationToast from '@/components/NotificationToast';

const PaymentCheckoutScreen: React.FC<MyScreenProps['PaymentCheckoutScreenProps']> = ({
  navigation,
  route,
}) => {
  const { courseId } = route.params;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>(ToastType.SUCCESS);

  const { confirmPayment } = useConfirmPayment();

  const showToast = (message: string, type: ToastType) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchCourseById();
  }, []);

  const fetchCourseById = async (): Promise<void> => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_API_GET_COURSE_BY_ID}`.replace(':id', courseId.toString())
      );
      setCourse(response?.data?.course);
    } catch (error) {
      showToast('Không thể tải thông tin khóa học', ToastType.ERROR);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentIntentClientSecret = async () => {
    try {
      const response = await axiosInstance.post(
        process.env.EXPO_PUBLIC_API_CREATE_PAYMENT_INTENT || '',
        {
          courseId,
        }
      );
      return response.data.clientSecret;
    } catch (error) {
      showToast('Không thể tạo giao dịch thanh toán', ToastType.ERROR);
      throw error;
    }
  };

  const formatPrice = (price: number): string => {
    if (price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  const handlePayPress = async () => {
    if (!course) return;

    try {
      setPaymentLoading(true);

      const clientSecret = await fetchPaymentIntentClientSecret();

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        showToast(error.message, ToastType.ERROR);
      } else if (paymentIntent) {
        showToast('Thanh toán thành công!', ToastType.SUCCESS);

        await axiosInstance.post(process.env.EXPO_PUBLIC_API_PROCESS_PAYMENT || '', {
          paymentIntentId: paymentIntent.id,
        });

        navigation.navigate('DetailCourseScreen', {
          courseId,
          message: `Thanh toán thành công cho khóa học ${course?.name}!`,
        });
      }
    } catch (error) {
      showToast('Thanh toán thất bại. Vui lòng thử lại.', ToastType.ERROR);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ee0" />
        <Text style={styles.loadingText}>Đang tải thông tin khóa học...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy khóa học</Text>
        <Text style={styles.errorSubText}>Vui lòng thử lại sau</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh Toán</Text>
        </View>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{course.name}</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
          <View style={styles.priceContainer}>
            {course.discount > 0 ? (
              <View style={styles.discountContainer}>
                <Text style={styles.discountPrice}>
                  {formatPrice(course.price - course.discount)}
                </Text>
                <Text style={styles.originalPrice}>{formatPrice(course.price)}</Text>
              </View>
            ) : (
              <Text style={styles.price}>{formatPrice(course.price)}</Text>
            )}
          </View>
        </View>

        <View style={styles.paymentSection}>
          <View style={styles.paymentHeader}>
            <Text style={styles.sectionTitle}>Thông Tin Thanh Toán</Text>
            <Image
              source={require('../../assets/images/stripe-powered.png')}
              style={styles.stripeLogo}
            />
          </View>
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
              expiration: 'MM/YY',
              cvc: 'CVC',
            }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
              borderColor: '#E5E7EB',
            }}
            style={styles.cardField}
          />
          <View style={styles.paymentMethods}>
            <Image
              source={require('../../assets/images/payment-methods.png')}
              style={styles.paymentMethodsImage}
            />
          </View>
        </View>

        <View style={styles.securitySection}>
          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark" size={20} color="#059669" />
            <Text style={styles.securityText}>Thanh toán được bảo mật bởi Stripe</Text>
          </View>
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed" size={20} color="#059669" />
            <Text style={styles.securityText}>Dữ liệu thẻ được mã hóa</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, paymentLoading && styles.payButtonDisabled]}
          onPress={handlePayPress}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Thanh Toán Ngay</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={2000}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  courseInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stripeLogo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  },
  paymentMethods: {
    alignItems: 'center',
    marginTop: 8,
  },
  paymentMethodsImage: {
    width: 500,
    height: 130,
    resizeMode: 'contain',
    marginRight: 0,
  },
  securitySection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityText: {
    marginLeft: 8,
    color: '#4B5563',
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#4A6EE0',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentCheckoutScreen;
