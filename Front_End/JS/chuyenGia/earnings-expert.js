// Base URL API server
const API_BASE_URL = "http://localhost:5221/api";

// Kiểm tra user từ localStorage
let user = JSON.parse(localStorage.getItem("user"));
if (!user || !user.id) {
  // Nếu chưa có user, mock tạm
  user = { id: 1, fullName: "Demo User" };
  localStorage.setItem("user", JSON.stringify(user));
}

// Load dữ liệu khi mở trang
window.addEventListener("DOMContentLoaded", function () {
  loadEarnings();
  loadTransactions();
  loadClientStatus();
});

// Load tổng thu nhập
async function loadEarnings() {
  try {
    const response = await fetch(`${API_BASE_URL}/chuyen-gia/hoaDonCuaChuyenGia?chuyenGiaTaiKhoanId=${user.id}`);
    const data = await response.json();
    let total = 0;
    data.forEach(tx => total += tx.tongTien);

    document.getElementById("totalEarnings").textContent = `${formatCurrency(total)} VNĐ`;
  } catch (error) {
    console.error("Lỗi load tổng thu nhập:", error);
  }
}

// Load danh sách giao dịch
async function loadTransactions() {
  try {
    const response = await fetch(`${API_BASE_URL}/chuyen-gia/hoaDonCuaChuyenGia?chuyenGiaTaiKhoanId=${user.id}`);
    const data = await response.json();
    const listContainer = document.getElementById("transactionList");
    listContainer.innerHTML = "";

    data.forEach(tx => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDate(tx.thoiGianTao)}</td>
        <td>${formatCurrency(tx.tongTien)} VNĐ</td>
        <td>${tx.hinhThuc}</td>
      `;
      listContainer.appendChild(tr);
    });
  } catch (error) {
    console.error("Lỗi load giao dịch:", error);
  }
}

// Load số người đang khám và đã hoàn thành
async function loadClientStatus() {
  try {
    const ongoing = Math.floor(Math.random() * 5 + 1); // Giả lập đang khám
    const completed = Math.floor(Math.random() * 20 + 5); // Giả lập đã khám xong

    document.getElementById("ongoingCount").textContent = ongoing;
    document.getElementById("completedCount").textContent = completed;
  } catch (error) {
    console.error("Lỗi load tình trạng khách hàng:", error);
  }
}

// Format số tiền VNĐ
function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN");
}

// Format ngày giờ
function formatDate(raw) {
  const date = new Date(raw);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Lọc thời gian giao dịch (Tạm thời chưa xử lý vì thiếu API hỗ trợ)
document.getElementById("timeFilter").addEventListener("change", function () {
  alert("Tính năng lọc theo thời gian sẽ cập nhật sau khi có API hỗ trợ.");
});

function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "../index.html";
}