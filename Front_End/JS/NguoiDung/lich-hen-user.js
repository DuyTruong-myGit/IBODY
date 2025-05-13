// const API_BASE = "http://localhost:5221/api";
// const user = JSON.parse(localStorage.getItem("user"));

// // ✅ Nếu chưa đăng nhập → redirect
// if (!user) {
//   alert("Vui lòng đăng nhập để tiếp tục.");
//   window.location.href = "../index.html";
// }

// // ✅ Giao diện người dùng (avatar + tên)
// document.addEventListener("DOMContentLoaded", () => {
//   const loginLink = document.getElementById("loginLink");
//   const userMenu = document.getElementById("userMenu");
//   const usernameDisplay = document.getElementById("usernameDisplay");
//   const avatarImg = document.querySelector(".user-button img");

//   if (user && loginLink && userMenu && usernameDisplay) {
//     loginLink.style.display = "none";
//     userMenu.style.display = "inline-block";
//     usernameDisplay.innerText = user.fullName || user.username;

//     if (avatarImg) {
//       avatarImg.src = user.avatarUrl
//         ? `http://localhost:5221${user.avatarUrl}`
//         : "../../img/default-avatar.png";
//     }
//   } else {
//     if (userMenu) userMenu.style.display = "none";
//   }
// });

// // ✅ Load danh sách lịch hẹn
// const lichHenListEl = document.getElementById("lichHenList");

// function mapTrangThai(trangThai) {
//   switch (trangThai) {
//     case "cho_duyet": return "Chờ duyệt";
//     case "cho_thanh_toan": return "Chờ thanh toán";
//     case "da_thanh_toan": return "Đã thanh toán";
//     case "da_huy": return "Đã hủy";
//     case "da_dien_ra": return "Đã diễn ra";
//     default: return trangThai;
//   }
// }

// function goToThanhToan(lichHenId) {
//   window.location.href = `thanh-toan.html?lichHenId=${lichHenId}`;
// }

// function isPast(dateTimeStr) {
//   const now = new Date();
//   const time = new Date(dateTimeStr);
//   return time < now;
// }

// async function loadLichHen() {
//   try {
//     const profileRes = await fetch(`${API_BASE}/user/profile/${user.taiKhoanId}`);
//     const profileData = await profileRes.json();
//     const nguoiDungId = profileData.id;

//     const res = await fetch(`${API_BASE}/lich-trinh/nguoi-dung/${nguoiDungId}`);
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.message || "Lỗi tải lịch hẹn");

//     if (data.length === 0) {
//       lichHenListEl.innerHTML = "<p>Bạn chưa có lịch hẹn nào.</p>";
//       return;
//     }

//     lichHenListEl.innerHTML = data.map(lh => {
//       const isOld = isPast(lh.thoiGianKetThuc);
//       const isDuyet = lh.trangThai === 'cho_thanh_toan';

//       return `
//         <div class="lich-hen-item ${isDuyet ? 'highlight' : ''} ${isOld ? 'lich-qua' : ''}">
//           <h4>${lh.chuyenGia?.hoTen || "Chuyên gia ẩn danh"}</h4>
//           <p><strong>Thời gian:</strong> ${new Date(lh.thoiGianBatDau).toLocaleString()} → ${new Date(lh.thoiGianKetThuc).toLocaleTimeString()}</p>
//           <p><strong>Trạng thái:</strong> ${mapTrangThai(lh.trangThai)}</p>
//           <p><strong>Hình thức:</strong> ${lh.hinhThuc?.ten || "Không rõ"}</p>
//           <p><strong>Tóm tắt:</strong> ${lh.tomTat || "(không có)"}</p>
//           ${isDuyet ? `<button class="pay-button" onclick="goToThanhToan(${lh.id})">Thanh toán</button>` : ""}
//         </div>
//       `;
//     }).join("");
//   } catch (err) {
//     console.error("❌ Lỗi khi tải lịch hẹn:", err);
//     lichHenListEl.innerHTML = "<p>Lỗi tải lịch hẹn.</p>";
//   }
// }

// document.addEventListener("DOMContentLoaded", loadLichHen);

// // ✅ Toggle dropdown user
// function toggleUserDropdown() {
//   const dropdown = document.getElementById("userDropdown");
//   dropdown.classList.toggle("show");
// }

// document.addEventListener("click", function (e) {
//   const menu = document.getElementById("userMenu");
//   const dropdown = document.getElementById("userDropdown");
//   if (menu && !menu.contains(e.target)) {
//     dropdown.classList.remove("show");
//   }
// });

// function logout() {
//   localStorage.removeItem("user");
//   alert("Đăng xuất thành công!");
//   window.location.href = "../index.html";
// }
const API_BASE = "http://localhost:5221/api";  // Đảm bảo đúng URL API của bạn
const user = JSON.parse(localStorage.getItem("user"));

// ✅ Nếu chưa đăng nhập → redirect
if (!user) {
  alert("Vui lòng đăng nhập để tiếp tục.");
  window.location.href = "../index.html";
}

// ✅ Giao diện người dùng (avatar + tên)
document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("loginLink");
  const userMenu = document.getElementById("userMenu");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const avatarImg = document.querySelector(".user-button img");

  if (user && loginLink && userMenu && usernameDisplay) {
    loginLink.style.display = "none";
    userMenu.style.display = "inline-block";
    usernameDisplay.innerText = user.fullName || user.username;

    if (avatarImg) {
      avatarImg.src = user.avatarUrl
        ? `http://localhost:5221${user.avatarUrl}`
        : "../../img/default-avatar.png";
    }
  } else {
    if (userMenu) userMenu.style.display = "none";
  }
});

// ✅ Tải danh sách lịch hẹn và lịch sử tư vấn
const lichHenListEl = document.getElementById("lichHenList");
const lichSuTuVanListEl = document.getElementById("lichSuTuVanList");

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

// ✅ Lấy lịch sử tư vấn
async function loadLichSuTuVan() {
  try {
    const profileRes = await fetch(`${API_BASE}/user/profile/${user.taiKhoanId}`);
    const profileData = await profileRes.json();
    const nguoiDungId = profileData.id;

    const res = await fetch(`${API_BASE}/lich-trinh/nguoi-dung/${nguoiDungId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi tải lịch sử tư vấn");

    if (data.length === 0) {
      lichSuTuVanListEl.innerHTML = "<p>Bạn chưa có lịch sử tư vấn nào.</p>";
      return;
    }

    lichSuTuVanListEl.innerHTML = data.filter(lh => lh.trangThai === 'da_dien_ra').map(lh => {
      return `
        <div class="lich-hen-item">
          <h4>${lh.chuyenGia?.hoTen || "Chuyên gia ẩn danh"}</h4>
          <p><strong>Thời gian:</strong> ${new Date(lh.thoiGianBatDau).toLocaleString()} → ${new Date(lh.thoiGianKetThuc).toLocaleTimeString()}</p>
          <p><strong>Trạng thái:</strong> ${mapTrangThai(lh.trangThai)}</p>
          <p><strong>Hình thức:</strong> ${lh.hinhThuc?.ten || "Không rõ"}</p>
          <p><strong>Tóm tắt:</strong> ${lh.tomTat || "(không có)"}</p>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("❌ Lỗi khi tải lịch sử tư vấn:", err);
    lichSuTuVanListEl.innerHTML = "<p>Lỗi tải lịch sử tư vấn.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadLichHen();
  loadLichSuTuVan(); // Gọi hàm để tải lịch sử tư vấn
});
