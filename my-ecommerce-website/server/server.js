const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const app = express();
const { exec } = require('child_process');
const port = 3000; // Cổng xuất

// Cấu hình CORS
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Cấu hình kết nối với SQL Server
const config = {
    user: 'sa', // Tên người dùng
    password: 'huy1202', // Mật khẩu
    server: 'LAPTOP-4ID5FA18', // Địa chỉ máy chủ
    database: 'MyShopDB', // Tên cơ sở dữ liệu
    options: {
        encrypt: true, // Azure
        trustServerCertificate: true 
    }
};

// Hàm để lấy vai trò người dùng
async function getUserRole(username, password) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT password, role FROM users WHERE username = @username');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            // In ra mật khẩu từ cơ sở dữ liệu
            console.log(`Mật khẩu trong CSDL cho người dùng ${username}: ${user.password}`);
            console.log(`Mật khẩu người dùng nhập vào: ${password}`);

            // So sánh mật khẩu trực tiếp
            if (user.password === password) {
                console.log("Mật khẩu đúng");
                return user.role; // Trả về vai trò người dùng
            } else {
                console.log("Mật khẩu không đúng");
            }
        } else {
            console.log("Người dùng không tồn tại");
        }
        return null; // Nếu không tìm thấy vai trò
    } catch (err) {
        console.error('Lỗi khi kết nối đến cơ sở dữ liệu:', err);
        throw new Error('Database query error');
    }
}

app.get('/api/products', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Products`;  
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error querying the database');
    }
});
// Route để lấy danh sách tài khoản
app.get('/accounts', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT username FROM users');

        // Trả về danh sách tài khoản dưới dạng JSON
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách tài khoản:', err);
        res.status(500).send('Có lỗi xảy ra khi lấy danh sách tài khoản.');
    }
});

// Đường dẫn để xử lý đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const role = await getUserRole(username, password);
        if (role) {
            // Lưu vai trò vào session 
            //req.session.userRole = role;

            // Chuyển hướng đến trang phù hợp
            if (role === 'admin') {
                res.redirect('/admin.html'); // Chuyển hướng đến trang admin
            } else {
                res.redirect('/user.html'); // Chuyển hướng đến trang người dùng
            }
        } else {
            // Nếu không hợp lệ, chuyển hướng về trang đăng nhập với thông báo lỗi
            // Thay đổi thông báo lỗi tùy thuộc vào lý do
           
                res.redirect('/login.html?error=invalid'); // Tên đăng nhập hoặc mật khẩu không đúng
            
        }
    } catch (err) {
        console.error('Lỗi trong quá trình đăng nhập:', err);
        res.redirect('/login.html?error=server'); // Lỗi từ server
    }
});
// Bắt đầu máy chủ
app.listen(port, async () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
    
    exec(`start http://localhost:${port}/index.html`, (err) => {
        if (err) {
            console.error('Có lỗi xảy ra khi mở trình duyệt:', err);
        } else {
            console.log('Đã mở trình duyệt');
        }
    });
});
