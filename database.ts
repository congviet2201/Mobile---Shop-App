import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
  categoryId: number;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'user';
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  product: Product;
  quantity: number;
  createdAt?: string;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  img: string;
}

export interface Order {
  id: number;
  userId: number;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod?: string;
  totalAmount: number;
  status: 'Đang xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
  createdAt: string;
  items: OrderDetail[];
}

const STORAGE_KEYS = {
  CATEGORIES: '@shopapp_categories_v2',
  PRODUCTS: '@shopapp_products_v2',
  USERS: '@shopapp_users_sqlite_v3',
  CART: '@shopapp_cart_v2',
  ORDERS: '@shopapp_orders_v2',
  ORDER_DETAILS: '@shopapp_order_details_v2',
  LOGGED_IN_USER: 'loggedInUser',
  SESSION_LEGACY: '@shopapp_current_session_v2',
};

// Dữ liệu danh mục mẫu ban đầu
const initialCategories: Category[] = [
  { id: 1, name: 'Điện thoại', description: 'Các dòng smartphone cao cấp' },
  { id: 2, name: 'Máy tính', description: 'Laptop, máy tính bảng công nghệ mới' },
  { id: 3, name: 'Phụ kiện', description: 'Tai nghe, đồng hồ, cáp sạc' },
  { id: 4, name: 'Thời trang', description: 'Quần áo thời trang nam nữ' },
  { id: 5, name: 'Đồng hồ', description: 'Đồng hồ thể thao, thông minh' },
];

// Dữ liệu sản phẩm mẫu ban đầu
const initialProducts: Product[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro Max 256GB',
    price: 34990000,
    img: 'iphone15.jpg',
    categoryId: 1,
    description: 'Flagship Apple mới nhất với chip A17 Pro và khung titan siêu nhẹ.',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S24 Ultra',
    price: 29990000,
    img: 's24.jpg',
    categoryId: 1,
    description: 'Điện thoại cao cấp với màn hình Dynamic AMOLED 2X và bút S-Pen thông minh.',
  },
  {
    id: 3,
    name: 'MacBook Air M3 2024',
    price: 27990000,
    img: 'macbook.jpg',
    categoryId: 2,
    description: 'Hiệu năng vượt trội cùng thời lượng pin cả ngày dài với chip Apple M3.',
  },
  {
    id: 4,
    name: 'iPad Pro M2 11-inch',
    price: 21590000,
    img: 'ipad.jpg',
    categoryId: 2,
    description: 'Màn hình Liquid Retina siêu nét cùng sức mạnh chip M2 đỉnh cao.',
  },
  {
    id: 5,
    name: 'AirPods Pro 2 USB-C',
    price: 5990000,
    img: 'hinh1.jpg',
    categoryId: 3,
    description: 'Khử tiếng ồn chủ động gấp 2 lần, cổng sạc Type-C tiện lợi.',
  },
  {
    id: 6,
    name: 'Apple Watch Ultra 2',
    price: 21490000,
    img: 'hinh2.jpg',
    categoryId: 3,
    description: 'Đồng hồ thông minh thể thao chuyên nghiệp với độ bền cao cấp.',
  },
  {
    id: 7,
    name: 'Áo sơ mi nam Oxford cao cấp',
    price: 450000,
    img: 'hinh1.jpg',
    categoryId: 4,
    description: 'Chất vải cotton thoáng mát, đường may tỉ mỉ, tôn dáng thanh lịch.',
  },
  {
    id: 8,
    name: 'Quần Jeans nam Slimfit',
    price: 650000,
    img: 'hinh2.jpg',
    categoryId: 4,
    description: 'Kiểu dáng thời trang trẻ trung, chất liệu co giãn thoải mái.',
  },
];

// Tài khoản Admin mặc định theo yêu cầu (username: admin, password: 123456, role: admin)
const defaultAdminUser: User = {
  id: 1,
  username: 'admin',
  password: '123456',
  role: 'admin',
  name: 'Quản trị viên',
  email: 'admin@shop.com',
  phone: '0901234567',
  address: 'Hà Nội, Việt Nam',
  createdAt: new Date().toISOString(),
};

