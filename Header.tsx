import React, { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getCartCount, User } from './database';

interface HeaderProps {
  onLogoutSuccess?: () => void;
}

export default function Header({ onLogoutSuccess }: HeaderProps) {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  // Nạp thông tin loggedInUser từ AsyncStorage mỗi khi màn hình nhận focus
  const loadUserSession = async () => {
    try {
      const raw = await AsyncStorage.getItem('loggedInUser');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCurrentUser(parsed);
        const count = await getCartCount(parsed.id);
        setCartCount(count);
      } else {
        setCurrentUser(null);
        setCartCount(0);
      }
    } catch (e) {
      console.error('Lỗi khi đọc loggedInUser từ AsyncStorage:', e);
      setCurrentUser(null);
      setCartCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserSession();
    }, []),
  );

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('loggedInUser');
            setCurrentUser(null);
            setCartCount(0);
            if (onLogoutSuccess) {
              onLogoutSuccess();
            }
            Alert.alert('Thông báo', 'Bạn đã đăng xuất thành công!');
            navigation.navigate('Login');
          } catch (e) {
            console.error('Lỗi đăng xuất:', e);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.headerWrapper}>
      {/* Brand Logo & Slogan */}
      <View style={styles.brandContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.brandTitle}>VIE TECH SHOP</Text>
          <Text style={styles.brandSubtitle}>Công nghệ trong tầm tay</Text>
        </TouchableOpacity>
      </View>

      {/* Right Controls */}
      <View style={styles.rightControls}>
        {/* Cart Icon Button with Counter Badge */}
        <TouchableOpacity
          style={styles.cartIconButton}
          onPress={() => navigation.navigate('CartScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.cartEmoji}>🛒</Text>
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* User Info & Actions */}
        {currentUser ? (
          <View style={styles.userContainer}>
            <View style={styles.userGreetingRow}>
              <Text style={styles.greetingText} numberOfLines={1}>
                Xin chào,{' '}
                <Text style={styles.highlightName}>{currentUser.username}</Text>{' '}
                <Text style={styles.roleTag}>({currentUser.role})</Text>
              </Text>
            </View>

            {/* Quick Action Buttons Row */}
            <View style={styles.actionRow}>
              {currentUser.role === 'admin' && (
                <TouchableOpacity
                  style={[styles.actionChip, styles.adminActionChip]}
                  onPress={() => navigation.navigate('AdminDashboard')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.adminActionChipText}>⚡ Quản trị</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => navigation.navigate('ProfileScreen')}
              >
                <Text style={styles.actionChipText}>👤 Hồ sơ</Text>
              </TouchableOpacity>

              {currentUser.role !== 'admin' && (
                <TouchableOpacity
                  style={styles.actionChip}
                  onPress={() => navigation.navigate('OrderHistoryScreen')}
                >
                  <Text style={styles.actionChipText}>📦 Đơn mua</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.guestActionRow}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.signupButtonText}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>🔑 Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandContainer: {
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#d32f2f',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#888',
    marginTop: 1,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartIconButton: {
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cartEmoji: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  userGreetingRow: {
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  highlightName: {
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  roleTag: {
    fontSize: 11,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionChip: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  actionChipText: {
    fontSize: 10,
    color: '#2f3542',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  logoutText: {
    color: '#d32f2f',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adminActionChip: {
    backgroundColor: '#d32f2f',
  },
  adminActionChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  guestActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#dfe4ea',
  },
  signupButtonText: {
    color: '#2f3542',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
