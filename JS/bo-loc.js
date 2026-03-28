let tours = [];
let selectedTourTypes = [];
let currentSearchKeyword = ""; // Biến toàn cục để nhớ từ khóa từ trang chủ
let currentSearchDate = ""; // Biến toàn cục để nhớ ngày khởi hành từ trang chủ

async function loadTours() {
  try {
    const response = await fetch("../data/tours.json");
    tours = await response.json();

    // === 1. HỨNG VÀ XỬ LÝ TỪ KHÓA + NGÀY THÁNG TỪ URL ===
    const urlParams = new URLSearchParams(window.location.search);
    currentSearchKeyword = urlParams.get('search') ? urlParams.get('search').toLowerCase() : "";
    currentSearchDate = urlParams.get('date') || ""; // Hứng ngày tháng (định dạng YYYY-MM-DD)

    if (currentSearchKeyword) {
      const destinationSelect = document.getElementById("destinationSelect");
      if (destinationSelect) {
        const options = Array.from(destinationSelect.options);
        
        // Tìm option khớp với từ khóa nhưng BẮT BUỘC bỏ qua option rỗng "" (Chọn điểm đến)
        const matchOption = options.find(opt => 
            opt.value !== "" && (
                opt.value.toLowerCase().includes(currentSearchKeyword) || 
                currentSearchKeyword.includes(opt.value.toLowerCase())
            )
        );
        
        if (matchOption) {
          destinationSelect.value = matchOption.value; // Tự động điền vào form
          currentSearchKeyword = ""; // Xóa text keyword vì đã chọn bằng ô Select
          
          // Dọn dẹp URL, nhưng vẫn giữ lại tham số date (nếu có)
          const cleanParams = new URLSearchParams();
          if (currentSearchDate) cleanParams.append("date", currentSearchDate);
          const newUrl = cleanParams.toString() ? `${window.location.pathname}?${cleanParams.toString()}` : window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
    
    // Gọi hàm render ra danh sách tour
    handleSearch();
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
}

// Hàm lấy thông số của tour an toàn (tránh lỗi null)
function getSpec(tour, key) {
  return (tour.specs || []).find((s) => s.k === key)?.v || "";
}

// === 2. HÀM SO SÁNH ĐỊA ĐIỂM THÔNG MINH ===
function isMatchLocation(specLocation, filterLocation) {
  if (!filterLocation) return true; // Nếu người dùng không chọn gì -> pass
  if (!specLocation) return false;
  
  // Đồng bộ các cách gọi khác nhau của Hồ Chí Minh thành "hcm"
  const a = specLocation.toLowerCase()
            .replace(/tp\.?\s*hồ chí minh/g, "hcm")
            .replace(/hồ chí minh/g, "hcm")
            .replace(/tp\.?\s*hcm/g, "hcm").trim();
            
  const b = filterLocation.toLowerCase()
            .replace(/tp\.?\s*hồ chí minh/g, "hcm")
            .replace(/hồ chí minh/g, "hcm")
            .replace(/tp\.?\s*hcm/g, "hcm").trim();
  
  // Xử lý các lựa chọn gộp 2 địa điểm (VD: "Huế/Đà Nẵng")
  if (b.includes('/')) {
    return b.split('/').some(part => a.includes(part.trim()));
  }
  
  return a.includes(b) || b.includes(a);
}

// Hàm render thẻ HTML
function renderTours(list) {
  const tourList = document.getElementById("tourList");
  const emptyState = document.getElementById("empty_state");

  if (!tourList || !emptyState) return;

  tourList.innerHTML = "";

  if (list.length === 0) {
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");

  list.forEach((tour) => {
    const days = parseInt(tour.type) || 0;
    const nights = days > 0 ? days - 1 : 0;
    const location = getSpec(tour, "location_end");
    
    tourList.innerHTML += `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
          <div class="tour-card">
              <div class="tour-image-container">
                  <img src="../${tour.images && tour.images[0] ? tour.images[0].url : ''}" class="tour-image" alt="${tour.name || 'Tour Image'}">
              </div>
              
              <div class="tour-content">
                  <h3 class="tour-title">${tour.short_name || tour.name || ''}</h3>
                  <p class="tour-rating">
                      ${tour.rating_summary?.average || "5.0"}
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
                          <span class="price-amount">${tour.price?.display || 'Liên hệ'}</span>
                      </div>
                      <a href="chi-tiet-tour.html?id=${tour._id}" class="btn-view-tour">
                          Chi tiết
                      </a>
                  </div>
              </div>
          </div>
      </div>
    `;
  });
}

// === 3. HÀM TÌM KIẾM CHÍNH TỪ SIDEBAR ===
function handleSearch() {
  const destination = document.getElementById("destinationSelect").value;
  const departure = document.getElementById("departureSelect").value;
  const sortValue = document.getElementById("sortSelect").value;

  const budgetBtn = document.querySelector(".budget_button.active");
  const timeBtn = document.querySelector(".time_button.active");

  const min = budgetBtn ? +budgetBtn.dataset.min : 0;
  const max = budgetBtn ? +budgetBtn.dataset.max : Infinity;
  const daysValue = timeBtn ? timeBtn.dataset.days : null;
  const tourTypes = selectedTourTypes;

  const result = tours.filter((tour) => {
    const price = tour.price.amount;
    const start = getSpec(tour, "location_start");
    const end = getSpec(tour, "location_end");
    const days = parseInt(tour.type);
    
    let matchTime = true;
    if (daysValue) {
      if (daysValue === "5+") matchTime = days >= 5;
      else matchTime = days === +daysValue;
    }
    
    // So sánh từ khóa nhập tay an toàn hơn
    const tourNameStr = (tour.name || tour.short_name || "").toLowerCase();
    const endStr = end.toLowerCase();
    
    const matchSearchText = currentSearchKeyword === "" || 
                            tourNameStr.includes(currentSearchKeyword) || 
                            endStr.includes(currentSearchKeyword);

    // Kiểm tra Ngày Khởi Hành (matchDate)
    let matchDate = true;
    if (currentSearchDate) {
      // Nếu tour có mảng upcoming_departures, kiểm tra xem có ngày nào khớp không
      if (tour.upcoming_departures && tour.upcoming_departures.length > 0) {
        // Dùng startsWith để bắt được cả chuỗi ngày giờ (VD: "2026-03-05T00:00:00")
        matchDate = tour.upcoming_departures.some(d => d.date.startsWith(currentSearchDate));
      } else {
        // Tour không có lịch khởi hành nào thì loại
        matchDate = false;
      }
    }

    return (
      isMatchLocation(end, destination) &&
      isMatchLocation(start, departure) &&
      price >= min &&
      price <= max &&
      matchTime &&
      matchSearchText &&
      matchDate && // Thêm điều kiện lọc ngày
      (tourTypes.length === 0 ||
        (tourTypes.includes("domestic") && isDomesticTour(end)) ||
        (tourTypes.includes("international") && !isDomesticTour(end)))
    );
  });

  // Xử lý sắp xếp
  if (sortValue === "price_asc") {
    result.sort((a, b) => a.price.amount - b.price.amount);
  } else if (sortValue === "price_desc") {
    result.sort((a, b) => b.price.amount - a.price.amount);
  } else if (sortValue === "rating_asc") {
    result.sort((a, b) => (a.rating_summary?.average || 0) - (b.rating_summary?.average || 0));
  } else if (sortValue === "rating_desc") {
    result.sort((a, b) => (b.rating_summary?.average || 0) - (a.rating_summary?.average || 0));
  }

  renderTours(result);
}

// === KHỞI TẠO SỰ KIỆN KHI TRANG VỪA TẢI ===
document.addEventListener("DOMContentLoaded", () => {
  loadTours();

  // Nút Ngân Sách
  document.querySelectorAll(".budget_button").forEach((btn) => {
    btn.onclick = () => {
      if(btn.classList.contains("active")) {
          btn.classList.remove("active");
      } else {
          document.querySelectorAll(".budget_button").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
      }
    };
  });

  // Nút Thời Gian
  document.querySelectorAll(".time_button").forEach((btn) => {
    btn.onclick = () => {
      if(btn.classList.contains("active")) {
          btn.classList.remove("active");
      } else {
          document.querySelectorAll(".time_button").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
      }
    };
  });

  // Nếu người dùng chọn Select thủ công, tự động xóa biến tìm kiếm cũ
  document.getElementById("destinationSelect").addEventListener("change", function() {
    currentSearchKeyword = "";
    // Xóa ?search khỏi URL nhưng giữ lại date nếu có
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  });
  
  document.getElementById("departureSelect").addEventListener("change", function() {
    currentSearchKeyword = "";
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
  });

  // Nút Tìm Tour & Select Sắp Xếp
  document.getElementById("searchTourBtn").addEventListener("click", handleSearch);
  document.getElementById("sortSelect").addEventListener("change", handleSearch);

  // Nút Loại Tour
  document.querySelectorAll(".tour_type_button").forEach((btn) => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      
      if(btn.classList.contains("active")) {
          btn.classList.remove("active");
          selectedTourTypes = [];
      } else {
          selectedTourTypes = [type];
          document.querySelectorAll(".tour_type_button").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
      }
    };
  });
});

function isDomesticTour(location) {
  const vietnamPlaces = [
    "Phú Quốc", "Đà Lạt", "Nha Trang", "Huế", "Đà Nẵng", 
    "Quy Nhơn", "Hà Nội", "Côn Đảo", "Phan Thiết", "Tây Nguyên", 
    "Gia Lai", "Kon Tum", "Buôn Ma Thuột", "TP.HCM", "Sài Gòn", "Hồ Chí Minh"
  ];
  return vietnamPlaces.some((place) => location.includes(place));
}