const initialUsers: User[] = [
  defaultAdminUser,
  {
    id: 2,
    username: 'user1',
    password: 'password123',
    role: 'user',
    name: 'Khách hàng 1',
    email: 'user1@shop.com',
    phone: '0987654321',
    address: 'TP. Hồ Chí Minh, Việt Nam',
    createdAt: new Date().toISOString(),
  },
];

// In-Memory Storage Cache
let categoriesStore: Category[] = [...initialCategories];
let productsStore: Product[] = [...initialProducts];
let usersStore: User[] = [...initialUsers];
let cartStore: CartItem[] = [];
let ordersStore: Order[] = [];
let orderDetailsStore: OrderDetail[] = [];

let nextCategoryId = 6;
let nextProductId = 9;
let nextUserId = 3;
let nextCartId = 1;
let nextOrderId = 1;
let nextOrderDetailId = 1;

/**
 * Lưu danh mục vào persistent storage
 */
const persistCategories = async () => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categoriesStore),
    );
  } catch (error) {
    console.error('Lỗi khi lưu danh mục:', error);
  }
};

/**
 * Lưu sản phẩm vào persistent storage
 */
const persistProducts = async () => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PRODUCTS,
      JSON.stringify(productsStore),
    );
  } catch (error) {
    console.error('Lỗi khi lưu sản phẩm vào storage:', error);
  }
};

/**
 * Lưu bảng users vào persistent storage
 */
const persistUsers = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersStore));
  } catch (error) {
    console.error('Lỗi khi lưu người dùng vào storage:', error);
  }
};

/**
 * Lưu giỏ hàng vào persistent storage
 */
const persistCart = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartStore));
  } catch (error) {
    console.error('Lỗi khi lưu giỏ hàng vào storage:', error);
  }
};

/**
 * Lưu đơn hàng vào persistent storage
 */
const persistOrders = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersStore));
    await AsyncStorage.setItem(
      STORAGE_KEYS.ORDER_DETAILS,
      JSON.stringify(orderDetailsStore),
    );
  } catch (error) {
    console.error('Lỗi khi lưu đơn hàng vào storage:', error);
  }
};

/**
 * Khởi tạo Database và nạp dữ liệu từ persistent storage
 */
export const initDatabase = async (onSuccess?: () => void): Promise<void> => {
  try {
    // 1. Nạp Danh mục
    const rawCategories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (rawCategories) {
      const parsedCats = JSON.parse(rawCategories);
      if (Array.isArray(parsedCats) && parsedCats.length > 0) {
        categoriesStore = parsedCats;
        const maxCatId = Math.max(...categoriesStore.map((c) => c.id || 0), 5);
        nextCategoryId = maxCatId + 1;
      } else {
        categoriesStore = [...initialCategories];
        await persistCategories();
      }
    } else {
      categoriesStore = [...initialCategories];
      await persistCategories();
    }

    // 2. Nạp Sản phẩm
    const rawProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (rawProducts) {
      const parsed = JSON.parse(rawProducts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        productsStore = parsed;
        const maxId = Math.max(...productsStore.map((p) => p.id || 0), 8);
        nextProductId = maxId + 1;
      } else {
        productsStore = [...initialProducts];
        await persistProducts();
      }
    } else {
      productsStore = [...initialProducts];
      await persistProducts();
    }

    // 3. Nạp Bảng Users (SQLite Users)
    const rawUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed) && parsed.length > 0) {
        usersStore = parsed;
      } else {
        usersStore = [...initialUsers];
      }
    } else {
      usersStore = [...initialUsers];
    }

    // Đảm bảo luôn tồn tại tài khoản admin mặc định: admin / 123456 / admin
    const hasAdmin = usersStore.some(
      (u) => u.username.toLowerCase() === 'admin',
    );
    if (!hasAdmin) {
      usersStore.unshift(defaultAdminUser);
    }
    await persistUsers();

    const maxUserId = Math.max(...usersStore.map((u) => u.id || 0), 2);
    nextUserId = maxUserId + 1;

    // 4. Nạp Giỏ hàng (Cart)
    const rawCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
    if (rawCart) {
      const parsedCart = JSON.parse(rawCart);
      if (Array.isArray(parsedCart)) {
        cartStore = parsedCart;
        const maxCartId = Math.max(...cartStore.map((c) => c.id || 0), 0);
        nextCartId = maxCartId + 1;
      }
    }

    // 5. Nạp Đơn hàng (Orders & OrderDetails)
    const rawOrders = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    const rawDetails = await AsyncStorage.getItem(STORAGE_KEYS.ORDER_DETAILS);
    if (rawOrders) {
      const parsedOrders = JSON.parse(rawOrders);
      if (Array.isArray(parsedOrders)) {
        ordersStore = parsedOrders;
        const maxOrderId = Math.max(...ordersStore.map((o) => o.id || 0), 0);
        nextOrderId = maxOrderId + 1;
      }
    }
    if (rawDetails) {
      const parsedDetails = JSON.parse(rawDetails);
      if (Array.isArray(parsedDetails)) {
        orderDetailsStore = parsedDetails;
        const maxDetailId = Math.max(...orderDetailsStore.map((d) => d.id || 0), 0);
        nextOrderDetailId = maxDetailId + 1;
      }
    }

    console.log('✅ SQLite Database & Persistent Storage sẵn sàng.');
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('❌ Lỗi khi khởi tạo database:', error);
    if (onSuccess) {
      onSuccess();
    }
  }
};

