async function loadMyFavoriteTours() {
    try {
        // 1. Lấy danh sách ID các tour đã lưu trong LocalStorage
        const favoriteToursIds = JSON.parse(localStorage.getItem('favoriteTours')) || [];
        const container = document.getElementById('favorite-tour-list');

        // 2. Nếu danh sách trống, dừng lại (để hiển thị giao diện chưa có tour)
        if (favoriteToursIds.length === 0) {
            return;
        }

        // 3. Tải toàn bộ dữ liệu tour từ file JSON
        const response = await fetch('../data/tours.json');
        const allTours = await response.json();

        // 4. Lọc ra những tour có _id nằm trong mảng favoriteToursIds
        const myTours = allTours.filter(tour => favoriteToursIds.includes(tour._id));

        // 5. Đổ dữ liệu ra HTML
        let html = '';
        myTours.forEach(tour => {
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
        container.innerHTML = html;

    } catch (error) {
        console.error("Lỗi tải dữ liệu tour yêu thích:", error);
    }
}

// Gắn hàm vào window để HTML có thể gọi được
window.removeFavorite = function (event, tourId) {
    event.preventDefault(); // Ngăn chặn chuyển trang
    event.stopPropagation(); // QUAN TRỌNG: Ngăn chặn click lan ra các thẻ bên dưới

    let favoriteTours = JSON.parse(localStorage.getItem('favoriteTours')) || [];
    favoriteTours = favoriteTours.filter(id => id !== tourId);
    localStorage.setItem('favoriteTours', JSON.stringify(favoriteTours));

    alert("Đã xóa khỏi Tour của tôi!");

    // Load lại trang để cập nhật danh sách ngay lập tức
    window.location.reload();
};

// Chạy hàm khi load file
loadMyFavoriteTours();