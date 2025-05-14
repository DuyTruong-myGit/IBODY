let expertTaiKhoanId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) {
    alert("Bạn cần đăng nhập để xem hồ sơ chuyên gia.");
    window.location.href = "../index.html";
    return;
  }

  const loginLink = document.getElementById("loginLink");
  const userMenu = document.getElementById("userMenu");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const avatarImg = document.querySelector(".user-button img");

  if (loginLink && userMenu && usernameDisplay) {
    loginLink.style.display = "none";
    userMenu.style.display = "inline-block";
    usernameDisplay.innerText = currentUser.fullName || currentUser.username;

    if (avatarImg) {
      avatarImg.src = currentUser.avatarUrl
        ? `http://localhost:5221${currentUser.avatarUrl}`
        : "../../img/default-avatar.png";
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const chuyenGiaId = urlParams.get("id");
  if (!chuyenGiaId) {
    alert("Không tìm thấy chuyên gia.");
    window.location.href = "search-expert.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:5221/api/tu-van/chuyen-gia/${chuyenGiaId}`);
    if (!res.ok) throw new Error("Không tìm thấy chuyên gia.");
    const data = await res.json();

    document.getElementById("expertName").textContent = data.hoTen;
    document.getElementById("expertEmail").textContent = data.email;
    document.getElementById("expertChuyenMon").textContent = data.chuyenMon;
    document.getElementById("expertKinhNghiem").textContent = data.soNamKinhNghiem;
    document.getElementById("expertChungChi").textContent = data.soChungChi;
    document.getElementById("expertGioiThieu").textContent = data.gioiThieu;

    // Thời gian rảnh
    const thoiGianList = document.getElementById("expertThoiGianRanh");
    data.thoiGianRanh?.forEach(t => {
      const li = document.createElement("li");
      li.textContent = `${t.thuTrongTuan}: ${t.tu} - ${t.den}`;
      thoiGianList.appendChild(li);
    });

    expertTaiKhoanId = data.taiKhoanId;

    // Avatar chuyên gia
    const avatarRes = await fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${expertTaiKhoanId}`);
    const avatarData = await avatarRes.json();
    const expertAvatarImg = document.querySelector(".expert-avatar");
    expertAvatarImg.src = avatarData.avatarUrl
      ? `http://localhost:5221${avatarData.avatarUrl}`
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // Đánh giá
    const thongKeRes = await fetch(`http://localhost:5221/api/tu-van/avgDanhGia/${chuyenGiaId}`);
    const thongKe = await thongKeRes.json();
    const diem = thongKe.diemTrungBinh ?? 0;
    const soDanhGia = thongKe.soLuongDanhGia ?? 0;
    document.querySelector(".expert-rating").textContent = `⭐ ${diem} (${soDanhGia} đánh giá)`;

    const danhGiaList = document.getElementById("expertDanhGia");
    if (!data.danhGia || data.danhGia.length === 0) {
      danhGiaList.innerHTML = "<li>Chưa có đánh giá nào.</li>";
    } else {
      data.danhGia.forEach(dg => {
        const li = document.createElement("li");
        li.classList.add("danhgia-item");
        li.innerHTML = `<strong>${dg.nguoiDanhGia}</strong>: ${dg.diemSo}/5<br><em>"${dg.nhanXet}"</em>`;
        danhGiaList.appendChild(li);
      });
    }

    document.querySelector(".expert-sidebar h3")?.addEventListener("click", () => {
      danhGiaList.classList.toggle("hidden");
    });

  } catch (err) {
    console.error("Lỗi tải chuyên gia:", err);
    alert("Lỗi khi tải thông tin chuyên gia.");
  }
});

// Tố cáo chuyên gia
const modal = document.getElementById("reportModal");
const openBtn = document.getElementById("openReportModalBtn");
const closeBtn = document.querySelector(".close");
const submitBtn = document.getElementById("submitReportBtn");

openBtn?.addEventListener("click", () => modal.style.display = "block");
closeBtn?.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

submitBtn?.addEventListener("click", async () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const reason = document.getElementById("reportReason").value.trim();

  if (!reason) return alert("Vui lòng nhập lý do tố cáo.");
  if (!expertTaiKhoanId) return alert("Không xác định được tài khoản chuyên gia.");

  try {
    const response = await fetch('http://localhost:5221/api/bao-cao/gui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nguoiBaoCaoId: currentUser.id,
        chuyenGiaTaiKhoanId: expertTaiKhoanId,
        lyDo: reason
      })
    });

    const text = await response.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { message: text };
    }

    if (response.ok) {
      alert(result.message || "Đã gửi báo cáo.");
      modal.style.display = "none";
      document.getElementById("reportReason").value = '';
    } else {
      alert("❌ Lỗi: " + (result.message || "Không rõ nguyên nhân."));
    }
  } catch (err) {
    console.error(err);
    alert("⚠️ Lỗi kết nối hoặc máy chủ.");
  }
});

// Đặt lịch
function datLich() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (id) window.location.href = `datLich.html?chuyenGiaId=${id}`;
}

// Dropdown
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown?.classList.toggle("show");
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("userMenu");
  const dropdown = document.getElementById("userDropdown");
  if (menu && !menu.contains(e.target)) {
    dropdown?.classList.remove("show");
  }
});

document.getElementById("menu-toggle")?.addEventListener("click", () => {
  document.querySelector(".nav")?.classList.toggle("open");
});

function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "../index.html";
}
