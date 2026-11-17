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

type PaymentMethodType = 'COD' | 'SAC_BANK' | 'MOMO';

const momoQrImage = require('./assets/momo_qr.jpg');

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('COD');
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
      const paymentMethodLabel =
        paymentMethod === 'SAC_BANK'
          ? 'Chuyển khoản Sacombank (040933145794 - Đoàn Công Việt)'
          : paymentMethod === 'MOMO'
          ? 'Ví MoMo (0792455240 - Đoàn Công Việt)'
          : 'Thanh toán khi nhận hàng (COD)';

      const orderPayload = {
        userId: currentUser.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
        paymentMethod: paymentMethodLabel,
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

      const successMsg =
        paymentMethod === 'COD'
          ? `Cảm ơn bạn! Đơn hàng #${newOrder.id} đã được tiếp nhận.\nHình thức: COD (Thanh toán tiền mặt khi nhận hàng).\nTổng thanh toán: ${newOrder.totalAmount.toLocaleString('vi-VN')} đ`
          : `Cảm ơn bạn! Đơn hàng #${newOrder.id} đã được tiếp nhận.\nHình thức: ${paymentMethodLabel}.\nTổng tiền: ${newOrder.totalAmount.toLocaleString('vi-VN')} đ\n\n📌 Vui lòng hoàn tất chuyển khoản đến ${paymentMethod === 'SAC_BANK' ? 'STK 040933145794 (Sacombank)' : 'SĐT 0792455240 (MoMo)'} - Đoàn Công Việt để đơn hàng được gửi sớm nhất!`;

      Alert.alert(
        '🎉 Đặt hàng thành công!',
        successMsg,
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

        {/* Option 1: COD */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'COD' && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod('COD')}
          activeOpacity={0.8}
        >
          <Text style={styles.paymentRadio}>
            {paymentMethod === 'COD' ? '🔘' : '⚪'}
          </Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>
              💵 Thanh toán khi nhận hàng (COD)
            </Text>
            <Text style={styles.paymentDesc}>
              Thanh toán tiền mặt trực tiếp cho shipper khi nhận kiện hàng
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Sacombank */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'SAC_BANK' && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod('SAC_BANK')}
          activeOpacity={0.8}
        >
          <Text style={styles.paymentRadio}>
            {paymentMethod === 'SAC_BANK' ? '🔘' : '⚪'}
          </Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>
              🏦 Chuyển khoản Ngân hàng (Sacombank)
            </Text>
            <Text style={styles.paymentDesc}>
              STK: 040933145794 - Đoàn Công Việt
            </Text>
          </View>
        </TouchableOpacity>

        {/* Option 3: MoMo */}
        <TouchableOpacity
          style={[
            styles.paymentOption,
            paymentMethod === 'MOMO' && styles.paymentOptionActive,
          ]}
          onPress={() => setPaymentMethod('MOMO')}
          activeOpacity={0.8}
        >
          <Text style={styles.paymentRadio}>
            {paymentMethod === 'MOMO' ? '🔘' : '⚪'}
          </Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>
              📱 Chuyển tiền qua Ví MoMo
            </Text>
            <Text style={styles.paymentDesc}>
              Ví MoMo: 0792455240 - Đoàn Công Việt
            </Text>
          </View>
        </TouchableOpacity>

        {/* Sacombank Details Box */}
        {paymentMethod === 'SAC_BANK' && (
          <View style={styles.bankDetailCard}>
            <Text style={styles.bankTitle}>
              🏦 THÔNG TIN TÀI KHOẢN SACOMBANK
            </Text>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Ngân hàng:</Text>
              <Text style={styles.bankInfoValueBold}>Sacombank (CN TP.HCM)</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Số tài khoản:</Text>
              <Text style={styles.bankAccountHighlight}>040933145794</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
              <Text style={styles.bankInfoValueBold}>ĐOÀN CÔNG VIỆT</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Số tiền cần chuyển:</Text>
              <Text style={styles.bankAmountHighlight}>
                {totalAmount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Nội dung CK:</Text>
              <Text style={styles.bankTransferSyntax}>
                SHOPAPP {phone.trim() || 'SDT'}
              </Text>
            </View>
            <Text style={styles.bankNoteText}>
              💡 Sau khi đặt hàng, bạn hãy chuyển khoản đúng số tài khoản trên để đơn hàng được xác nhận và giao sớm nhất!
            </Text>
          </View>
        )}

        {/* MoMo Details Box */}
        {paymentMethod === 'MOMO' && (
          <View style={styles.momoDetailCard}>
            <Text style={styles.momoTitle}>
              📱 THÔNG TIN THANH TOÁN VÍ MOMO
            </Text>

            {/* QR Code MoMo */}
            <View style={styles.qrContainer}>
              <Image
                source={momoQrImage}
                style={styles.qrImage}
                resizeMode="contain"
              />
              <Text style={styles.qrHint}>
                ⚡ Quét mã QR bằng ứng dụng MoMo để thanh toán nhanh
              </Text>
            </View>

            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Cổng thanh toán:</Text>
              <Text style={styles.bankInfoValueBold}>Ví điện tử MoMo (24/7)</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Số điện thoại ví:</Text>
              <Text style={styles.momoPhoneHighlight}>0792455240</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Chủ tài khoản:</Text>
              <Text style={styles.bankInfoValueBold}>ĐOÀN CÔNG VIỆT</Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Số tiền cần chuyển:</Text>
              <Text style={styles.bankAmountHighlight}>
                {totalAmount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.bankInfoRow}>
              <Text style={styles.bankInfoLabel}>Lời nhắn MoMo:</Text>
              <Text style={styles.bankTransferSyntax}>
                SHOPAPP {phone.trim() || 'SDT'}
              </Text>
            </View>
            <Text style={styles.bankNoteText}>
              💡 Sau khi đặt hàng, bạn hãy mở app MoMo quét mã QR trên hoặc chuyển tiền đến số điện thoại 0792455240 kèm lời nhắn để hệ thống ghi nhận ngay!
            </Text>
          </View>
        )}
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
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  paymentOptionActive: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff5f5',
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
  bankDetailCard: {
    backgroundColor: '#0a3d62',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#ffdd59',
  },
  bankTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffdd59',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  momoDetailCard: {
    backgroundColor: '#a21b65',
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#ffc1e3',
  },
  momoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  bankInfoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  bankInfoValueBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  bankAccountHighlight: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffdd59',
    letterSpacing: 1,
  },
  momoPhoneHighlight: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  bankAmountHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  bankTransferSyntax: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffdd59',
  },
  bankNoteText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 16,
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
  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  qrImage: {
    width: 220,
    height: 250,
  },
  qrHint: {
    fontSize: 11,
    color: '#a21b65',
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
});
