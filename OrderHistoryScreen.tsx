import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  fetchOrders,
  getCurrentUser,
  Order,
  User,
} from './database';
import { getImageSource } from './ProductDetailScreen';

export default function OrderHistoryScreen() {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const loadOrders = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);

    if (user) {
      // Nếu là admin thì xem được toàn bộ, user thường xem đơn của mình
      const list =
        user.role === 'admin'
          ? await fetchOrders()
          : await fetchOrders(user.id);
      setOrders(list);
    } else {
      setOrders([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Hoàn thành':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'Đang giao':
        return { bg: '#e3f2fd', text: '#1565c0' };
      case 'Đã hủy':
        return { bg: '#ffebee', text: '#c62828' };
      default:
        return { bg: '#fff8e1', text: '#f57f17' };
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.titleText}>Chưa đăng nhập</Text>
        <Text style={styles.subText}>
          Vui lòng đăng nhập để xem lịch sử mua hàng của bạn!
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
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>
          {currentUser.role === 'admin'
            ? 'Quản lý toàn bộ Đơn hàng'
            : 'Lịch sử mua hàng của bạn'}
        </Text>
        <Text style={styles.topBarCount}>{orders.length} đơn</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.titleText}>Chưa có đơn hàng nào</Text>
          <Text style={styles.subText}>
            Bạn chưa thực hiện đơn mua hàng nào. Hãy bắt đầu chọn sắm sản phẩm công nghệ yêu thích!
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryBtnText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => `order-${item.id}`}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => {
            const statusStyle = getStatusColor(item.status);
            const isExpanded = expandedOrderId === item.id;
            const dateStr = new Date(item.createdAt).toLocaleString('vi-VN');

            return (
              <View style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderIdText}>Mã đơn: #OD-{item.id}</Text>
                    <Text style={styles.orderDate}>{dateStr}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.bg },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusStyle.text }]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Recipient Details */}
                <View style={styles.recipientBox}>
                  <Text style={styles.recipientLine}>
                    👤 Người nhận: <Text style={styles.boldText}>{item.customerName}</Text> (SĐT: {item.phone})
                  </Text>
                  <Text style={styles.recipientLine} numberOfLines={2}>
                    📍 Địa chỉ: {item.address}
                  </Text>
                </View>

                {/* Items Summary */}
                <View style={styles.itemsContainer}>
                  {item.items.map((prod, idx) => (
                    <View key={`ord-prod-${idx}`} style={styles.productRow}>
                      <Image
                        source={getImageSource(prod.img)}
                        style={styles.prodThumb}
                      />
                      <View style={styles.prodInfo}>
                        <Text style={styles.prodName} numberOfLines={1}>
                          {prod.productName}
                        </Text>
                        <Text style={styles.prodQty}>
                          {prod.quantity} × {prod.price.toLocaleString('vi-VN')} đ
                        </Text>
                      </View>
                      <Text style={styles.prodSubtotal}>
                        {(prod.price * prod.quantity).toLocaleString('vi-VN')} đ
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Total and Expand Button */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
                    <Text style={styles.totalAmount}>
                      {item.totalAmount.toLocaleString('vi-VN')} đ
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.detailToggleBtn}
                    onPress={() =>
                      setExpandedOrderId(isExpanded ? null : item.id)
                    }
                  >
                    <Text style={styles.detailToggleText}>
                      {isExpanded ? 'Thu gọn ▲' : 'Chi tiết ▼'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Expanded Details */}
                {isExpanded && item.note ? (
                  <View style={styles.expandedBox}>
                    <Text style={styles.noteTitle}>Ghi chú đơn hàng:</Text>
                    <Text style={styles.noteContent}>{item.note}</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
          contentContainerStyle={styles.listPadding}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  topBarCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
  },
  subText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listPadding: {
    padding: 12,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: 8,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  orderDate: {
    fontSize: 11,
    color: '#a0aec0',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  recipientBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  recipientLine: {
    fontSize: 12,
    color: '#4a5568',
    marginBottom: 3,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1a202c',
  },
  itemsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: 8,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  prodThumb: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#f1f2f6',
  },
  prodInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  prodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3748',
  },
  prodQty: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  prodSubtotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: '#718096',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  detailToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#edf2f7',
  },
  detailToggleText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600',
  },
  expandedBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#edf2f7',
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  noteContent: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
    fontStyle: 'italic',
  },
});
