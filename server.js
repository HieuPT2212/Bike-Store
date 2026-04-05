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

// Trang Mua xe (Sẽ xây dựng sau)
app.get('/mua-xe', (req, res) => {
  res.send('<h1>Trang danh sách xe đang được xây dựng...</h1><a href="/">Về trang chủ</a>');
});

// Lắng nghe trên cổng 3000
app.listen(port, () => {
  console.log(`Server đang chạy ổn định tại http://localhost:${port}`);
  console.log(`Bạn có thể mở trình duyệt và truy cập ngay.`);
});
