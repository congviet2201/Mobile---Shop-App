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
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'hinh2.jpg':
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    'iphone15.jpg':
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
    's24.jpg':
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600',
    'macbook.jpg':
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
    'ipad.jpg':
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
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
