import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { initFavorite } from "./favorite.js";
import { processPayment, initPaymentModals } from "./payment.js";

let currentAdultPrice = 0;
let currentMaxSeats = 0;
let dateCards;
let orderBtn;
const urlParams = new URLSearchParams(window.location.search);
const tourId = String(urlParams.get("id"));

initFavorite(tourId);
initPaymentModals();

async function loadDetail() {
  try {
    const tourDoc = await getDoc(doc(db, "tours", tourId));
    if (tourDoc.exists()) {
      renderTourDetail(tourDoc.data());
    } else {
      alert("Không tìm thấy tour!");
    }
  } catch (error) {
    console.error("Lỗi tải chi tiết tour:", error);
  }
}

function renderTourDetail(tour) {
  if (tour) {
    //Đổ dữ liệu phần header
    document.getElementById("tour-title").innerText = tour.name;
    document.getElementById("tour-rating").innerText =
      tour.rating_summary.average;
    document.getElementById("tour-rating-count").innerText =
      tour.rating_summary.count;
    document.getElementById("tour-price").innerText = tour.price.display;
    document.getElementById("tour-schedule-text").innerText =
      tour.recurring_schedule[0];

    const duration = tour.type.match(/\d+/g) || [0, 0];
    document.getElementById("tour-days").innerText = duration[0];
    document.getElementById("tour-nights").innerText = duration[1];
    const location =
      tour.specs.find((s) => s.k === "location_end")?.v || "Việt Nam";
    document.getElementById("tour-location").innerText = location;
    document.getElementById("tour-main-img").src = tour.images[0].url;
    document.getElementById("tour-img-caption").innerText =
      tour.images[0].caption;

    //các ô Ngày khởi hành
    const departureArea = document.getElementById("departure-dates");
    let depHtml = "";

    //tạo content
    tour.upcoming_departures.forEach((d) => {
      const dateStr = new Date(d.date).toLocaleDateString("vi-VN");
      const isLow = d.seats_left < 7;

      const statusText = isLow ? "Sắp hết" : "Đang nhận";
      const badgeStyle = isLow
        ? "background-color: #fee2e2; color: #dc2626;" // Đỏ tươi (Red 600)
        : "background-color: #dcfce7; color: #16a34a;"; // Xanh lá tươi (Green 600)

      const seatText = isLow
        ? `Chỉ còn ${d.seats_left} chỗ`
        : `Còn ${d.seats_left} chỗ trống`;

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
    departureArea.innerHTML = depHtml;
    const specsList = document.getElementById("tour-specs-list");
    //icon
    const specIcons = {
      transport: "fa-car",
      hotel_rating: "fa-hotel",
      location_start: "fa-route",
      location_end: "fa-location-dot",
    };

    // map 
    const specLabels = {
      transport: "Phương tiện",
      hotel_rating: "Khách sạn",
      location_start: "Khởi hành từ",
      location_end: "Điểm đến",
    };

    let specsHtml = "";
    tour.specs.forEach((s) => {
      const icon = specIcons[s.k] || "fa-check";
      const label = specLabels[s.k] || s.k;
      specsHtml += `
        <li class="mb-3 d-flex align-items-center">
            <i class="fa-solid ${icon} me-3 text-dark" style="width: 20px;"></i>
            <span>
                <strong class="text-dark">${label}:</strong> 
                <span class="text-muted ms-1">${s.v}</span>
            </span>
        </li>`;
    });
    specsList.innerHTML = specsHtml;

    //điểm tập trung
    if (tour.pickup_location) {
      document.getElementById("pickup-name").innerText =
        tour.pickup_location.name;
      document.getElementById("pickup-address").innerText =
        tour.pickup_location.address;
    }

    //lịch trình tour
    const itineraryContainer = document.getElementById(
      "tour-itinerary-container",
    );
    let itineraryHtml = "";
    if (tour.itinerary && tour.itinerary.length > 0) {
      tour.itinerary.forEach((item, index) => {
        const isLast = index === tour.itinerary.length - 1;

        itineraryHtml += `
                <div class="position-relative pb-4">
                    <!-- 1. Đường kẻ dọc dính liền: Chạy từ tâm nút này xuống tâm nút sau -->
                    ${
                      !isLast
                        ? `
                        <div style="position: absolute; 
                                    left: 49px; 
                                    top: 20px; 
                                    bottom: -25px; 
                                    width: 2px; 
                                    background-color: #dee2e6; 
                                    z-index: 0;">
                        </div>`
                        : ""
                    }

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

    //chính sách tour
    const includedList = document.getElementById("tour-included-list");
    if (includedList && tour.policy?.included) {
      includedList.innerHTML = tour.policy.included
        .map(
          (item) => `
                <li class="py-3 border-bottom d-flex align-items-center"><i class="fa-solid fa-check me-3" style="color: #28a745;"></i><span>${item}</span></li>`,
        )
        .join("");
    }
    const excludedList = document.getElementById("tour-excluded-list");
    if (excludedList && tour.policy?.excluded) {
      excludedList.innerHTML = tour.policy.excluded
        .map(
          (item) => `
                <li class="py-3 border-bottom d-flex align-items-center"><i class="fa-solid fa-xmark me-3" style="color: #dc3545;"></i><span>${item}</span></li>`,
        )
        .join("");
    }

    //click đặt tour
    const dateCards = document.querySelectorAll(".date-selectable");
    const orderBtn = document.getElementById("nut-dat-tour");
    const bookingModal = document.getElementById("bookingModal");

    dateCards.forEach((card) => {
      card.addEventListener("click", function () {
        dateCards.forEach((c) => c.classList.remove("selected"));
        this.classList.add("selected");

        if (orderBtn) {
          orderBtn.disabled = false;
          orderBtn.classList.add("btn-activated");
          orderBtn.innerText = "Đặt ngay";
        }
      });
    });

    if (orderBtn) {
      orderBtn.onclick = function () {
        const user = auth.currentUser;
        if (!user) {
          window.location.href = "./dang-nhap.html";
          return;
        }
        const selectedDiv = document.querySelector(".date-selectable.selected");
        if (!selectedDiv) return;

        try {
          const dateTxt = selectedDiv.querySelector(".fw-bold").innerText;
          const subInfo =
          selectedDiv.querySelector(".text-secondary").innerText;

          document.getElementById("modal-img").src = tour.images[0].url;
          document.getElementById("modal-title").innerText = tour.name;
          document.getElementById("modal-date").innerText = dateTxt;
          document.getElementById("modal-day").innerText = subInfo
            .split("•")[0]
            .trim();

          currentAdultPrice = tour.price.amount;
          const seatsMatch = subInfo.match(/\d+/);
          currentMaxSeats = seatsMatch ? parseInt(seatsMatch[0]) : 10;

          document.getElementById("modal-price-unit").innerText =
            tour.price.display;
          document.getElementById("adult-price-txt").innerText =
            tour.price.display;
          document.getElementById("child-price-txt").innerText =
            (currentAdultPrice * 0.7).toLocaleString() + " VNĐ";
          document.getElementById("modal-seats-left").innerText =
            currentMaxSeats;
          document.getElementById("max-seats").innerText = currentMaxSeats;

          //hiện modal
          if (bookingModal) {
            bookingModal.style.display = "flex";
            document.getElementById("qty-adult").innerText = "1";
            document.getElementById("qty-child").innerText = "0";
            updateTotal();
          }
        } catch (err) {
          console.error("Lỗi khi đổ dữ liệu vào Modal:", err);
          alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
      };
    }

    const nameInput = document.getElementById("cus-name");
    const phoneInput = document.getElementById("cus-phone");
    const cccdInput = document.getElementById("cus-cccd");

    //validate
    nameInput.addEventListener("input", function () {
      let val = this.value.trim();
      const nameRegex = /^[a-zA-ZÀ-ỹ\s]+\s[a-zA-ZÀ-ỹ\s]+$/;
      if (val === "" || !nameRegex.test(val)) {
        document.getElementById("err-name").innerText =
          "Vui lòng nhập ít nhất 2 từ (Họ và Tên)";
      } else {
        document.getElementById("err-name").innerText = "";
      }

      validateForm();
    });

    nameInput.addEventListener("blur", function () {
      let val = this.value.trim();
      if (val.length > 0) {
        this.value = val
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    });

    phoneInput.addEventListener("input", function () {
      const val = this.value.trim();
      const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;

      if (!phoneRegex.test(val)) {
        document.getElementById("err-phone").innerText =
          "SĐT không hợp lệ (Phải là 10 con số, bắt đầu bằng 03, 05, 07, 08, 09)";
      } else {
        document.getElementById("err-phone").innerText = "";
      }

      validateForm();
    });

    cccdInput.addEventListener("input", function () {
      const val = this.value.trim();
      const cccdRegex = /^[0-9]{12}$/;

      if (!cccdRegex.test(val)) {
        document.getElementById("err-cccd").innerText =
          "CCCD không hợp lệ (Phải nhập đúng 12 con số)";
      } else {
        document.getElementById("err-cccd").innerText = "";
      }

      validateForm();
    });

    // đóng Modal
    document.getElementById("closeModal").onclick = () =>
      (bookingModal.style.display = "none");

    document.addEventListener("click", (event) => {
      if (event.target.id === "bookingModal") {
        bookingModal.style.display = "none";
      }
    });

    const confirmBtn = document.getElementById("btn-confirm-booking");
    function validateForm() {
      const nameVal = nameInput.value.trim();
      const phoneVal = phoneInput.value.trim();
      const cccdVal = cccdInput.value.trim();

      const isEmpty = nameVal === "" || phoneVal === "" || cccdVal === "";

      const hasError =
        document.getElementById("err-name").innerText !== "" ||
        document.getElementById("err-phone").innerText !== "" ||
        document.getElementById("err-cccd").innerText !== "";

      confirmBtn.disabled = isEmpty || hasError;
    }
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        console.log("clicked", confirmBtn.disabled);
        processPayment(tourId, this);
      });
    }
  }
}
window.changeQty = function (type, val) {
  const adultEl = document.getElementById("qty-adult");
  const childEl = document.getElementById("qty-child");

  let aQty = parseInt(adultEl.innerText);
  let cQty = parseInt(childEl.innerText);

  let nextAdult = type === "adult" ? Math.max(1, aQty + val) : aQty;
  let nextChild = type === "child" ? Math.max(0, cQty + val) : cQty;

  if (val > 0 && nextAdult + nextChild > currentMaxSeats) {
    return;
  }

  adultEl.innerText = nextAdult;
  childEl.innerText = nextChild;

  updateButtonStates(nextAdult, nextChild);
  updateTotal();
};
function updateButtonStates(aQty, cQty) {
  const total = aQty + cQty;
  const plusButtons = document.querySelectorAll("button[onclick*=', 1']");
  const minusAdult = document.querySelector(
    "button[onclick=\"changeQty('adult', -1)\"]",
  );
  const minusChild = document.querySelector(
    "button[onclick=\"changeQty('child', -1)\"]",
  );

//mở khóa nút cộng
  plusButtons.forEach((btn) => {
    if (total >= currentMaxSeats) {
      btn.style.opacity = "0.3";
      btn.style.cursor = "not-allowed";
    } else {
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
    }
  });

//khóa nút trừ ng lớn
  if (aQty <= 1) {
    minusAdult.style.opacity = "0.3";
    minusAdult.style.cursor = "not-allowed";
  } else {
    minusAdult.style.opacity = "1";
    minusAdult.style.cursor = "pointer";
  }

//khóa nút trừ trẻ em 
  if (cQty <= 0) {
    minusChild.style.opacity = "0.3";
    minusChild.style.cursor = "not-allowed";
  } else {
    minusChild.style.opacity = "1";
    minusChild.style.cursor = "pointer";
  }
}

function updateTotal() {
  const aQty = parseInt(document.getElementById("qty-adult").innerText);
  const cQty = parseInt(document.getElementById("qty-child").innerText);
  const total = aQty * currentAdultPrice + cQty * (currentAdultPrice * 0.7);

  document.getElementById("total-qty").innerText = aQty + cQty;
  document.getElementById("total-amount").innerText =
    total.toLocaleString() + " VNĐ";
  // document.getElementById("btn-confirm-booking").disabled = false;
  // document.getElementById("btn-confirm-booking").classList.add("active");
}

loadDetail();