// ==========================================
// CÁC HÀM CRUD DANH MỤC (CATEGORIES)
// ==========================================

export const fetchCategories = async (): Promise<Category[]> => {
  return [...categoriesStore];
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  return categoriesStore.find((c) => c.id === id) || null;
};

export const addCategory = async (
  name: string,
  description: string = '',
): Promise<Category> => {
  const cleanName = name.trim();
  if (!cleanName) {
    throw new Error('Tên danh mục không được để trống!');
  }
  const existing = categoriesStore.find(
    (c) => c.name.toLowerCase() === cleanName.toLowerCase(),
  );
  if (existing) {
    throw new Error('Danh mục này đã tồn tại!');
  }
  const newCat: Category = {
    id: nextCategoryId++,
    name: cleanName,
    description: description.trim(),
  };
  categoriesStore.push(newCat);
  await persistCategories();
  return newCat;
};

export const updateCategory = async (category: Category): Promise<void> => {
  const index = categoriesStore.findIndex((c) => c.id === category.id);
  if (index !== -1) {
    categoriesStore[index] = { ...category };
    await persistCategories();
  } else {
    throw new Error(`Không tìm thấy danh mục ID ${category.id}`);
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  // Kiểm tra nếu danh mục còn sản phẩm
  const hasProducts = productsStore.some((p) => p.categoryId === id);
  if (hasProducts) {
    throw new Error(
      'Không thể xóa danh mục đang chứa sản phẩm! Vui lòng xóa hoặc chuyển sản phẩm trước.',
    );
  }
  categoriesStore = categoriesStore.filter((c) => c.id !== id);
  await persistCategories();
};

// ==========================================
// CÁC HÀM CRUD SẢN PHẨM (PRODUCTS)
// ==========================================

export const fetchProducts = async (): Promise<Product[]> => {
  return [...productsStore];
};

export const getProductById = async (id: number): Promise<Product | null> => {
  return productsStore.find((p) => p.id === id) || null;
};

export const fetchProductsByCategory = async (
  categoryId: number,
): Promise<Product[]> => {
  return productsStore.filter((p) => p.categoryId === categoryId);
};

export const addProduct = async (
  product: Omit<Product, 'id'>,
): Promise<Product> => {
  const newProduct: Product = {
    ...product,
    id: nextProductId++,
  };
  productsStore.push(newProduct);
  await persistProducts();
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<void> => {
  const index = productsStore.findIndex((p) => p.id === product.id);
  if (index !== -1) {
    productsStore[index] = { ...product };
    await persistProducts();
  } else {
    throw new Error(`Không tìm thấy sản phẩm có ID ${product.id}`);
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  productsStore = productsStore.filter((p) => p.id !== id);
  await persistProducts();
};

export const searchProductsByNameOrCategory = async (
  keyword: string,
): Promise<Product[]> => {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return [...productsStore];

  const matchedCatIds = categoriesStore
    .filter((c) => c.name.toLowerCase().includes(lower))
    .map((c) => c.id);

  return productsStore.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      (p.description && p.description.toLowerCase().includes(lower)) ||
      matchedCatIds.includes(p.categoryId),
  );
};

// ==========================================
// BỘ LỌC GIÁ VÀ SẮP XẾP SẢN PHẨM (PRICE FILTER & SORT)
// ==========================================

export interface PriceRangeFilter {
  id: string;
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export const PRESET_PRICE_RANGES: PriceRangeFilter[] = [
  { id: 'all', label: 'Tất cả giá', minPrice: null, maxPrice: null },
  { id: 'under_5m', label: '< 5 triệu', minPrice: null, maxPrice: 5000000 },
  { id: '5m_15m', label: '5 - 15 triệu', minPrice: 5000000, maxPrice: 15000000 },
  { id: '15m_30m', label: '15 - 30 triệu', minPrice: 15000000, maxPrice: 30000000 },
  { id: 'above_30m', label: '> 30 triệu', minPrice: 30000000, maxPrice: null },
];

export type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc';

export interface ProductFilterOptions {
  categoryId?: number | null;
  searchKeyword?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortBy?: SortOption;
}

/**
 * Hàm lọc sản phẩm kết hợp: Tìm kiếm (Tên/Mô tả/Danh mục), Lọc Danh mục, Lọc Giá, Sắp xếp
 */
export const filterAndSortProducts = (
  products: Product[],
  categories: Category[],
  options: ProductFilterOptions,
): Product[] => {
  const {
    categoryId = null,
    searchKeyword = '',
    minPrice = null,
    maxPrice = null,
    sortBy = 'default',
  } = options;

  const kw = searchKeyword.toLowerCase().trim();

  // Tìm danh mục có tên chứa từ khóa
  const matchedCatIds = kw
    ? categories
        .filter((c) => c.name.toLowerCase().includes(kw))
        .map((c) => c.id)
    : [];

  const filtered = products.filter((p) => {
    // 1. Lọc theo danh mục đã chọn
    if (categoryId !== null && p.categoryId !== categoryId) {
      return false;
    }

    // 2. Tìm kiếm theo tên sản phẩm, mô tả HOẶC tên danh mục
    if (kw) {
      const matchName = p.name.toLowerCase().includes(kw);
      const matchDesc = (p.description || '').toLowerCase().includes(kw);
      const matchCategory = matchedCatIds.includes(p.categoryId);
      if (!matchName && !matchDesc && !matchCategory) {
        return false;
      }
    }

    // 3. Lọc theo giá (minPrice, maxPrice)
    if (minPrice !== null && minPrice !== undefined && p.price < minPrice) {
      return false;
    }
    if (maxPrice !== null && maxPrice !== undefined && p.price > maxPrice) {
      return false;
    }

    return true;
  });

  // 4. Sắp xếp
  const result = [...filtered];
  if (sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name_asc') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }

  return result;
};

// ==========================================
// BẢNG USERS VÀ CÁC HÀM QUẢN LÝ TÀI KHOẢN (SQLITE)
// ==========================================

export const addUser = async (
  username: string,
  password: string,
  role: 'admin' | 'user' = 'user',
  name?: string,
  phone?: string,
  address?: string,
): Promise<User> => {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (!cleanUsername || !cleanPassword) {
    throw new Error('Tên đăng nhập và mật khẩu không được để trống!');
  }

  // Kiểm tra trùng username
  const existing = usersStore.find(
    (u) => u.username.toLowerCase() === cleanUsername.toLowerCase(),
  );
  if (existing) {
    throw new Error('Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác!');
  }

  const newUser: User = {
    id: nextUserId++,
    username: cleanUsername,
    password: cleanPassword,
    role: role || 'user',
    name: name || cleanUsername,
    email: `${cleanUsername}@shop.com`,
    phone: phone || '',
    address: address || '',
    createdAt: new Date().toISOString(),
  };

  usersStore.push(newUser);
  await persistUsers();
  return newUser;
};

export const updateUser = async (user: User): Promise<void> => {
  const index = usersStore.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    usersStore[index] = { ...user };
    await persistUsers();

    // Nếu đang sửa chính user hiện tại thì cập nhật lại AsyncStorage session
    const current = await getCurrentUser();
    if (current && current.id === user.id) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LOGGED_IN_USER,
        JSON.stringify(usersStore[index]),
      );
    }
  } else {
    throw new Error(`Không tìm thấy người dùng có ID ${user.id}`);
  }
};

export const updateUserRole = async (
  id: number,
  newRole: 'admin' | 'user',
): Promise<void> => {
  const index = usersStore.findIndex((u) => u.id === id);
  if (index !== -1) {
    // Không cho phép hạ quyền tài khoản admin gốc
    if (usersStore[index].username.toLowerCase() === 'admin' && newRole !== 'admin') {
      throw new Error('Không thể đổi quyền của tài khoản Admin gốc!');
    }
    usersStore[index].role = newRole;
    await persistUsers();

    const current = await getCurrentUser();
    if (current && current.id === id) {
      current.role = newRole;
      await AsyncStorage.setItem(
        STORAGE_KEYS.LOGGED_IN_USER,
        JSON.stringify(current),
      );
    }
  } else {
    throw new Error(`Không tìm thấy người dùng ID ${id}`);
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  const target = usersStore.find((u) => u.id === id);
  if (!target) return;
  if (target.username.toLowerCase() === 'admin') {
    throw new Error('Không thể xóa tài khoản Admin mặc định của hệ thống!');
  }
  const current = await getCurrentUser();
  if (current && current.id === id) {
    throw new Error('Không thể xóa tài khoản Quản trị viên đang đăng nhập!');
  }

  usersStore = usersStore.filter((u) => u.id !== id);
  await persistUsers();
};

export const fetchUsers = async (): Promise<User[]> => {
  return [...usersStore];
};

export const getUserByCredentials = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const cleanUsername = username.trim().toLowerCase();
  const cleanPassword = password.trim();

  const user = usersStore.find(
    (u) =>
      u.username.toLowerCase() === cleanUsername &&
      u.password === cleanPassword,
  );

  return user || null;
};

export const getUserById = async (id: number): Promise<User | null> => {
  const user = usersStore.find((u) => u.id === id);
  return user || null;
};

// ==========================================
// QUẢN LÝ PHIÊN ĐĂNG NHẬP (ASYNCSTORAGE SESSION)
// ==========================================

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.LOGGED_IN_USER);
    if (raw) {
      return JSON.parse(raw);
    }
    const legacyRaw = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_LEGACY);
    if (legacyRaw) {
      return JSON.parse(legacyRaw);
    }
  } catch (e) {
    console.error('Lỗi khi lấy loggedInUser:', e);
  }
  return null;
};

