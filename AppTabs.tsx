import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeStackScreen from './HomeStackScreen';
import AdminDashboard from './AdminDashboard';
import SignupSqlite from './SignupSqlite';
import LoginSqlite from './LoginSqlite';

export type AppTabsParamList = {
  Home: undefined;
  AdminDashboard: undefined;
  Signup: undefined;
  Login: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

function getActiveRouteName(state: any): string {
  if (!state || !state.routes || state.routes.length === 0) {
    return '';
  }
  const current = state.routes[state.index ?? 0];
  if (current.state) {
    return getActiveRouteName(current.state);
  }
  return current.name;
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const checkUser = async () => {
      try {
        const raw = await AsyncStorage.getItem('loggedInUser');
        if (isMounted) {
          setCurrentUser(raw ? JSON.parse(raw) : null);
        }
      } catch {
        if (isMounted) {
          setCurrentUser(null);
        }
      }
    };

    checkUser();
    return () => {
      isMounted = false;
    };
  }, [state]);

  const activeScreenName = getActiveRouteName(state);

  // Lọc các tab hiển thị theo yêu cầu:
  // 1. Tab 'AdminDashboard' không bao giờ hiển thị ở footer (Yêu cầu 1, 4).
  // 2. Ở trang dành cho Admin và User (Home / AdminDashboard): CHỈ hiển thị duy nhất nút 'Home' (Yêu cầu 4).
  // 3. Nút Đăng ký và Đăng nhập CHỈ xuất hiện khi người dùng đang ở trang Đăng ký / Đăng nhập (Yêu cầu 5).
  // 4. Khi đã đăng nhập, Đăng ký và Đăng nhập hoàn toàn ẩn khỏi footer (Yêu cầu 2, 3).
  const visibleRoutes = state.routes.filter((route) => {
    if (route.name === 'AdminDashboard') {
      return false;
    }
    if (route.name === 'Signup' || route.name === 'Login') {
      if (currentUser) {
        return false;
      }
      // Nút đăng ký - đăng nhập chỉ xuất hiện ở trang Đăng ký - đăng nhập
      if (activeScreenName !== 'Signup' && activeScreenName !== 'Login') {
        return false;
      }
      return true;
    }
    return true;
  });

  const isSingleTab = visibleRoutes.length === 1;

  return (
    <View style={[styles.tabBar, isSingleTab && styles.tabBarSingle]}>
      {visibleRoutes.map((route) => {
        const routeIndex = state.routes.findIndex((r) => r.key === route.key);
        const isFocused = state.index === routeIndex;
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const getIcon = () => {
          if (route.name === 'Home') return '🏠';
          if (route.name === 'Signup') return '📝';
          if (route.name === 'Login') return '🔑';
          return '⚡';
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={[
              styles.tabItem,
              isSingleTab && styles.tabItemSingle,
              isSingleTab && styles.tabItemSingleActive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
              {getIcon()}
            </Text>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {typeof label === 'string' ? label : route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const renderCustomTabBar = (props: BottomTabBarProps) => (
  <CustomTabBar {...props} />
);

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderCustomTabBar}
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 1. Tab Home người dùng: Mặc định hiển thị khi mở app */}
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Trang chủ',
        }}
      />

      {/* 2. Tab Quản trị (Admin Dashboard) - Chỉ điều hướng, không hiện ở footer */}
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{
          tabBarLabel: 'Quản trị',
        }}
      />

      {/* 3. Tab Đăng ký */}
      <Tab.Screen
        name="Signup"
        component={SignupSqlite}
        options={{
          tabBarLabel: 'Đăng ký',
        }}
      />

      {/* 4. Tab Đăng nhập */}
      <Tab.Screen
        name="Login"
        component={LoginSqlite}
        options={{
          tabBarLabel: 'Đăng nhập',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    height: 62,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabBarSingle: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabItemSingle: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
    borderColor: '#ffcdd2',
  },
  tabItemSingleActive: {
    backgroundColor: '#ffebee',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#636e72',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  tabIcon: {
    fontSize: 18,
    color: '#636e72',
  },
  tabIconActive: {
    color: '#d32f2f',
  },
});
