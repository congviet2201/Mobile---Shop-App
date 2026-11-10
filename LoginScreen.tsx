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
import { loginUser } from './database';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      Alert.alert('Lỗi đăng nhập', 'Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      setLoading(false);
      Alert.alert('Thành công', `Chào mừng ${user.name} quay trở lại!`, [
        {
          text: 'Bắt đầu',
          onPress: () => navigation.navigate('Sanpham3Sqlite'),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      const msg = error.message || 'Email hoặc mật khẩu không chính xác!';
      setErrorMessage(msg);
      Alert.alert('Đăng nhập thất bại', msg);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrorMessage('');
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
          <Text style={styles.brandSubtitle}>Công nghệ trong tầm tay</Text>
          <Text style={styles.welcomeText}>Đăng nhập tài khoản</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nhap.email@example.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
          />

          <Text style={styles.inputLabel}>Mật khẩu</Text>
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

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.quickFillContainer}>
            <Text style={styles.quickFillTitle}>Tài khoản thử nghiệm nhanh:</Text>
            <TouchableOpacity
              style={styles.quickFillBadge}
              onPress={() => handleQuickFill('admin@shop.com', 'password123')}
            >
              <Text style={styles.quickFillText}>
                🔑 Admin: admin@shop.com / password123
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerPromptRow}>
            <Text style={styles.subText}>Chưa có tài khoản? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => navigation.navigate('Sanpham3Sqlite')}
            activeOpacity={0.7}
          >
            <Text style={styles.guestBtnText}>
              🛍️ Duyệt sản phẩm với tư cách Khách
            </Text>
          </TouchableOpacity>
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
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginTop: 15,
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
  loginBtn: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickFillContainer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
  },
  quickFillTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  quickFillBadge: {
    backgroundColor: '#edf2f7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  quickFillText: {
    fontSize: 12,
    color: '#2d3748',
    fontWeight: '500',
  },
  registerPromptRow: {
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
  guestBtn: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestBtnText: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

