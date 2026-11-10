# PHIẾU CHẤM ĐIỂM MÔN LẬP TRÌNH DI ĐỘNG 2 (90T)

- **Họ tên sinh viên:** Đoàn Công Việt
- **Lớp:** 24PNV1A
- **Tên dự án:** Ứng dụng Di động Bán hàng Shop App (`VIE TECH SHOP`)
- **Link git:** https://github.com/congviet2201/Mobile---Shop-App.git

---

## 🛠️ THÔNG TIN MÔI TRƯỜNG PHÁT TRIỂN & CÔNG NGHỆ

- **Hệ điều hành:** Windows 10/11 x64
- **Môi trường chạy:** Node.js `v22.11.0+`, Java JDK 17, Android Studio SDK Platform 36, Android Emulator (`Medium_Phone_API_36.1`)
- **React Native phiên bản:** `0.88.1`
- **React phiên bản:** `19.3.0`
- **TypeScript:** `^6.0.3`
- **Các thư viện sử dụng và phiên bản chính xác (từ `package.json`):**
  1. `@react-navigation/native`: `^7.5.1` (Điều hướng ứng dụng React Navigation v6/v7)
  2. `@react-navigation/stack`: `^7.12.1` (Điều hướng Stack màn hình con)
  3. `@react-navigation/bottom-tabs`: `^7.21.0` (Thanh điều hướng chân trang Bottom Tab)
  4. `@react-native-async-storage/async-storage`: `^3.1.1` (Lưu trữ dữ liệu cục bộ bền vững)
  5. `react-native-screens`: `^4.30.1` (Tối ưu hiệu năng native màn hình)
  6. `react-native-safe-area-context`: `^5.11.0` (Xử lý vùng an toàn tai thỏ / thanh điều hướng)
  7. `react-native-gesture-handler`: `^3.4.0` (Xử lý cử chỉ vuốt chạm)
  8. `react-native-reanimated`: `^4.7.1` (Hiệu ứng animation chuyển cảnh)
  9. `react-native-vector-icons`: `^10.3.0` (Bộ icon ứng dụng)
  10. `react-native-worklets`: `0.13.1` (Hỗ trợ luồng xử lý UI song song)

---

## 📋 BẢNG ĐIỂM ĐÁNH GIÁ CHI TIẾT TỪNG TIÊU CHÍ

