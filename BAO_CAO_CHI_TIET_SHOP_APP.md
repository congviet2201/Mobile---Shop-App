# BÁO CÁO KỸ THUẬT CẬP NHẬT TOÀN DIỆN DỰ ÁN SHOP APP (REACT NATIVE)

> **Dự án:** Ứng dụng Di động Thương mại Điện tử Shop App (`VIE TECH SHOP`)  
> **Nền tảng:** React Native (CLI), TypeScript, React Navigation v6, AsyncStorage / Persistent Data Engine.  
> **Thư mục dự án:** `D:\Mobile 2\Mobile\ShopApp`  
> **Phiên bản tài liệu:** 2.1 (Cập nhật ngày 10/11/2026)  
> **Trạng thái kiểm thử:** ✅ 0 lỗi TypeScript (`tsc --noEmit`), ✅ 0 cảnh báo ESLint (`lint`), ✅ Máy ảo Android (`Medium_Phone_API_36.1`) chạy ổn định.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY NHANH (QUICK START)

1. **Khởi chạy tự động (1-Click):**
   - Chạy file [`Chay_App.bat`](./Chay_App.bat) ở thư mục dự án.
   - Script tự động dọn dẹp file khóa emulator, mở cửa sổ máy ảo Android trên Desktop, thiết lập reverse port `8081` và mở ứng dụng.
2. **Khởi chạy thủ công:**
   ```bash
   cd "D:\Mobile 2\Mobile\ShopApp"
   npx react-native start --reset-cache
   npx react-native run-android
   ```
3. **Tài khoản kiểm thử tích hợp sẵn:**
   - **Quản trị viên (Admin):** Tài khoản `admin` / Mật khẩu `123456` (Quyền: `admin`) $\rightarrow$ Truy cập bảng quản trị: Duyệt & xử lý đơn hàng, quản lý danh mục, quản lý sản phẩm, phân quyền người dùng.
   - **Khách hàng (User):** Tài khoản `user1` / Mật khẩu `password123` (Quyền: `user`) $\rightarrow$ Duyệt sản phẩm, tìm kiếm, lọc theo giá, thêm giỏ hàng, đặt hàng COD, theo dõi đơn mua.

---

## 1. BẢNG MA TRẬN 25 CHỨC NĂNG TOÀN HỆ THỐNG

