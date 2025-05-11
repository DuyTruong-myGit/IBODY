const user = JSON.parse(localStorage.getItem("user"));

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




document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  if (!id) {
    alert("Không tìm thấy chuyên gia.");
    window.location.href = "search-expert.html";
    return;
  }
  

  // Lấy thông tin chi tiết chuyên gia
  const res = await fetch(`http://localhost:5221/api/tu-van/chuyen-gia/${id}`);
  const data = await res.json();

  document.getElementById("expertName").textContent = data.hoTen;
  document.getElementById("expertEmail").textContent = data.email;
  document.getElementById("expertChuyenMon").textContent = data.chuyenMon;
  document.getElementById("expertKinhNghiem").textContent = data.soNamKinhNghiem;
  document.getElementById("expertChungChi").textContent = data.soChungChi;
  document.getElementById("expertGioiThieu").textContent = data.gioiThieu;

  // Thời gian rảnh
  const thoiGianList = document.getElementById("expertThoiGianRanh");
  data.thoiGianRanh.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.thuTrongTuan}: ${t.tu} - ${t.den}`;
    thoiGianList.appendChild(li);
  });

  // Lấy thống kê đánh giá (điểm TB và số lượng)
  const thongKeRes = await fetch(`http://localhost:5221/api/tu-van/avgDanhGia/${id}`);
  const thongKe = await thongKeRes.json();
  const diem = thongKe.diemTrungBinh ?? 0;
  const soDanhGia = thongKe.soLuongDanhGia ?? 0;

  const ratingText = `⭐ ${diem} (${soDanhGia} đánh giá)`;
  document.querySelector(".expert-rating").textContent = ratingText;

  // Danh sách đánh giá
  const danhGiaList = document.getElementById("expertDanhGia");
  if (data.danhGia.length === 0) {
    danhGiaList.innerHTML = "<li>Chưa có đánh giá nào.</li>";
  } else {
    data.danhGia.forEach(dg => {
      const li = document.createElement("li");
      li.classList.add("danhgia-item");
      li.innerHTML = `<strong>${dg.nguoiDanhGia}</strong>: ${dg.diemSo}/5<br><em>"${dg.nhanXet}"</em>`;
      danhGiaList.appendChild(li);
    });
  }

  // Toggle dropdown khi nhấn tiêu đề "Đánh giá"
  const danhGiaTitle = document.querySelector(".expert-sidebar h3");
  danhGiaTitle.style.cursor = "pointer";
  danhGiaTitle.addEventListener("click", () => {
    danhGiaList.classList.toggle("hidden");
  });
});

function datLich() {
  const id = new URLSearchParams(window.location.search).get("id");
  window.location.href = `datLich.html?chuyenGiaId=${id}`;
}



// ✅ Xử lý dropdown menu người dùng
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
