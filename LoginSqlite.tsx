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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getUserByCredentials } from './database';

export default function LoginSqlite() {
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');

    // 1. Validate empty fields
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!',
      );
      return;
    }

    try {
      setLoading(true);

      // 2. Verify credentials using getUserByCredentials
      const user = await getUserByCredentials(
        username.trim(),
        password.trim(),
      );

      if (!user) {
        setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
        Alert.alert(
          'Đăng nhập thất bại',
          'Tên đăng nhập hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại.',
        );
        return;
      }

      // 3. Save logged-in user to AsyncStorage
      await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));

      const navigateAfterLogin = () => {
        setUsername('');
        setPassword('');
        // 4. Role based navigation
        if (user.role === 'admin') {
          navigation.navigate('AdminDashboard');
        } else {
          // Điều hướng về trang Home
          if (navigation.canGoBack()) {
            navigation.navigate('HomeScreen');
          }
          navigation.navigate('Home', { screen: 'HomeScreen' });
        }
      };

      // Chuyển hướng ngay lập tức về trang tương ứng
      navigateAfterLogin();

      Alert.alert(
        'Đăng nhập thành công',
        `Chào mừng ${user.username} (${user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'})!`,
        [
          {
            text: 'OK',
            onPress: navigateAfterLogin,
          },
        ],
        {
          cancelable: true,
          onDismiss: navigateAfterLogin,
        },
      );
    } catch (err: any) {
      const msg = err.message || 'Lỗi khi đăng nhập vào hệ thống!';
      setErrorMsg(msg);
      Alert.alert('Lỗi', msg);
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
          <Text style={styles.title}>Đăng Nhập</Text>
          <Text style={styles.subtitle}>
            Chào mừng bạn quay trở lại! Vui lòng đăng nhập vào tài khoản.
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          {/* Quick Admin Test Hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintTitle}>💡 Bấm để điền nhanh tài khoản:</Text>
            <TouchableOpacity
              onPress={() => {
                setUsername('admin');
                setPassword('123456');
                setErrorMsg('');
              }}
            >
              <Text style={styles.hintItem}>• Quản trị viên: admin / 123456 (Nhấn chọn)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setUsername('user1');
                setPassword('password123');
                setErrorMsg('');
              }}
            >
              <Text style={styles.hintItem}>• Khách hàng: user1 / password123 (Nhấn chọn)</Text>
            </TouchableOpacity>
          </View>

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập"
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
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>

          {/* Link to Signup */}
          <View style={styles.signupRow}>
            <Text style={styles.signupHint}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Đăng ký ngay</Text>
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
  hintBox: {
    backgroundColor: '#f0f3f6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  hintItem: {
    fontSize: 12,
    color: '#4b5563',
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  signupHint: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});

