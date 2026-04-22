require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

// --- Cấu hình Middleware cơ bản --- //
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Đọc dữ liệu từ Form (POST) và gán Session
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'CrankUp_Secret_Key_22122005',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Lưu phiên 24 tiếng
}));

// Gắn phân quyền Global cho mọi giao diện EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.error_msg = req.session.error_msg || null;
  res.locals.success_msg = req.session.success_msg || null;
  req.session.error_msg = null;
  req.session.success_msg = null;
  next();
});
app.set('views', path.join(__dirname, 'views'));

// Cấu hình thư mục Public chứa CSS, JS, Images (Bootstrap offline)
app.use(express.static(path.join(__dirname, 'public')));

// Khởi tạo kết nối đến MySQL
const db = mysql.createConnection({
  host: process.env.HOSTNAMEDB,
  user: process.env.USERNAMEDB,
  password: process.env.PASSWORDDB
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
          if (err) console.error(err);
          
          // Tạo bảng USERS nếu chưa có
          const createUsersTable = `
            CREATE TABLE IF NOT EXISTS USERS (
              id INT AUTO_INCREMENT PRIMARY KEY,
              full_name VARCHAR(100) NOT NULL,
              email VARCHAR(100) NOT NULL UNIQUE,
              phone VARCHAR(20),
              password_hash VARCHAR(255) NOT NULL,
              avatar_url VARCHAR(255),
              role VARCHAR(50) DEFAULT 'user',
              rating_score DECIMAL(3, 1) DEFAULT 5.0,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          db.query(createUsersTable, (err) => {
            if (err) console.error('Lỗi tạo bảng USERS:', err);
            else {
              console.log('Đã kiểm tra/tạo bảng USERS.');
              // Sau khi có bảng USERS, tạo bảng BIKES
              const createBikesTable = `
                CREATE TABLE IF NOT EXISTS BIKES (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  category VARCHAR(100) NOT NULL,
                  brand VARCHAR(100),
                  bike_condition VARCHAR(100),
                  frame_size VARCHAR(50),
                  location VARCHAR(100) NOT NULL,
                  price DECIMAL(15,2) NOT NULL,
                  description TEXT,
                  is_inspected BOOLEAN DEFAULT FALSE,
                  inspection_date VARCHAR(50),
                  images JSON,
                  seller_id INT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (seller_id) REFERENCES USERS(id) ON DELETE CASCADE
                )
              `;
              db.query(createBikesTable, (err) => {
                if (err) console.error('Lỗi tạo bảng BIKES:', err);
                else console.log('Đã kiểm tra/tạo bảng BIKES.');
              });
            }
          });
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

// Trang Mua xe (Đã tích hợp Database)
app.get('/bikes', (req, res) => {
  const query = `
    SELECT BIKES.*, USERS.full_name AS seller_name, USERS.avatar_url AS seller_avatar, USERS.rating_score AS seller_rating 
    FROM BIKES 
    JOIN USERS ON BIKES.seller_id = USERS.id
    ORDER BY BIKES.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách xe:', err);
      return res.status(500).send('Lỗi Server Nội Bộ');
    }
    
    // Parse JSON images cho từng xe và set img_url là ảnh đầu tiên
    const bikes = results.map(bike => {
      let images = [];
      try {
        images = typeof bike.images === 'string' ? JSON.parse(bike.images) : bike.images;
      } catch (e) {}
      bike.img_url = (images && images.length > 0) ? images[0] : 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&w=800&q=80';
      bike.desc = bike.description; // Giữ nguyên tên biến desc cho template cũ
      return bike;
    });

    res.render('bikes', { bikes: bikes });
  });
});

// Các trang tĩnh hoặc đang xây dựng
// Trạm Đăng Nhập / Đăng Ký (Auth)
app.get('/login', (req, res) => res.render('auth/login'));
app.get('/register', (req, res) => res.render('auth/register'));

