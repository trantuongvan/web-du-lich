import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

async function loadTours() {
    try {
        const tourCollection = collection(db, "tours");
        const tourSnapshot = await getDocs(tourCollection);
        const tours = tourSnapshot.docs.map(doc => doc.data());

        const tourHot = tours.slice(0, 6);
        
        renderTours(tourHot);
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
    }
}

function renderTours(tourList) {
    const tourContainer = document.getElementById('tour-list');
    let html = '';

    tourList.forEach(tour => {
        const duration = tour.type.match(/\d+/g) || [0, 0];
        const days = duration[0];
        const nights = duration[1];
        
        const location = tour.specs.find(s => s.k === 'location_end')?.v || 'Việt Nam';

        html += `
            <div class="col-12 col-md-6 col-lg-4">
                <a href="chi-tiet-tour.html?id=${tour._id}" class="tour-card">
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
        `;
    });

    tourContainer.innerHTML = html;
}

loadTours();



document.addEventListener("DOMContentLoaded", function () {
    const heroForm = document.querySelector(".hero-form");

    if (heroForm) {
        heroForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const searchInputValue = heroForm.querySelector(".search").value.trim();
            const dateInputValue = heroForm.querySelector(".date").value;
            let url = "./bo-loc.html";
            const params = new URLSearchParams();
            if (searchInputValue !== "") {
                params.append("search", searchInputValue);
            }
            if (dateInputValue !== "") {
                params.append("date", dateInputValue);
            }
            if (params.toString()) {
                url += "?" + params.toString();
            }
            window.location.href = url;
        });
    }
});
