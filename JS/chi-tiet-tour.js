// Khai báo biến toàn cục để các hàm tăng giảm số lượng có thể sử dụng
let currentAdultPrice = 0;
let currentMaxSeats = 0;
let dateCards;
let orderBtn;

async function loadDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const tourId = urlParams.get('id');

    const response = await fetch('../data/tours.json');
    const tours = await response.json();
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
        const location = tour.specs.find(s => s.k === 'location_end')?.v || 'Việt Nam';
        document.getElementById('tour-location').innerText = location;
        document.getElementById('tour-main-img').src = tour.images[0].url;
        document.getElementById('tour-img-caption').innerText = tour.images[0].caption;

        // --- 2. Đổ các ô Ngày khởi hành ---
        // 45. Chuẩn bị vùng chứa
        const departureArea = document.getElementById('departure-dates');
        let depHtml = '';

        // 46. Vòng lặp tạo nội dung (Chỉ dùng 1 vòng lặp duy nhất)
        tour.upcoming_departures.forEach(d => {
            const dateStr = new Date(d.date).toLocaleDateString('vi-VN');
            const isLow = d.seats_left < 7;

            const statusText = isLow ? "Sắp hết" : "Đang nhận";

            // THIẾT LẬP MÀU TƯƠI (Màu nền nhạt, màu chữ đậm tươi)
            const badgeStyle = isLow
                ? "background-color: #fee2e2; color: #dc2626;" // Đỏ tươi (Red 600)
                : "background-color: #dcfce7; color: #16a34a;"; // Xanh lá tươi (Green 600)

            const seatText = isLow ? `Chỉ còn ${d.seats_left} chỗ` : `Còn ${d.seats_left} chỗ trống`;

            depHtml += `
                <div class="col-6 mb-3">
                    <div class="border rounded-3 p-2 px-3 date-selectable d-flex flex-column justify-content-between" 
                         style="cursor: pointer; min-height: 80px;">
                        
                        <!-- Hàng 1 -->
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold" style="font-size: 0.95rem; color: #000;">${dateStr}</span>
                            
                            <!-- Cập nhật style badge tại đây -->
                            <span class="badge border-0 py-1 px-2" 
                                  style="font-size: 0.75rem; font-weight: 600; border-radius: 6px; ${badgeStyle}">
                                ${statusText}
                            </span>
                        </div>

                        <!-- Hàng 2 -->
                        <div class="d-flex justify-content-between align-items-end">
                            <span class="text-secondary" style="font-size: 0.75rem;">${d.day_of_week}</span>
                            <span class="text-secondary" style="font-size: 0.75rem;">${seatText}</span>
                        </div>
                        
                    </div>
                </div>`;
        });





        // 56. ĐỔ DỮ LIỆU VÀO HTML (CHỈ GỌI 1 LẦN)
        departureArea.innerHTML = depHtml;

        // 57. XỬ LÝ CLICK (Dán ngay sau khi đổ dữ liệu)
        const currentCards = document.querySelectorAll('.date-selectable');
        const currentOrderBtn = document.getElementById('nut-dat-tour');

        currentCards.forEach(card => {
            card.onclick = function () {
                // Xóa viền đen ở các ô khác
                currentCards.forEach(c => c.classList.remove('selected'));

                // Thêm viền đen vào ô vừa bấm
                this.classList.add('selected');

                // Mở khóa và đổi màu đen cho nút Đặt ngay
                if (currentOrderBtn) {
                    currentOrderBtn.disabled = false;
                    currentOrderBtn.classList.add('btn-activated');
                    currentOrderBtn.innerText = "Đặt ngay";
                }
            };
        });




        // --- 3. Đổ Specs (Thông tin tour) ---
        const specsList = document.getElementById('tour-specs-list');

        // 1. Bản đồ Icon (Giữ nguyên của bạn)
        const specIcons = {
            "transport": "fa-car",
            "hotel_rating": "fa-hotel",
            "location_start": "fa-route",
            "location_end": "fa-location-dot"
        };

        // 2. BỔ SUNG: Bản đồ Tên hiển thị tiếng Việt
        const specLabels = {
            "transport": "Phương tiện",
            "hotel_rating": "Khách sạn",
            "location_start": "Khởi hành từ",
            "location_end": "Điểm đến"
        };

        let specsHtml = '';
        tour.specs.forEach(s => {
            const icon = specIcons[s.k] || "fa-check";
            const label = specLabels[s.k] || s.k; // Nếu không tìm thấy tên thì mới dùng mã gốc

            // Sửa lại dòng HTML: Dùng biến 'label' thay vì 's.k'
            specsHtml += `
        <li class="mb-3 d-flex align-items-center">
            <i class="fa-solid ${icon} me-3 text-secondary" style="width: 20px;"></i>
            <span>
                <strong class="text-dark">${label}:</strong> 
                <span class="text-muted ms-1">${s.v}</span>
            </span>
        </li>`;
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

                itineraryHtml += `
                <div class="position-relative pb-4">
                    <!-- 1. Đường kẻ dọc dính liền: Chạy từ tâm nút này xuống tâm nút sau -->
                    ${!isLast ? `
                        <div style="position: absolute; 
                                    left: 49px; 
                                    top: 20px; 
                                    bottom: -25px; 
                                    width: 2px; 
                                    background-color: #dee2e6; 
                                    z-index: 0;">
                        </div>` : ''}

                    <!-- 2. Tiêu đề: Badge (Ngày) và Chữ -->
                    <div class="d-flex align-items-center mb-3" style="position: relative; z-index: 1;">
                        <span class="badge bg-dark rounded-pill d-flex align-items-center justify-content-center"
                              style="width: 100px; height: 40px; font-size: 0.9rem; font-weight: normal;">
                            ${item.day_label}
                        </span>
                        <span class="fw-bold ms-3 text-uppercase" style="font-size: 1rem;">
                            ${item.title}
                        </span>
                    </div>

                    <!-- 3. Nội dung chi tiết -->
                    <div style="padding-left: 100px;">
                        <div class="ps-4">
                            <p class="text-muted mb-0" style="line-height: 1.6; font-size: 0.95rem;">
                                ${item.details}
                            </p>
                        </div>
                    </div>
                </div>
            `;
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
        const bookingModal = document.getElementById('bookingModal');

        dateCards.forEach(card => {
            card.addEventListener('click', function () {
                dateCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');

                if (orderBtn) {
                    orderBtn.disabled = false;
                    orderBtn.classList.add('btn-activated');
                    orderBtn.innerText = "Đặt ngay";
                }
            });
        });

        if (orderBtn) {
            orderBtn.onclick = function () {
                const selectedDiv = document.querySelector('.date-selectable.selected');
                if (!selectedDiv) return;

                try {
                    // Lấy thông tin từ ô đã chọn (Sửa từ .text-muted thành .text-secondary)
                    const dateTxt = selectedDiv.querySelector('.fw-bold').innerText;
                    const subInfo = selectedDiv.querySelector('.text-secondary').innerText; // Chỗ này quan trọng

                    // Đổ dữ liệu vào Modal
                    document.getElementById('modal-img').src = tour.images[0].url;
                    document.getElementById('modal-title').innerText = tour.name;
                    document.getElementById('modal-date').innerText = dateTxt;
                    document.getElementById('modal-day').innerText = subInfo.split('•')[0].trim();

                    currentAdultPrice = tour.price.amount;
                    // Trích xuất số chỗ còn lại
                    const seatsMatch = subInfo.match(/\d+/);
                    currentMaxSeats = seatsMatch ? parseInt(seatsMatch[0]) : 10;

                    document.getElementById('modal-price-unit').innerText = tour.price.display;
                    document.getElementById('adult-price-txt').innerText = tour.price.display;
                    document.getElementById('child-price-txt').innerText = (currentAdultPrice * 0.7).toLocaleString() + " VNĐ";
                    document.getElementById('modal-seats-left').innerText = currentMaxSeats;
                    document.getElementById('max-seats').innerText = currentMaxSeats;

                    // HIỆN MODAL
                    if (bookingModal) {
                        bookingModal.style.display = 'flex';
                        // Reset số lượng về 1 người lớn, 0 trẻ em khi mở mới
                        document.getElementById('qty-adult').innerText = "1";
                        document.getElementById('qty-child').innerText = "0";
                        updateTotal();
                    }
                } catch (err) {
                    console.error("Lỗi khi đổ dữ liệu vào Modal:", err);
                    alert("Có lỗi xảy ra, vui lòng thử lại!");
                }
            };
        }

        const nameInput = document.getElementById('cus-name');
        const phoneInput = document.getElementById('cus-phone');
        const cccdInput = document.getElementById('cus-cccd');
        const modal = document.getElementById('bookingModal');

        // --- 1. KIỂM TRA HỌ TÊN NGAY KHI NHẬP ---
        nameInput.addEventListener('input', function () {
            let val = this.value.trim();
            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+\s[a-zA-ZÀ-ỹ\s]+$/;
            if (val === "" || !nameRegex.test(val)) {
                document.getElementById('err-name').innerText = "Vui lòng nhập ít nhất 2 từ (Họ và Tên)";
            } else {
                document.getElementById('err-name').innerText = "";
            }
        });

        // Tự động viết hoa (Vẫn giữ để làm đẹp dữ liệu khi khách nhấn ra ngoài)
        nameInput.addEventListener('blur', function () {
            let val = this.value.trim();
            if (val.length > 0) {
                this.value = val.toLowerCase().split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
        });

        // --- 2. KIỂM TRA SỐ ĐIỆN THOẠI (CHO PHÉP NHẬP CHỮ NHƯNG BÁO LỖI ĐỎ) ---
        phoneInput.addEventListener('input', function () {
            const val = this.value.trim();
            // Regex: Bắt đầu bằng 0, theo sau là 3,5,7,8,9 và đúng 8 chữ số tiếp theo (Tổng 10)
            const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;

            if (!phoneRegex.test(val)) {
                document.getElementById('err-phone').innerText = "SĐT không hợp lệ (Phải là 10 con số, bắt đầu bằng 03, 05, 07, 08, 09)";
            } else {
                document.getElementById('err-phone').innerText = "";
            }
        });

        // --- 3. KIỂM TRA CCCD (CHO PHÉP NHẬP CHỮ NHƯNG BÁO LỖI ĐỎ) ---
        cccdInput.addEventListener('input', function () {
            const val = this.value.trim();
            // Regex: Đúng 12 con số
            const cccdRegex = /^[0-9]{12}$/;

            if (!cccdRegex.test(val)) {
                document.getElementById('err-cccd').innerText = "CCCD không hợp lệ (Phải nhập đúng 12 con số)";
            } else {
                document.getElementById('err-cccd').innerText = "";
            }
        });

        // Đóng Modal
        document.getElementById('closeModal').onclick = () => modal.style.display = 'none';

        // 4. KIỂM TRA LẦN CUỐI KHI BẤM NÚT ĐẶT TOUR
        document.getElementById('btn-confirm-booking').onclick = function () {
            const nameVal = nameInput.value.trim();
            const phoneVal = phoneInput.value.trim();
            const cccdVal = cccdInput.value.trim();

            // Kiểm tra xem có ô nào trống hoặc còn dòng lỗi nào đang hiện không
            const hasError = document.getElementById('err-name').innerText !== "" ||
                document.getElementById('err-phone').innerText !== "" ||
                document.getElementById('err-cccd').innerText !== "";

            if (nameVal === "" || phoneVal === "" || cccdVal === "" || hasError) {
                alert("Thông tin chưa chính xác. Vui lòng kiểm tra lại các dòng báo lỗi màu đỏ!");
            } else {
                alert("Chúc mừng! Bạn đã đặt tour thành công.");
                modal.style.display = 'none';
                console.log("Dữ liệu đặt tour:", { nameVal, phoneVal, cccdVal });
            }
        };

    }
}
// --- CÁC HÀM PHỤ (Dán bên ngoài) ---
window.changeQty = function (type, val) {
    const adultEl = document.getElementById('qty-adult');
    const childEl = document.getElementById('qty-child');

    let aQty = parseInt(adultEl.innerText);
    let cQty = parseInt(childEl.innerText);

    // Tính toán số lượng dự kiến sau khi bấm
    let nextAdult = type === 'adult' ? Math.max(1, aQty + val) : aQty;
    let nextChild = type === 'child' ? Math.max(0, cQty + val) : cQty;

    // RÀNG BUỘC: Nếu bấm tăng (+) mà tổng vượt quá chỗ trống thì không làm gì cả
    if (val > 0 && (nextAdult + nextChild) > currentMaxSeats) {
        return; // Thoát hàm ngay lập tức, không đổi số
    }

    // Nếu hợp lệ thì mới cập nhật số lên màn hình
    adultEl.innerText = nextAdult;
    childEl.innerText = nextChild;

    // Cập nhật giao diện nút (Khóa/Mở nút + -)
    updateButtonStates(nextAdult, nextChild);
    updateTotal();
};
function updateButtonStates(aQty, cQty) {
    const total = aQty + cQty;
    // Tìm tất cả các nút cộng (+) trong modal
    const plusButtons = document.querySelectorAll("button[onclick*=', 1']");
    // Tìm các nút trừ (-)
    const minusAdult = document.querySelector("button[onclick=\"changeQty('adult', -1)\"]");
    const minusChild = document.querySelector("button[onclick=\"changeQty('child', -1)\"]");

    // 1. Nếu tổng người = max, làm mờ và khóa tất cả nút cộng
    plusButtons.forEach(btn => {
        if (total >= currentMaxSeats) {
            btn.style.opacity = "0.3";
            btn.style.cursor = "not-allowed";
        } else {
            btn.style.opacity = "1";
            btn.style.cursor = "pointer";
        }
    });

    // 2. Khóa nút trừ người lớn nếu chỉ còn 1 người
    if (aQty <= 1) {
        minusAdult.style.opacity = "0.3";
        minusAdult.style.cursor = "not-allowed";
    } else {
        minusAdult.style.opacity = "1";
        minusAdult.style.cursor = "pointer";
    }

    // 3. Khóa nút trừ trẻ em nếu là 0
    if (cQty <= 0) {
        minusChild.style.opacity = "0.3";
        minusChild.style.cursor = "not-allowed";
    } else {
        minusChild.style.opacity = "1";
        minusChild.style.cursor = "pointer";
    }
}


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
