import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, updateUser, User } from './database';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setFullName(user.name || user.username || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
        setEmail(user.email || '');
      }
    };
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    if (!fullName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ và tên của bạn!');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser: User = {
        ...currentUser,
        name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim(),
        password: newPassword.trim() ? newPassword.trim() : currentUser.password,
      };

      await updateUser(updatedUser);
      setCurrentUser(updatedUser);
      setNewPassword('');
      setConfirmPassword('');
      setIsSaving(false);

      Alert.alert(
        'Thành công',
        'Thông tin hồ sơ cá nhân đã được cập nhật thành công!',
      );
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Lỗi cập nhật', err.message || 'Không thể cập nhật hồ sơ!');
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('loggedInUser');
          Alert.alert('Thông báo', 'Bạn đã đăng xuất thành công!');
          navigation.navigate('Login');
        },
      },
    ]);
  };

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.titleText}>Chưa đăng nhập</Text>
        <Text style={styles.subText}>
          Vui lòng đăng nhập tài khoản để xem và chỉnh sửa thông tin hồ sơ của bạn!
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* User Avatar & Badge Card */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {currentUser.username.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.usernameTitle}>{currentUser.username}</Text>
        <View
          style={[
            styles.roleBadge,
            currentUser.role === 'admin'
              ? styles.roleAdmin
              : styles.roleUser,
          ]}
        >
          <Text
            style={[
              styles.roleText,
              currentUser.role === 'admin'
                ? styles.roleTextAdmin
                : styles.roleTextUser,
            ]}
          >
            {currentUser.role === 'admin' ? '⚡ QUẢN TRỊ VIÊN' : '👤 KHÁCH HÀNG'}
          </Text>
        </View>
        <Text style={styles.metaText}>
          Mã thành viên: #{currentUser.id} • Ngày tham gia:{' '}
          {currentUser.createdAt
            ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN')
            : 'Mới'}
        </Text>
      </View>

      {/* Edit Profile Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✏️ Thông tin cá nhân</Text>

        <Text style={styles.label}>Tên đăng nhập (Cố định)</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={currentUser.username}
          editable={false}
        />

        <Text style={styles.label}>Họ và tên hiển thị *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên..."
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Số điện thoại liên hệ</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại..."
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Email liên hệ</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập email..."
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Địa chỉ giao hàng mặc định</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập địa chỉ nhận hàng..."
          multiline
          numberOfLines={2}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Password Change Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Đổi mật khẩu (Tùy chọn)</Text>

        <Text style={styles.label}>Mật khẩu mới (ít nhất 6 ký tự)</Text>
        <TextInput
          style={styles.input}
          placeholder="Để trống nếu không đổi..."
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        {newPassword ? (
          <>
            <Text style={styles.label}>Xác nhận mật khẩu mới *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới..."
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </>
        ) : null}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={handleSaveProfile}
        disabled={isSaving}
        activeOpacity={0.8}
      >
        <Text style={styles.saveBtnText}>
          {isSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  container: {
    padding: 14,
    paddingBottom: 40,
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
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  usernameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  roleAdmin: {
    backgroundColor: '#ffeaa7',
  },
  roleUser: {
    backgroundColor: '#e3f2fd',
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  roleTextAdmin: {
    color: '#d35400',
  },
  roleTextUser: {
    color: '#1976d2',
  },
  metaText: {
    fontSize: 11,
    color: '#a0aec0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#2d3748',
    backgroundColor: '#fafbfc',
  },
  disabledInput: {
    backgroundColor: '#edf2f7',
    color: '#718096',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: '#e57373',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutBtnText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

