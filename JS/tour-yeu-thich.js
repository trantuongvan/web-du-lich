import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc, arrayRemove, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const favoriteTourList = document.getElementById('favorite-tour-list');
const emptySate = favoriteTourList.innerHTML;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./dang-nhap.html";
        return;
    }
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const favoriteToursIds = userData.favorites || [];
            if (favoriteToursIds.length > 0) {
                loadMyFavoriteTours(favoriteToursIds, user.uid);
            } else {
                favoriteTourList.innerHTML = emptySate;
            }
        } else {
            favoriteTourList.innerHTML = emptySate;
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", error);
        favoriteTourList.innerHTML = emptySate;
    }
});


async function loadMyFavoriteTours(favoriteToursIds, uid) {
    try {
        favoriteTourList.innerHTML = '<p class="text-center">Đang tải...</p>';

       const tourCollection = collection(db, "tours");
       const tourSnapshot = await getDocs(tourCollection);
       const allTours = tourSnapshot.docs.map(doc => doc.data());

        // Lọc tour có _id nằm trong mảng favoriteToursIds
        const favoriteTours = allTours.filter(tour => favoriteToursIds.includes(tour._id));
        
        //hiện data
        let html = '';
        favoriteTours.forEach(tour => {
            const duration = tour.type.match(/\d+/g) || [0, 0];
            const days = duration[0];
            const nights = duration[1];
            const location = tour.specs.find(s => s.k === 'location_end')?.v || 'Việt Nam';

            html += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="tour-card position-relative d-block">
                        
                        <button class="btn btn-light text-danger position-absolute top-0 end-0 m-2 rounded-circle shadow-sm" 
                                style="z-index: 10; width: 40px; height: 40px;" 
                                onclick="removeFavorite(event, '${tour._id}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                        <a href="chi-tiet-tour.html?id=${tour._id}" class="text-decoration-none" style="color: inherit;">
                            <div class="tour-image-container">
                                <img src="${tour.images[0].url}" class="tour-image" alt="${tour.name}">
                            </div>
                            
                            <div class="tour-content">
                                <h3 class="tour-title">${tour.short_name}</h3>
                                <p class="tour-rating">
                                    ${tour.rating_summary?.average || 'Mới'}
                                    <i class="fa-solid fa-star"></i>
                                    <span class="ms-1">(${tour.rating_summary?.count || 0})</span>
                                </p>
                                
                                <div class="tour-divider"></div>
                                
                                <div class="tour-info">
                                    <div class="info-item">
                                        <i class="fa-solid fa-calendar-days info-icon"></i>
                                        <span>${days} Ngày</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fa-solid fa-moon info-icon"></i>
                                        <span>${nights} Đêm</span>
                                    </div>
                                    <div class="info-item">
                                        <i class="fa-solid fa-location-dot info-icon"></i>
                                        <span>${location}</span>
                                    </div>
                                </div>
                                
                                <div class="tour-footer">
                                    <div class="price-section">
                                        <span class="price-label">Giá từ</span>
                                        <span class="price-amount">${tour.price.display}</span>
                                    </div>
                                    <span class="btn-view-tour">Chi tiết</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            `;
        });

        // Xóa giao diện trống đi và thay bằng danh sách tour
        favoriteTourList.innerHTML = html;

    } catch (error) {
        console.error("Lỗi tải dữ liệu tour yêu thích:", error);
    }
}

window.removeFavorite = async function(event, tourId) {
    event.preventDefault(); 
    event.stopPropagation();
    
    const user = auth.currentUser;
    if (!user) return;

    const btn = event.currentTarget;
    btn.innerHTML = '<div class="spinner-border spinner-border-sm text-danger" role="status"></div>';
    btn.disabled = true;

    try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            favorites: arrayRemove(tourId)
        }, { merge: true });
        window.location.reload();
    } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Có lỗi xảy ra, không thể xóa tour này!");
        btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btn.disabled = false;
    }
};