export const loginUser = async (
  usernameOrEmail: string,
  password: string,
): Promise<User> => {
  const user = await getUserByCredentials(usernameOrEmail, password);
  if (!user) {
    const byEmail = usersStore.find(
      (u) =>
        u.email?.toLowerCase() === usernameOrEmail.trim().toLowerCase() &&
        u.password === password.trim(),
    );
    if (byEmail) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LOGGED_IN_USER,
        JSON.stringify(byEmail),
      );
      return byEmail;
    }
    throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
  }

  await AsyncStorage.setItem(
    STORAGE_KEYS.LOGGED_IN_USER,
    JSON.stringify(user),
  );
  return user;
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  const username = data.name.trim() || data.email.split('@')[0];
  const user = await addUser(username, data.password, 'user');
  user.name = data.name;
  user.email = data.email;
  await persistUsers();

  await AsyncStorage.setItem(
    STORAGE_KEYS.LOGGED_IN_USER,
    JSON.stringify(user),
  );
  return user;
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.LOGGED_IN_USER);
  await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_LEGACY);
};

// ==========================================
// CÁC HÀM CRUD GIỎ HÀNG (SHOPPING CART)
// ==========================================

export const fetchCart = async (userId: number): Promise<CartItem[]> => {
  // Lấy các mục giỏ hàng kèm thông tin sản phẩm mới nhất
  const userItems = cartStore.filter((item) => item.userId === userId);
  return userItems.map((item) => {
    const prod = productsStore.find((p) => p.id === item.productId) || item.product;
    return {
      ...item,
      product: prod,
    };
  });
};

