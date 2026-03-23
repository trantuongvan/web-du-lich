let tours = [];
let selectedTourTypes = [];
async function loadTours() {
  try {
    const response = await fetch("../data/tours.json");
    tours = await response.json();

    renderTours(tours);
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }
}

function getSpec(tour, key) {
  return tour.specs.find((s) => s.k === key)?.v || "";
}

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
      <div class="col-12 col-md-6 col-lg-4">
                <div class="tour-card">
                    <div class="tour-image-container">
                        <img src="../${tour.images[0].url}" class="tour-image" alt="${tour.name}">
                    </div>
                    
                    <div class="tour-content">
                        <h3 class="tour-title">${tour.short_name}</h3>
                        <p class="tour-rating">
                            ${tour.rating_summary?.average || "Mới"}
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
                            <a href="detail.html?slug=${tour.slug}" class="btn-view-tour">
                                Chi tiết
                            </a>
                        </div>
                    </div>
                </div>
            </div>
    `;
  });
}

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
      if (daysValue === "5+") {
        matchTime = days >= 5;
      } else {
        matchTime = days === +daysValue;
      }
    }
    let matchType = true;
    if (selectedTourTypes.length > 0) {
      if (selectedTourTypes[0] === "domestic") {
        matchType = isDomesticTour(end);
      } else if (selectedTourTypes[0] === "international") {
        matchType = !isDomesticTour(end);
      }
    }
    return (
      (!destination || end.includes(destination)) &&
      (!departure || start.includes(departure)) &&
      price >= min &&
      price <= max &&
      matchTime &&
      (tourTypes.length === 0 ||
        (tourTypes.includes("domestic") && isDomesticTour(end)) ||
        (tourTypes.includes("international") && !isDomesticTour(end)))
    );
  });

  if (sortValue === "price_asc") {
    result.sort((a, b) => a.price.amount - b.price.amount);
  } else if (sortValue === "price_desc") {
    result.sort((a, b) => b.price.amount - a.price.amount);
  } else if (sortValue === "rating_asc") {
    result.sort(
      (a, b) =>
        (a.rating_summary?.average || 0) - (b.rating_summary?.average || 0),
    );
  } else if (sortValue === "rating_desc") {
    result.sort(
      (a, b) =>
        (b.rating_summary?.average || 0) - (a.rating_summary?.average || 0),
    );
  }

  renderTours(result);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTours();

  document.querySelectorAll(".budget_button").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".budget_button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  document.querySelectorAll(".time_button").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".time_button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    };
  });

  document
    .getElementById("searchTourBtn")
    .addEventListener("click", handleSearch);

  document
    .getElementById("sortSelect")
    .addEventListener("change", handleSearch);

  document.querySelectorAll(".tour_type_button").forEach((btn) => {
    btn.onclick = () => {
      const type = btn.dataset.type;
      selectedTourTypes = [type];
      document
        .querySelectorAll(".tour_type_button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      handleSearch();
    };
  });
});

function isDomesticTour(location) {
  const vietnamPlaces = [
    "Phú Quốc",
    "Đà Lạt",
    "Nha Trang",
    "Huế",
    "Đà Nẵng",
    "Quy Nhơn",
    "Hà Nội",
    "Côn Đảo",
    "Phan Thiết",
    "Tây Nguyên",
    "Gia Lai",
    "Kon Tum",
    "Buôn Ma Thuột",
  ];
  return vietnamPlaces.some((place) => location.includes(place));
}
