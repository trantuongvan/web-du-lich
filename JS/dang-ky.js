import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const signupForm = document.getElementById('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const checkbox = document.getElementById('checkbox');
const errorMessageDiv = document.getElementById('error-message');

// Biểu thức chính quy để kiểm tra định dạng email và mật khẩu
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/;

// Hàm để chuyển đổi mã lỗi Firebase thành thông báo lỗi với người dùng
function getSignupErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'Email đã được sử dụng.';
        // case 'auth/invalid-email':
        //     return 'Email không hợp lệ.';
        // case 'auth/weak-password':
        //     return 'Mật khẩu phải có ít nhất 6 ký tự.';
        default:
            return 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
}
// Hàm hiển thị thông báo lỗi
function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('show');
    void errorMessageDiv.offsetWidth; 
    errorMessageDiv.classList.add('show');
    if (message === "Email đã được sử dụng.") {
      window.location.href = "./dang-nhap.html";
      return;
    }
}

// Xử lý sự kiện khi người dùng submit form đăng ký
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!emailRegex.test(email)) {
        showError('Email không hợp lệ.');
        return;
    }
    if (!passwordRegex.test(password)) {
        showError('Mật khẩu có ít nhất 6 ký tự, một ký tự viết hoa, một ký tự đặc biệt.');
        return;
    }
    if (!checkbox.checked) {
        showError('Bạn phải đồng ý với điều khoản dịch vụ.');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        window.location.replace('./index.html');
    } catch (error) {
        const errorMessage = getSignupErrorMessage(error.code);
        showError(errorMessage);
    }
});

// Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
[emailInput, passwordInput, checkbox].forEach(input => {
    input.addEventListener('input', () => {
        if (errorMessageDiv.classList.contains('show')) {
            errorMessageDiv.classList.remove('show');
        }
    });
});