export const getCartCount = async (userId: number): Promise<number> => {
  const items = cartStore.filter((item) => item.userId === userId);
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

export const addToCart = async (
  userId: number,
  productId: number,
  quantity: number = 1,
): Promise<void> => {
  const product = productsStore.find((p) => p.id === productId);
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm!');
  }

  const existingIndex = cartStore.findIndex(
    (item) => item.userId === userId && item.productId === productId,
  );

  if (existingIndex !== -1) {
    cartStore[existingIndex].quantity += quantity;
  } else {
    const newItem: CartItem = {
      id: nextCartId++,
      userId,
      productId,
      product,
      quantity,
      createdAt: new Date().toISOString(),
    };
    cartStore.push(newItem);
  }
  await persistCart();
};

export const updateCartQuantity = async (
  cartItemId: number,
  quantity: number,
): Promise<void> => {
  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return;
  }
  const index = cartStore.findIndex((c) => c.id === cartItemId);
  if (index !== -1) {
    cartStore[index].quantity = quantity;
    await persistCart();
  }
};

export const removeFromCart = async (cartItemId: number): Promise<void> => {
  cartStore = cartStore.filter((c) => c.id !== cartItemId);
  await persistCart();
};

export const clearCart = async (userId: number): Promise<void> => {
  cartStore = cartStore.filter((c) => c.userId !== userId);
  await persistCart();
};

