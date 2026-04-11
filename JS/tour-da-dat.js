import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const orderListEl = document.getElementById("orderList");
const orderCountEl = document.getElementById("orderCount");
const statusFilter = document.getElementById("statusFilter");

let allOrders = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./dang-nhap.html";
    return;
  }
  await fetchMyOrders(user.uid);
});

async function fetchMyOrders(uid) {
  orderListEl.innerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2">Đang tải danh sách...</p></div>';

  try {
    const q = query(collection(db, "orders"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);

    allOrders = [];
    querySnapshot.forEach((doc) => {
      allOrders.push(doc.data());
    });

    // Sắp xếp
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    renderOrders(allOrders);
  } catch (error) {
    console.error("Lỗi lấy danh sách đơn hàng:", error);
    orderListEl.innerHTML =
      '<p class="text-danger text-center">Có lỗi xảy ra khi tải dữ liệu!</p>';
  }
}

// Render ra giao diện
function renderOrders(ordersData) {
  orderCountEl.innerText = `Tìm thấy ${ordersData.length} đặt tour`;

  if (ordersData.length === 0) {
    orderListEl.innerHTML = `
            <div class="text-center text-muted p-5 border rounded bg-light">
                <i class="fa-solid fa-box-open fs-1 mb-3"></i>
                <p>Bạn chưa có đơn đặt tour nào ở trạng thái này.</p>
                <a href="./index.html" class="btn btn-outline-primary mt-2 btn-index">Khám phá tour ngay</a>
            </div>`;
    return;
  }

  let html = "";
  ordersData.forEach((order) => {
    const isPaid = order.status === "PAID";

    // Nhãn
    const statusBadge = isPaid
      ? '<span class="badge" style="background-color: #dcfce7; color: #16a34a; padding: 6px 12px; font-weight: 600;">ĐÃ THANH TOÁN</span>'
      : '<span class="badge" style="background-color: #fef08a; color: #854d0e; padding: 6px 12px; font-weight: 600;">CHỜ THANH TOÁN</span>';

    const dateStr = new Date(order.createdAt).toLocaleDateString("vi-VN");
    const childText =
      order.guests.children > 0 ? `, ${order.guests.children} trẻ em` : "";

    html += `
            <div class="card shadow-sm border-1" style="border-radius: 12px;">
                <div class="card-body p-3 p-md-4">
                    <div class="row align-items-center">
                        <div class="col-12 col-md-3 mb-3 mb-md-0">
                            <img src="${order.tourImg}" class="img-fluid rounded" alt="${order.tourName}" 
                                 style="object-fit: cover; height: 140px; width: 100%;">
                        </div>
                        
                        <div class="col-12 col-md-6">
                            <div class="text-muted small mb-1">Đơn hàng: #${order.orderId}</div>
                            <h5 class="fw-bold mb-2">${order.tourName}</h5>
                            <div class="text-danger fw-bold fs-5 mb-3">${order.totalAmount.toLocaleString()} đ</div>
                            <div>${statusBadge}</div>
                        </div>

                        <div class="col-12 col-md-3 text-md-end d-flex flex-column justify-content-between h-100 mt-3 mt-md-0">
                            <div>
                                <div class="text-muted small mb-1">Ngày đặt: ${dateStr}</div>
                                <div class="text-muted small">${order.guests.adults} người lớn${childText}</div>
                            </div>
                            <div class="mt-3">
                                <button class="btn btn-link text-decoration-none fw-bold p-0 text-dark" 
                                        onclick="viewOrderDetail('${order.orderId}')">
                                    Xem chi tiết &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });

  orderListEl.innerHTML = html;
}

// BỘ LỌC
if (statusFilter) {
  statusFilter.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val === "ALL") {
      renderOrders(allOrders);
    } else {
      const filtered = allOrders.filter((o) => o.status === val);
      renderOrders(filtered);
    }
  });
}

// Đóng modal chi tiết
window.closeOrderDetailModal = function () {
  document.getElementById("orderDetailModal").style.display = "none";
};
document.addEventListener("click", (event) => {
  if (event.target === document.getElementById("orderDetailModal")) {
    document.getElementById("orderDetailModal").style.display = "none";
  }
});

// MỞ MODAL VÀ ĐỔ DỮ LIỆU
window.viewOrderDetail = function (orderId) {
  const order = allOrders.find((o) => o.orderId === orderId);
  if (!order) {
    alert("Không tìm thấy thông tin đơn hàng!");
    return;
  }

  const isPaid = order.status === "PAID";
  const totalVND = order.totalAmount.toLocaleString() + " đ";

  // Cập nhật Trạng thái và Tóm tắt
  const statusEl = document.getElementById("detail-status");
  if (isPaid) {
    statusEl.innerHTML =
      '<i class="fa-solid fa-circle-check me-2"></i>ĐÃ THANH TOÁN';
    statusEl.className = "fw-bold mb-3 text-success";
  } else {
    statusEl.innerHTML =
      '<i class="fa-solid fa-circle-exclamation me-2"></i>CHỜ THANH TOÁN';
    statusEl.className = "fw-bold mb-3 text-warning";
  }

  document.getElementById("detail-id").innerText = "#" + order.orderId;
  document.getElementById("detail-created").innerText = new Date(
    order.createdAt,
  ).toLocaleDateString("vi-VN");
  document.getElementById("detail-total-top").innerText = totalVND;

  // Thông tin Tour
  document.getElementById("detail-tour-name").innerText = order.tourName;
  document.getElementById("detail-tour-date").innerText =
    order.tourDate || "Đang cập nhật";
  const avgPrice =
    Math.round(order.totalAmount / order.guests.total).toLocaleString() + " đ";
  document.getElementById("detail-tour-price").innerText =
    avgPrice + " / khách";

  document.getElementById("detail-cus-name").innerText = order.customer.name;
  document.getElementById("detail-cus-phone").innerText = order.customer.phone;
  document.getElementById("detail-cus-cccd").innerText = order.customer.cccd;

  document.getElementById("detail-qty-adult").innerText =
    "x" + order.guests.adults;
  document.getElementById("detail-qty-child").innerText =
    "x" + order.guests.children;
  document.getElementById("detail-qty-total").innerText =
    order.guests.total + " người";
  document.getElementById("detail-notes").innerText =
    order.customer.note || "Không có ghi chú";

  document.getElementById("detail-amount-sub").innerText = totalVND;
  document.getElementById("detail-amount-total").innerText = totalVND;

  // Xử lý hiển thị QR Code khi CHƯA thanh toán
  const qrSection = document.getElementById("detail-qr-section");
  if (!isPaid) {
    const bankID = "BIDV";
    const stk = "7850727692";
    const tenChuTK = "BUI THAI VY";
    const qrUrl = `https://img.vietqr.io/image/${bankID}-${stk}-compact2.png?amount=${order.totalAmount}&addInfo=${order.orderId}&accountName=${encodeURIComponent(tenChuTK)}`;

    document.getElementById("detail-qr-img").src = qrUrl;
    document.getElementById("detail-qr-code").innerText = order.orderId;
    qrSection.style.display = "block";

    document.getElementById("btn-recheck-payment").onclick = function () {
      alert(`Đang xử lý, đợi sau nhé.`);
    };
  } else {
    qrSection.style.display = "none"; // Ẩn QR đi nếu đã trả tiền
  }

  document.getElementById("orderDetailModal").style.display = "flex";
};
