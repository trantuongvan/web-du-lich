document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".form-content");
    const textInputs = form.querySelectorAll('input[type="text"]');
    const lastNameInput = textInputs[0];
    const firstNameInput = textInputs[1];
    const emailInput = textInputs[2];
    const messageInput = form.querySelector("textarea");
    const policyCheckbox = form.querySelector('input[type="checkbox"]');
    const submitBtn = form.querySelector(".btn-send");

//thong bao
    const toastContainer = document.createElement("div");
    toastContainer.style.position = "fixed";
    toastContainer.style.bottom = "20px";
    toastContainer.style.right = "20px";
    toastContainer.style.zIndex = "9999";
    toastContainer.style.display = "flex";
    toastContainer.style.flexDirection = "column";
    toastContainer.style.gap = "10px";
    document.body.appendChild(toastContainer);

    function showToast(message, isSuccess = true) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.padding = "0.75rem 1.25rem";
        toast.style.borderRadius = "0.5rem";
        toast.style.color = "#fff";
        toast.style.fontFamily = "'Be Vietnam Pro', sans-serif";
        toast.style.fontSize = "0.875rem";
        toast.style.fontWeight = "600";
        toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        
        toast.style.backgroundColor = isSuccess ? "#10b981" : "#ef4444"; 
        
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        toast.style.transition = "all 0.3s ease";
        
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        }, 10);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(1.25rem)";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }


    function showError(inputElement, message) {
        let errorEl;
        if (inputElement.type === 'checkbox') {
            errorEl = inputElement.parentElement.nextElementSibling;
            if (!errorEl || !errorEl.classList.contains('error-message')) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                inputElement.parentElement.insertAdjacentElement('afterend', errorEl);
            }
        } else {
            errorEl = inputElement.parentElement.querySelector('.error-message');
            if (!errorEl) {
                errorEl = document.createElement('span');
                errorEl.className = 'error-message';
                inputElement.parentElement.appendChild(errorEl);
            }
        }

        errorEl.textContent = message;
        errorEl.style.color = '#ef4444'; 
        errorEl.style.fontSize = '0.85rem';
        errorEl.style.fontWeight = '500';
        errorEl.style.marginTop = '0.4rem';
        errorEl.style.display = 'block';
        
        if(inputElement.type !== 'checkbox') {
            inputElement.style.borderColor = '#ef4444';
        }
    }

    function clearError(inputElement) {
        let errorEl;
        if (inputElement.type === 'checkbox') {
            errorEl = inputElement.parentElement.nextElementSibling;
        } else {
            errorEl = inputElement.parentElement.querySelector('.error-message');
        }

        if (errorEl && errorEl.classList.contains('error-message')) {
            errorEl.remove();
        }

        if(inputElement.type !== 'checkbox') {
            inputElement.style.borderColor = ''; 
        }
    }

// validation
    function checkLastName() {
        if (!lastNameInput.value.trim()) {
            showError(lastNameInput, "Vui lòng nhập họ và tên lót.");
            return false;
        }
        clearError(lastNameInput);
        return true;
    }

    function checkFirstName() {
        if (!firstNameInput.value.trim()) {
            showError(firstNameInput, "Vui lòng nhập tên của bạn.");
            return false;
        }
        clearError(firstNameInput);
        return true;
    }

    function checkEmail() {
        const val = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!val) {
            showError(emailInput, "Vui lòng nhập địa chỉ Email.");
            return false;
        } else if (!emailRegex.test(val)) {
            showError(emailInput, "Định dạng Email không hợp lệ (VD: ten@gmail.com).");
            return false;
        }
        clearError(emailInput);
        return true;
    }

    function checkMessage() {
        if (!messageInput.value.trim()) {
            showError(messageInput, "Vui lòng để lại lời nhắn cho chúng tôi.");
            return false;
        }
        clearError(messageInput);
        return true;
    }

    function checkPolicy() {
        if (!policyCheckbox.checked) {
            showError(policyCheckbox, "Bạn cần đồng ý với chính sách bảo mật.");
            return false;
        }
        clearError(policyCheckbox);
        return true;
    }

//realtime nhập liệu
    lastNameInput.addEventListener('input', checkLastName);
    firstNameInput.addEventListener('input', checkFirstName);
    emailInput.addEventListener('input', checkEmail);
    messageInput.addEventListener('input', checkMessage);
    policyCheckbox.addEventListener('change', checkPolicy);


// sự kiện nhấn nút gửi
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const isLastNameValid = checkLastName();
        const isFirstNameValid = checkFirstName();
        const isEmailValid = checkEmail();
        const isMessageValid = checkMessage();
        const isPolicyValid = checkPolicy();

        if (!isLastNameValid || !isFirstNameValid || !isEmailValid || !isMessageValid || !isPolicyValid) {
            return; 
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = "Đang gửi...";
        submitBtn.style.opacity = "0.7";
        submitBtn.style.pointerEvents = "none";

        const fullName = lastNameInput.value.trim() + " " + firstNameInput.value.trim();
        const userEmailAddress = emailInput.value.trim();
        const userMessage = messageInput.value.trim();
        const yourEmail = "e174ecfb79f2d6d39c7790af61b5ad4a"; 

        fetch(`https://formsubmit.co/ajax/${yourEmail}`, {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: "Có lời nhắn từ website Travlia!",
                "Họ và tên": fullName,
                "Email khách hàng": userEmailAddress,
                "Lời nhắn": userMessage
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                showToast("Gửi lời nhắn thành công! Chúng tôi sẽ liên hệ sớm nhất.", true);
                form.reset();
                clearError(lastNameInput);
                clearError(firstNameInput);
                clearError(emailInput);
                clearError(messageInput);
                clearError(policyCheckbox);
            } else {
                showToast("Lỗi hệ thống! Vui lòng thử lại sau.", false);
                console.log(data);
            }
        })
        .catch(error => {
            showToast("Không thể kết nối. Vui lòng kiểm tra lại mạng!", false);
            console.error(error);
        })
        .finally(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.opacity = "1";
            submitBtn.style.pointerEvents = "auto";
        });
    });
});