| STT | Tên Chức Năng | File Chịu Trách Nhiệm | Dòng Code Cụ Thể | Thành Phần / Hàm Chính | Mô Tả Tóm Tắt |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Hiển thị sản phẩm (Grid 2 cột)** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) | `L720 - L820` | `FlatList` (`numColumns={2}`), `CARD_WIDTH`, thẻ sản phẩm responsive | Hiển thị sản phẩm 2 cột cân đối, bo góc, bóng đổ, huy hiệu danh mục |
| **2** | **Xem chi tiết sản phẩm** | [`ProductDetailScreen.tsx`](./ProductDetailScreen.tsx) | `L20 - L280` | `ProductDetailScreen`, `getImageSource()`, bộ chọn số lượng | Ảnh sản phẩm lớn, thông số, mô tả chi tiết, nút Thêm giỏ & Mua ngay |
| **3** | **Tìm kiếm thông minh (Tên & Danh mục)** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx)<br>[`database.ts`](./database.ts) | `L325 - L365`<br>`L470 - L550` | `searchKeyword`, ô `TextInput`, `searchProductsByNameOrCategory` | Tìm kiếm thời gian thực theo tên SP, mô tả VÀ tên danh mục |
| **4** | **Lọc sản phẩm theo danh mục** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx)<br>[`ProductsByCategoryScreen.tsx`](./ProductsByCategoryScreen.tsx) | `L365 - L440`<br>`L20 - L169` | `selectedCategoryId`, thanh cuộn ngang `ScrollView`, nút `Bỏ chọn [✕]` | Chip danh mục cuộn ngang hiển thị số lượng SP, nút hủy chọn nhanh |
| **5** | **Lọc sản phẩm theo giá (5 mức + Tùy chỉnh)** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx)<br>[`database.ts`](./database.ts) | `L445 - L580`<br>`L485 - L570` | `selectedPriceRangeId`, `PRESET_PRICE_RANGES`, Modal Tùy chỉnh giá | Lọc $<5$Tr, $5-15$Tr, $15-30$Tr, $>30$Tr hoặc tự nhập Min/Max |
| **6** | **Sắp xếp theo giá (Price Sort)** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx)<br>[`database.ts`](./database.ts) | `L545 - L578`<br>`L535 - L560` | `sortBy`, `filterAndSortProducts`, nút `Thấp → Cao ⬆️`, `Cao → Thấp ⬇️` | Sắp xếp giá tăng dần, giảm dần hoặc giữ thứ tự mới nhất |
| **7** | **Thanh trạng thái bộ lọc (Active Filters Bar)** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) | `L585 - L680` | `activeFiltersBar`, các thẻ tag `activeFilterTag`, `Xóa tất cả ↺` | Hiển thị các tiêu chí đang lọc với nút `✕` xóa từng tiêu chí hoặc xóa hết |
| **8** | **Thêm sản phẩm mới (User/Admin)** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) | `L780 - L900` | Nút `+ Thêm sản phẩm`, Modal form nhập liệu, `addProduct()` | Modal nhập tên, giá, chọn danh mục, mô tả, chọn ảnh mẫu |
| **9** | **Chỉnh sửa sản phẩm** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) | `L905 - L1020` | Nút `Sửa` trên thẻ sản phẩm, Modal cập nhật, `updateProduct()` | Form sửa thông tin sản phẩm có xác thực dữ liệu đầu vào |
| **10** | **Xóa sản phẩm** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) | `L220 - L250` | Nút `Xóa`, hộp thoại `Alert.alert` xác nhận, `deleteProduct()` | Hộp thoại xác nhận an toàn trước khi xóa bản ghi |
| **11** | **Giỏ hàng (Cart Screen)** | [`CartScreen.tsx`](./CartScreen.tsx)<br>[`database.ts`](./database.ts) | `L1 - L405`<br>`L730 - L810` | `CartScreen`, `fetchCart`, `updateCartQuantity`, `removeFromCart` | Danh sách món trong giỏ, tăng/giảm số lượng, tạm tính, tính phí ship |
| **12** | **Thêm vào giỏ / Mua ngay** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx)<br>[`ProductDetailScreen.tsx`](./ProductDetailScreen.tsx) | `L250 - L290`<br>`L85 - L145` | Nút `🛒 +Giỏ`, nút `Mua ngay`, hàm `addToCart()` | Thêm nhanh sản phẩm từ màn hình chính hoặc trang chi tiết |
| **13** | **Đặt hàng & Thanh toán (Checkout)** | [`CheckoutScreen.tsx`](./CheckoutScreen.tsx)<br>[`database.ts`](./database.ts) | `L1 - L393`<br>`L815 - L860` | `CheckoutScreen`, form địa chỉ, phương thức COD, `createOrder()` | Điền thông tin giao hàng, chọn thanh toán COD, tạo đơn hàng |
| **14** | **Lịch sử đơn mua (Order History)** | [`OrderHistoryScreen.tsx`](./OrderHistoryScreen.tsx) | `L1 - L397` | `OrderHistoryScreen`, danh sách đơn `#OD-...`, chi tiết món đã mua | Khách hàng theo dõi trạng thái đơn hàng của chính mình |
| **15** | **Bảng quản trị tổng quan (Admin Dashboard)** | [`AdminDashboard.tsx`](./AdminDashboard.tsx) | `L40 - L150`, `L460 - L550` | Kiểm tra quyền Admin, 4 thẻ thống kê (Users, Cats, Prods, Orders) | Thống kê số lượng, nút Đăng xuất góc trên bên phải màn hình |
| **16** | **Quản lý & Xử lý đơn hàng (Admin)** | [`AdminDashboard.tsx`](./AdminDashboard.tsx)<br>[`database.ts`](./database.ts) | `L435 - L510`, `L995 - L1290`<br>`L930 - L950` | Lọc 5 trạng thái đơn, nút `🚚 Giao hàng`, `✅ Hoàn tất`, `❌ Hủy`, Modal đổi trạng thái | Duyệt và chuyển trạng thái đơn hàng cho khách |
| **17** | **Quản lý Người dùng (Admin)** | [`AdminDashboard.tsx`](./AdminDashboard.tsx) | `L155 - L220`, `L610 - L710` | Đổi vai trò `user` ↔ `admin`, xóa user, bảo vệ tài khoản admin gốc | Phân quyền tài khoản trong hệ thống |
| **18** | **Quản lý Loại sản phẩm (Admin)** | [`AdminDashboard.tsx`](./AdminDashboard.tsx) | `L225 - L330`, `L715 - L830` | CRUD danh mục, Modal Thêm/Sửa, đếm số lượng SP thuộc danh mục | Thêm, sửa tên/mô tả danh mục, kiểm tra an toàn khi xóa |
| **19** | **Quản lý Sản phẩm (Admin)** | [`AdminDashboard.tsx`](./AdminDashboard.tsx) | `L335 - L430`, `L835 - L990` | CRUD sản phẩm, chọn danh mục, bộ chọn hình ảnh mẫu 6 món | Quản trị toàn bộ danh mục sản phẩm của cửa hàng |
| **20** | **Đăng nhập & Điều hướng sau Login** | [`LoginSqlite.tsx`](./LoginSqlite.tsx) | `L55 - L95`, `L1 - L317` | `getUserByCredentials()`, `navigateAfterLogin()` | Lưu phiên, tự động chuyển User về Home, Admin về Dashboard |
| **21** | **Đăng ký tài khoản (Signup)** | [`SignupSqlite.tsx`](./SignupSqlite.tsx) | `L1 - L288` | `addUser()`, xác thực mật khẩu $\ge 6$ ký tự, kiểm tra trùng username | Đăng ký tài khoản mới với vai trò mặc định là `user` |
| **22** | **Hồ sơ cá nhân (Profile)** | [`ProfileScreen.tsx`](./ProfileScreen.tsx) | `L1 - L400` | Xem thông tin tài khoản, cập nhật họ tên, SĐT, địa chỉ, đổi mật khẩu | Quản lý thông tin cá nhân của người dùng |
| **23** | **Header & Icon giỏ có Badge** | [`Header.tsx`](./Header.tsx) | `L1 - L302` | `Xin chào, username (role)`, huy hiệu số lượng giỏ, nút `⚡ Quản trị` | Thanh đầu trang nhận diện người dùng, nút Quản trị chỉ hiện với admin |
| **24** | **Điều hướng Tab Bar thông minh** | [`AppTabs.tsx`](./AppTabs.tsx) | `L22 - L130` | `CustomTabBar`: Tự động ẩn Quản trị, ẩn Đăng ký/Đăng nhập ở Home | Chân trang chỉ hiện duy nhất nút `🏠 Trang chủ` khi ở Home/Admin |
| **25** | **Cơ sở dữ liệu & Persistent Engine** | [`database.ts`](./database.ts) | `L1 - L952` | Schemas, Seed data mặc định, CRUD Users, Categories, Products, Cart, Orders | Lưu trữ bền vững AsyncStorage kết hợp bộ nhớ đệm in-memory |

