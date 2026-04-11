import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

export function initFavorite(tourId) {
  const favBtn = document.getElementById("favBtn");
  if (!favBtn || !tourId) return;

  function updateFavButton(isFav) {
    if (isFav) {
      favBtn.classList.add("favorited");
      favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
    } else {
      favBtn.classList.remove("favorited");
      favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    }
  }

  // 1. Kiểm tra trạng thái lúc vừa load trang
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const isFav = userData.favorites && userData.favorites.includes(tourId);
        updateFavButton(isFav);
      }
    }
  });

  // 2. Bắt sự kiện bấm nút
  favBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = "./dang-nhap.html";
      return;
    }

    favBtn.disabled = true;
    const userDocRef = doc(db, "users", user.uid);
    const isFav = favBtn.classList.contains("favorited");

    try {
      if (isFav) {
        await setDoc(
          userDocRef,
          { favorites: arrayRemove(tourId) },
          { merge: true },
        );
        updateFavButton(false);
      } else {
        await setDoc(
          userDocRef,
          { favorites: arrayUnion(tourId) },
          { merge: true },
        );
        updateFavButton(true);
      }
    } catch (error) {
      console.error("Lỗi cập nhật yêu thích:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      favBtn.disabled = false;
    }
  });
}
