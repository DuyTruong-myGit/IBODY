// TongHopChuyenGia.js - Dùng dữ liệu thật từ API
const BASE_API = "http://localhost:5221/api";
window.addEventListener("DOMContentLoaded", () => {
  loadIncome();
  loadAppointments();
  loadClients();
  loadRatings();
});

function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN", { minimumFractionDigits: 0 });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN") + " " + d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

async function loadIncome() {
  const localUser = JSON.parse(localStorage.getItem("user"));
  const taiKhoanId = localUser.taiKhoanId;

  const res = await fetch(`http://localhost:5221/api/chuyen-gia/hoaDonCuaChuyenGia?chuyenGiaTaiKhoanId=${taiKhoanId}`);
  const list = await res.json();
  const uniqueList = list.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.id === value.id)
  );
  
  const total = uniqueList.reduce((sum, x) => sum + x.tongTien, 0);
  document.getElementById("totalEarningsCard").innerHTML = `
    <h3>Tổng thu nhập</h3>
    <p>${formatCurrency(total)} VNĐ</p>
  `;
  
  document.getElementById("totalClientsCard").innerHTML = `
    <h3>Tổng khách hàng</h3>
    <p>${uniqueList.length} khách</p>
  `;
  
  document.getElementById("completedClientsCard").innerHTML = `
    <h3>Khách đã hoàn thành</h3>
    <p>${uniqueList.length} khách</p>
  `;
  
  const listContainer = document.getElementById("transactionList");
  listContainer.innerHTML = "";
  uniqueList.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(tx.thoiGianTao)}</td>
      <td>${formatCurrency(tx.tongTien)} VNĐ</td>
      <td>${tx.hinhThuc}</td>
    `;
    listContainer.appendChild(tr);
  });
}

async function loadAppointments() {
  const localUser = JSON.parse(localStorage.getItem("user"));
  const taiKhoanId = localUser.taiKhoanId;

  const res = await fetch(`http://localhost:5221/api/lich-hen/chuyen-gia/${taiKhoanId}?taiKhoanId=${taiKhoanId}`);
  const list = await res.json();

  const container = document.getElementById("appointmentsList");
  if (!container) return;
  container.innerHTML = "";

  list.forEach(app => {
    const card = document.createElement("div");
    card.className = "appointment-card";
    card.innerHTML = `
      <div class="appointment-info">
        <h4>${app.nguoiDatLich.hoTen}</h4>
        <p>Thời gian: ${formatDate(app.thoiGianBatDau)}</p>
        <p>Hình thức: ${app.hinhThuc}</p>
        <p>Ghi chú: ${app.tomTat}</p>
      </div>
      <div class="appointment-actions">
        <button class="btn-confirm" onclick="confirmAppointment(${app.id})">Xác nhận</button>
        <button class="btn-reject" onclick="rejectAppointment(${app.id})">Từ chối</button>
      </div>
    `;
    container.appendChild(card);
  });
}
async function loadClients() {
  const localUser = JSON.parse(localStorage.getItem("user"));
  const taiKhoanId = localUser.taiKhoanId;

  try {
    // Bước 1: ánh xạ taiKhoanId → chuyenGiaId
    const infoRes = await fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${taiKhoanId}`);
    if (!infoRes.ok) throw new Error("Không tìm thấy chuyên gia");

    const chuyenGia = await infoRes.json();
    const chuyenGiaId = chuyenGia.id;

    // Bước 2: dùng chuyenGiaId để gọi khách hàng
    const res = await fetch(`http://localhost:5221/api/chuyen-gia/khach-hang-tu-van/${chuyenGiaId}`);
    if (!res.ok) throw new Error("Không thể lấy danh sách khách hàng");

    const list = await res.json();
    renderClients(list);
  } catch (err) {
    console.error("loadClients() failed:", err);
    const table = document.getElementById("clientsList");
    if (table) {
      table.innerHTML = `<tr><td colspan="4">Không thể tải danh sách khách hàng.</td></tr>`;
    }
  }
}


function renderClients(list) {
  const tbody = document.getElementById("clientsList");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (list.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>Không có khách hàng nào.</td></tr>";
    return;
  }

  list.forEach(kh => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${kh.hoTenKhachHang}</td>
      <td>${kh.email}</td>
      <td>1</td>
      <td>${formatDate(kh.gioBatDau)}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadRatings() {
  try {
    const localUser = JSON.parse(localStorage.getItem("user"));
    const taiKhoanId = localUser.taiKhoanId;
    const response = await fetch(`${BASE_API}/chuyen-gia/danhGia/${taiKhoanId}`);
    if (!response.ok) throw new Error("Không thể lấy đánh giá");

    const ratings = await response.json();

    const ratingCard = document.getElementById("ratingCard");

    if (ratings.length === 0) {
      ratingCard.innerHTML = `<p>Chưa có đánh giá nào.</p>`;
      return;
    }

    const average = (ratings.reduce((sum, r) => sum + r.diemSo, 0) / ratings.length).toFixed(1);
    let html = `<h3>⭐ Đánh giá trung bình: ${average} / 5 (${ratings.length} lượt)</h3><ul class="rating-list">`;

    ratings.forEach(r => {
      html += `
        <li class="rating-item">
          <p><strong>${r.hoTenNguoiDung}</strong> (${new Date(r.thoiGianTuvan).toLocaleDateString()}):</p>
          <p>⭐ ${r.diemSo} - ${r.nhanXet}</p>
        </li>`;
    });

    html += `</ul>`;
    ratingCard.innerHTML = html;
  } catch (err) {
    console.error("loadRatings() failed:", err);
    document.getElementById("ratingCard").innerHTML = `<p style="color:red;">Không thể tải đánh giá.</p>`;
  }
}


function confirmAppointment(id) {
  alert("Đã xác nhận lịch hẹn: " + id);
  // Gọi API xác nhận nếu có
}

function rejectAppointment(id) {
  alert("Đã từ chối lịch hẹn: " + id);
  // Gọi API từ chối nếu có
}


function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "../index.html";
}