const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginForm = document.getElementById('loginForm');
const successSound = document.getElementById('successSound');

// Chỉ cho phép chữ cái, số và dấu _
function sanitizeUsernameInput(e) {
    let value = e.target.value;
    value = value.replace(/[^\w]/g, ''); // Loại emoji, ký tự lạ
    e.target.value = value;
}

// Kích hoạt nút login nếu hợp lệ
function validateForm() {
    const userVal = username.value.trim();
    const passVal = password.value.trim();
    loginBtn.disabled = !(userVal.length > 0 && passVal.length > 0);
}

// Gắn event listener
username.addEventListener('input', sanitizeUsernameInput);
username.addEventListener('input', validateForm);
password.addEventListener('input', validateForm);

// Xử lý form login
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    async function login() {
        const user = username.value.trim();
        const pass = password.value.trim();

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user, pass })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                successSound.play();
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng kí thành công!',
                    showConfirmButton: false,
                    timer: 1500,
                    toast: true,
                    position: 'top-end'
                }).then(() => {
                    window.location.href = '/';
                });
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối!',
                text: 'Không thể kết nối tới máy chủ.',
                showConfirmButton: true
            });
            console.error('Lỗi login:', err);
        }
    }

    login();
});