// API: Xử lý Submit Form Đăng Ký
app.post('/register', async (req, res) => {
  const { full_name, phone, email, role, password, confirm_password } = req.body;

  if (password !== confirm_password) {
    req.session.error_msg = 'Mật khẩu cài đặt và nhập lại không khớp!';
    return res.redirect('/register');
  }

  try {
    // 1. Kiểm tra xem Email đã bị người khác đăng ký chưa
    db.query('SELECT email FROM USERS WHERE email = ?', [email], async (err, results) => {
      if (err) {
        req.session.error_msg = 'Lỗi kết nối CSDL, thử lại sau.';
        return res.redirect('/register');
      }

      if (results.length > 0) {
        req.session.error_msg = 'Email này đã tồn tại trong hệ thống CrankUp!';
        return res.redirect('/register');
      }

      // 2. Băm Mật Khẩu (Hashing) để chống Hacker
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Đút dữ liệu sạch vào Database
      const query = `INSERT INTO USERS (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`;
      db.query(query, [full_name, email, phone, hashedPassword, role], (err, result) => {
        if (err) {
          req.session.error_msg = 'Có lỗi xảy ra khi lưu trữ thông tin!';
          return res.redirect('/register');
        }
        req.session.success_msg = 'Chúc mừng bạn gia nhập CrankUp! Hãy đăng nhập để duyệt xe nhé.';
        res.redirect('/login'); // Chuyển chớp nhoáng sang trang Đăng Nhập
      });
    });
  } catch (error) {
    req.session.error_msg = 'Lỗi máy chủ nội bộ!';
    res.redirect('/register');
  }
});

// API: Xử lý Submit Form Đăng Nhập
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // 1. Mò tìm người dùng theo Email
  db.query('SELECT * FROM USERS WHERE email = ?', [email], async (err, results) => {
    if (err) {
      req.session.error_msg = 'Dịch vụ CSDL đang bảo trì!';
      return res.redirect('/login');
    }

    // Nếu rỗng (Tức là không ai xài email này)
    if (results.length === 0) {
      req.session.error_msg = 'Email hoặc tài khoản không tồn tại.';
      return res.redirect('/login');
    }

    const user = results[0];

    // 2. So găng mật khẩu ngón tay với mật khẩu băm trong DB
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      req.session.error_msg = 'Mật khẩu sai, xin mời nhập lại.';
      return res.redirect('/login');
    }

    // 3. Đăng nhập SIÊU CẤP THÀNH CÔNG -> Gắn the Cookies Session!
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      rating_score: user.rating_score
    };

    // Trả khách hàng về giao diện chính
    res.redirect('/');
  });
});

// API: Đăng xuất Tài khoản Khỏi Hệ Thống (Huỷ Cookie)
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/sell', (req, res) => res.send('<h1 style="text-align:center; margin-top:50px;">Trang Đăng Bán Xe (Seller) đang được xây dựng...</h1><div style="text-align:center"><a href="/">Về trang chủ</a></div>'));
app.get('/about', (req, res) => res.send('<h1 style="text-align:center; margin-top:50px;">Về CrankUp - Hệ thống kết nối mua bán xe đạp...</h1><div style="text-align:center"><a href="/">Về trang chủ</a></div>'));
app.get('/bike/:id', (req, res) => {
  const bikeId = req.params.id;
  const query = `
    SELECT BIKES.*, USERS.full_name AS seller_name, USERS.avatar_url AS seller_avatar, USERS.rating_score AS seller_rating, USERS.created_at AS seller_join_date, USERS.phone AS seller_phone
    FROM BIKES 
    JOIN USERS ON BIKES.seller_id = USERS.id
    WHERE BIKES.id = ?
  `;

  db.query(query, [bikeId], (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy chi tiết xe:', err);
      return res.status(500).send('Lỗi Server Nội Bộ');
    }

    if (results.length === 0) {
      return res.status(404).send('Không tìm thấy xe đạp này');
    }

    const bikeData = results[0];
    
    // Parse JSON images
    let images = [];
    try {
      images = typeof bikeData.images === 'string' ? JSON.parse(bikeData.images) : bikeData.images;
    } catch (e) {}

    // Xử lý ngày tham gia
    const joinDate = new Date(bikeData.seller_join_date);
    const formattedJoinDate = 'Tháng ' + (joinDate.getMonth() + 1) + ', ' + joinDate.getFullYear();

    const bike = {
      id: bikeData.id,
      name: bikeData.name,
      category: bikeData.category,
      location: bikeData.location,
      brand: bikeData.brand,
      condition: bikeData.bike_condition,
      frame_size: bikeData.frame_size,
      price: bikeData.price,
      is_inspected: bikeData.is_inspected,
      inspection_date: bikeData.inspection_date,
      desc: bikeData.description,
      images: (images && images.length > 0) ? images : ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&w=1200&q=80'],
      seller: {
        name: bikeData.seller_name,
        avatar: bikeData.seller_avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
        rating: bikeData.seller_rating,
        join_date: formattedJoinDate,
        phone: bikeData.seller_phone || 'Chưa cập nhật'
      }
    };

    res.render('bike-detail', { bike: bike });
  });
});

// Lắng nghe trên cổng 3000
app.listen(port, () => {
  console.log(`Server đang chạy ổn định tại http://localhost:${port}`);
  console.log(`Bạn có thể mở trình duyệt và truy cập ngay.`);
});
