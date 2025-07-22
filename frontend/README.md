# Phần Mềm Quản Lý Nhà Sách

Đồ án cuối kỳ của môn **Nhập môn Công nghệ Phần mềm (SE104)**

---

## 1. Giới Thiệu

Phần mềm Quản Lý Nhà Sách được thiết kế nhằm cung cấp một giải pháp toàn diện cho việc quản lý các hoạt động và nghiệp vụ của một nhà sách. Ứng dụng hỗ trợ quản trị viên và nhân viên kiểm soát mọi khía cạnh, từ quản lý đầu sách đến báo cáo thống kê, giúp tối ưu hóa quy trình kinh doanh và nâng cao hiệu quả vận hành.

---

## 2. Tính Năng Chính

- **Quản lý đầu sách:**  
  Quản lý chi tiết thông tin sách như tiêu đề, tác giả, mô tả và hình ảnh bìa.

- **Quản lý thể loại sách:**  
  Phân loại sách theo danh mục để dễ dàng sắp xếp kho và tìm kiếm.

- **Quản lý nhà xuất bản:**  
  Lưu trữ và cập nhật thông tin về các nhà xuất bản cung cấp đầu sách.

- **Quản lý nhà cung cấp:**  
  Quản lý danh mục nhà cung cấp hỗ trợ quy trình đặt hàng và nhập sách.

- **Quản lý nhập sách:**  
  Theo dõi quy trình nhập sách, từ đặt hàng, kiểm tra chất lượng đến cập nhật tồn kho.

- **Quản lý hóa đơn:**  
  Xử lý giao dịch bán hàng, lưu trữ và đối chiếu thông tin hóa đơn để báo cáo hiệu quả kinh doanh.

- **Quản lý khuyến mãi:**  
  Thiết lập và quản lý các chương trình ưu đãi nhằm kích thích doanh số.

- **Báo cáo:**  
  Cung cấp báo cáo thống kê về doanh thu, tồn kho và các chỉ số kinh doanh quan trọng.

- **Quản lý tài khoản:**  
  Hỗ trợ phân quyền người dùng và đảm bảo bảo mật thông tin.

- **Thay đổi quy định:**  
  Cập nhật các chính sách và quy định để phù hợp với yêu cầu thực tiễn.

---

## 3. Thành Viên Nhóm

- **Hà Xuân Bách** – 22520088  
- **Nguyễn Tường Vinh** – 22521679  
- **Nguyễn Đình Khôi** – 23520774  
- **Đoàn Thái Hoàng** – 23520514  
- **Ngô Minh Trí** – 23521640

---

## 4. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Hệ Thống

- **Node.js:**  
  Vui lòng cài đặt [Node.js](https://nodejs.org/) (phiên bản LTS được khuyến nghị).

### Bước 1: Clone Repository

Mở terminal và chạy lệnh sau để clone mã nguồn về máy:

```bash
git clone https://github.com/NgDinhKhoi0709/SE104-QuanLyNhaSach.git
```

### Bước 2: Cài Đặt Các Gói Phụ Thuộc
Di chuyển vào thư mục dự án và chạy lệnh dưới đây để cài đặt các package cần thiết:
```bash
cd SE104-QuanLyNhaSach
npm install
```

### Bước 3: Chạy Ứng Dụng
Khởi động ứng dụng ở chế độ phát triển bằng lệnh:
```bash
npm run dev
```
Sau khi khởi chạy, mở trình duyệt và truy cập địa chỉ http://localhost:5173 để sử dụng ứng dụng.

## 5. Các Vai Trò Trong Phần Mềm
- **Nhân viên bán hàng:**
  + Chức năng: Quản lý hóa đơn, khuyến mãi và báo cáo thống kê.
  + Tài khoản:
    + Tên đăng nhập: `seller`
    + Mật khẩu: `seller123`

- **Nhân viên thủ kho:**
  + Chức năng: Quản lý đầu sách, thể loại sách, nhà xuất bản, nhập sách và nhà cung cấp.
  + Tài khoản:
    + Tên đăng nhập: `inventory`
    + Mật khẩu: `inventory123`
   
- **Quản trị viên:**
  + Chức năng: Toàn quyền quản lý tất cả các hoạt động của hệ thống.
  + Tài khoản:
    + Tên đăng nhập: `admin`
    + Mật khẩu: `admin123`
    
