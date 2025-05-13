let expertTaiKhoanId = null; // lưu ID tài khoản chuyên gia để dùng khi gửi báo cáo

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const user = JSON.parse(localStorage.getItem("user"));
  const loginLink = document.getElementById("loginLink");
  const userMenu = document.getElementById("userMenu");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const avatarImg = document.querySelector(".user-button img");

  if (loginLink && userMenu && usernameDisplay) {
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


  // Lấy ID chuyên gia từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const chuyenGiaId = urlParams.get("id");
  if (!chuyenGiaId) {
    alert("Không tìm thấy chuyên gia.");
    window.location.href = "search-expert.html";
    return;
  }

  // Gọi API tu-van để lấy thông tin chuyên gia
  const res = await fetch(`http://localhost:5221/api/tu-van/chuyen-gia/${chuyenGiaId}`);
  if (!res.ok) {
    alert("Không tìm thấy chuyên gia.");
    return;
  }
  const data = await res.json();

  // Hiển thị thông tin chuyên gia
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

  // Tìm taiKhoanId của chuyên gia dựa vào email
  try {
    const accountRes = await fetch("http://localhost:5221/api/admin/accounts");
    const accountData = await accountRes.json();
    expertTaiKhoanId = data.taiKhoanId; // lấy trực tiếp từ response


    // Hiển thị avatar nếu có
    if (expertTaiKhoanId) {
      const avatarRes = await fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${expertTaiKhoanId}`);
      const avatarData = await avatarRes.json();
      const avatarImg = document.querySelector(".expert-avatar");
      avatarImg.src = avatarData.avatarUrl
        ? `http://localhost:5221${avatarData.avatarUrl}`
        : "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }
  } catch (err) {
    console.error("Lỗi khi tải avatar hoặc ID chuyên gia:", err);
  }

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

  document.querySelector(".expert-sidebar h3").onclick = () => {
    danhGiaList.classList.toggle("hidden");
  };
});

// Tố cáo chuyên gia
const modal = document.getElementById("reportModal");
const openBtn = document.getElementById("openReportModalBtn");
const closeBtn = document.querySelector(".close");
const submitBtn = document.getElementById("submitReportBtn");

openBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

submitBtn.onclick = async () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const reason = document.getElementById("reportReason").value.trim();

  if (!reason) {
    alert("Vui lòng nhập lý do tố cáo.");
    return;
  }
  if (!expertTaiKhoanId) {
    alert("Không xác định được tài khoản chuyên gia.");
    return;
  }

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
    alert("⚠️ Lỗi kết nối hoặc máy chủ.");
    console.error(err);
  }
};

function datLich() {
  const id = new URLSearchParams(window.location.search).get("id");
  window.location.href = `datLich.html?chuyenGiaId=${id}`;
}

// Dropdown user
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

document.addEventListener("click", function (e) {
  const menu = document.getElementById("userMenu");
  const dropdown = document.getElementById("userDropdown");
  if (!menu.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const nav = document.querySelector(".nav");
  toggleBtn?.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
});

function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "../index.html";
}
