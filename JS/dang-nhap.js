import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const loginForm = document.getElementById('form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageDiv = document.getElementById('error-message');

// Biểu thức chính quy để kiểm tra định dạng email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getLoginErrorMessage(errorCode) {
    switch (errorCode) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Email hoặc mật khẩu không đúng.";
        case "auth/user-disabled":
            return "Tài khoản đã bị vô hiệu hóa.";
        case "auth/too-many-requests":
            return "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.";
        case "auth/network-request-failed":
            return "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
        default:
            return "Đã xảy ra lỗi. Vui lòng thử lại.";
    }
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('show');
    void errorMessageDiv.offsetWidth; 
    errorMessageDiv.classList.add('show');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!emailRegex.test(email)) {
        showError('Email không hợp lệ.');
        return;
    }
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.replace('./index.html');
    } catch (error) {
        const errorMessage = getLoginErrorMessage(error.code);
        showError(errorMessage);
    }
});

// Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
[emailInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
        if (errorMessageDiv.classList.contains('show')) {
            errorMessageDiv.classList.remove('show');
        }
    });
});