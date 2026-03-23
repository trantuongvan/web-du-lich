// Khai báo biến toàn cục để các hàm tăng giảm số lượng có thể sử dụng
let currentAdultPrice = 0;
let currentMaxSeats = 0;

async function loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    const response = await fetch('../data/tours.json');
    const tours = await response.json();
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======

    // Sửa lỗi: dùng tourId thay vì id để khớp với khai báo bên trên
>>>>>>> f81e156 (feat(chi-tiet-tour): form đăng kí tour + responsive thử lần 1)
=======

    // Sửa lỗi: dùng tourId thay vì id để khớp với khai báo bên trên
=======
>>>>>>> ec458a58243c04030863b9b7fe6b8bcfe4e15ee8
>>>>>>> 55712eaa7306bd55da052ed863af2a06dcdfa9c9
>>>>>>> 3ab4ab391830665cb3157413718bd93c21eeea35
    const tour = tours.find(t => t._id === tourId);

    if (tour) {
        // --- 1. Đổ dữ liệu phần Header ---
        document.getElementById('tour-title').innerText = tour.name;
        document.getElementById('tour-rating').innerText = tour.rating_summary.average;
        document.getElementById('tour-rating-count').innerText = tour.rating_summary.count;
        document.getElementById('tour-price').innerText = tour.price.display;
        document.getElementById('tour-schedule-text').innerText = tour.recurring_schedule[0];

        const duration = tour.type.match(/\d+/g) || [0, 0];
        document.getElementById('tour-days').innerText = duration[0];
        document.getElementById('tour-nights').innerText = duration[1];

        document.getElementById('tour-main-img').src = tour.images[0].url;
        document.getElementById('tour-img-caption').innerText = tour.images[0].caption;

        // --- 2. Đổ các ô Ngày khởi hành ---
        const departureArea = document.getElementById('departure-dates');
        let depHtml = '';
        tour.upcoming_departures.forEach(d => {
            const dateStr = new Date(d.date).toLocaleDateString('vi-VN');
            let depHtml = '';
            tour.upcoming_departures.forEach(d => {
                const dateStr = new Date(d.date).toLocaleDateString('vi-VN');

                // --- LOGIC MỚI: Kiểm tra số chỗ trống ---
                const isLowRegistry = d.seats_left < 7;
                const statusText = isLowRegistry ? "Sắp hết" : "Đang nhận";
                const statusClass = isLowRegistry ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success";

                depHtml += `
      <div class="col-5">
        <div class="border rounded p-2 position-relative date-selectable" style="cursor: pointer;">
          <!-- Badge thay đổi theo số chỗ -->
          <span class="badge ${statusClass} position-absolute top-0 end-0 m-1" style="font-size: 10px;">
            ${statusText}
          </span>
          <div class="fw-bold small">${dateStr}</div>
          <div class="text-muted" style="font-size: 11px;">${d.day_of_week} • Còn ${d.seats_left} chỗ</div>
        </div>
      </div>`;
            });
        });
        departureArea.innerHTML = depHtml;

        // --- 3. Đổ Specs (Thông tin tour) ---
        const specsList = document.getElementById('tour-specs-list');
        const specIcons = { "transport": "fa-car", "hotel_rating": "fa-hotel", "location_start": "fa-route", "location_end": "fa-location-dot" };
        let specsHtml = '';
        tour.specs.forEach(s => {
            const icon = specIcons[s.k] || "fa-check";
            specsHtml += `<li class="mb-3 d-flex align-items-center"><span><i class="fa-solid ${icon} me-3"></i><span class="text-muted">${s.k}:</span> ${s.v}</span></li>`;
        });
        specsList.innerHTML = specsHtml;

        // --- 4. Điểm tập trung ---
        if (tour.pickup_location) {
            document.getElementById('pickup-name').innerText = tour.pickup_location.name;
            document.getElementById('pickup-address').innerText = tour.pickup_location.address;
        }

        // --- 5. Lịch trình tour (Timeline) ---
        const itineraryContainer = document.getElementById('tour-itinerary-container');
        let itineraryHtml = '';
        if (tour.itinerary && tour.itinerary.length > 0) {
            tour.itinerary.forEach((item, index) => {
                const isLast = index === tour.itinerary.length - 1;
                const borderClass = isLast ? "" : "border-start";
                itineraryHtml += `
                    <div class="d-flex align-items-center mb-4">
                        <span class="badge bg-dark rounded-pill px-4 py-2 me-3 fw-normal">${item.day_label}</span>
                        <span class="fw-bold text-uppercase">${item.title}</span>
                    </div>
                    <div class="ms-5 ps-3 ${borderClass} pb-4 ps-md-5">
                        <p class="text-muted">${item.details}</p>
                    </div>`;
            });
            itineraryContainer.innerHTML = itineraryHtml;
        }

        // --- 6. Chính sách tour ---
        const includedList = document.getElementById('tour-included-list');
        if (includedList && tour.policy?.included) {
            includedList.innerHTML = tour.policy.included.map(item => `
                <li class="py-3 border-bottom d-flex align-items-center"><i class="fa-solid fa-check me-3" style="color: #28a745;"></i><span>${item}</span></li>`).join('');
        }
        const excludedList = document.getElementById('tour-excluded-list');
        if (excludedList && tour.policy?.excluded) {
            excludedList.innerHTML = tour.policy.excluded.map(item => `
                <li class="py-3 border-bottom d-flex align-items-center"><i class="fa-solid fa-xmark me-3" style="color: #dc3545;"></i><span>${item}</span></li>`).join('');
        }

        // --- 7. Xử lý Click chọn ngày & Mở Modal Đặt Tour ---
        const dateCards = document.querySelectorAll('.date-selectable');
        const orderBtn = document.getElementById('nut-dat-tour');

        dateCards.forEach(card => {
            card.addEventListener('click', function () {
                dateCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                orderBtn.disabled = false;
                orderBtn.classList.add('btn-activated');
                orderBtn.innerText = "Đặt ngay";
            });
        });

        orderBtn.addEventListener('click', function () {
            const selectedDiv = document.querySelector('.date-selectable.selected');
            if (!selectedDiv) return;

            // Đổ dữ liệu vào Modal từ tour và ô đã chọn
            document.getElementById('modal-img').src = tour.images[0].url;
            document.getElementById('modal-title').innerText = tour.name;
            document.getElementById('modal-date').innerText = selectedDiv.querySelector('.fw-bold').innerText;
            document.getElementById('modal-day').innerText = selectedDiv.querySelector('.text-muted').innerText.split('•')[0];

            currentAdultPrice = tour.price.amount;
            currentMaxSeats = parseInt(selectedDiv.querySelector('.text-muted').innerText.match(/\d+/)[0]);

            document.getElementById('modal-price-unit').innerText = tour.price.display;
            document.getElementById('adult-price-txt').innerText = tour.price.display;
            document.getElementById('child-price-txt').innerText = (currentAdultPrice * 0.7).toLocaleString() + " VNĐ";
            document.getElementById('modal-seats-left').innerText = currentMaxSeats;
            document.getElementById('max-seats').innerText = currentMaxSeats;

            document.getElementById('bookingModal').style.display = 'flex';
            updateTotal();
        });

        // --- 8. Regex kiểm tra Form ---
        document.getElementById('btn-confirm-booking').onclick = function () {
            const name = document.getElementById('cus-name').value;
            const phone = document.getElementById('cus-phone').value;
            const cccd = document.getElementById('cus-cccd').value;

            const nameRegex = /^[a-zA-ZÀ-ỹ\s]{3,50}$/;
            const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
            const cccdRegex = /^[0-9]{12}$/;

            let isOk = true;
            if (!nameRegex.test(name)) { document.getElementById('err-name').innerText = "Họ tên không hợp lệ"; isOk = false; }
            else document.getElementById('err-name').innerText = "";

            if (!phoneRegex.test(phone)) { document.getElementById('err-phone').innerText = "SĐT không đúng (10 số)"; isOk = false; }
            else document.getElementById('err-phone').innerText = "";

            if (!cccdRegex.test(cccd)) { document.getElementById('err-cccd').innerText = "CCCD không đúng (12 số)"; isOk = false; }
            else document.getElementById('err-cccd').innerText = "";

            if (isOk) alert("Đặt tour thành công!");
        };

        document.getElementById('closeModal').onclick = () => document.getElementById('bookingModal').style.display = 'none';

    } // Kết thúc if (tour)
}

// --- CÁC HÀM PHỤ (Dán bên ngoài) ---
window.changeQty = function (type, val) {
    const adultEl = document.getElementById('qty-adult');
    const childEl = document.getElementById('qty-child');
    let aQty = parseInt(adultEl.innerText);
    let cQty = parseInt(childEl.innerText);

    if (type === 'adult') aQty = Math.max(1, aQty + val);
    else cQty = Math.max(0, cQty + val);

    if ((aQty + cQty) > currentMaxSeats) {
        alert("Vượt quá số chỗ còn trống!");
        return;
    }

    adultEl.innerText = aQty;
    childEl.innerText = cQty;
    updateTotal();
};

function updateTotal() {
    const aQty = parseInt(document.getElementById('qty-adult').innerText);
    const cQty = parseInt(document.getElementById('qty-child').innerText);
    const total = (aQty * currentAdultPrice) + (cQty * (currentAdultPrice * 0.7));

    document.getElementById('total-qty').innerText = aQty + cQty;
    document.getElementById('total-amount').innerText = total.toLocaleString() + " VNĐ";
    document.getElementById('btn-confirm-booking').disabled = false;
    document.getElementById('btn-confirm-booking').classList.add('active');
}

loadDetail();
