require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Bắt đầu quá trình seed dữ liệu...');
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.HOSTNAMEDB,
      user: process.env.USERNAMEDB,
      password: process.env.PASSWORDDB
    });
    
    // Tự động tạo DB nếu chưa có
    await connection.query('CREATE DATABASE IF NOT EXISTS CrankUp_DB');
    await connection.query('USE CrankUp_DB');

    // Tạo bảng (nếu server.js chưa chạy kịp)
    await connection.query(`
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
    `);

    await connection.query(`
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
    `);

    // Xóa dữ liệu cũ
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE BIKES');
    await connection.query('TRUNCATE TABLE USERS');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Đã làm sạch các bảng dữ liệu.');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const pass1 = await bcrypt.hash('123456', salt);
    
    const users = [
      ['Hoàng Anh', 'hoanganh@gmail.com', '0981234567', pass1, 'https://randomuser.me/api/portraits/men/32.jpg', 4.8],
      ['Biker Miền Nam', 'bikermn@gmail.com', '0909876543', pass1, 'https://randomuser.me/api/portraits/women/44.jpg', 4.9],
      ['Lê Khoa', 'lekhoa_mtb@gmail.com', '0912345678', pass1, 'https://randomuser.me/api/portraits/men/85.jpg', 4.0],
      ['Ông Trùm Trái Cây', 'trumtraicay@gmail.com', '0933456789', pass1, 'https://randomuser.me/api/portraits/men/15.jpg', 4.6],
      ['Hải Yến Road', 'haiyen_speed@gmail.com', '0944567890', pass1, 'https://randomuser.me/api/portraits/women/68.jpg', 5.0]
    ];

    for (const u of users) {
      await connection.query(
        'INSERT INTO USERS (full_name, email, phone, password_hash, avatar_url, rating_score) VALUES (?, ?, ?, ?, ?, ?)', 
        u
      );
    }
    console.log('Đã tạo xong 5 Users.');

    // Lấy ID của Users vừa tạo
    const [userRows] = await connection.query('SELECT id, email FROM USERS');
    const uMap = {};
    userRows.forEach(row => uMap[row.email] = row.id);

    // Seed Bikes
    const bikes = [
      {
        name: 'Giant XTC 800 Bản Quốc Tế Mới',
        category: 'Địa hình (MTB)',
        brand: 'Giant',
        bike_condition: 'Mới 95%',
        frame_size: 'M (1m65-1m75)',
        location: 'Hà Nội',
        price: 12500000,
        description: 'Giảm xóc khí kép, xích hợp kim chịu lực, phuộc hơi xịn. Đã bảo dưỡng mỡ bò trơn tru. Bộ truyền động sang số cực êm ái.\n- Bánh xe hợp kim nhôm.\n- Phanh đĩa dầu thủy lực siêu nhạy.\n- Chắn bùn được tặng kèm theo cho ai nhiệt tình.',
        is_inspected: true,
        inspection_date: '10/05/2026',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&w=1200&q=80',
          'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['hoanganh@gmail.com']
      },
      {
        name: 'Trek Madone Carbon Siêu Lướt',
        category: 'Đua (Road)',
        brand: 'Trek',
        bike_condition: 'Like New (99%)',
        frame_size: 'S (1m55-1m65)',
        location: 'TP.HCM',
        price: 85000000,
        description: 'Sườn Carbon OCLV cao cấp, Group Sram E-tap điện tử 12 Cấp, chạy bứt tốc đường cao tốc khỏi chê. Xe đi siêu lướt mới lăn bánh 100km.',
        is_inspected: true,
        inspection_date: '02/06/2026',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?ixlib=rb-4.0.3&w=1200&q=80',
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['bikermn@gmail.com']
      },
      {
        name: 'Specialized Stumpjumper Expert',
        category: 'Địa hình (MTB)',
        brand: 'Specialized',
        bike_condition: 'Cũ 80%',
        frame_size: 'L (1m75-1m85)',
        location: 'Đà Nẵng',
        price: 36000000,
        description: 'Phuộc Fox Factory cực êm ái, phanh SRAM Code R. Thích hợp mua về chạy giải địa hình. Khung có vài vết xước dăm nhưng không ảnh hưởng kết cấu.',
        is_inspected: false,
        inspection_date: null,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['lekhoa_mtb@gmail.com']
      },
      {
        name: 'Trinx Free 2.0 Nhôm',
        category: 'Phố (Touring)',
        brand: 'Trinx',
        bike_condition: 'Cũ 90%',
        frame_size: 'M (1m65-1m75)',
        location: 'Cần Thơ',
        price: 2500000,
        description: 'Xe đi chợ của bà xã, nay không đạp nữa nên thanh lý. Có giỏ xe xịn tặng kèm. Xe đạp rất nhẹ, phù hợp dạo phố, đi chợ.',
        is_inspected: false,
        inspection_date: null,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['trumtraicay@gmail.com']
      },
      {
        name: 'Canyon Ultimate CF SL 8',
        category: 'Đua (Road)',
        brand: 'Canyon',
        bike_condition: 'Mới 98%',
        frame_size: 'M (1m70-1m78)',
        location: 'Hà Nội',
        price: 65000000,
        description: 'Hàng nhập khẩu Đức. Groupset Shimano Ultegra, vành carbon siêu nhẹ. Bảo dưỡng định kỳ đầy đủ.',
        is_inspected: true,
        inspection_date: '15/07/2026',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['haiyen_speed@gmail.com']
      },
      {
        name: 'Cannondale Trail 5',
        category: 'Địa hình (MTB)',
        brand: 'Cannondale',
        bike_condition: 'Cũ 85%',
        frame_size: 'S (1m55-1m65)',
        location: 'Hải Phòng',
        price: 10500000,
        description: 'Dành cho các bạn nhập môn xe địa hình. Khung nhôm chắc chắn, phuộc nhún SR Suntour. Xe còn cứng cáp.',
        is_inspected: false,
        inspection_date: null,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['lekhoa_mtb@gmail.com']
      },
      {
        name: 'Brompton M6L (Xe Gập Gọn)',
        category: 'Gấp gọn (Folding)',
        brand: 'Brompton',
        bike_condition: 'Mới 100%',
        frame_size: 'One Size',
        location: 'TP.HCM',
        price: 45000000,
        description: 'Xe gấp Brompton nhập Anh quốc, vô cùng tiện dụng mang lên xe bus, tàu điện. Hàng hiếm.',
        is_inspected: true,
        inspection_date: '01/01/2026',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['bikermn@gmail.com']
      },
      {
        name: 'Asama Touring',
        category: 'Phố (Touring)',
        brand: 'Asama',
        bike_condition: 'Cũ 75%',
        frame_size: 'M (1m65-1m75)',
        location: 'Bình Dương',
        price: 1500000,
        description: 'Xe cũ sinh viên dùng đi học, xước xát nhiều nhưng đạp vẫn êm.',
        is_inspected: false,
        inspection_date: null,
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511994298241-608e28f14fde?ixlib=rb-4.0.3&w=1200&q=80'
        ]),
        seller_id: uMap['trumtraicay@gmail.com']
      }
    ];

    for (const b of bikes) {
      const bParams = [b.name, b.category, b.brand, b.bike_condition, b.frame_size, b.location, b.price, b.description, b.is_inspected, b.inspection_date, b.images, b.seller_id];
      await connection.query(
        'INSERT INTO BIKES (name, category, brand, bike_condition, frame_size, location, price, description, is_inspected, inspection_date, images, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        bParams
      );
    }
    console.log('Đã tạo xong 8 chiếc Xe đạp thực tế.');

    console.log('=== SEED THÀNH CÔNG! ===');
    process.exit(0);

  } catch (err) {
    console.error('Lỗi khi seed:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
