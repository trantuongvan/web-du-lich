import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";


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

let currentPath = window.location.pathname.split("/").pop();
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
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

  const headerForm = document.querySelector("header form");
  if (headerForm) {
    headerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const searchInput = headerForm.querySelector('input[type="text"]');
      if (searchInput) {
        const keyword = searchInput.value.trim();
        if (keyword !== "") {
          window.location.href = `./bo-loc.html?search=${encodeURIComponent(keyword)}`;
        } else {
          window.location.href = `./bo-loc.html`;
        }
      }
    });
  }
});

const userBtn = document.getElementById("userBtn");
const heartBtn = document.getElementById("heartBtn");
const dropdown = document.getElementById("userDropdown");

const loggedOutView = document.getElementById("loggedOutView");
const loggedInView = document.getElementById("loggedInView");
const userEmail = document.getElementById("userEmail");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");

const bookedBtn = document.getElementById("bookedBtn");

//Xu lý sự kiện click vào nút yêu thích
heartBtn.addEventListener("click", () => {
  if (auth.currentUser) {
    window.location.href = "./tour-yeu-thich.html";
  } else {
    window.location.href = "./dang-nhap.html";
  }
});
if (currentPath === "tour-yeu-thich.html") {
  heartBtn.classList.add("active");
} else {
  heartBtn.classList.remove("active");
}

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

bookedBtn.addEventListener("click", () => {
    window.location.href = "./tour-da-dat.html";
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
