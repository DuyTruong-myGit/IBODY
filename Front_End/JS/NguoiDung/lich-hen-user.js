const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

const lichHenListEl = document.getElementById("lichHenList");
const API_BASE = "http://localhost:5221/api";

function mapTrangThai(trangThai) {
  switch (trangThai) {
    case "cho_duyet": return "Chờ duyệt";
    case "cho_thanh_toan": return "Chờ thanh toán";
    case "da_thanh_toan": return "Đã thanh toán";
    case "da_huy": return "Đã hủy";
    case "da_dien_ra": return "Đã diễn ra";
    default: return trangThai;
  }
}

function goToThanhToan(lichHenId) {
  window.location.href = `thanh-toan.html?lichHenId=${lichHenId}`;
}

function isPast(dateTimeStr) {
  const now = new Date();
  const time = new Date(dateTimeStr);
  return time < now;
}

async function loadLichHen() {
  try {
    // ✅ Lấy đúng ID người dùng từ tài khoản
    const profileRes = await fetch(`${API_BASE}/user/profile/${user.taiKhoanId}`);
    const profileData = await profileRes.json();
    const nguoiDungId = profileData.id;

    const res = await fetch(`${API_BASE}/lich-trinh/nguoi-dung/${nguoiDungId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi tải lịch hẹn");

    if (data.length === 0) {
      lichHenListEl.innerHTML = "<p>Bạn chưa có lịch hẹn nào.</p>";
      return;
    }

    lichHenListEl.innerHTML = data.map(lh => {
      const isOld = isPast(lh.thoiGianKetThuc);
      const isDuyet = lh.trangThai === 'cho_thanh_toan';

      return `
        <div class="lich-hen-item ${isDuyet ? 'highlight' : ''} ${isOld ? 'lich-qua' : ''}">
          <h4>${lh.chuyenGia?.hoTen || "Chuyên gia ẩn danh"}</h4>
          <p><strong>Thời gian:</strong> ${new Date(lh.thoiGianBatDau).toLocaleString()} → ${new Date(lh.thoiGianKetThuc).toLocaleTimeString()}</p>
          <p><strong>Trạng thái:</strong> ${mapTrangThai(lh.trangThai)}</p>
          <p><strong>Hình thức:</strong> ${lh.hinhThuc?.ten || "Không rõ"}</p>
          <p><strong>Tóm tắt:</strong> ${lh.tomTat || "(không có)"}</p>
          ${isDuyet ? `<button class="pay-button" onclick="goToThanhToan(${lh.id})">Thanh toán</button>` : ""}
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("❌ Lỗi khi tải lịch hẹn:", err);
    lichHenListEl.innerHTML = "<p>Lỗi tải lịch hẹn.</p>";
  }
}

document.addEventListener("DOMContentLoaded", loadLichHen);
