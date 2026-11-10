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

export type RootStackParamList = {
  Home: undefined;
  HomeScreen: undefined;
  Sanpham3Sqlite: undefined;
  ProductDetail: { product: Product };
  ProductsByCategory: { categoryId: number; categoryName?: string };
  AdminDashboard: undefined;
  Login: undefined;
  Signup: undefined;
  Register: undefined;
  CartScreen: undefined;
  CheckoutScreen: { cartItems?: CartItem[]; totalAmount?: number };
  OrderHistoryScreen: undefined;
  ProfileScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigatorProduct() {
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
      <Stack.Screen
        name="HomeScreen"
        component={Sanpham3Sqlite}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Sanpham3Sqlite"
        component={Sanpham3Sqlite}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />
      <Stack.Screen
        name="ProductsByCategory"
        component={ProductsByCategoryScreen}
        options={({ route }) => ({
          title: route.params.categoryName || 'Sản phẩm theo loại',
        })}
      />
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{ title: 'Giỏ hàng' }}
      />
      <Stack.Screen
        name="CheckoutScreen"
        component={CheckoutScreen}
        options={{ title: 'Đặt hàng' }}
      />
      <Stack.Screen
        name="OrderHistoryScreen"
        component={OrderHistoryScreen}
        options={{ title: 'Lịch sử mua hàng' }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Hồ sơ người dùng' }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ title: 'Bảng Quản Trị Viên' }}
      />
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
