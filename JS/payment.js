import { auth, db } from "./firebase.js";
import {
  doc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

let orderId = null;

// Tạo mã đơn hàng ngẫu nhiên
function generateOrderId() {
  return "DH" + Date.now();
}

// Hàm chính xử lý thanh toán
export async function processPayment(tourId, btnConfirm) {
  const user = auth.currentUser;
  const nameVal = document.getElementById("cus-name").value.trim();
  const phoneVal = document.getElementById("cus-phone").value.trim();
  const cccdVal = document.getElementById("cus-cccd").value.trim();
  const noteVal = document.getElementById("special-notes").value.trim();

  btnConfirm.disabled = true;
  btnConfirm.innerText = "Đang tạo đơn...";

  orderId = generateOrderId();
  const totalAmount = parseInt(
    document.getElementById("total-amount").innerText.replace(/[^\d]/g, ""),
  );
  const aQty = parseInt(document.getElementById("qty-adult").innerText);
  const cQty = parseInt(document.getElementById("qty-child").innerText);
  const tourDate = document.getElementById("modal-date").innerText;

  const orderData = {
    orderId: orderId,
    userId: user.uid,
    tourId: tourId,
    tourName: document.getElementById("modal-title").innerText,
    tourImg: document.getElementById("modal-img").src,
    tourDate: tourDate,
    customer: { name: nameVal, phone: phoneVal, cccd: cccdVal, note: noteVal },
    guests: { adults: aQty, children: cQty, total: aQty + cQty },
    totalAmount: totalAmount,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };

  try {
    // LƯU ĐƠN HÀNG VÀO FIRESTORE
    await setDoc(doc(db, "orders", orderId), orderData);

    // HIỂN THỊ MODAL QR CODE

    document.getElementById("qr-code-img").src = "../IMG/qr.png";
    document.getElementById("pay-amount").innerText =
      totalAmount.toLocaleString() + " VNĐ";
    document.getElementById("pay-order-id").innerText = orderId;

    document.getElementById("bookingModal").style.display = "none";
    document.getElementById("paymentModal").style.display = "flex";
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    alert("Có lỗi xảy ra khi tạo đơn. Vui lòng thử lại!");
  } finally {
    btnConfirm.disabled = false;
    btnConfirm.innerText = "Tiếp tục thanh toán";
  }
}

// Xử lý các nút đóng Modal
export function initPaymentModals() {
  const paymentModal = document.getElementById("paymentModal");
  document.getElementById("closePaymentModal").onclick = () => {
    paymentModal.style.display = "none";
  };

  document.addEventListener("click", (event) => {
    if (event.target.id === "paymentModal") {
      paymentModal.style.display = "none";
    }
  });

  document.getElementById("btn-paid-status").onclick = async function () {
    if (!orderId) {
      return;
    }
    this.innerText = "Đang xac nhận...";
    this.disabled = true;

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "PAID",
        paidAt: new Date().toISOString(),
      });
      window.location.href = "./tour-da-dat.html";
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert("Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại!");
      this.innerText = "Đã thanh toán";
      this.disabled = false;
    }
  };

  document.getElementById("btn-pay-later").onclick = () => {
    window.location.href = "./tour-da-dat.html";
  };
}
