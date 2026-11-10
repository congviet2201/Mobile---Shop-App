import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './AppNavigatorProduct';
import {
  addProduct,
  addToCart,
  Category,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  filterAndSortProducts,
  getCurrentUser,
  initDatabase,
  PRESET_PRICE_RANGES,
  Product,
  SortOption,
  updateProduct,
  User,
} from './database';
import { getImageSource } from './ProductDetailScreen';
import Header from './Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 36) / 2;

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'Sanpham3Sqlite'
>;

export default function Sanpham3Sqlite() {
  const navigation = useNavigation<NavigationProp>();

  // Data states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Price Filter & Sort States
  const [selectedPriceRangeId, setSelectedPriceRangeId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [customPriceModalVisible, setCustomPriceModalVisible] = useState(false);
  const [customMinInput, setCustomMinInput] = useState('');
  const [customMaxInput, setCustomMaxInput] = useState('');
  const [appliedCustomMin, setAppliedCustomMin] = useState<number | null>(null);
  const [appliedCustomMax, setAppliedCustomMax] = useState<number | null>(null);

  // Modal State for Add & Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('iphone15.jpg');
  const [formError, setFormError] = useState('');

  // Load initial data
  const loadInitialData = async () => {
    const cats = await fetchCategories();
    const prods = await fetchProducts();
    const user = await getCurrentUser();

    setCategories(cats);
    setAllProducts([...prods].reverse());
    setCurrentUser(user);
  };

  useEffect(() => {
    initDatabase(() => {
      loadInitialData();
    });
  }, []);

  // Refresh user state whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      getCurrentUser().then(setCurrentUser);
      loadInitialData();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // Auth Guard Helper
  const requireAuth = (actionName: string, onAuthorized: () => void) => {
    if (!currentUser) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        `Bạn cần đăng nhập tài khoản để thực hiện chức năng ${actionName}!`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng nhập ngay',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
      return;
    }
    onAuthorized();
  };

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    requireAuth('thêm sản phẩm', () => {
      setIsEditing(false);
      setCurrentEditId(null);
      setFormName('');
      setFormPrice('');
      setFormCategoryId(selectedCategoryId || (categories[0]?.id ?? 1));
      setFormDescription('');
      setFormImage('iphone15.jpg');
      setFormError('');
      setModalVisible(true);
    });
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (product: Product) => {
    requireAuth('chỉnh sửa sản phẩm', () => {
      setIsEditing(true);
      setCurrentEditId(product.id);
      setFormName(product.name);
      setFormPrice(product.price.toString());
      setFormCategoryId(product.categoryId);
      setFormDescription(product.description || '');
      setFormImage(product.img || 'iphone15.jpg');
      setFormError('');
      setModalVisible(true);
    });
  };

  // Close Modal & Reset
  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setCurrentEditId(null);
    setFormError('');
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async () => {
    setFormError('');

    // Validation 1: Required Name
    if (!formName.trim()) {
      setFormError('Vui lòng nhập tên sản phẩm!');
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên sản phẩm!');
      return;
    }

    // Validation 2: Required Price and positive number
    const numericPrice = parseFloat(formPrice);
    if (!formPrice.trim() || isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Vui lòng nhập giá sản phẩm hợp lệ (> 0)!');
      Alert.alert('Giá không hợp lệ', 'Vui lòng nhập giá sản phẩm hợp lệ (> 0)!');
      return;
    }

    // Validation 3: Category required
    if (!formCategoryId) {
      setFormError('Vui lòng chọn danh mục cho sản phẩm!');
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn danh mục cho sản phẩm!');
      return;
    }

    try {
      if (isEditing && currentEditId !== null) {
        // Cập nhật sản phẩm hiện có
        await updateProduct({
          id: currentEditId,
          name: formName.trim(),
          price: numericPrice,
          categoryId: formCategoryId,
          img: formImage,
          description: formDescription.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm thành công!');
      } else {
        // Thêm sản phẩm mới
        await addProduct({
          name: formName.trim(),
          price: numericPrice,
          categoryId: formCategoryId,
          img: formImage,
          description: formDescription.trim(),
        });
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới thành công!');
      }

      handleCloseModal();
      await loadInitialData();
    } catch (error: any) {
      const msg = error.message || 'Lỗi khi lưu sản phẩm vào cơ sở dữ liệu!';
      setFormError(msg);
      Alert.alert('Lỗi', msg);
    }
  };

  // Delete Product
  const handleDeleteProduct = (product: Product) => {
    requireAuth('xóa sản phẩm', () => {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteProduct(product.id);
                Alert.alert('Thành công', 'Đã xóa sản phẩm thành công!');
                await loadInitialData();
              } catch (error: any) {
                Alert.alert('Lỗi', error.message || 'Không thể xóa sản phẩm!');
              }
            },
          },
        ],
      );
    });
  };

  // Add to cart helper
  const handleAddToCart = async (product: Product) => {
    requireAuth('thêm vào giỏ hàng', async () => {
      if (!currentUser) return;
      try {
        await addToCart(currentUser.id, product.id, 1);
        Alert.alert(
          'Thành công',
          `Đã thêm "${product.name}" vào giỏ hàng!`,
          [
            { text: 'Tiếp tục mua', style: 'cancel' },
            {
              text: 'Xem giỏ hàng',
              onPress: () => navigation.navigate('CartScreen' as any),
            },
          ],
        );
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể thêm vào giỏ hàng!');
      }
    });
  };

  // Buy now helper
  const handleBuyNow = async (product: Product) => {
    requireAuth('mua hàng', async () => {
      if (!currentUser) return;
      try {
        await addToCart(currentUser.id, product.id, 1);
        navigation.navigate('CartScreen' as any);
      } catch (err: any) {
        Alert.alert('Lỗi', err.message || 'Không thể mua sản phẩm!');
      }
    });
  };

  // Calculation of minPrice and maxPrice
  let activeMinPrice: number | null = null;
  let activeMaxPrice: number | null = null;

  if (selectedPriceRangeId === 'custom') {
    activeMinPrice = appliedCustomMin;
    activeMaxPrice = appliedCustomMax;
  } else {
    const preset = PRESET_PRICE_RANGES.find((r) => r.id === selectedPriceRangeId);
    if (preset) {
      activeMinPrice = preset.minPrice;
      activeMaxPrice = preset.maxPrice;
    }
  }

  // Filtered & Sorted Products Calculation using centralized function
  const filteredProducts = filterAndSortProducts(allProducts, categories, {
    categoryId: selectedCategoryId,
    searchKeyword,
    minPrice: activeMinPrice,
    maxPrice: activeMaxPrice,
    sortBy,
  });

  // Sample Image Choices
  const sampleImages = [
    { key: 'iphone15.jpg', label: 'iPhone' },
    { key: 's24.jpg', label: 'Galaxy' },
    { key: 'macbook.jpg', label: 'MacBook' },
    { key: 'ipad.jpg', label: 'iPad' },
    { key: 'hinh1.jpg', label: 'Tai nghe' },
    { key: 'hinh2.jpg', label: 'Đồng hồ' },
  ];

  // Helper get category name by ID
  const getCategoryName = (catId: number): string => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Điện tử';
  };

  // Helper get label of active price filter
  const getActivePriceLabel = (): string => {
    if (selectedPriceRangeId === 'custom') {
      const minStr =
        appliedCustomMin !== null
          ? `${appliedCustomMin.toLocaleString('vi-VN')} đ`
          : '0 đ';
      const maxStr =
        appliedCustomMax !== null
          ? `${appliedCustomMax.toLocaleString('vi-VN')} đ`
          : 'Vô cực';
      return `${minStr} - ${maxStr}`;
    }
    const preset = PRESET_PRICE_RANGES.find((r) => r.id === selectedPriceRangeId);
    return preset ? preset.label : 'Tất cả giá';
  };

  // Reset all filters
  const handleResetAllFilters = () => {
    setSelectedCategoryId(null);
    setSearchKeyword('');
    setSelectedPriceRangeId('all');
    setSortBy('default');
    setAppliedCustomMin(null);
    setAppliedCustomMax(null);
    setCustomMinInput('');
    setCustomMaxInput('');
  };

  // Check if any filter is active
  const isAnyFilterActive =
    selectedCategoryId !== null ||
    searchKeyword.trim() !== '' ||
    selectedPriceRangeId !== 'all' ||
    sortBy !== 'default';

  // Apply custom price filter
  const handleApplyCustomPrice = () => {
    const minVal = customMinInput.trim() ? parseFloat(customMinInput.trim()) : null;
    const maxVal = customMaxInput.trim() ? parseFloat(customMaxInput.trim()) : null;

    if (minVal !== null && isNaN(minVal)) {
      Alert.alert('Giá không hợp lệ', 'Giá tối thiểu phải là số hợp lệ!');
      return;
    }
    if (maxVal !== null && isNaN(maxVal)) {
      Alert.alert('Giá không hợp lệ', 'Giá tối đa phải là số hợp lệ!');
      return;
    }
    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      Alert.alert(
        'Giá không hợp lệ',
        'Giá tối thiểu không được lớn hơn giá tối đa!',
      );
      return;
    }

    setAppliedCustomMin(minVal);
    setAppliedCustomMax(maxVal);
    setSelectedPriceRangeId('custom');
    setCustomPriceModalVisible(false);
  };

  // Render Header Component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Header Bar with Welcome message and Logout according to Requirement 4 */}
      <Header onLogoutSuccess={loadInitialData} />

      {/* Promotional Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeText}>UP TO 50% OFF</Text>
        </View>
        <Text style={styles.bannerTitle}>SIÊU SALE THÁNG 10</Text>
        <Text style={styles.bannerSubtitle}>
          Giảm giá cực sốc toàn bộ phụ kiện và thiết bị công nghệ chính hãng!
        </Text>
      </View>

      {/* Smart Search Bar - Search by product name, description OR category */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={
            selectedCategoryId !== null
              ? `Tìm trong "${getCategoryName(selectedCategoryId)}"...`
              : 'Tìm kiếm theo tên sản phẩm hoặc danh mục...'
          }
          placeholderTextColor="#888"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          clearButtonMode="while-editing"
        />
        {searchKeyword ? (
          <TouchableOpacity
            onPress={() => setSearchKeyword('')}
            style={styles.clearSearchTouch}
          >
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.filterTitle}>📁 Danh mục sản phẩm:</Text>
          {selectedCategoryId !== null && (
            <TouchableOpacity
              onPress={() => setSelectedCategoryId(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.resetCategoryText}>Bỏ chọn [✕]</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {/* Option: All Products */}
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategoryId === null && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategoryId(null)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategoryId === null && styles.categoryChipTextActive,
              ]}
            >
              Tất cả ({allProducts.length})
            </Text>
          </TouchableOpacity>

          {/* Dynamic Categories */}
          {categories.map((c) => {
            const count = allProducts.filter((p) => p.categoryId === c.id).length;
            const isSelected = selectedCategoryId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() =>
                  setSelectedCategoryId(isSelected ? null : c.id)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {c.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Price Filter Section */}
      <View style={styles.priceFilterSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.filterTitle}>💰 Lọc theo khoảng giá:</Text>
          {selectedPriceRangeId !== 'all' && (
            <TouchableOpacity
              onPress={() => {
                setSelectedPriceRangeId('all');
                setAppliedCustomMin(null);
                setAppliedCustomMax(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.resetCategoryText}>Bỏ lọc giá [✕]</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priceScroll}
        >
          {PRESET_PRICE_RANGES.map((preset) => {
            const isSelected = selectedPriceRangeId === preset.id;
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.priceChip,
                  isSelected && styles.priceChipActive,
                ]}
                onPress={() => setSelectedPriceRangeId(preset.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    isSelected && styles.priceChipTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Custom Price Chip */}
          <TouchableOpacity
            style={[
              styles.priceChip,
              selectedPriceRangeId === 'custom' && styles.priceChipActive,
            ]}
            onPress={() => setCustomPriceModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.priceChipText,
                selectedPriceRangeId === 'custom' && styles.priceChipTextActive,
              ]}
            >
              {selectedPriceRangeId === 'custom'
                ? `Tùy chỉnh: ${getActivePriceLabel()}`
                : 'Tùy chỉnh ⚙️'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Sort Row */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sắp xếp giá:</Text>
          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === 'default' && styles.sortChipActive,
            ]}
            onPress={() => setSortBy('default')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'default' && styles.sortChipTextActive,
              ]}
            >
              Mới nhất
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === 'price_asc' && styles.sortChipActive,
            ]}
            onPress={() => setSortBy('price_asc')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'price_asc' && styles.sortChipTextActive,
              ]}
            >
              Thấp → Cao ⬆️
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sortChip,
              sortBy === 'price_desc' && styles.sortChipActive,
            ]}
            onPress={() => setSortBy('price_desc')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sortChipText,
                sortBy === 'price_desc' && styles.sortChipTextActive,
              ]}
            >
              Cao → Thấp ⬇️
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters Bar */}
      {isAnyFilterActive && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersLabel}>Đang lọc:</Text>

          {selectedCategoryId !== null && (
            <TouchableOpacity
              style={styles.activeFilterTag}
              onPress={() => setSelectedCategoryId(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.activeFilterTagText}>
                📁 {getCategoryName(selectedCategoryId)} ✕
              </Text>
            </TouchableOpacity>
          )}

          {searchKeyword.trim() !== '' && (
            <TouchableOpacity
              style={styles.activeFilterTag}
              onPress={() => setSearchKeyword('')}
              activeOpacity={0.7}
            >
              <Text style={styles.activeFilterTagText}>
                🔍 &quot;{searchKeyword}&quot; ✕
              </Text>
            </TouchableOpacity>
          )}

          {selectedPriceRangeId !== 'all' && (
            <TouchableOpacity
              style={styles.activeFilterTag}
              onPress={() => {
                setSelectedPriceRangeId('all');
                setAppliedCustomMin(null);
                setAppliedCustomMax(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.activeFilterTagText}>
                💰 {getActivePriceLabel()} ✕
              </Text>
            </TouchableOpacity>
          )}

          {sortBy !== 'default' && (
            <TouchableOpacity
              style={styles.activeFilterTag}
              onPress={() => setSortBy('default')}
              activeOpacity={0.7}
            >
              <Text style={styles.activeFilterTagText}>
                ↕️ {sortBy === 'price_asc' ? 'Thấp → Cao' : 'Cao → Thấp'} ✕
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.clearAllFiltersBtn}
            onPress={handleResetAllFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.clearAllFiltersText}>Xóa tất cả ↺</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Section Header: Product Count & Add Product Button (Requirement 2) */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionTitle}>SẢN PHẨM</Text>
          <Text style={styles.productCountText}>
            {filteredProducts.length} sản phẩm
            {selectedCategoryId !== null
              ? ` trong "${getCategoryName(selectedCategoryId)}"`
              : ''}
            {selectedPriceRangeId !== 'all' ? ` (${getActivePriceLabel()})` : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addProductBtn}
          onPress={handleOpenAddModal}
          activeOpacity={0.8}
        >
          <Text style={styles.addProductBtnText}>+ Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Product Card (Requirement 1: 2-column grid layout)
  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.8}
        style={styles.imageBox}
      >
        <Image
          source={getImageSource(item.img)}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText} numberOfLines={1}>
            {getCategoryName(item.categoryId)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Card Body */}
      <View style={styles.cardBody}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
          activeOpacity={0.8}
        >
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>

        <Text style={styles.productPrice}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>

        {/* Action Row: Edit & Delete (Requirement 1 & 3) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtnEdit}
            onPress={() => handleOpenEditModal(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnEditText}>✏️ Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDelete}
            onPress={() => handleDeleteProduct(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnDeleteText}>🗑️ Xóa</Text>
          </TouchableOpacity>
        </View>

        {/* Cart & Buy Now Row */}
        <View style={styles.buyRow}>
          <TouchableOpacity
            style={styles.addCartBtnSmall}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.addCartBtnSmallText}>🛒 +Giỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => handleBuyNow(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.buyBtnText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📦</Text>
      <Text style={styles.emptyTitle}>Không có sản phẩm nào phù hợp!</Text>
      <Text style={styles.emptySubtitle}>
        {isAnyFilterActive
          ? 'Không tìm thấy sản phẩm nào khớp với bộ lọc danh mục, từ khóa hoặc khoảng giá đã chọn.'
          : 'Hiện chưa có sản phẩm nào trong cửa hàng.'}
      </Text>

      <View style={styles.emptyBtnRow}>
        {isAnyFilterActive ? (
          <TouchableOpacity
            style={styles.emptyResetBtn}
            onPress={handleResetAllFilters}
          >
            <Text style={styles.emptyResetBtnText}>↺ Xóa tất cả bộ lọc</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.emptyAddBtn}
          onPress={handleOpenAddModal}
        >
          <Text style={styles.emptyAddBtnText}>+ Thêm sản phẩm mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => `product-${item.id}`}
        renderItem={renderProductCard}
        numColumns={2}
        key="product-grid-2col"
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Add / Edit Product Modal (Requirements 2 & 3) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? '✏️ Cập nhật sản phẩm' : '➕ Thêm sản phẩm mới'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={styles.modalErrorBox}>
                <Text style={styles.modalErrorText}>⚠️ {formError}</Text>
              </View>
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Product Name Field */}
              <Text style={styles.formLabel}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập tên sản phẩm (ví dụ: iPhone 16 Pro)"
                placeholderTextColor="#999"
                value={formName}
                onChangeText={(text) => {
                  setFormName(text);
                  if (formError) setFormError('');
                }}
              />

              {/* Product Price Field */}
              <Text style={styles.formLabel}>Giá sản phẩm (VNĐ) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Nhập giá bằng số (ví dụ: 25000000)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={formPrice}
                onChangeText={(text) => {
                  setFormPrice(text);
                  if (formError) setFormError('');
                }}
              />

              {/* Category Selection */}
              <Text style={styles.formLabel}>Danh mục sản phẩm *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.formCategoryScroll}
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.formCategoryChip,
                      formCategoryId === c.id && styles.formCategoryChipActive,
                    ]}
                    onPress={() => setFormCategoryId(c.id)}
                  >
                    <Text
                      style={[
                        styles.formCategoryChipText,
                        formCategoryId === c.id &&
                          styles.formCategoryChipTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Product Description */}
              <Text style={styles.formLabel}>Mô tả sản phẩm</Text>
              <TextInput
                style={[styles.formInput, styles.formInputArea]}
                placeholder="Nhập chi tiết mô tả thông số, đặc điểm nổi bật..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              {/* Image Selection */}
              <Text style={styles.formLabel}>Chọn hình ảnh mẫu</Text>
              <View style={styles.imageSelectorRow}>
                {sampleImages.map((img) => (
                  <TouchableOpacity
                    key={img.key}
                    style={[
                      styles.imageChoiceBtn,
                      formImage === img.key && styles.imageChoiceBtnActive,
                    ]}
                    onPress={() => setFormImage(img.key)}
                  >
                    <Image
                      source={getImageSource(img.key)}
                      style={styles.imageChoiceThumb}
                    />
                    <Text
                      style={[
                        styles.imageChoiceLabel,
                        formImage === img.key && styles.imageChoiceLabelActive,
                      ]}
                    >
                      {img.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Form Actions: Save & Cancel */}
              <View style={styles.formBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleCloseModal}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProduct}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>
                    {isEditing ? 'Lưu thay đổi' : 'Lưu sản phẩm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Tùy chỉnh khoảng giá */}
      <Modal
        visible={customPriceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomPriceModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.priceModalOverlay}
        >
          <View style={styles.priceModalBox}>
            <Text style={styles.priceModalTitle}>⚙️ Tùy chỉnh khoảng giá</Text>
            <Text style={styles.priceModalSubtitle}>
              Nhập khoảng giá bạn mong muốn tìm kiếm (VNĐ):
            </Text>

            <View style={styles.priceInputRow}>
              <Text style={styles.priceInputLabel}>Giá tối thiểu (VNĐ):</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="VD: 5000000"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                value={customMinInput}
                onChangeText={setCustomMinInput}
              />
            </View>

            <View style={styles.priceInputRow}>
              <Text style={styles.priceInputLabel}>Giá tối đa (VNĐ):</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="VD: 25000000"
                placeholderTextColor="#a0aec0"
                keyboardType="numeric"
                value={customMaxInput}
                onChangeText={setCustomMaxInput}
              />
            </View>

            <View style={styles.priceModalBtnRow}>
              <TouchableOpacity
                style={styles.priceModalCancelBtn}
                onPress={() => setCustomPriceModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.priceModalCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.priceModalApplyBtn}
                onPress={handleApplyCustomPrice}
                activeOpacity={0.8}
              >
                <Text style={styles.priceModalApplyText}>Áp dụng lọc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 10,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#d32f2f',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  userBadge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    maxWidth: 120,
  },
  logoutSub: {
    fontSize: 10,
    color: '#e53e3e',
    fontWeight: '600',
  },
  loginBtnHeader: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginBtnHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerContainer: {
    backgroundColor: '#c53030',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#c53030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  bannerBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#feebc8',
    marginTop: 4,
    lineHeight: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: '#2d3748',
  },
  clearSearch: {
    fontSize: 14,
    color: '#a0aec0',
    padding: 4,
  },
  clearSearchTouch: {
    padding: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resetCategoryText: {
    fontSize: 11,
    color: '#d32f2f',
    fontWeight: '700',
  },
  priceFilterSection: {
    marginBottom: 14,
  },
  priceScroll: {
    paddingRight: 10,
    marginBottom: 8,
  },
  priceChip: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceChipActive: {
    backgroundColor: '#2b6cb0',
    borderColor: '#2b6cb0',
  },
  priceChipText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600',
  },
  priceChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  sortLabel: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '700',
    marginRight: 2,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sortChipActive: {
    backgroundColor: '#ebf8ff',
    borderColor: '#3182ce',
  },
  sortChipText: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: '#2b6cb0',
    fontWeight: 'bold',
  },
  activeFiltersBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#edf2f7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  activeFiltersLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#718096',
    marginRight: 2,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  activeFilterTagText: {
    fontSize: 11,
    color: '#2d3748',
    fontWeight: '600',
  },
  clearAllFiltersBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fed7d7',
  },
  clearAllFiltersText: {
    fontSize: 11,
    color: '#c53030',
    fontWeight: '700',
  },
  priceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  priceModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  priceModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  priceModalSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 14,
    lineHeight: 16,
  },
  priceInputRow: {
    marginBottom: 12,
  },
  priceInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2d3748',
    backgroundColor: '#fafafa',
  },
  priceModalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  priceModalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#edf2f7',
  },
  priceModalCancelText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  priceModalApplyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#2b6cb0',
  },
  priceModalApplyText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 14,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a5568',
    marginBottom: 8,
  },
  categoryScroll: {
    paddingRight: 10,
  },
  categoryChip: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a202c',
  },
  productCountText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  addProductBtn: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addProductBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  imageBox: {
    width: '100%',
    height: 135,
    backgroundColor: '#f7fafc',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d32f2f',
  },
  cardBody: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d3748',
    height: 36,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#d32f2f',
    marginVertical: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  actionBtnEdit: {
    flex: 1,
    backgroundColor: '#fffaf0',
    borderWidth: 1,
    borderColor: '#feebc8',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  actionBtnEditText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dd6b20',
  },
  actionBtnDelete: {
    flex: 1,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fed7d7',
    borderRadius: 6,
    paddingVertical: 5,
    alignItems: 'center',
  },
  actionBtnDeleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e53e3e',
  },
  buyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  addCartBtnSmall: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d32f2f',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    marginRight: 6,
  },
  addCartBtnSmallText: {
    color: '#d32f2f',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buyBtn: {
    flex: 1.2,
    backgroundColor: '#d32f2f',
    borderRadius: 6,
    paddingVertical: 7,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptyBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  emptyResetBtn: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    fontSize: 13,
    color: '#2d3748',
    fontWeight: '600',
  },
  emptyAddBtn: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#a0aec0',
    fontWeight: 'bold',
    padding: 4,
  },
  modalErrorBox: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#e53e3e',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalErrorText: {
    color: '#e53e3e',
    fontSize: 12,
    fontWeight: '600',
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a5568',
    marginBottom: 6,
    marginTop: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fafafa',
    color: '#2d3748',
  },
  formInputArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  formCategoryScroll: {
    marginVertical: 4,
  },
  formCategoryChip: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formCategoryChipActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  formCategoryChipText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600',
  },
  formCategoryChipTextActive: {
    color: '#fff',
  },
  imageSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  imageChoiceBtn: {
    width: '30%',
    alignItems: 'center',
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f7fafc',
  },
  imageChoiceBtnActive: {
    borderColor: '#d32f2f',
    backgroundColor: '#fff5f5',
  },
  imageChoiceThumb: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginBottom: 4,
  },
  imageChoiceLabel: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '500',
  },
  imageChoiceLabelActive: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#edf2f7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export const HomeScreen = Sanpham3Sqlite;