---

## 2. NGUYÊN LÝ HOẠT ĐỘNG CHI TIẾT TỪNG TÍNH NĂNG

### 2.1. Tìm kiếm Thông minh theo Tên & Danh mục (Smart Category Search)
- **Vị trí:** [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) & [`database.ts`](./database.ts#L470-L550).
- **Thuật toán tìm kiếm đa trường:**
  1. Người dùng nhập chuỗi vào ô tìm kiếm liên kết với biến `searchKeyword`.
  2. Chuỗi được chuẩn hóa về chữ thường không dấu / có dấu thông qua `.toLowerCase().trim()`.
  3. Hệ thống kiểm tra danh sách danh mục hiện có: Nếu tên danh mục chứa từ khóa (`category.name.toLowerCase().includes(kw)`), lưu lại toàn bộ các `categoryId` tương ứng vào mảng `matchedCatIds`.
  4. Một sản phẩm được coi là khớp nếu thỏa mãn **bất kỳ một trong 3 điều kiện**:
     - Tên sản phẩm chứa từ khóa (`p.name.toLowerCase().includes(kw)`).
     - Mô tả sản phẩm chứa từ khóa (`p.description.toLowerCase().includes(kw)`).
     - ID danh mục của sản phẩm nằm trong danh sách danh mục khớp (`matchedCatIds.includes(p.categoryId)`).
  5. **Hiệu ứng thực tế:** Người dùng chỉ cần gõ chữ `"phụ kiện"`, hệ thống lập tức hiển thị `Apple Watch Ultra 2` và `AirPods Pro 2` mà không cần trong tên sản phẩm có chữ "phụ kiện".

---

### 2.2. Lọc Sản phẩm theo Khoảng giá & Sắp xếp giá
- **Vị trí:** [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx) & [`database.ts`](./database.ts#L485-L570).
- **Nguyên lý hoạt động:**
  1. **5 Mức giá định sẵn (`PRESET_PRICE_RANGES`):**
     - `Tất cả giá`: `minPrice = null`, `maxPrice = null`.
     - `< 5 triệu`: `minPrice = null`, `maxPrice = 5.000.000`.
     - `5 - 15 triệu`: `minPrice = 5.000.000`, `maxPrice = 15.000.000`.
     - `15 - 30 triệu`: `minPrice = 15.000.000`, `maxPrice = 30.000.000`.
     - `> 30 triệu`: `minPrice = 30.000.000`, `maxPrice = null`.
  2. **Tùy chỉnh khoảng giá Modal (`custom`):**
     - Khi người dùng nhấn nút `Tùy chỉnh ⚙️`, một Modal popup hiển thị với 2 ô nhập: `Giá tối thiểu (VNĐ)` và `Giá tối đa (VNĐ)` (bàn phím số `keyboardType="numeric"`).
     - Hàm kiểm tra tính hợp lệ: Báo lỗi nếu giá nhập vào không phải là số hoặc giá tối thiểu lớn hơn giá tối đa.
     - Sau khi nhấn `Áp dụng lọc`, nhãn hiển thị mức giá sẽ cập nhật động dạng: `VD: 2.000.000 đ - 18.000.000 đ`.
  3. **Thuật toán sắp xếp (Price Sorting):**
     - `Thấp → Cao ⬆️`: Gọi hàm `result.sort((a, b) => a.price - b.price)`.
     - `Cao → Thấp ⬇️`: Gọi hàm `result.sort((a, b) => b.price - a.price)`.
     - `Mới nhất`: Giữ nguyên thứ tự ID sản phẩm mới nhất được thêm vào.

---

### 2.3. Thanh hiển thị Tiêu chí Lọc đang áp dụng (Active Filters Bar)
- **Vị trí:** [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L585-L680).
- **Nguyên lý hoạt động:**
  - Biến cờ `isAnyFilterActive` kiểm tra xem có bất kỳ điều kiện lọc nào khác mặc định hay không:
    ```typescript
    const isAnyFilterActive =
      selectedCategoryId !== null ||
      searchKeyword.trim() !== '' ||
      selectedPriceRangeId !== 'all' ||
      sortBy !== 'default';
    ```
  - Nếu `isAnyFilterActive === true`, thanh bộ lọc xuất hiện ngay phía trên danh sách sản phẩm gồm các pill badge trực quan:
    - `[📁 {Tên danh mục} ✕]`
    - `[🔍 "{Từ khóa}" ✕]`
    - `[💰 {Mức giá} ✕]`
    - `[↕️ {Sắp xếp} ✕]`
    - Nút **`Xóa tất cả ↺`**
  - Chạm vào từng badge sẽ hủy riêng điều kiện lọc đó; chạm vào `Xóa tất cả ↺` sẽ xóa sạch mọi bộ lọc và đưa danh sách về 8 sản phẩm gốc.

---

### 2.4. Quản trị & Xử lý Đơn hàng cho Admin
- **Vị trí:** [`AdminDashboard.tsx`](./AdminDashboard.tsx), [`database.ts`](./database.ts#L930-L950).
- **Nguyên lý hoạt động:**
  1. **Bảo mật phân quyền:** Khi màn hình nạp, hệ thống kiểm tra `currentUser.role === 'admin'`. Nếu không phải admin, người dùng bị đẩy về trang chủ ngay lập tức.
  2. **Bốn tab quản lý:** `Người dùng (users)`, `Danh mục (categories)`, `Sản phẩm (products)`, `Đơn hàng (orders)`.
  3. **Xử lý đơn hàng:**
     - Bộ lọc 5 trạng thái: `Tất cả`, `Đang xử lý`, `Đang giao`, `Hoàn thành`, `Đã hủy`.
     - Nút xử lý chuyển trạng thái nhanh 1 chạm:
       - Đơn mới `Đang xử lý` $\rightarrow$ bấm nút `🚚 Giao hàng` chuyển thành `Đang giao`.
       - Đơn đang giao $\rightarrow$ bấm nút `✅ Hoàn tất` chuyển thành `Hoàn thành`.
       - Nút `❌ Hủy đơn` chuyển thành `Đã hủy`.
       - Nút `⚙️ Đổi trạng thái` mở modal cho phép chọn bất kỳ trạng thái nào.
       - Nút `🗑️ Xóa` xóa hoàn toàn bản ghi đơn hàng khỏi cơ sở dữ liệu sau khi xác nhận.

---

### 2.5. Điều hướng Thông minh (Smart Tab Bar & Auth Flow)
- **Vị trí:** [`AppTabs.tsx`](./AppTabs.tsx), [`LoginSqlite.tsx`](./LoginSqlite.tsx), [`Header.tsx`](./Header.tsx).
- **Nguyên lý hoạt động:**
  1. `CustomTabBar` sử dụng hàm duyệt cây đệ quy `getActiveRouteName(state)`:
     - Khi người dùng ở màn hình `Home` hoặc `AdminDashboard`: Chân trang (footer) **chỉ hiển thị duy nhất 1 nút `🏠 Trang chủ`** bo tròn dạng viên thuốc (pill), ẩn hoàn toàn nút Quản trị, Đăng ký, Đăng nhập.
     - Khi người dùng ở màn hình Đăng ký hoặc Đăng nhập (chưa login): Chân trang hiển thị 3 tab `Trang chủ`, `Đăng ký`, `Đăng nhập`.
     - Khi đã đăng nhập thành công: Chân trang không bao giờ hiển thị nút Đăng ký / Đăng nhập.
  2. **Sau khi đăng nhập:** Hàm `navigateAfterLogin()` tự động phân luồng: nếu là tài khoản `admin` $\rightarrow$ chuyển thẳng đến `AdminDashboard`; nếu là tài khoản `user` $\rightarrow$ chuyển thẳng đến trang chủ `Home`.
  3. **Header:** Nút `[⚡ Quản trị]` trên đầu trang chỉ xuất hiện duy nhất khi tài khoản đang đăng nhập có `role === 'admin'`. Nút `[🚪 Đăng xuất]` của trang Admin được đặt ở góc trên bên phải màn hình.

---

## 3. SƠ ĐỒ LUỒNG DỮ LIỆU & BỘ LỌC TỔNG HỢP (DATA FLOW)

```mermaid
flowchart TD
    subgraph UI_Header["KHU VỰC ĐIỀU HƯỚNG & TÌM KIẾM"]
        H[Header - Xin chào user & Nút Quản trị]
        SB[Thanh Tìm kiếm - Search by Name & Category]
        CAT[Thanh Chip Danh mục - Categories Horizontal Scroll]
        PRICE[Thanh Lọc Giá - 5 Presets & Custom Modal]
        SORT[Bộ chọn Sắp xếp - Mới nhất / Thấp-Cao / Cao-Thấp]
        TAGS[Thanh Active Filter Tags - [Xóa tất cả ↺]]
    end

    subgraph Filter_Engine["BỘ LỌC KẾT HỢP (filterAndSortProducts)"]
        F1{1. Lọc theo Danh mục?}
        F2{2. Tìm kiếm Tên / Mô tả / Tên Loại?}
        F3{3. Lọc theo Khoảng giá Min - Max?}
        F4[4. Sắp xếp kết quả]
    end

    subgraph Data_Source["CƠ SỞ DỮ LIỆU PERSISTENT (database.ts)"]
        DB[(AsyncStorage & In-memory Cache)]
        D_PROD[Bảng Products]
        D_CAT[Bảng Categories]
        D_CART[Bảng Cart]
        D_ORDER[Bảng Orders & Details]
        D_USER[Bảng Users]
    end

    subgraph Presentation["HIỂN THỊ KẾT QUẢ"]
        GRID[FlatList 2 cột - Sanpham3Sqlite]
        EMPTY[Giao diện Trống - Reset Filter Button]
    end

    SB --> Filter_Engine
    CAT --> Filter_Engine
    PRICE --> Filter_Engine
    SORT --> Filter_Engine
    TAGS --> Filter_Engine

    DB --> D_PROD & D_CAT
    D_PROD & D_CAT --> Filter_Engine

    Filter_Engine --> F1 --> F2 --> F3 --> F4
    F4 -->|Có sản phẩm khớp| GRID
    F4 -->|Không có sản phẩm khớp| EMPTY
```

---

## 4. TỔNG KẾT CHẤT LƯỢNG MÃ NGUỒN & XÁC THỰC

1. **Kiểm tra TypeScript (`npx tsc --noEmit`):**
   - Đạt **0 lỗi (Zero errors)**. Tất cả kiểu dữ liệu (`ProductFilterOptions`, `PriceRangeFilter`, `SortOption`, `Order`, `OrderDetail`) đều được định kiểu chặt chẽ.
2. **Kiểm tra cú pháp & quy chuẩn ESLint (`npm run lint`):**
   - Đạt **0 lỗi, 0 cảnh báo (Zero warnings)**. Không có biến thừa, không có inline styles không hợp lệ, tuân thủ React Hooks dependencies.
3. **Kiểm thử giao diện & tính năng trên máy ảo Android thật:**
   - Đã kiểm thử trực tiếp trên máy ảo `emulator-5554` (`Medium_Phone_API_36.1`):
     - Gõ `"phụ kiện"` $\rightarrow$ Hiển thị chính xác các sản phẩm thuộc danh mục Phụ kiện (`Apple Watch Ultra 2`, `AirPods Pro 2`).
     - Chọn danh mục `"Điện thoại"` kết hợp mức giá `"15 - 30 triệu"` $\rightarrow$ Hiển thị chính xác `Samsung Galaxy S24 Ultra`.
     - Bấm `Thấp → Cao ⬆️` $\rightarrow$ Sản phẩm tự động sắp xếp theo giá tăng dần từ 450.000 đ lên đến 31.990.000 đ.
     - Bấm `Xóa tất cả ↺` $\rightarrow$ Danh sách lập tức khôi phục về trạng thái ban đầu đầy đủ 8 sản phẩm.
4. **Đồng bộ tài liệu dự án:** Toàn bộ nội dung báo cáo này đã được cập nhật đồng bộ vào file [`README.md`](./README.md) của dự án.
