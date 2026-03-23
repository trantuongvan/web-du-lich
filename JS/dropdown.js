const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("userDropdown");

const loggedOutView = document.getElementById("loggedOutView");
const loggedInView = document.getElementById("loggedInView");
const userEmail = document.getElementById("userEmail");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const btnIcons = document.querySelectorAll(".btn-icon");

userBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  userBtn.classList.toggle("active");
  dropdown.classList.toggle("hidden");
});

document.addEventListener("click", () => {
    userBtn.classList.remove("active");
  dropdown.classList.add("hidden");
});

dropdown.addEventListener("click", (e) => e.stopPropagation());

loginBtn.addEventListener("click", () => {
    window.location.href = "dang-nhap.html";
});
signupBtn.addEventListener("click", () => {
    window.location.href = "dang-ky.html";
});