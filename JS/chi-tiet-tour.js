async function loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    const response = await fetch('../data/tours.json');
    const tours = await response.json();
    const tour = tours.find(t => t._id === tourId);

    if (tour) {
        // --- Đổ dữ liệu phần trên ---
        document.getElementById('tour-title').innerText = tour.name;
        document.getElementById('tour-rating').innerText = tour.rating_summary.average;
        document.getElementById('tour-rating-count').innerText = tour.rating_summary.count;
        document.getElementById('tour-price').innerText = tour.price.display;
        document.getElementById('tour-schedule-text').innerText = tour.recurring_schedule[0];
        
        // Tách ngày đêm từ chuỗi "3 ngày 2 đêm"
        const duration = tour.type.match(/\d+/g);
        document.getElementById('tour-days').innerText = duration[0];
        document.getElementById('tour-nights').innerText = duration[1];

        // Ảnh
        document.getElementById('tour-main-img').src = tour.images[0].url;
        document.getElementById('tour-img-caption').innerText = tour.images[0].caption;

        // --- Đổ các ô Ngày khởi hành ---
        const departureArea = document.getElementById('departure-dates');
        let depHtml = '';
        tour.upcoming_departures.forEach(d => {
            const dateStr = new Date(d.date).toLocaleDateString('vi-VN');
            depHtml += `
              <div class="col-5">
                <div class="border rounded p-2 position-relative date-selectable" style="cursor: pointer;">
                  <span class="badge bg-success-subtle text-success position-absolute top-0 end-0 m-1" style="font-size: 10px;">Đang nhận</span>
                  <div class="fw-bold small">${dateStr}</div>
                  <div class="text-muted" style="font-size: 11px;">${d.day_of_week} • Còn ${d.seats_left} chỗ</div>
                </div>
              </div>`;
        });
        departureArea.innerHTML = depHtml;

        // --- Đổ danh sách Specs (Thông tin tour bên dưới) ---
        const specsList = document.getElementById('tour-specs-list');
        const specIcons = {
            "transport": "fa-car",
            "hotel_rating": "fa-hotel",
            "location_start": "fa-route",
            "location_end": "fa-location-dot"
        };
        
        let specsHtml = '';
        tour.specs.forEach(s => {
            const icon = specIcons[s.k] || "fa-check";
            specsHtml += `
              <li class="mb-3 d-flex align-items-center">
                <span><i class="fa-solid ${icon} me-3"></i><span class="text-muted">${s.k}:</span> ${s.v}</span>
              </li>`;
        });
        specsList.innerHTML = specsHtml;
        if (tour.pickup_location) {
            document.getElementById('pickup-name').innerText = tour.pickup_location.name;
            document.getElementById('pickup-address').innerText = tour.pickup_location.address;
        }

        // 2. Đổ dữ liệu Lịch trình tour (Timeline)
        const itineraryContainer = document.getElementById('tour-itinerary-container');
        let itineraryHtml = '';

        if (tour.itinerary && tour.itinerary.length > 0) {
            tour.itinerary.forEach((item, index) => {
                // Nếu là ngày cuối cùng thì không vẽ đường kẻ dọc (border-start)
                const isLast = index === tour.itinerary.length - 1;
                const borderClass = isLast ? "" : "border-start";

                itineraryHtml += `
                    <div class="d-flex align-items-center mb-4">
                        <span class="badge bg-dark rounded-pill px-4 py-2 me-3 fw-normal">${item.day_label}</span>
                        <span class="fw-bold text-uppercase">${item.title}</span>
                    </div>
                    <div class="ms-5 ps-3 ${borderClass} pb-4 ps-md-5">
                        <p class="text-muted">${item.details}</p>
                    </div>
                `;
            });
            itineraryContainer.innerHTML = itineraryHtml;
        }
        const includedList = document.getElementById('tour-included-list');
        if (includedList && tour.policy && tour.policy.included) {
            let includedHtml = '';
            tour.policy.included.forEach(item => {
                includedHtml += `
                    <li class="py-3 border-bottom d-flex align-items-center">
                      <i class="fa-solid fa-check me-3" style="color: #28a745;"></i>
                      <span>${item}</span>
                    </li>
                `;
            });
            includedList.innerHTML = includedHtml;
        }

        // --- BỔ SUNG: Chính sách tour (Không bao gồm) ---
        const excludedList = document.getElementById('tour-excluded-list');
        if (excludedList && tour.policy && tour.policy.excluded) {
            let excludedHtml = '';
            tour.policy.excluded.forEach(item => {
                excludedHtml += `
                    <li class="py-3 border-bottom d-flex align-items-center">
                      <i class="fa-solid fa-xmark me-3" style="color: #dc3545;"></i>
                      <span>${item}</span>
                    </li>
                `;
            });
            excludedList.innerHTML = excludedHtml;
        }
    }
}

loadDetail();
