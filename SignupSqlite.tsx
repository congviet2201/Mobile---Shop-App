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
import { addUser } from './database';

export default function SignupSqlite() {
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async () => {
    setErrorMsg('');

    // 1. Validate empty fields
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên đăng nhập!');
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đăng nhập!');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự!');
      Alert.alert('Lỗi', 'Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu!');
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mật khẩu!');
      return;
    }

    if (password.trim().length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự!');
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setLoading(true);
      // Lưu vào SQLite với role mặc định là 'user'
      const newUser = await addUser(username.trim(), password.trim(), 'user');

      const goToLogin = () => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        navigation.navigate('Login');
      };

      Alert.alert(
        'Đăng ký thành công',
        `Tài khoản "${newUser.username}" đã được tạo thành công! Hãy đăng nhập để tiếp tục.`,
        [
          {
            text: 'Đăng nhập ngay',
            onPress: goToLogin,
          },
        ],
        {
          cancelable: true,
          onDismiss: goToLogin,
        },
      );
    } catch (err: any) {
      const msg = err.message || 'Không thể tạo tài khoản. Vui lòng thử lại!';
      setErrorMsg(msg);
      Alert.alert('Lỗi đăng ký', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.logoText}>VIE TECH SHOP</Text>
          <Text style={styles.title}>Đăng Ký Tài Khoản</Text>
          <Text style={styles.subtitle}>
            Tạo tài khoản mới để trải nghiệm mua sắm tiện ích
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập (ví dụ: nguyenvana)"
              placeholderTextColor="#999"
              autoCapitalize="none"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>
            )}
          </TouchableOpacity>

          {/* Link to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#d32f2f',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eef2f5',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#2f3542',
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#d32f2f',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  loginHint: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});

