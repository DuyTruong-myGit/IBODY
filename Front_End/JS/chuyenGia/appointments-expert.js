document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.taiKhoanId || !user.roles.includes("chuyen_gia")) {
    alert("Bạn không có quyền truy cập trang này.");
    return (window.location.href = "../index.html");
  }

  const listDangDienRaEl = document.getElementById("lichDangDienRa");
  const listChoDuyetEl = document.getElementById("lichChoDuyet");

  try {
    const profileRes = await fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${user.taiKhoanId}`);
    if (!profileRes.ok) throw new Error("Không thể lấy thông tin chuyên gia");

    const profileData = await profileRes.json();
    const chuyenGiaId = profileData.id;

    // 🔵 Lịch đang diễn ra
    const res1 = await fetch(`http://localhost:5221/api/lich-hen/chuyen-gia/${chuyenGiaId}?taiKhoanId=${user.taiKhoanId}&trangThai=da_dien_ra`);
    if (!res1.ok) throw new Error("Không thể tải lịch đang diễn ra");
    const list1 = await res1.json();

    listDangDienRaEl.innerHTML = list1.length === 0 ? "<p>Không có lịch đang diễn ra.</p>" : list1.map(item => `
      <div class="lich-item">
        <h4>Khách hàng: ${item.nguoiDatLich?.hoTen || "Ẩn danh"}</h4>
        <p><strong>Thời gian:</strong> ${formatDate(item.thoiGianBatDau)} → ${formatTime(item.thoiGianKetThuc)}</p>
        <p><strong>Hình thức:</strong> ${item.hinhThuc}</p>
        <p><strong>Tóm tắt:</strong> ${item.tomTat || "Không có"}</p>
        <div class="btn-group">
          <button onclick="hoanTat(${item.id})">✅ Hoàn tất</button>
          <button onclick="huyLich(${item.id})">❌ Hủy</button>
        </div>
      </div>
    `).join("");

    // 🟡 Lịch chờ duyệt
    const res2 = await fetch(`http://localhost:5221/api/lich-hen/chuyen-gia/${chuyenGiaId}?taiKhoanId=${user.taiKhoanId}&trangThai=cho_duyet`);
    if (!res2.ok) throw new Error("Không thể tải lịch chờ duyệt");
    const list2 = await res2.json();

    listChoDuyetEl.innerHTML = list2.length === 0 ? "<p>Không có lịch chờ duyệt.</p>" : list2.map(item => `
      <div class="lich-item">
        <h4>Khách hàng: ${item.nguoiDatLich?.hoTen || "Ẩn danh"}</h4>
        <p><strong>Thời gian:</strong> ${formatDate(item.thoiGianBatDau)} → ${formatTime(item.thoiGianKetThuc)}</p>
        <p><strong>Hình thức:</strong> ${item.hinhThuc}</p>
        <p><strong>Tóm tắt:</strong> ${item.tomTat || "Không có"}</p>
        <div class="btn-group">
          <button onclick="duyetLich(${item.id})">✅ Duyệt</button>
          <button onclick="tuChoi(${item.id})">❌ Từ chối</button>
        </div>
      </div>
    `).join("");

  } catch (err) {
    listDangDienRaEl.innerHTML = listChoDuyetEl.innerHTML = `<p style="color:red;">❌ ${err.message}</p>`;
  }
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("vi-VN");
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
}

async function duyetLich(id) {
  if (!confirm("Xác nhận duyệt lịch này?")) return;
  try {
    const res = await fetch(`http://localhost:5221/api/lich-hen/duyet-lich/${id}`, { method: "POST" });
    const data = await res.json();
    alert(data.message || "Đã duyệt lịch.");
    location.reload();
  } catch (err) {
    alert("Lỗi khi duyệt lịch.");
  }
}

async function tuChoi(id) {
  if (!confirm("Bạn có chắc muốn từ chối lịch này?")) return;
  try {
    const res = await fetch(`http://localhost:5221/api/lich-hen/tu-choi-lich/${id}`, { method: "POST" });
    const data = await res.json();
    alert(data.message || "Đã từ chối lịch.");
    location.reload();
  } catch (err) {
    alert("Lỗi khi từ chối lịch.");
  }
}

async function hoanTat(id) {
  if (!confirm("Xác nhận hoàn tất buổi tư vấn?")) return;
  try {
    const res = await fetch(`http://localhost:5221/api/lich-hen/hoan-tat/${id}`, { method: "POST" });
    const data = await res.json();
    alert(data.message || "Đã hoàn tất buổi tư vấn.");
    location.reload();
  } catch (err) {
    alert("Lỗi khi hoàn tất lịch.");
  }
}

async function huyLich(id) {
  if (!confirm("Bạn chắc chắn muốn hủy lịch này?")) return;
  const user = JSON.parse(localStorage.getItem("user"));
  try {
    const res = await fetch(`http://localhost:5221/api/lich-hen/huy-lich-chuyen-gia/${id}?taiKhoanId=${user.taiKhoanId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    alert(data.message || "Đã hủy lịch.");
    location.reload();
  } catch (err) {
    alert("Lỗi khi hủy lịch.");
  }
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "../index.html";
}