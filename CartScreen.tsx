import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  CartItem,
  clearCart,
  fetchCart,
  getCurrentUser,
  removeFromCart,
  updateCartQuantity,
  User,
} from './database';
import { getImageSource } from './ProductDetailScreen';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const loadCartData = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const items = await fetchCart(user.id);
      setCartItems(items);
    } else {
      setCartItems([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, []),
  );

  const handleUpdateQuantity = async (cartItemId: number, newQty: number) => {
    await updateCartQuantity(cartItemId, newQty);
    await loadCartData();
  };

  const handleRemoveItem = (cartItem: CartItem) => {
    Alert.alert(
      'Xóa sản phẩm',
      `Bạn có muốn bỏ sản phẩm "${cartItem.product.name}" khỏi giỏ hàng?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await removeFromCart(cartItem.id);
            await loadCartData();
          },
        },
      ],
    );
  };

  const handleClearCart = () => {
    if (!currentUser) return;
    Alert.alert('Xóa tất cả', 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa hết',
        style: 'destructive',
        onPress: async () => {
          await clearCart(currentUser.id);
          await loadCartData();
        },
      },
    ]);
  };

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shippingFee = subtotal > 0 ? 0 : 0; // Miễn phí giao hàng
  const totalAmount = subtotal + shippingFee;

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.titleText}>Chưa đăng nhập</Text>
        <Text style={styles.subText}>
          Vui lòng đăng nhập tài khoản để xem và quản lý giỏ hàng của bạn!
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header bar with Clear Cart button */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          Giỏ hàng của bạn ({cartItems.length} mặt hàng)
        </Text>
        {cartItems.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🛍️</Text>
          <Text style={styles.titleText}>Giỏ hàng đang trống</Text>
          <Text style={styles.subText}>
            Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá ngay các sản phẩm hot!
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryBtnText}>Khám phá sản phẩm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `cart-${item.id}`}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <Image
                  source={getImageSource(item.product?.img)}
                  style={styles.productImg}
                  resizeMode="cover"
                />
                <View style={styles.cartInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {item.product?.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {(item.product?.price || 0).toLocaleString('vi-VN')} đ
                  </Text>

                  {/* Quantity control */}
                  <View style={styles.qtyRow}>
                    <View style={styles.stepperBox}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Text style={styles.stepperBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveItem(item)}
                    >
                      <Text style={styles.removeBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listPadding}
          />

          {/* Checkout Bottom Sheet */}
          <View style={styles.bottomBar}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {subtotal.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.freeShipText}>Miễn phí</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPrice}>
                {totalAmount.toLocaleString('vi-VN')} đ
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() =>
                navigation.navigate('CheckoutScreen', { cartItems, totalAmount })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.checkoutBtnText}>
                Tiến hành Đặt hàng ({cartItems.length})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  clearText: {
    fontSize: 12,
    color: '#e53e3e',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listPadding: {
    padding: 12,
    paddingBottom: 20,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  productImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepperBtn: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  qtyValue: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeBtnText: {
    fontSize: 12,
    color: '#e53e3e',
    fontWeight: '600',
  },
  bottomBar: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  summaryRow: {
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
  freeShipText: {
    fontSize: 13,
    color: '#38a169',
    fontWeight: 'bold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  checkoutBtn: {
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
