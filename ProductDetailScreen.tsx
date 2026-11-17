// trang chi tiết sản phẩm với các nút loại sản phẩm
// khi nhấn vào một loại sản phẩm, sẽ điều hướng đến ProductsByCategoryScreen để hiển thị danh sách các sản phẩm thuộc loại đó.
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './AppNavigatorProduct';
import {
  addToCart,
  Category,
  fetchCategories,
  getCurrentUser,
} from './database';
import CategorySelector from './CategorySelector';

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

export const getImageSource = (img?: string) => {
  if (!img) {
    return {
      uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    };
  }
  if (
    img.startsWith('file://') ||
    img.startsWith('http://') ||
    img.startsWith('https://')
  ) {
    return { uri: img };
  }

  const sampleImages: { [key: string]: string } = {
    'hinh1.jpg':
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', // Tai nghe chụp tai
    'hinh2.jpg':
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', // Đồng hồ thông minh Sport trắng
    'iphone15.jpg':
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600', // iPhone 15 Pro Max
    's24.jpg':
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', // Samsung Galaxy S24 Ultra
    'macbook.jpg':
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', // MacBook Air M3
    'ipad.jpg':
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', // iPad Pro
    'shirt.jpg':
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', // Áo sơ mi Oxford cao cấp
    'jeans.jpg':
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', // Quần Jeans Slimfit denim xanh cao cấp
    'blazer.jpg':
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', // Áo khoác Blazer nam
    'sneaker.jpg':
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', // Giày Sneaker Running
    'ps5_controller.jpg':
      'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=600', // Tay cầm chơi game PS5 DualSense
    'switch.jpg':
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600', // Máy chơi game Nintendo Switch OLED
    'vr_headset.jpg':
      'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600', // Kính thực tế ảo Meta Quest 3 VR
    'flycam.jpg':
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600', // Flycam DJI Mini 4 Pro Combo
    'xiaomi.jpg':
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600', // Xiaomi 14 Ultra Leica
    'pixel.jpg':
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600', // Google Pixel 8 Pro
    'gaming_laptop.jpg':
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', // Laptop Gaming Asus ROG
    'imac.jpg':
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', // Máy tính iMac M3
    'speaker.jpg':
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600', // Loa Marshall Bluetooth
    'keyboard.jpg':
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600', // Bàn phím cơ không dây
    'mouse.jpg':
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', // Chuột Logitech MX Master
    'garmin.jpg':
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600', // Đồng hồ thể thao Garmin
    'tissot.jpg':
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600', // Đồng hồ cơ Tissot Thụy Sĩ
    'apple_watch.jpg':
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=600', // Apple Watch Series 9
  };

  return {
    uri: sampleImages[img] || `https://picsum.photos/seed/${img}/600/400`,
  };
};

export const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const product = route.params?.product;
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const load = async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    };
    load();
  }, []);

  const handleSelectCategory = (id: number) => {
    const selected = categories.find((c) => c.id === id);
    if (selected) {
      console.log('Selected category:', selected);
      navigation.navigate('ProductsByCategory', {
        categoryId: selected.id,
        categoryName: selected.name,
      });
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const user = await getCurrentUser();
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng!',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
      return;
    }

    try {
      await addToCart(user.id, product.id, 1);
      Alert.alert(
        'Thành công',
        `Đã thêm "${product.name}" vào giỏ hàng!`,
        [
          { text: 'Tiếp tục xem', style: 'cancel' },
          {
            text: 'Xem giỏ hàng',
            onPress: () => navigation.navigate('CartScreen' as any),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể thêm vào giỏ hàng!');
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    const user = await getCurrentUser();
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản để tiến hành đặt hàng!',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đăng nhập',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
      return;
    }

    try {
      await addToCart(user.id, product.id, 1);
      navigation.navigate('CartScreen' as any);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể mua sản phẩm!');
    }
  };

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin sản phẩm!</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={getImageSource(product.img)}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>
        {(product.price || 0).toLocaleString('vi-VN')} đ
      </Text>

      {/* Cart & Buy Action Row */}
      <View style={styles.btnActionRow}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.addToCartBtnText}>🛒 Thêm vào giỏ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyNowBtn}
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <Text style={styles.buyNowBtnText}>⚡ Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {product.description ? (
        <View style={styles.descBox}>
          <Text style={styles.descTitle}>Mô tả sản phẩm:</Text>
          <Text style={styles.descText}>{product.description}</Text>
        </View>
      ) : null}
      <Text style={styles.label}>Xem các sản phẩm khác:</Text>
      <CategorySelector
        categories={categories}
        selectedId={product.categoryId}
        onSelect={handleSelectCategory}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 6,
    color: '#1a1a1a',
  },
  price: {
    fontSize: 20,
    color: '#d32f2f',
    fontWeight: '700',
    marginBottom: 14,
  },
  btnActionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  addToCartBtnText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buyNowBtn: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  descBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#d32f2f',
  },
  descTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    color: '#636e72',
    lineHeight: 18,
  },
});

export default ProductDetailScreen;
