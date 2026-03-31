let tours = [];

async function loadTours() {
  try {
    const response = await fetch("../data/tours.json");
    tours = await response.json();

    console.log(tours);
    renderAllTours();
    // initFilters(); // Đóng tạm hàm này vì chưa được định nghĩa để tránh lỗi đứng script
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
}

function getSpec(tour, key) {
  return tour.specs?.find((s) => s.k === key)?.v || "";
}

function renderCarousel(list, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let i = 0; i < list.length; i += 3) {
    const group = list.slice(i, i + 3);

    container.innerHTML += `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <div class="row">
          ${group
            .map((tour) => {
              const days = tour.days || 3;
              const nights = days > 0 ? days - 1 : 0;
              const location = getSpec(tour, "location_end");

              return `
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
            })
            .join("")}
        </div>
      </div>
    `;
  }
}

function renderAllTours() {
  const domestic = tours.filter((t) => isDomesticTour(t));
  const international = tours.filter((t) => !isDomesticTour(t));

  renderCarousel(domestic, "domesticContainer");
  renderCarousel(international, "internationalContainer");
}

document.querySelectorAll(".filter-domestic").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;

    const domestic = tours.filter((t) => isDomesticTour(t));

    const filtered =
      type === "all"
        ? domestic
        : domestic.filter((t) =>
            getSpec(t, "location_end").toLowerCase().includes(type),
          );

    renderCarousel(filtered, "domesticContainer");
  });
});

document.querySelectorAll(".filter-international").forEach((btn) => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;

    const international = tours.filter((t) => !isDomesticTour(t));

    const filtered =
      type === "all"
        ? international
        : international.filter((t) =>
            getSpec(t, "location_end").toLowerCase().includes(type),
          );

    renderCarousel(filtered, "internationalContainer");
  });
});

function isDomesticTour(tour) {
  const location = getSpec(tour, "location_end").toLowerCase();

  const vietnamPlaces = [
    "phú quốc",
    "đà lạt",
    "nha trang",
    "huế",
    "đà nẵng",
    "quy nhơn",
    "hà nội",
    "côn đảo",
    "phan thiết",
    "tây nguyên",
    "gia lai",
    "kon tum",
    "buôn ma thuột",
    "hạ long",
    "ninh bình",
    "sapa",
  ];

  return vietnamPlaces.some((place) => location.includes(place));
}

loadTours();