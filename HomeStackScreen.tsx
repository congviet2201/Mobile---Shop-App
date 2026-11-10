import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Sanpham3Sqlite from './Sanpham3Sqlite';
import ProductDetailScreen from './ProductDetailScreen';
import ProductsByCategoryScreen from './ProductsByCategoryScreen';
import AdminDashboard from './AdminDashboard';
import LoginSqlite from './LoginSqlite';
import SignupSqlite from './SignupSqlite';
import CartScreen from './CartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import ProfileScreen from './ProfileScreen';
import { CartItem, Product } from './database';

export type HomeStackParamList = {
  Home: undefined;
  HomeScreen: undefined;
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
  AdminDashboard: undefined;
  Login: undefined;
  Signup: undefined;
  CartScreen: undefined;
  CheckoutScreen: { cartItems?: CartItem[]; totalAmount?: number };
  OrderHistoryScreen: undefined;
  ProfileScreen: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStackScreen() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerStyle: { backgroundColor: '#d32f2f' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}
    >
      {/* 1. Màn hình chính mặc định khi mở app: HomeScreen & alias Home */}
      <Stack.Screen
        name="HomeScreen"
        component={Sanpham3Sqlite}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Home"
        component={Sanpham3Sqlite}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Sanpham3Sqlite"
        component={Sanpham3Sqlite}
        options={{ headerShown: false }}
      />

      {/* 2. Chi tiết sản phẩm */}
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />

      {/* 3. Lọc sản phẩm theo danh mục */}
      <Stack.Screen
        name="ProductsByCategory"
        component={ProductsByCategoryScreen}
        options={({ route }) => ({
          title: route.params.categoryName || 'Sản phẩm theo loại',
        })}
      />

      {/* 4. Giỏ hàng & Đặt hàng */}
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ title: 'Giỏ hàng của bạn' }}
      />

      <Stack.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{ title: 'Thanh toán & Đặt hàng' }}
      />

      {/* 5. Lịch sử mua hàng */}
      <Stack.Screen
        name="OrderHistoryScreen"
        component={OrderHistoryScreen}
        options={{ title: 'Lịch sử mua hàng' }}
      />

      {/* 6. Hồ sơ cá nhân */}
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Hồ sơ người dùng' }}
      />

      {/* 7. Màn hình Quản trị viên (Admin Dashboard) */}
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Bảng Quản Trị Viên' }}
      />

      {/* 8. Đăng nhập / Đăng ký */}
      <Stack.Screen
        name="Login"
        component={LoginSqlite}
        options={{ title: 'Đăng nhập' }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupSqlite}
        options={{ title: 'Đăng ký tài khoản' }}
      />
    </Stack.Navigator>
  );
}
