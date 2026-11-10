import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './AppNavigatorProduct';
import { registerUser } from './database';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (mail: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(mail.trim());
  };

  const handleRegister = async () => {
    setErrorMessage('');

    // 1. Kiểm tra để trống
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      const err = 'Vui lòng điền đầy đủ tất cả các trường thông tin!';
      setErrorMessage(err);
      Alert.alert('Thiếu thông tin', err);
      return;
    }

    // 2. Kiểm tra định dạng Email
    if (!validateEmail(email)) {
      const err = 'Định dạng email không hợp lệ (Ví dụ: name@example.com)!';
      setErrorMessage(err);
      Alert.alert('Email không hợp lệ', err);
      return;
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      const err = 'Mật khẩu phải có ít nhất 6 ký tự!';
      setErrorMessage(err);
      Alert.alert('Mật khẩu quá ngắn', err);
      return;
    }

    // 4. Kiểm tra khớp mật khẩu
    if (password !== confirmPassword) {
      const err = 'Mật khẩu xác nhận không khớp!';
      setErrorMessage(err);
      Alert.alert('Xác nhận mật khẩu thất bại', err);
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      setLoading(false);
      Alert.alert(
        'Đăng ký thành công',
        `Chào mừng ${newUser.name}! Tài khoản của bạn đã được tạo thành công.`,
        [
          {
            text: 'Bắt đầu ngay',
            onPress: () => navigation.navigate('Sanpham3Sqlite'),
          },
        ],
      );
    } catch (error: any) {
      setLoading(false);
      const msg = error.message || 'Đã có lỗi xảy ra khi đăng ký!';
      setErrorMessage(msg);
      Alert.alert('Đăng ký thất bại', msg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBox}>
          <Text style={styles.brandTitle}>VIE TECH SHOP</Text>
          <Text style={styles.brandSubtitle}>Tạo tài khoản mới</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Nguyễn Văn A"
            placeholderTextColor="#999"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage('');
            }}
          />

          <Text style={styles.inputLabel}>Địa chỉ Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="vidu@domain.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
          />

          <Text style={styles.inputLabel}>Mật khẩu (tối thiểu 6 ký tự) *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
          />

          <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
          />

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerBtnText}>Tạo tài khoản</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginPromptRow}>
            <Text style={styles.subText}>Đã có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#d32f2f',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorBox: {
    backgroundColor: '#ffeaa7',
    borderLeftWidth: 4,
    borderLeftColor: '#d63031',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d63031',
    fontWeight: '600',
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#2d3436',
  },
  registerBtn: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  subText: {
    fontSize: 14,
    color: '#636e72',
  },
  linkText: {
    fontSize: 14,
    color: '#0984e3',
    fontWeight: 'bold',
  },
});