| STT | Chức năng | Điểm thành phần | Điểm đạt | File & Dòng Code Minh Chứng | Diễn giải / Kết quả thực tế |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **A** | **CHỨC NĂNG CỦA NGƯỜI DÙNG** | **4.0đ** | **4.0đ** | | |
| 1 | Trang chủ người dùng (gồm các sản phẩm có sẵn khi khởi tạo database) | 0.25đ | **0.25đ** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L720-L820)<br>[`database.ts`](./database.ts#L85-L150) | Khởi tạo sẵn 8 sản phẩm (iPhone 15, S24 Ultra, MacBook, iPad, v.v.), hiển thị lưới 2 cột cân đối responsive. |
| 2 | Banner và Menu điều hướng gồm: Home, Danh mục sản phẩm | 0.25đ | **0.25đ** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L320-L330,L365-L425) | Banner đỏ nổi bật `SIÊU SALE THÁNG 10 (UP TO 50% OFF)` kèm thanh danh mục cuộn ngang hiển thị số lượng SP. |
| 3 | Xem sản phẩm theo từng danh mục (CategorySelector.tsx) | 0.50đ | **0.50đ** | [`CategorySelector.tsx`](./CategorySelector.tsx)<br>[`ProductsByCategoryScreen.tsx`](./ProductsByCategoryScreen.tsx)<br>[`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L365-L440) | Component `CategorySelector` hiển thị các loại sản phẩm, chọn loại nào lập tức lọc hiển thị sản phẩm loại đó. |
| 4 | Trang chi tiết sản phẩm khi click vào sản phẩm ở trang chủ | 0.25đ | **0.25đ** | [`ProductDetailScreen.tsx`](./ProductDetailScreen.tsx#L20-L280)<br>[`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L425-L435) | Nhấn vào thẻ sản phẩm chuyển sang trang chi tiết có ảnh lớn, giá tiền, badge danh mục, mô tả, bộ chọn số lượng. |
| 5 | Bottom Tab ở trang chủ gồm 3 nút: Home, Sign up, Login | 0.25đ | **0.25đ** | [`AppTabs.tsx`](./AppTabs.tsx#L145-L192) | Cấu hình `createBottomTabNavigator` đầy đủ các tab Home, Signup, Login kèm biểu tượng và nhãn tương ứng. |
| 6 | Đăng ký thành công | 0.50đ | **0.50đ** | [`SignupSqlite.tsx`](./SignupSqlite.tsx#L40-L120)<br>[`database.ts`](./database.ts#L580-L620) | Xác thực đầu vào (mật khẩu $\ge 6$ ký tự, khớp xác nhận, kiểm tra trùng username), lưu tài khoản với vai trò `user`. |
| 7 | Đăng nhập ở Bottom Tab, đăng nhập thành công điều hướng đến trang chủ người dùng | 0.50đ | **0.50đ** | [`LoginSqlite.tsx`](./LoginSqlite.tsx#L55-L95)<br>[`database.ts`](./database.ts#L685-L710) | Xác thực thông tin, lưu phiên `AsyncStorage`, hàm `navigateAfterLogin()` tự động chuyển user về trang Home. |
| 8 | Hiển thị thông tin người dùng đã đăng nhập và đăng xuất (Header.tsx) | 0.50đ | **0.50đ** | [`Header.tsx`](./Header.tsx#L100-L160) | Header hiển thị `Xin chào, {username} ({role})`, huy hiệu số lượng giỏ, nút Hồ sơ, Đơn mua và nút Đăng xuất. |
| 9 | Tìm kiếm theo tên/danh mục | 0.50đ | **0.50đ** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L325-L365)<br>[`database.ts`](./database.ts#L470-L550) | Tìm kiếm thời gian thực đa trường: Tên sản phẩm, mô tả và tên danh mục. Gõ "phụ kiện" tìm ra Apple Watch, AirPods. |
| 10 | Lọc sản phẩm theo khoảng giá | 0.50đ | **0.50đ** | [`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L445-L580)<br>[`database.ts`](./database.ts#L485-L570) | 5 khoảng giá định sẵn ($<5$Tr, $5-15$Tr, $15-30$Tr, $>30$Tr), Modal Tùy chỉnh giá, sắp xếp Thấp $\rightarrow$ Cao / Cao $\rightarrow$ Thấp. |
| **B** | **CHỨC NĂNG CỦA ADMIN** | **4.0đ** | **4.0đ** | | |
| 1 | Khởi tạo database với 1 tài khoản admin có sẵn | 0.25đ | **0.25đ** | [`database.ts`](./database.ts#L150-L165,L310-L325) | Khởi tạo tài khoản Admin mặc định hệ thống: `admin` / `123456` với `role = 'admin'`. |
| 2 | Đăng nhập (bao gồm Hiển thị thông tin người dùng đã đăng nhập và đăng xuất (Header.tsx), đăng nhập thành công thì điều hướng đến trang chủ quản trị | 0.50đ | **0.50đ** | [`LoginSqlite.tsx`](./LoginSqlite.tsx#L55-L95)<br>[`AdminDashboard.tsx`](./AdminDashboard.tsx#L45-L65)<br>[`Header.tsx`](./Header.tsx) | Admin đăng nhập được điều hướng ngay đến `AdminDashboard`, Header hiển thị `role admin`, nút Đăng xuất ở góc phải trên. |
| 3 | Trang chủ quản trị: gồm các nút chức năng Quản lý user, Quản lý loại sản phẩm, Quản lý sản phẩm | 0.25đ | **0.25đ** | [`AdminDashboard.tsx`](./AdminDashboard.tsx#L460-L550) | 4 thẻ thống kê số liệu và 4 tab chuyển đổi: Quản lý user, Quản lý loại SP, Quản lý sản phẩm, Quản lý đơn hàng. |
| 4 | Admin Bottom Tab gồm: Home của user, Home của admin, Signup, Login | 0.50đ | **0.50đ** | [`AppTabs.tsx`](./AppTabs.tsx#L145-L192) | Cấu hình Bottom Tab tích hợp đủ các màn hình Home, AdminDashboard, Signup, Login cho phân quyền quản trị. |
| 5 | Quản trị user: xem, cập nhật vai trò, xóa user | 0.50đ | **0.50đ** | [`AdminDashboard.tsx`](./AdminDashboard.tsx#L155-L220,L610-L710)<br>[`database.ts`](./database.ts#L640-L680) | Xem danh sách user, nút đổi vai trò `user ↔ admin`, nút xóa user có khóa bảo vệ tài khoản admin gốc. |
| 6 | Quản trị loại sản phẩm: xem, thêm, sửa, xóa (0.5đ); thêm sản phẩm cho loại tương ứng (0.5đ) | 1.00đ | **1.00đ** | [`AdminDashboard.tsx`](./AdminDashboard.tsx#L225-L330,L715-L830)<br>[`database.ts`](./database.ts#L365-L425) | CRUD danh mục với kiểm tra an toàn khi xóa; Form thêm sản phẩm hỗ trợ chọn danh mục tương ứng bằng bộ chip. |
| 7 | Quản trị sản phẩm: xem, thêm, sửa, xóa | 1.00đ | **1.00đ** | [`AdminDashboard.tsx`](./AdminDashboard.tsx#L335-L430,L835-L990)<br>[`Sanpham3Sqlite.tsx`](./Sanpham3Sqlite.tsx#L780-L1020)<br>[`database.ts`](./database.ts#L425-L465) | Xem danh sách SP dạng card/bảng; Modal Thêm mới; Modal Sửa thông tin; Hộp thoại xác nhận xóa SP an toàn. |
| **C** | **CHỨC NĂNG KHÁC** | **2.0đ** | **2.0đ** | | |
| 1 | Chức năng khác của người dùng:<br>+ Xem và cập nhật giỏ hàng (0.5đ)<br>+ Checkout đơn hàng và Đặt hàng (0.5đ)<br>+ Xem lịch sử mua hàng (0.25đ)<br>+ Cập nhật thông tin người dùng (0.25đ) | 1.50đ | **1.50đ** | [`CartScreen.tsx`](./CartScreen.tsx#L1-L405)<br>[`CheckoutScreen.tsx`](./CheckoutScreen.tsx#L1-L393)<br>[`OrderHistoryScreen.tsx`](./OrderHistoryScreen.tsx#L1-L397)<br>[`ProfileScreen.tsx`](./ProfileScreen.tsx#L1-L400) | - Giỏ hàng: tăng/giảm số lượng, tạm tính, phí ship.<br>- Đặt hàng COD: tạo đơn `#OD-...`, dọn sạch giỏ.<br>- Lịch sử: theo dõi các đơn hàng đã đặt.<br>- Profile: cập nhật SĐT, địa chỉ, đổi mật khẩu. |
| 2 | Chức năng khác của admin:<br>+ Quản trị đơn hàng: xem danh sách, cập nhật tình trạng đơn hàng | 0.50đ | **0.50đ** | [`AdminDashboard.tsx`](./AdminDashboard.tsx#L435-L510,L995-L1290)<br>[`database.ts`](./database.ts#L930-L950) | Xem danh sách đơn hàng, lọc 5 trạng thái, nút xử lý nhanh 1 chạm: `🚚 Giao hàng`, `✅ Hoàn tất`, `❌ Hủy đơn`, Modal đổi trạng thái tùy ý, xóa đơn. |
| | **TỔNG ĐIỂM** | **10.0đ** | **10.0đ** | | **XẾP LOẠI: XUẤT SẮC (ĐẠT 100% YÊU CẦU BAREM)** |

---

## 🔍 KẾT QUẢ KIỂM THỬ KỸ THUẬT & CHẤT LƯỢNG MÃ NGUỒN

- **Biên dịch TypeScript:** `npx tsc --noEmit` $\rightarrow$ **0 lỗi cú pháp / Type errors**.
- **Quy chuẩn mã nguồn ESLint:** `npm run lint` $\rightarrow$ **0 lỗi, 0 cảnh báo (Zero warnings)**.
- **Kiểm thử trên thiết bị máy ảo:** Hoạt động trơn tru, mượt mà trên Android Emulator API 36 (`Medium_Phone_API_36.1`).

