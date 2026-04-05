# Dự Án Bán Xe Đạp (CrankUp Web App)

Đây là dự án thiết kế trang web cửa hàng xe đạp được xây dựng bằng kiến trúc Backend **Node.js (Express)**, **EJS (Template Engine)** để chia nhỏ giao diện thành các Component (Header, Footer...) và sử dụng bộ cơ sở dữ liệu **MySQL**.

## 🛠 Công Nghệ Sử Dụng
- **Front-end:** HTML, Vanilla CSS, Bootstrap (giao diện, layout responsive).
- **Back-end:** Node.js, Express framework.
- **Template Engine:** EJS (cho phép tái sử dụng đoạn mã HTML).
- **Database:** MySQL.
- **Thư viện khác:** `dotenv` (ẩn biến môi trường), `mysql2` (giao tiếp CSDL).

## 🗂 Cấu Trúc Dự Án
- `server.js`: File khởi chạy server, định tuyến (router) và cấu hình kết nối tới Database.
- `views/`: Tổ chức các giao diện.
  - `index.ejs`: Trang chủ.
  - `partials/`: Chứa các mảnh giao diện được xé nhỏ như Navbar, Footer.
- `public/`: Chứa file tài nguyên dùng chung như CSS, JS và Hình ảnh tĩnh.

## 🚀 Hướng Dẫn Chạy Dự Án Chạy Cục Bộ (Local)

### 1. Yêu Cầu Cần Thiết
- Hãy đảm bảo máy tính đã cài đặt **Node.js**: (https://nodejs.org/).
- Cài đặt hệ quản trị cơ sở dữ liệu MySQL (có thể dùng XAMPP, MySQL Workbench hoặc Docker...). Máy chủ MySQL cần được bật.

### 2. Cài Đặt và Khởi Động
1. Tải source code này về máy.
2. Mở Terminal (Command Prompt / PowerShell) tại thư mục chứa dự án.
3. Chạy lệnh cài đặt các gói NPM:
   ```bash
   npm install
   ```
4. Kiểm tra cấu hình Database trong file `server.js` (hoặc `.env` nếu có) sao cho khớp với tên `user` và `password` MySQL của máy tính bạn. (Mặc định trong code đang để user: `root` và password là pass nội bộ bạn thiết lập).
5. Khởi chạy Server:
   ```bash
   node server.js
   ```
   Hoặc nều bạn dùng Nodemon (dev):
   ```bash
   npm run build # (nếu bạn có cấu hình script tương ứng trong package.json)
   ```
6. Mở trình duyệt Web lên và truy cập [http://localhost:3000](http://localhost:3000)

---

## ☁️ Hướng Dẫn Đẩy Code (Push) Lên Github

Bạn cần cài đặt công cụ **Git** trên máy tính trước tiên. Dưới đây là các bước để đưa dự án này lên Github cá nhân:

### Bước 1: Tạo kho lưu trữ trên Github
- Đăng nhập vào Github của bạn, bấm vào nút **New Repository**.
- Đặt tên cho kho lưu trữ (Ví dụ: `CrankUp-Bike-Store`).
- Chỉnh phần Public/Private theo ý muốn và **tuyệt đối KHÔNG chọn "Add a README file" hay ".gitignore"**, hãy để nó trống hoàn toàn. Sau đó bấm **Create Repository**.

### Bước 2: Dùng lệnh Git đẩy code
Mở Terminal ở ngay trong thư mục chứa dự án gốc (cùng cấp với thư mục `views`, `node_modules`...).

Chạy lần lượt các lệnh hiển thị sau:

```bash
# 1. Khởi tạo kho lưu trữ cục bộ
git init

# 2. Đưa toàn bộ các file dự án vào danh sách chuẩn bị (staging). 
# Lưu ý: Các file trong thư mục đã được cấu hình trong .gitignore (như node_modules) sẽ được bỏ qua tự động!
git add .

# 3. Gom chung và dán nhãn commit cho phiên bản đầu tiên
git commit -m "Khởi tạo dự án Bán Xe Đạp với Node.js và EJS"

# 4. Đặt tên nhánh chính là "main"
git branch -M main

# 5. Kết nối kho lưu trữ của bạn với Github. 
# (THAY đường link URL bên dưới bằng đường link kho lưu trữ (repository) mà bạn vừa tạo ở Bước 1)
git remote add origin https://github.com/Tên_Tài_Khoản_Của_Bạn/CrankUp-Bike-Store.git

# 6. Đẩy toàn bộ code lên Github.
git push -u origin main
```

🎉 Hoàn tất! Lên f5 lại trang Github của bạn để chiêm ngưỡng thành quả.
