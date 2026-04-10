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
  const mockBike = {
    id: req.params.id,
    name: 'Giant XTC 800 Đời Mới Nhất Bản Quốc Tế',
    category: 'Địa hình (MTB)',
    location: 'Hà Nội',
    brand: 'Giant',
    condition: 'Mới 95%',
    frame_size: 'M (1m65-1m75)',
    price: 12500000,
    is_inspected: true,
    inspection_date: '04/04/2026',
    desc: 'Giảm xóc khí kép, xích hợp kim chịu lực, phuộc hơi xịn. Đã bảo dưỡng mỡ bò trơn tru. \n\nXe chủ yếu đi lòng vòng công viên nên lớp sơn còn cực kỳ bóng bẩy, chưa hề có dấu hiệu móp méo nứt gãy. Bộ truyền động sang số cực êm ái.\n- Bánh xe hợp kim nhôm.\n- Phanh đĩa dầu thủy lực siêu nhạy.\n- Chắn bùn được tặng kèm theo cho ai nhiệt tình.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&w=1200&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&w=1200&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&w=1200&q=80'
    ],
    seller: {
      name: 'Hoàng Anh',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      rating: 4.8,
      join_date: 'Tháng 12, 2024',
      phone: '0987.xxx.xxx'
    }
  };
  res.render('bike-detail', { bike: mockBike });
});

// Lắng nghe trên cổng 3000
app.listen(port, () => {
  console.log(`Server đang chạy ổn định tại http://localhost:${port}`);
  console.log(`Bạn có thể mở trình duyệt và truy cập ngay.`);
});
