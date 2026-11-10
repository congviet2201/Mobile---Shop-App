import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './AppNavigatorProduct';
import {
  Category,
  fetchCategories,
  fetchProductsByCategory,
  Product,
} from './database';
import CategorySelector from './CategorySelector';
import { getImageSource } from './ProductDetailScreen';

// Định nghĩa kiểu navigation cho stack
type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductsByCategory'
>;
type RouteProps = RouteProp<RootStackParamList, 'ProductsByCategory'>;

export function ProductsByCategoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  // Lấy categoryId an toàn từ params
  const { categoryId = 1, categoryName = '' } = route.params || {};
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    categoryId || 1,
  );

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Đồng bộ selectedCategoryId khi params categoryId thay đổi
  useEffect(() => {
    if (categoryId && categoryId !== selectedCategoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId, selectedCategoryId]);

  useEffect(() => {
    fetchProductsByCategory(selectedCategoryId).then(setProducts);

    // Cập nhật lại tiêu đề header theo tên category đang chọn
    const currentCat = categories.find((c) => c.id === selectedCategoryId);
    if (currentCat) {
      navigation.setOptions({ title: currentCat.name });
    } else if (categoryName) {
      navigation.setOptions({ title: categoryName });
    }
  }, [selectedCategoryId, categories, navigation, categoryName]);

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.headerLabel}>Chọn danh mục:</Text>
      <CategorySelector
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={(id) => setSelectedCategoryId(id)} // Callback từ con truyền ngược lên cha
      />

      <Text style={styles.subHeader}>
        Danh sách sản phẩm ({products.length}):
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('ProductDetail', { product: item })
            }
          >
            <Image
              source={getImageSource(item.img)}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.price}>
                {(item.price || 0).toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Không có sản phẩm nào thuộc danh mục này
          </Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f8f9fa',
  },
  headerLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginVertical: 12,
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f1f2f6',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2d3436',
    marginBottom: 4,
  },
  price: {
    color: '#e74c3c',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export const ProductListScreen = ProductsByCategoryScreen;
export default ProductsByCategoryScreen;