// ==========================================
// CÁC HÀM CRUD ĐƠN HÀNG (ORDERS & ORDER DETAILS)
// ==========================================

export const createOrder = async (orderData: {
  userId: number;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod?: string;
  items: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    img: string;
  }[];
}): Promise<Order> => {
  if (!orderData.items || orderData.items.length === 0) {
    throw new Error('Giỏ hàng trống! Vui lòng chọn sản phẩm trước khi đặt hàng.');
  }
  if (!orderData.customerName.trim() || !orderData.phone.trim() || !orderData.address.trim()) {
    throw new Error('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ nhận hàng!');
  }

  const orderId = nextOrderId++;
  const totalAmount = orderData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const orderDetails: OrderDetail[] = orderData.items.map((item) => ({
    id: nextOrderDetailId++,
    orderId,
    productId: item.productId,
    productName: item.productName,
    price: item.price,
    quantity: item.quantity,
    img: item.img,
  }));

  const newOrder: Order = {
    id: orderId,
    userId: orderData.userId,
    customerName: orderData.customerName.trim(),
    phone: orderData.phone.trim(),
    address: orderData.address.trim(),
    note: orderData.note?.trim() || '',
    paymentMethod: orderData.paymentMethod || 'Thanh toán khi nhận hàng (COD)',
    totalAmount,
    status: 'Đang xử lý',
    createdAt: new Date().toISOString(),
    items: orderDetails,
  };

  ordersStore.unshift(newOrder);
  orderDetailsStore.push(...orderDetails);

  await persistOrders();

  // Xóa giỏ hàng của user sau khi đặt hàng thành công
  await clearCart(orderData.userId);

  return newOrder;
};

export const fetchOrders = async (userId?: number): Promise<Order[]> => {
  if (userId) {
    return ordersStore.filter((o) => o.userId === userId);
  }
  return [...ordersStore];
};

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  return ordersStore.find((o) => o.id === orderId) || null;
};

export const updateOrderStatus = async (
  orderId: number,
  status: Order['status'],
): Promise<void> => {
  const index = ordersStore.findIndex((o) => o.id === orderId);
  if (index !== -1) {
    ordersStore[index].status = status;
    await persistOrders();
  }
};

export const deleteOrder = async (orderId: number): Promise<boolean> => {
  const initialLength = ordersStore.length;
  ordersStore = ordersStore.filter((o) => o.id !== orderId);
  orderDetailsStore = orderDetailsStore.filter((d) => d.orderId !== orderId);
  if (ordersStore.length !== initialLength) {
    await persistOrders();
    return true;
  }
  return false;
};
