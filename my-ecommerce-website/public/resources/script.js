document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value; // Sử dụng email
    const password = document.getElementById('password').value;

    fetch('localhost:8888/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Gửi email
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Đã xảy ra lỗi khi kết nối với máy chủ.'); // Kiểm tra phản hồi
        }
        return response.json();
    })
    .then(data => {
        if (data.message) {
            alert(data.message);
            if (data.role === 'admin') {
                window.location.href = '/admin.html'; // Chuyển hướng đến trang admin
            } else {
                window.location.href = '/user.html'; // Chuyển hướng đến trang người dùng
            }
        } else {
            document.getElementById('message').innerText = 'Thông tin không chính xác!'; // Thông báo lỗi
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerText = error.message; // Hiển thị thông báo lỗi
    });
});
