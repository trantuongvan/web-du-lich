import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  let currentPath = window.location.pathname.split("/").pop();
  if (currentPath === "") {
    currentPath = "index.html";
  }

  navLinks.forEach(link => {
    link.classList.remove("active");
    const linkPath = link.getAttribute("href").split("/").pop();
    if (currentPath === linkPath) {
      link.classList.add("active");
    }
  });
});

const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("userDropdown");

const loggedOutView = document.getElementById("loggedOutView");
const loggedInView = document.getElementById("loggedInView");
const userEmail = document.getElementById("userEmail");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const btnIcons = document.querySelectorAll(".btn-icon");

//Xử lý hiển thị dropdown
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

onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedOutView.classList.add("hidden");
    loggedInView.classList.remove("hidden");
    userEmail.textContent = user.email;
  } else {
    loggedInView.classList.add("hidden");
    loggedOutView.classList.remove("hidden");
  }
});

loginBtn.addEventListener("click", () => {
    window.location.href = "./dang-nhap.html";
});
signupBtn.addEventListener("click", () => {
    window.location.href = "./dang-ky.html";
});

logoutBtn.onclick = async () => {
  await signOut(auth);
  dropdown.classList.add("hidden");
  window.location.reload();
};
