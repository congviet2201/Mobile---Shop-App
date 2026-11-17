import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  addCategory,
  addProduct,
  Category,
  deleteCategory,
  deleteOrder,
  deleteProduct,
  deleteUser,
  fetchCategories,
  fetchOrders,
  fetchProducts,
  fetchUsers,
  getCurrentUser,
  Order,
  Product,
  updateCategory,
  updateOrderStatus,
  updateProduct,
  updateUserRole,
  User,
} from './database';
import { getImageSource } from './ProductDetailScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AdminTab = 'users' | 'categories' | 'products' | 'orders' | 'statistics';

export default function AdminDashboard() {
  const navigation = useNavigation<any>();

  // Data states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Category Modal State
  const [catModalVisible, setCatModalVisible] = useState(false);
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [currentEditCatId, setCurrentEditCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  // Product Modal State
  const [prodModalVisible, setProdModalVisible] = useState(false);
  const [isEditingProd, setIsEditingProd] = useState(false);
  const [currentEditProdId, setCurrentEditProdId] = useState<number | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState<number>(1);
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('iphone15.jpg');

  // Order Management State
  const [orderFilter, setOrderFilter] = useState<'Tất cả' | Order['status']>('Tất cả');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);

  // ==========================================
  // THỐNG KÊ DOANH THU & ĐƠN HÀNG (STATISTICS)
  // ==========================================
  const totalOrdersCount = orders.length;
  const completedOrdersList = useMemo(
    () => orders.filter((o) => o.status === 'Hoàn thành'),
    [orders],
  );
  const cancelledOrdersList = useMemo(
    () => orders.filter((o) => o.status === 'Đã hủy'),
    [orders],
  );
  const shippingOrdersList = useMemo(
    () => orders.filter((o) => o.status === 'Đang giao'),
    [orders],
  );
  const processingOrdersList = useMemo(
    () => orders.filter((o) => o.status === 'Đang xử lý'),
    [orders],
  );

  // 1. Tổng doanh thu thực tế (Từ đơn hàng ĐÃ HOÀN THÀNH)
  const totalCompletedRevenue = useMemo(
    () => completedOrdersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [completedOrdersList],
  );

  // 2. Giá trị đơn hàng dự kiến thu (Đang xử lý + Đang giao)
  const pendingRevenue = useMemo(
    () =>
      [...processingOrdersList, ...shippingOrdersList].reduce(
        (sum, o) => sum + (o.totalAmount || 0),
        0,
      ),
    [processingOrdersList, shippingOrdersList],
  );

  // 3. Giá trị đơn hàng đã hủy
  const cancelledRevenue = useMemo(
    () => cancelledOrdersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [cancelledOrdersList],
  );

  // 4. Tỷ lệ %
  const completedPercent =
    totalOrdersCount > 0
      ? Math.round((completedOrdersList.length / totalOrdersCount) * 100)
      : 0;
  const cancelledPercent =
    totalOrdersCount > 0
      ? Math.round((cancelledOrdersList.length / totalOrdersCount) * 100)
      : 0;
  const processingPercent =
    totalOrdersCount > 0
      ? Math.round((processingOrdersList.length / totalOrdersCount) * 100)
      : 0;
  const shippingPercent =
    totalOrdersCount > 0
      ? Math.round((shippingOrdersList.length / totalOrdersCount) * 100)
      : 0;

  // 5. Giá trị trung bình đơn hàng hoàn tất (AOV)
  const avgOrderValue =
    completedOrdersList.length > 0
      ? Math.round(totalCompletedRevenue / completedOrdersList.length)
      : 0;

  // 6. Tổng số sản phẩm đã bán trong các đơn hoàn tất
  const totalProductsSold = useMemo(() => {
    return completedOrdersList.reduce((sum, o) => {
      const itemsCount = (o.items || []).reduce(
        (iSum, item) => iSum + (item.quantity || 1),
        0,
      );
      return sum + itemsCount;
    }, 0);
  }, [completedOrdersList]);

  const loadData = useCallback(async () => {
    try {
      const curUser = await getCurrentUser();
      // Yêu cầu 1: Kiểm tra quyền Admin - Người dùng thông thường hoặc khách không được phép truy cập
      if (!curUser || curUser.role !== 'admin') {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Trang này chỉ dành riêng cho Quản trị viên (Admin)!',
          [
            {
              text: 'Về trang chủ',
              onPress: () => navigation.navigate('Home'),
            },
          ],
        );
        navigation.navigate('Home');
        return;
      }
      setCurrentUser(curUser);

      const [uList, cList, pList, oList] = await Promise.all([
        fetchUsers(),
        fetchCategories(),
        fetchProducts(),
        fetchOrders(),
      ]);

      setUsers(uList);
      setCategories(cList);
      setProducts(pList);
      setOrders(oList);
    } catch (e) {
      console.error('Lỗi tải dữ liệu admin:', e);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất Admin', 'Bạn có muốn đăng xuất tài khoản quản trị?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('loggedInUser');
          Alert.alert('Thông báo', 'Đã đăng xuất tài khoản quản trị!');
          navigation.navigate('Login');
        },
      },
    ]);
  };

  // ==========================================
  // USER MANAGEMENT HANDLERS (2.4)
  // ==========================================
  const handleToggleUserRole = (targetUser: User) => {
    if (targetUser.username.toLowerCase() === 'admin') {
      Alert.alert('Không thể thay đổi', 'Tài khoản admin mặc định không thể thay đổi vai trò!');
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const roleLabel = newRole === 'admin' ? 'Quản trị viên (admin)' : 'Khách hàng (user)';

    Alert.alert(
      'Thay đổi vai trò người dùng',
      `Bạn có muốn chuyển vai trò của "${targetUser.username}" thành "${roleLabel}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              await updateUserRole(targetUser.id, newRole);
              Alert.alert('Thành công', `Đã cập nhật vai trò "${targetUser.username}" thành ${newRole}!`);
              await loadData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể cập nhật vai trò!');
            }
          },
        },
      ],
    );
  };

  const handleDeleteUser = (targetUser: User) => {
    if (targetUser.username.toLowerCase() === 'admin') {
      Alert.alert('Không được phép', 'Không thể xóa tài khoản Admin mặc định!');
      return;
    }
    if (currentUser && currentUser.id === targetUser.id) {
      Alert.alert('Không được phép', 'Không thể xóa chính tài khoản Admin bạn đang đăng nhập!');
      return;
    }

    Alert.alert(
      'Xác nhận xóa tài khoản',
      `Bạn có chắc chắn muốn xóa tài khoản "${targetUser.username}" (ID: #${targetUser.id}) không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(targetUser.id);
              Alert.alert('Thành công', `Đã xóa tài khoản "${targetUser.username}"!`);
              await loadData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa tài khoản!');
            }
          },
        },
      ],
    );
  };

  // ==========================================
  // CATEGORY MANAGEMENT HANDLERS (2.5)
  // ==========================================
  const handleOpenAddCategory = () => {
    setIsEditingCat(false);
    setCurrentEditCatId(null);
    setCatName('');
    setCatDescription('');
    setCatModalVisible(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setIsEditingCat(true);
    setCurrentEditCatId(cat.id);
    setCatName(cat.name);
    setCatDescription(cat.description || '');
    setCatModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên danh mục!');
      return;
    }

    try {
      if (isEditingCat && currentEditCatId !== null) {
        await updateCategory({
          id: currentEditCatId,
          name: catName.trim(),
          description: catDescription.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật danh mục thành công!');
      } else {
        await addCategory(catName.trim(), catDescription.trim());
        Alert.alert('Thành công', 'Đã thêm danh mục mới thành công!');
      }
      setCatModalVisible(false);
      await loadData();
    } catch (err: any) {
      Alert.alert('Lỗi danh mục', err.message || 'Không thể lưu danh mục!');
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    const prodsInCat = products.filter((p) => p.categoryId === cat.id);
    if (prodsInCat.length > 0) {
      Alert.alert(
        'Không thể xóa danh mục',
        `Danh mục "${cat.name}" hiện đang có ${prodsInCat.length} sản phẩm. Bạn cần xóa hoặc chuyển sản phẩm trước!`,
      );
      return;
    }

    Alert.alert(
      'Xác nhận xóa danh mục',
      `Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(cat.id);
              Alert.alert('Thành công', `Đã xóa danh mục "${cat.name}"!`);
              await loadData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa danh mục!');
            }
          },
        },
      ],
    );
  };

  const handleAddProductToCategory = (catId: number) => {
    setIsEditingProd(false);
    setCurrentEditProdId(null);
    setProdName('');
    setProdPrice('');
    setProdCategoryId(catId);
    setProdDescription('');
    setProdImage('iphone15.jpg');
    setProdModalVisible(true);
  };

  // ==========================================
  // PRODUCT MANAGEMENT HANDLERS (2.6)
  // ==========================================
  const handleOpenAddProduct = () => {
    setIsEditingProd(false);
    setCurrentEditProdId(null);
    setProdName('');
    setProdPrice('');
    setProdCategoryId(categories[0]?.id || 1);
    setProdDescription('');
    setProdImage('iphone15.jpg');
    setProdModalVisible(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setIsEditingProd(true);
    setCurrentEditProdId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price.toString());
    setProdCategoryId(prod.categoryId);
    setProdDescription(prod.description || '');
    setProdImage(prod.img || 'iphone15.jpg');
    setProdModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên sản phẩm!');
      return;
    }
    const numPrice = parseFloat(prodPrice);
    if (!prodPrice.trim() || isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Giá không hợp lệ', 'Vui lòng nhập giá sản phẩm là số dương (> 0)!');
      return;
    }
    if (!prodCategoryId) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn danh mục cho sản phẩm!');
      return;
    }

    try {
      if (isEditingProd && currentEditProdId !== null) {
        await updateProduct({
          id: currentEditProdId,
          name: prodName.trim(),
          price: numPrice,
          categoryId: prodCategoryId,
          img: prodImage,
          description: prodDescription.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm thành công!');
      } else {
        await addProduct({
          name: prodName.trim(),
          price: numPrice,
          categoryId: prodCategoryId,
          img: prodImage,
          description: prodDescription.trim(),
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới thành công!');
      }
      setProdModalVisible(false);
      await loadData();
    } catch (err: any) {
      Alert.alert('Lỗi sản phẩm', err.message || 'Không thể lưu sản phẩm!');
    }
  };

  const handleDeleteProduct = (prod: Product) => {
    Alert.alert(
      'Xác nhận xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa sản phẩm "${prod.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(prod.id);
              Alert.alert('Thành công', `Đã xóa sản phẩm "${prod.name}"!`);
              await loadData();
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa sản phẩm!');
            }
          },
        },
      ],
    );
  };

  const getSegmentStyle = (percent: number, bgStyle: any) => [
    styles.progressBarSegment,
    bgStyle,
    { width: `${percent}%` as const },
  ];

  const getCategoryName = (catId: number) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.name : 'Chưa phân loại';
  };

  const sampleImages = [
    { key: 'iphone15.jpg', label: 'iPhone' },
    { key: 's24.jpg', label: 'Galaxy' },
    { key: 'macbook.jpg', label: 'MacBook' },
    { key: 'ipad.jpg', label: 'iPad' },
    { key: 'hinh1.jpg', label: 'Tai nghe' },
    { key: 'hinh2.jpg', label: 'Đồng hồ' },
  ];

  // ==========================================
  // ORDER MANAGEMENT HANDLERS
  // ==========================================
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'Tất cả') {
      return orders;
    }
    return orders.filter((o) => o.status === orderFilter);
  }, [orders, orderFilter]);

  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: Order['status'],
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // RÀNG BUỘC LOGIC: Không cho đổi trạng thái nếu đơn đã hoàn thành hoặc đã hủy
    if (targetOrder.status === 'Hoàn thành' || targetOrder.status === 'Đã hủy') {
      Alert.alert(
        'Không thể đổi trạng thái',
        `Đơn hàng #OD-${orderId} đã ở trạng thái "${targetOrder.status}". Trạng thái này đã được khóa cố định và không thể thay đổi!`,
      );
      return;
    }

    // Ràng buộc quy trình: Chỉ đơn "Đang xử lý" mới được thay đổi trạng thái (hoặc "Đang giao" -> "Hoàn thành")
    if (
      targetOrder.status !== 'Đang xử lý' &&
      !(targetOrder.status === 'Đang giao' && newStatus === 'Hoàn thành')
    ) {
      Alert.alert(
        'Ràng buộc quy trình',
        'Chỉ những đơn hàng ở trạng thái "Đang xử lý" mới được phép thay đổi trạng thái!',
      );
      return;
    }

    try {
      await updateOrderStatus(orderId, newStatus);
      const updated = await fetchOrders();
      setOrders(updated);
      Alert.alert(
        'Thành công',
        `Đơn hàng #OD-${orderId} đã được chuyển sang trạng thái "${newStatus}"!`,
      );
    } catch (e) {
      console.error('Lỗi cập nhật trạng thái đơn:', e);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng!');
    }
  };

  const handleDeleteOrder = (targetOrder: Order) => {
    Alert.alert(
      'Xác nhận xóa đơn hàng',
      `Bạn có chắc chắn muốn xóa đơn hàng #OD-${targetOrder.id} của khách "${targetOrder.customerName}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder(targetOrder.id);
              const updated = await fetchOrders();
              setOrders(updated);
              Alert.alert('Thành công', `Đã xóa đơn hàng #OD-${targetOrder.id}!`);
            } catch (e) {
              console.error('Lỗi khi xóa đơn hàng:', e);
              Alert.alert('Lỗi', 'Không thể xóa đơn hàng!');
            }
          },
        },
      ],
    );
  };

  const getOrderStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Hoàn thành':
        return {
          badgeStyle: styles.statusCompleted,
          textStyle: styles.statusCompletedText,
        };
      case 'Đang giao':
        return {
          badgeStyle: styles.statusShipping,
          textStyle: styles.statusShippingText,
        };
      case 'Đã hủy':
        return {
          badgeStyle: styles.statusCancelled,
          textStyle: styles.statusCancelledText,
        };
      default:
        return {
          badgeStyle: styles.statusProcessing,
          textStyle: styles.statusProcessingText,
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Admin Top Banner */}
      <View style={styles.topCard}>
        <View style={styles.topHeaderRow}>
          <View style={styles.topTitleContainer}>
            <Text style={styles.adminBadge}>⚡ BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN</Text>
            <Text style={styles.dashboardTitle}>
              Xin chào, {currentUser?.username || 'Admin'}
            </Text>
          </View>
          {/* Nút đăng xuất góc phải trên màn hình */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>🚪 Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statBox, activeTab === 'users' && styles.statBoxActive]}
            onPress={() => setActiveTab('users')}
            activeOpacity={0.8}
          >
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Người dùng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, activeTab === 'categories' && styles.statBoxActive]}
            onPress={() => setActiveTab('categories')}
            activeOpacity={0.8}
          >
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Loại SP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, activeTab === 'products' && styles.statBoxActive]}
            onPress={() => setActiveTab('products')}
            activeOpacity={0.8}
          >
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Sản phẩm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, activeTab === 'orders' && styles.statBoxActive]}
            onPress={() => setActiveTab('orders')}
            activeOpacity={0.8}
          >
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statBox, activeTab === 'statistics' && styles.statBoxActive]}
            onPress={() => setActiveTab('statistics')}
            activeOpacity={0.8}
          >
            <Text style={styles.statNumber}>📊</Text>
            <Text style={styles.statLabel}>Thống kê</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Nav Button */}
        <TouchableOpacity
          style={styles.shopNavBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.shopNavBtnText}>🛍️ Đi đến Cửa hàng (HomeScreen)</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Four Main Management Selector Buttons */}
      <View style={styles.tabSelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabSelectorRow}
        >
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'users' && styles.tabBtnTextActive,
            ]}
          >
            👥 Người dùng ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'categories' && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('categories')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'categories' && styles.tabBtnTextActive,
            ]}
          >
            📂 Loại SP ({categories.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
          onPress={() => setActiveTab('products')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'products' && styles.tabBtnTextActive,
            ]}
          >
            📦 Sản phẩm ({products.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'orders' && styles.tabBtnTextActive,
            ]}
          >
            📋 Đơn hàng ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'statistics' && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('statistics')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'statistics' && styles.tabBtnTextActive,
            ]}
          >
            📊 Thống kê
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>

      {/* 3. Section Content */}
      {/* ================= USER MANAGEMENT (2.4) ================= */}
      {activeTab === 'users' && (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Danh sách tài khoản hệ thống ({users.length})
            </Text>
          </View>

          <FlatList
            data={users}
            keyExtractor={(item) => `user-${item.id}`}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.cardMainText}>{item.username}</Text>
                    <View
                      style={[
                        styles.badge,
                        item.role === 'admin'
                          ? styles.badgeAdmin
                          : styles.badgeUser,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.role === 'admin'
                            ? styles.badgeTextAdmin
                            : styles.badgeTextUser,
                        ]}
                      >
                        {item.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.metaText}>
                    ID: #{item.id} • Tên: {item.name || item.username}
                  </Text>
                  {item.phone ? (
                    <Text style={styles.metaText}>SĐT: {item.phone}</Text>
                  ) : null}
                </View>

                {/* Actions: Toggle Role & Delete */}
                <View style={styles.actionCol}>
                  {item.username.toLowerCase() !== 'admin' && (
                    <TouchableOpacity
                      style={styles.roleToggleBtn}
                      onPress={() => handleToggleUserRole(item)}
                    >
                      <Text style={styles.roleToggleText}>
                        {item.role === 'admin' ? 'Hạ User' : 'Nâng Admin'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {item.role !== 'admin' && item.username.toLowerCase() !== 'admin' ? (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteUser(item)}
                    >
                      <Text style={styles.deleteBtnText}>Xóa</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}
            contentContainerStyle={styles.listPadding}
          />
        </View>
      )}

      {/* ================= CATEGORY MANAGEMENT (2.5) ================= */}
      {activeTab === 'categories' && (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Quản lý loại sản phẩm ({categories.length})
            </Text>
            <TouchableOpacity
              style={styles.addSectionBtn}
              onPress={handleOpenAddCategory}
            >
              <Text style={styles.addSectionBtnText}>+ Thêm loại SP</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => `cat-${item.id}`}
            renderItem={({ item }) => {
              const catProds = products.filter((p) => p.categoryId === item.id);
              return (
                <View style={styles.itemCard}>
                  <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.cardMainText}>{item.name}</Text>
                      <View style={styles.badgeCount}>
                        <Text style={styles.badgeCountText}>
                          {catProds.length} sản phẩm
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.metaText}>
                      ID: #{item.id} • {item.description || 'Chưa có mô tả'}
                    </Text>

                    {/* Quick Button: Add product directly to this category (2.5) */}
                    <TouchableOpacity
                      style={styles.quickAddProdBtn}
                      onPress={() => handleAddProductToCategory(item.id)}
                    >
                      <Text style={styles.quickAddProdText}>
                        + Thêm SP vào mục này
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionCol}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleOpenEditCategory(item)}
                    >
                      <Text style={styles.editBtnText}>✏️ Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteCategory(item)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.listPadding}
          />
        </View>
      )}

      {/* ================= PRODUCT MANAGEMENT (2.6) ================= */}
      {activeTab === 'products' && (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Quản lý sản phẩm ({products.length})
            </Text>
            <TouchableOpacity
              style={styles.addSectionBtn}
              onPress={handleOpenAddProduct}
            >
              <Text style={styles.addSectionBtnText}>+ Thêm sản phẩm</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            keyExtractor={(item) => `prod-${item.id}`}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Image
                  source={getImageSource(item.img)}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />

                <View style={styles.cardInfo}>
                  <Text style={styles.cardMainText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.prodPriceText}>
                    {item.price.toLocaleString('vi-VN')} đ
                  </Text>
                  <View style={styles.catPill}>
                    <Text style={styles.catPillText}>
                      {getCategoryName(item.categoryId)}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEditProduct(item)}
                  >
                    <Text style={styles.editBtnText}>✏️ Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteProduct(item)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️ Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listPadding}
          />
        </View>
      )}

      {/* ================= ORDER MANAGEMENT ================= */}
      {activeTab === 'orders' && (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Quản lý Đơn hàng ({filteredOrders.length})
            </Text>
          </View>

          {/* Filter Status Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.orderFilterRow}
          >
            {(
              ['Tất cả', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'] as const
            ).map((st) => {
              const count =
                st === 'Tất cả'
                  ? orders.length
                  : orders.filter((o) => o.status === st).length;
              const isSelected = orderFilter === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.orderFilterChip,
                    isSelected && styles.orderFilterChipActive,
                  ]}
                  onPress={() => setOrderFilter(st)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.orderFilterText,
                      isSelected && styles.orderFilterTextActive,
                    ]}
                  >
                    {st} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {filteredOrders.length === 0 ? (
            <View style={styles.emptyOrderContainer}>
              <Text style={styles.emptyOrderIcon}>📦</Text>
              <Text style={styles.emptyOrderTitle}>
                {orderFilter === 'Tất cả'
                  ? 'Chưa có đơn hàng nào'
                  : `Không có đơn hàng nào "${orderFilter}"`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => `order-${item.id}`}
              renderItem={({ item }) => {
                const badge = getOrderStatusBadge(item.status);
                return (
                  <View style={styles.orderCard}>
                    {/* Top Row: Mã đơn & Trạng thái */}
                    <View style={styles.orderHeaderRow}>
                      <View>
                        <Text style={styles.orderCode}>#OD-{item.id}</Text>
                        <Text style={styles.orderTime}>{item.createdAt}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          badge.badgeStyle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            badge.textStyle,
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    {/* Customer Info */}
                    <View style={styles.orderCustomerBox}>
                      <Text style={styles.customerNameText}>
                        👤 {item.customerName} • 📞 {item.phone}
                      </Text>
                      <Text style={styles.customerAddressText}>
                        📍 {item.address}
                      </Text>
                      {item.note ? (
                        <Text style={styles.customerNoteText}>
                          📝 Ghi chú: {item.note}
                        </Text>
                      ) : null}
                    </View>

                    {/* Items List */}
                    <View style={styles.orderItemsBox}>
                      {item.items &&
                        item.items.map((prod, idx) => (
                          <View
                            key={`item-${item.id}-${idx}`}
                            style={styles.orderItemRow}
                          >
                            <Image
                              source={getImageSource(prod.img)}
                              style={styles.orderItemImg}
                              resizeMode="cover"
                            />
                            <View style={styles.orderItemDetails}>
                              <Text
                                style={styles.orderItemName}
                                numberOfLines={1}
                              >
                                {prod.productName}
                              </Text>
                              <Text style={styles.orderItemQtyPrice}>
                                {prod.quantity} ×{' '}
                                {prod.price.toLocaleString('vi-VN')} đ
                              </Text>
                            </View>
                            <Text style={styles.orderItemTotal}>
                              {(prod.quantity * prod.price).toLocaleString(
                                'vi-VN',
                              )}{' '}
                              đ
                            </Text>
                          </View>
                        ))}
                    </View>

                    {/* Total Amount Row */}
                    <View style={styles.orderTotalRow}>
                      <Text style={styles.orderTotalLabel}>Tổng thanh toán:</Text>
                      <Text style={styles.orderTotalValue}>
                        {item.totalAmount.toLocaleString('vi-VN')} đ
                      </Text>
                    </View>

                    {/* Action Buttons: Xử lý đơn hàng */}
                    <View style={styles.orderActionsRow}>
                      {/* Đơn hàng Hoàn thành hoặc Đã hủy: BỊ KHÓA, không cho đổi trạng thái */}
                      {(item.status === 'Hoàn thành' || item.status === 'Đã hủy') && (
                        <View style={styles.orderLockedBadge}>
                          <Text style={styles.orderLockedBadgeText}>
                            🔒 Đơn {item.status.toLowerCase()} (Khóa)
                          </Text>
                        </View>
                      )}

                      {/* Chỉ đơn 'Đang xử lý' mới được Giao hàng / Hủy đơn / Đổi trạng thái */}
                      {item.status === 'Đang xử lý' && (
                        <>
                          <TouchableOpacity
                            style={[
                              styles.orderActionBtn,
                              styles.orderActionShip,
                            ]}
                            onPress={() =>
                              handleUpdateOrderStatus(item.id, 'Đang giao')
                            }
                            activeOpacity={0.8}
                          >
                            <Text style={styles.orderActionShipText}>
                              🚚 Giao hàng
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.orderActionBtn,
                              styles.orderActionCancel,
                            ]}
                            onPress={() =>
                              handleUpdateOrderStatus(item.id, 'Đã hủy')
                            }
                            activeOpacity={0.8}
                          >
                            <Text style={styles.orderActionCancelText}>
                              ❌ Hủy đơn
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.orderActionBtn,
                              styles.orderActionChange,
                            ]}
                            onPress={() => {
                              setSelectedOrderForStatus(item);
                              setStatusModalVisible(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.orderActionChangeText}>
                              ⚙️ Đổi trạng thái
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {/* Đơn 'Đang giao': Admin bấm Hoàn tất khi giao thành công */}
                      {item.status === 'Đang giao' && (
                        <TouchableOpacity
                          style={[
                            styles.orderActionBtn,
                            styles.orderActionComplete,
                          ]}
                          onPress={() =>
                            handleUpdateOrderStatus(item.id, 'Hoàn thành')
                          }
                          activeOpacity={0.8}
                        >
                          <Text style={styles.orderActionCompleteText}>
                            ✅ Hoàn tất
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Nút Xóa đơn hàng luôn khả dụng cho admin */}
                      <TouchableOpacity
                        style={[
                          styles.orderActionBtn,
                          styles.orderActionDelete,
                        ]}
                        onPress={() => handleDeleteOrder(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.orderActionDeleteText}>
                          🗑️ Xóa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.listPadding}
            />
          )}
        </View>
      )}

      {/* ================= STATISTICS TAB ================= */}
      {activeTab === 'statistics' && (
        <ScrollView
          style={styles.tabContent}
          contentContainerStyle={styles.statsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              📊 Thống kê hoạt động & Doanh thu
            </Text>
            <TouchableOpacity
              style={styles.refreshStatsBtn}
              onPress={loadData}
              activeOpacity={0.8}
            >
              <Text style={styles.refreshStatsText}>🔄 Làm mới</Text>
            </TouchableOpacity>
          </View>

          {/* 1. Hero Revenue Card */}
          <View style={styles.revenueHeroCard}>
            <Text style={styles.revenueHeroLabel}>💰 TỔNG DOANH THU THỰC TẾ</Text>
            <Text style={styles.revenueHeroAmount}>
              {totalCompletedRevenue.toLocaleString('vi-VN')} đ
            </Text>
            <Text style={styles.revenueHeroSub}>
              Được ghi nhận từ {completedOrdersList.length} đơn hàng đã hoàn tất thành công
            </Text>

            <View style={styles.revenueDivider} />

            <View style={styles.revenueSubRow}>
              <View style={styles.revenueSubItem}>
                <Text style={styles.revenueSubLabel}>
                  ⏳ Đang chờ thu (Đang xử lý/giao):
                </Text>
                <Text style={styles.revenueSubValuePending}>
                  +{pendingRevenue.toLocaleString('vi-VN')} đ
                </Text>
              </View>
              <View style={styles.revenueSubItem}>
                <Text style={styles.revenueSubLabel}>
                  ❌ Thất thoát do hủy đơn:
                </Text>
                <Text style={styles.revenueSubValueLoss}>
                  -{cancelledRevenue.toLocaleString('vi-VN')} đ
                </Text>
              </View>
            </View>
          </View>

          {/* 2. Grid Cards: 4 Core Metrics */}
          <Text style={styles.statsSectionHeading}>
            📦 Phân tích trạng thái đơn hàng
          </Text>
          <View style={styles.statsGrid}>
            {/* Total Orders */}
            <View style={[styles.statsGridCard, styles.cardTotalBorder]}>
              <View style={styles.statsIconBgTotal}>
                <Text style={styles.statsIcon}>📦</Text>
              </View>
              <Text style={styles.statsCardNum}>{totalOrdersCount}</Text>
              <Text style={styles.statsCardLabel}>Tổng số đơn hàng</Text>
              <Text style={styles.statsCardSub}>100% đơn phát sinh</Text>
            </View>

            {/* Completed Orders */}
            <View style={[styles.statsGridCard, styles.cardCompletedBorder]}>
              <View style={styles.statsIconBgCompleted}>
                <Text style={styles.statsIcon}>✅</Text>
              </View>
              <Text style={[styles.statsCardNum, styles.textCompleted]}>
                {completedOrdersList.length}
              </Text>
              <Text style={styles.statsCardLabel}>Đơn đã hoàn thành</Text>
              <Text style={styles.statsCardSub}>
                {completedPercent}% tổng đơn
              </Text>
            </View>

            {/* Cancelled Orders */}
            <View style={[styles.statsGridCard, styles.cardCancelledBorder]}>
              <View style={styles.statsIconBgCancelled}>
                <Text style={styles.statsIcon}>❌</Text>
              </View>
              <Text style={[styles.statsCardNum, styles.textCancelled]}>
                {cancelledOrdersList.length}
              </Text>
              <Text style={styles.statsCardLabel}>Đơn đã bị hủy</Text>
              <Text style={styles.statsCardSub}>
                {cancelledPercent}% tổng đơn
              </Text>
            </View>

            {/* Processing & Shipping */}
            <View style={[styles.statsGridCard, styles.cardProcessingBorder]}>
              <View style={styles.statsIconBgProcessing}>
                <Text style={styles.statsIcon}>⏳</Text>
              </View>
              <Text style={[styles.statsCardNum, styles.textProcessing]}>
                {processingOrdersList.length + shippingOrdersList.length}
              </Text>
              <Text style={styles.statsCardLabel}>Đang xử lý / giao</Text>
              <Text style={styles.statsCardSub}>
                {processingPercent + shippingPercent}% tổng đơn
              </Text>
            </View>
          </View>

          {/* 3. Visual Progress Bar */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              📊 Tỷ lệ phân bổ trạng thái đơn hàng
            </Text>
            {totalOrdersCount === 0 ? (
              <Text style={styles.chartEmptyText}>Chưa có dữ liệu đơn hàng</Text>
            ) : (
              <>
                <View style={styles.progressBarWrapper}>
                  {completedPercent > 0 && (
                    <View
                      style={getSegmentStyle(
                        completedPercent,
                        styles.segmentCompleted,
                      )}
                    />
                  )}
                  {shippingPercent > 0 && (
                    <View
                      style={getSegmentStyle(
                        shippingPercent,
                        styles.segmentShipping,
                      )}
                    />
                  )}
                  {processingPercent > 0 && (
                    <View
                      style={getSegmentStyle(
                        processingPercent,
                        styles.segmentProcessing,
                      )}
                    />
                  )}
                  {cancelledPercent > 0 && (
                    <View
                      style={getSegmentStyle(
                        cancelledPercent,
                        styles.segmentCancelled,
                      )}
                    />
                  )}
                </View>

                {/* Legend Row */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, styles.dotCompleted]}
                    />
                    <Text style={styles.legendText}>
                      Hoàn thành: {completedOrdersList.length} ({completedPercent}%)
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, styles.dotShipping]}
                    />
                    <Text style={styles.legendText}>
                      Đang giao: {shippingOrdersList.length} ({shippingPercent}%)
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, styles.dotProcessing]}
                    />
                    <Text style={styles.legendText}>
                      Đang xử lý: {processingOrdersList.length} ({processingPercent}%)
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, styles.dotCancelled]}
                    />
                    <Text style={styles.legendText}>
                      Đã hủy: {cancelledOrdersList.length} ({cancelledPercent}%)
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* 4. Business Performance Metrics */}
          <View style={styles.performanceCard}>
            <Text style={styles.performanceTitle}>💡 Chỉ số kinh doanh nổi bật</Text>
            <View style={styles.performanceRow}>
              <Text style={styles.perfLabel}>Giá trị trung bình đơn (AOV):</Text>
              <Text style={styles.perfValue}>
                {avgOrderValue.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.perfLabel}>Số sản phẩm đã bán ra:</Text>
              <Text style={styles.perfValue}>{totalProductsSold} món</Text>
            </View>
            <View style={styles.performanceRow}>
              <Text style={styles.perfLabel}>Tỷ lệ hoàn thành đơn thành công:</Text>
              <Text style={[styles.perfValue, styles.perfValueCompleted]}>
                {completedPercent}%
              </Text>
            </View>
            <View style={[styles.performanceRow, styles.performanceRowLast]}>
              <Text style={styles.perfLabel}>Tỷ lệ hủy đơn hàng:</Text>
              <Text style={[styles.perfValue, styles.perfValueCancelled]}>
                {cancelledPercent}%
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ================= MODAL CHANGE ORDER STATUS ================= */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModalBox}>
            <Text style={styles.modalTitle}>
              ⚙️ Xử lý đơn hàng #OD-{selectedOrderForStatus?.id}
            </Text>
            <Text style={styles.statusModalSubTitle}>
              Khách hàng: {selectedOrderForStatus?.customerName} (
              {selectedOrderForStatus?.phone})
            </Text>
            <Text style={styles.statusModalSubTitle}>
              Trạng thái hiện tại: {selectedOrderForStatus?.status}
            </Text>

            {/* Nếu đơn đã hoàn thành hoặc đã hủy -> Hiển thị thông báo khóa */}
            {selectedOrderForStatus?.status === 'Hoàn thành' ||
            selectedOrderForStatus?.status === 'Đã hủy' ? (
              <View style={styles.lockedModalNotice}>
                <Text style={styles.lockedModalNoticeText}>
                  🔒 Đơn hàng này đã ở trạng thái "
                  {selectedOrderForStatus?.status}" (trạng thái kết thúc).
                  Theo quy định, đơn hàng đã bị khóa cố định và không thể thay
                  đổi trạng thái!
                </Text>
              </View>
            ) : (
              <View style={styles.statusOptionsContainer}>
                {(
                  ['Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'] as const
                ).map((st) => {
                  const isCurrent = selectedOrderForStatus?.status === st;
                  const b = getOrderStatusBadge(st);
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusOptionBtn,
                        b.badgeStyle,
                        isCurrent && styles.statusOptionCurrent,
                      ]}
                      onPress={() => {
                        if (selectedOrderForStatus) {
                          handleUpdateOrderStatus(selectedOrderForStatus.id, st);
                          setStatusModalVisible(false);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.statusOptionText, b.textStyle]}
                      >
                        {st === 'Đang xử lý' && '⏳ '}
                        {st === 'Đang giao' && '🚚 '}
                        {st === 'Hoàn thành' && '✅ '}
                        {st === 'Đã hủy' && '❌ '}
                        {st}
                        {isCurrent ? ' (Hiện tại)' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL CATEGORY (ADD / EDIT) ================= */}
      <Modal
        visible={catModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCatModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {isEditingCat ? '✏️ Chỉnh sửa loại sản phẩm' : '➕ Thêm loại sản phẩm mới'}
            </Text>

            <Text style={styles.formLabel}>Tên loại sản phẩm *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nhập tên loại sản phẩm (ví dụ: Đồng hồ thông minh)"
              value={catName}
              onChangeText={setCatName}
            />

            <Text style={styles.formLabel}>Mô tả loại sản phẩm</Text>
            <TextInput
              style={[styles.formInput, styles.formArea]}
              placeholder="Mô tả thông tin chi tiết loại sản phẩm..."
              multiline
              numberOfLines={2}
              value={catDescription}
              onChangeText={setCatDescription}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCatModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveCategory}
              >
                <Text style={styles.modalSaveText}>
                  {isEditingCat ? 'Lưu thay đổi' : 'Thêm mới'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ================= MODAL PRODUCT (ADD / EDIT) ================= */}
      <Modal
        visible={prodModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProdModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalBox, styles.prodModalBox]}>
            <Text style={styles.modalTitle}>
              {isEditingProd ? '✏️ Chỉnh sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên sản phẩm..."
                value={prodName}
                onChangeText={setProdName}
              />

              <Text style={styles.formLabel}>Giá bán (VNĐ) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập giá (ví dụ: 15000000)..."
                keyboardType="numeric"
                value={prodPrice}
                onChangeText={setProdPrice}
              />

              {/* Category Picker Modal Chips */}
              <Text style={styles.formLabel}>Loại sản phẩm *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={`prod-cat-${c.id}`}
                    style={[
                      styles.chipItem,
                      prodCategoryId === c.id && styles.chipItemActive,
                    ]}
                    onPress={() => setProdCategoryId(c.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        prodCategoryId === c.id && styles.chipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Mô tả sản phẩm</Text>
              <TextInput
                style={[styles.formInput, styles.formArea]}
                placeholder="Mô tả đặc điểm sản phẩm..."
                multiline
                numberOfLines={2}
                value={prodDescription}
                onChangeText={setProdDescription}
              />

              <Text style={styles.formLabel}>Chọn hình ảnh mẫu</Text>
              <View style={styles.imageChoices}>
                {sampleImages.map((img) => (
                  <TouchableOpacity
                    key={`pimg-${img.key}`}
                    style={[
                      styles.imageChoice,
                      prodImage === img.key && styles.imageChoiceActive,
                    ]}
                    onPress={() => setProdImage(img.key)}
                  >
                    <Image
                      source={getImageSource(img.key)}
                      style={styles.choiceThumb}
                    />
                    <Text style={styles.choiceLabel}>{img.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setProdModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveProduct}
                >
                  <Text style={styles.modalSaveText}>
                    {isEditingProd ? 'Lưu thay đổi' : 'Thêm mới'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 12,
  },
  topCard: {
    backgroundColor: '#1e272e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffdd59',
    letterSpacing: 0.5,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#ff3f34',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerLogoutBtn: {
    backgroundColor: '#ff3f34',
    marginRight: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    elevation: 2,
  },
  headerLogoutBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#d2dae2',
    marginTop: 2,
  },
  shopNavBtn: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shopNavBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  tabSelectorContainer: {
    marginBottom: 12,
  },
  tabSelectorRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  tabBtnTextActive: {
    color: '#fff',
  },
  tabContent: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  addSectionBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addSectionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listPadding: {
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 1,
  },
  thumbImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f1f2f6',
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMainText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAdmin: {
    backgroundColor: '#ffeaa7',
  },
  badgeUser: {
    backgroundColor: '#e3f2fd',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  badgeTextAdmin: {
    color: '#d35400',
  },
  badgeTextUser: {
    color: '#1976d2',
  },
  badgeCount: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeCountText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '600',
  },
  metaText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  prodPriceText: {
    fontSize: 13,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginTop: 2,
  },
  catPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  catPillText: {
    fontSize: 10,
    color: '#4a5568',
  },
  quickAddProdBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },
  quickAddProdText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  actionCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  roleToggleBtn: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  roleToggleText: {
    color: '#1976d2',
    fontSize: 10,
    fontWeight: 'bold',
  },
  editBtn: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  editBtnText: {
    color: '#e65100',
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteBtnText: {
    color: '#d32f2f',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    elevation: 5,
  },
  prodModalBox: {
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 8,
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2d3748',
    backgroundColor: '#fafbfc',
  },
  formArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chipItem: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipItemActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  chipText: {
    fontSize: 12,
    color: '#4a5568',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  imageChoice: {
    width: (SCREEN_WIDTH - 80) / 3,
    alignItems: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  imageChoiceActive: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  choiceThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginBottom: 4,
  },
  choiceLabel: {
    fontSize: 10,
    color: '#4a5568',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#edf2f7',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  modalSaveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#d32f2f',
  },
  modalSaveText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  // Order Styles
  orderFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  orderFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderFilterChipActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
    elevation: 2,
    shadowColor: '#d32f2f',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  orderFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  orderFilterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyOrderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 8,
  },
  emptyOrderIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyOrderTitle: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  orderCode: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  orderTime: {
    fontSize: 11,
    color: '#8395a7',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 26,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  orderCustomerBox: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  customerNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2f3542',
  },
  customerAddressText: {
    fontSize: 12,
    color: '#57606f',
    marginTop: 2,
  },
  customerNoteText: {
    fontSize: 12,
    color: '#e67e22',
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderItemsBox: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderItemImg: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f1f2f6',
  },
  orderItemDetails: {
    flex: 1,
    marginLeft: 8,
  },
  orderItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2f3542',
  },
  orderItemQtyPrice: {
    fontSize: 11,
    color: '#747d8c',
  },
  orderItemTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  orderTotalLabel: {
    fontSize: 13,
    color: '#57606f',
    fontWeight: '600',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  orderActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  orderActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  orderActionShip: {
    backgroundColor: '#1976d2',
  },
  orderActionShipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderActionComplete: {
    backgroundColor: '#2e7d32',
  },
  orderActionCompleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderActionCancel: {
    backgroundColor: '#d32f2f',
  },
  orderActionCancelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderActionChange: {
    backgroundColor: '#57606f',
  },
  orderActionChangeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderActionDelete: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff7675',
  },
  orderActionDeleteText: {
    color: '#d63031',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderLockedBadge: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  orderLockedBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#747d8c',
  },
  statusModalBox: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statusModalSubTitle: {
    fontSize: 13,
    color: '#57606f',
    marginBottom: 4,
    lineHeight: 18,
  },
  lockedModalNotice: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 14,
  },
  lockedModalNoticeText: {
    color: '#856404',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  statusOptionsContainer: {
    marginVertical: 14,
  },
  statusOptionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  statusOptionCurrent: {
    borderWidth: 2,
    borderColor: '#2f3542',
  },
  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statBoxActive: {
    borderColor: '#ffdd59',
    borderWidth: 1.5,
  },
  // Status style classes
  statusProcessing: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffe082',
  },
  statusProcessingText: {
    color: '#f57f17',
  },
  statusShipping: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  statusShippingText: {
    color: '#1565c0',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
    borderColor: '#a5d6a7',
  },
  statusCompletedText: {
    color: '#2e7d32',
  },
  statusCancelled: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
  },
  statusCancelledText: {
    color: '#c62828',
  },

  // ==========================================
  // STATISTICS STYLES
  // ==========================================
  statsScrollContent: {
    paddingBottom: 32,
  },
  refreshStatsBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  refreshStatsText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  revenueHeroCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#ffdd59',
  },
  revenueHeroLabel: {
    color: '#ffdd59',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  revenueHeroAmount: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    marginTop: 4,
    marginBottom: 4,
  },
  revenueHeroSub: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 16,
  },
  revenueDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  revenueSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  revenueSubItem: {
    flex: 1,
  },
  revenueSubLabel: {
    color: '#9ca3af',
    fontSize: 10,
    marginBottom: 2,
  },
  revenueSubValuePending: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  revenueSubValueLoss: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsSectionHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statsGridCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    elevation: 1,
  },
  cardTotalBorder: {
    borderColor: '#e5e7eb',
  },
  cardCompletedBorder: {
    borderColor: '#bbf7d0',
  },
  cardCancelledBorder: {
    borderColor: '#fecaca',
  },
  cardProcessingBorder: {
    borderColor: '#fed7aa',
  },
  statsIconBgTotal: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statsIconBgCompleted: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statsIconBgCancelled: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statsIconBgProcessing: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffedd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statsIcon: {
    fontSize: 16,
  },
  statsCardNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  textCompleted: {
    color: '#16a34a',
  },
  textCancelled: {
    color: '#dc2626',
  },
  textProcessing: {
    color: '#ea580c',
  },
  statsCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 2,
  },
  statsCardSub: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  chartEmptyText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 12,
  },
  progressBarWrapper: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e5e7eb',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#4b5563',
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
  },
  performanceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  perfLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  perfValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  segmentCompleted: {
    backgroundColor: '#2e7d32',
  },
  segmentShipping: {
    backgroundColor: '#1976d2',
  },
  segmentProcessing: {
    backgroundColor: '#f57f17',
  },
  segmentCancelled: {
    backgroundColor: '#d32f2f',
  },
  dotCompleted: {
    backgroundColor: '#2e7d32',
  },
  dotShipping: {
    backgroundColor: '#1976d2',
  },
  dotProcessing: {
    backgroundColor: '#f57f17',
  },
  dotCancelled: {
    backgroundColor: '#d32f2f',
  },
  perfValueCompleted: {
    color: '#2e7d32',
  },
  perfValueCancelled: {
    color: '#d32f2f',
  },
  performanceRowLast: {
    borderBottomWidth: 0,
  },
});
