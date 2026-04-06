const express = require('express');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// Cấu hình View Engine là EJS để phân tách HTML components
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình thư mục Public chứa CSS, JS, Images (Bootstrap offline)
app.use(express.static(path.join(__dirname, 'public')));

// Khởi tạo kết nối đến MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '22122005'
});

// Kết nối Database
db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err.message);
    console.log('Hãy đảm bảo bạn đã bật dịch vụ MySQL (ví dụ: qua XAMPP).');
  } else {
    console.log('Đã kết nối thành công tới máy chủ MySQL!');
    
    // Tự động tạo CSDL dự án nếu chưa có
    db.query('CREATE DATABASE IF NOT EXISTS CrankUp_DB', (err) => {
      if (err) {
        console.error('Lỗi khởi tạo CSDL:', err);
      } else {
        console.log('Đã nạp CSDL CrankUp_DB thành công.');
        
        // Trỏ vào CSDL vừa tạo để làm việc
        db.query('USE CrankUp_DB', (err) => {
            if(err) console.error(err);
        });
      }
    });
  }
});

// --- ROUTERS (Định tuyến địa chỉ) ---

// Trang chủ
app.get('/', (req, res) => {
  // Render file views/index.ejs
  res.render('index');
});

// Trang Mua xe (Dùng Mockup Data từ mảng Array)
app.get('/bikes', (req, res) => {
  const fakeBikes = [
    {
      id: 1,
      name: 'Giant XTC 800 Đời Mới Nhất Bản Quốc Tế',
      category: 'Địa hình (MTB)',
      location: 'Hà Nội',
      desc: 'Giảm xóc khí kép, xích hợp kim chịu lực, phuộc hơi xịn. Đã bảo dưỡng mỡ bò trơn tru...',
      price: 12500000,
      is_inspected: true,
      img_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&w=800&q=80',
      seller_name: 'Hoàng Anh',
      seller_avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      seller_rating: 4.8
    },
    {
      id: 2,
      name: 'Trek Madone Carbon siêu lướt',
      category: 'Đua (Road)',
      location: 'TP.HCM',
      desc: 'Sườn Carbon OCLV, Group Sram E-tap điện tử 12 Cấp, chạy bứt tốc đường cao tốc khỏi chê.',
      price: 85000000,
      is_inspected: true,
      img_url: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?ixlib=rb-4.0.3&w=800&q=80',
      seller_name: 'Biker Miền Nam',
      seller_avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      seller_rating: 4.9
    },
    {
      id: 3,
      name: 'Specialized Stumpjumper Cũ',
      category: 'Địa hình (MTB)',
      location: 'Đà Nẵng',
      desc: 'Lốp thủng nhẹ đã dán, giảm xóc Fox Factory bao phê. Thích hợp mua về đua giải địa hình.',
      price: 36000000,
      is_inspected: false,
      img_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&w=800&q=80',
      seller_name: 'Lê Khoa',
      seller_avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
      seller_rating: 4.0
    },
    {
      id: 4,
      name: 'Trinx Free 2.0 Nhôm',
      category: 'Phố (Touring)',
      location: 'Cần Thơ',
      desc: 'Xe đi chợ của bà xã, nay bả không đi chợ xa nữa nên thanh lý. Có giỏ xe tặng kèm.',
      price: 2500000,
      is_inspected: false,
      img_url: 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&w=800&q=80',
      seller_name: 'Ông Trùm Trái Cây',
      seller_avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
      seller_rating: 4.6
    }
  ];

  res.render('bikes', { bikes: fakeBikes });
});

// Các trang tĩnh hoặc đang xây dựng
app.get('/sell', (req, res) => res.send('<h1 style="text-align:center; margin-top:50px;">Trang Đăng Bán Xe (Seller) đang được xây dựng...</h1><div style="text-align:center"><a href="/">Về trang chủ</a></div>'));
app.get('/about', (req, res) => res.send('<h1 style="text-align:center; margin-top:50px;">Về CrankUp - Hệ thống kết nối mua bán xe đạp...</h1><div style="text-align:center"><a href="/">Về trang chủ</a></div>'));
app.get('/bike/:id', (req, res) => res.send('<h1 style="text-align:center; margin-top:50px;">Trang Chi Tiết Xe Đạp số ' + req.params.id + ' đang được thiết kế...</h1><div style="text-align:center"><a href="/bikes">Quay lại danh sách</a></div>'));

// Lắng nghe trên cổng 3000
app.listen(port, () => {
  console.log(`Server đang chạy ổn định tại http://localhost:${port}`);
  console.log(`Bạn có thể mở trình duyệt và truy cập ngay.`);
});
