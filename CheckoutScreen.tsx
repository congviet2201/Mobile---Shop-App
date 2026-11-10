import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CartItem,
  createOrder,
  fetchCart,
  getCurrentUser,
  User,
} from './database';
import { getImageSource } from './ProductDetailScreen';

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(
    route.params?.cartItems || [],
  );
  const [totalAmount, setTotalAmount] = useState<number>(
    route.params?.totalAmount || 0,
  );

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const user = await getCurrentUser();
      if (!isMounted) return;
      setCurrentUser(user);

      if (user) {
        setCustomerName(user.name || user.username || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');

        const routeCart = route.params?.cartItems;
        if (!routeCart || routeCart.length === 0) {
          const items = await fetchCart(user.id);
          if (isMounted) {
            setCartItems(items);
            const total = items.reduce(
              (sum, it) => sum + (it.product?.price || 0) * it.quantity,
              0,
            );
            setTotalAmount(total);
          }
        }
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [route.params?.cartItems]);

  const handleConfirmOrder = async () => {
    if (!currentUser) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để tiến hành đặt hàng!');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên người nhận hàng!');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại nhận hàng!');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng!');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Không có sản phẩm nào để đặt hàng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: currentUser.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          img: item.product.img,
        })),
      };

      const newOrder = await createOrder(orderPayload);
      setIsSubmitting(false);

      Alert.alert(
        '🎉 Đặt hàng thành công!',
        `Cảm ơn bạn! Đơn hàng #${newOrder.id} đã được tiếp nhận và đang được xử lý.\nTổng thanh toán: ${newOrder.totalAmount.toLocaleString('vi-VN')} đ`,
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => navigation.navigate('OrderHistoryScreen'),
          },
          {
            text: 'Về trang chủ',
            onPress: () => navigation.navigate('Home'),
          },
        ],
      );
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Lỗi đặt hàng', err.message || 'Không thể tạo đơn hàng!');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* 1. Customer Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Thông tin giao hàng</Text>

        <Text style={styles.inputLabel}>Họ và tên người nhận *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên..."
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.inputLabel}>Số điện thoại liên hệ *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại (ví dụ: 0901234567)"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.inputLabel}>Địa chỉ nhận hàng chi tiết *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
          multiline
          numberOfLines={2}
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.inputLabel}>Ghi chú đơn hàng (tùy chọn)</Text>
        <TextInput
          style={styles.input}
          placeholder="Lời nhắn cho người giao hàng..."
          value={note}
          onChangeText={setNote}
        />
      </View>

      {/* 2. Order Items Review Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          📦 Danh sách sản phẩm ({cartItems.length})
        </Text>

        {cartItems.map((item) => (
          <View key={`review-${item.id}`} style={styles.itemRow}>
            <Image
              source={getImageSource(item.product?.img)}
              style={styles.itemThumb}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.product?.name}
              </Text>
              <Text style={styles.itemMeta}>
                Số lượng: {item.quantity} ×{' '}
                {(item.product?.price || 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <Text style={styles.itemSubtotal}>
              {((item.product?.price || 0) * item.quantity).toLocaleString(
                'vi-VN',
              )}{' '}
              đ
            </Text>
          </View>
        ))}
      </View>

      {/* 3. Payment Method Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 Hình thức thanh toán</Text>
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentRadio}>🔘</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>
              Thanh toán khi nhận hàng (COD)
            </Text>
            <Text style={styles.paymentDesc}>
              Thanh toán tiền mặt trực tiếp cho nhân viên giao hàng
            </Text>
          </View>
        </View>
      </View>

      {/* 4. Order Summary Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💰 Chi tiết thanh toán</Text>
        <View style={styles.summaryLine}>
          <Text style={styles.summaryLabel}>Tổng tiền hàng:</Text>
          <Text style={styles.summaryValue}>
            {totalAmount.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <View style={styles.summaryLine}>
          <Text style={styles.summaryLabel}>Phí giao hàng:</Text>
          <Text style={styles.freeShip}>Miễn phí</Text>
        </View>
        <View style={[styles.summaryLine, styles.totalLine]}>
          <Text style={styles.totalLabel}>Tổng cần thanh toán:</Text>
          <Text style={styles.totalValue}>
            {totalAmount.toLocaleString('vi-VN')} đ
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={handleConfirmOrder}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitBtnText}>
          {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  container: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e4e7eb',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#2d3748',
    backgroundColor: '#fafbfc',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  itemInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
  },
  itemMeta: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentRadio: {
    fontSize: 18,
    marginRight: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  paymentDesc: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#718096',
  },
  summaryValue: {
    fontSize: 13,
    color: '#2d3748',
    fontWeight: '600',
  },
  freeShip: {
    fontSize: 13,
    color: '#38a169',
    fontWeight: 'bold',
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  submitBtn: {
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#e57373',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
