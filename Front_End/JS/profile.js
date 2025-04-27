

document.addEventListener("DOMContentLoaded", () => {
    // Load user data
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Bạn cần đăng nhập.");
      window.location.href = "index.html";
      return;
    }
    loadThongTinCaNhan();
    
    // Xử lý chuyển tab
    const tabs = document.querySelectorAll(".tab-btn");
    const contents = document.querySelectorAll(".tab-content");
  
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        contents.forEach(c => c.classList.add("hidden"));
  
        tab.classList.add("active");
        const target = document.getElementById(`${tab.dataset.tab}-tab`);
        target.classList.remove("hidden");
      });
    });
  

    //////////////////////////////////
    async function loadThongTinCaNhan() {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) return;
    
      try {
        const res = await fetch(`http://localhost:5221/api/user/profile/${user.taiKhoanId}`);
        const data = await res.json();
    
        if (res.ok) {
          document.getElementById("infoHoTen").innerText = data.hoTen || "N/A";
          document.getElementById("infoEmail").innerText = data.email || "N/A";
          document.getElementById("infoGioiTinh").innerText = data.gioiTinh || "N/A";
          document.getElementById("infoNgaySinh").innerText = data.ngaySinh
            ? new Date(data.ngaySinh).toLocaleDateString()
            : "N/A";
          document.getElementById("infoMucTieu").innerText = data.mucTieuTamLy || "N/A";
        } else {
          alert(data.message || "Không tải được thông tin.");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi kết nối đến máy chủ.");
      }
    }
    


  // ======================== CẬP NHẬT THÔNG TIN NGƯỜI DÙNG ========================

const updateForm = document.getElementById("updateInfoForm");

updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Chưa đăng nhập.");

  const dto = {
    hoTen: document.getElementById("hoTen").value,
    ngaySinh: document.getElementById("ngaySinh").value || null,
    gioiTinh: document.getElementById("gioiTinh").value,
    mucTieuTamLy: document.getElementById("mucTieuTamLy").value
  };

  try {
    const res = await fetch(`http://localhost:5221/api/user/profile/${user.taiKhoanId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    });

    if (res.ok) {
      alert("Cập nhật thông tin thành công!");
    } else {
      const result = await res.json();
      alert(result.message || "Cập nhật thất bại.");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi máy chủ khi cập nhật.");
  }
});



// đổi mật khẩu
const changePasswordForm = document.getElementById("changePasswordForm");

changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return alert("Chưa đăng nhập.");

  const current = document.getElementById("currentPassword").value;
  const newPw = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmNewPassword").value;

  if (newPw !== confirm) return alert("Mật khẩu mới không khớp.");

  const dto = {
    currentPassword: current,
    newPassword: newPw
  };

  try {
    const res = await fetch(`http://localhost:5221/api/user/change-password/${user.taiKhoanId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto)
    });

    if (res.ok) {
      alert("Đổi mật khẩu thành công!");
      changePasswordForm.reset();
    } else {
      const result = await res.json();
      alert(result.message || "Đổi mật khẩu thất bại.");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi khi đổi mật khẩu.");
  }
});



// hiển thị lịch sử tư vấn
async function loadLichSuTuVan() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
  
    const container = document.getElementById("lichSuTuVanList");
    container.innerHTML = "<p>Đang tải dữ liệu...</p>";
  
    try {
      const res = await fetch(`http://localhost:5221/api/user/lichSuTuVan/${user.taiKhoanId}`);
      const data = await res.json();
  
      if (res.ok && data.length > 0) {
        container.innerHTML = data.map(item => `
          <div class="lich-tu-van-item">
            <h4>Chuyên gia: ${item.chuyenGia}</h4>
            <p>📅 ${new Date(item.thoiGianBatDau).toLocaleDateString()} – ⏰ ${new Date(item.thoiGianBatDau).toLocaleTimeString()} → ${new Date(item.thoiGianKetThuc).toLocaleTimeString()}</p>
            <p>💬 ${item.tomTat}</p>
            <p>💰 ${item.tongTien.toLocaleString()}đ | 🧾 Hóa đơn #${item.hoaDonId} | Thanh toán: ${new Date(item.thoiGianThanhToan).toLocaleString()}</p>
          </div>
        `).join("");
      } else {
        container.innerHTML = "<p>Chưa có lịch sử tư vấn nào.</p>";
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = "<p>Lỗi khi tải lịch sử tư vấn.</p>";
    }
     // ✅ Gọi khi load trang
  document.addEventListener("DOMContentLoaded", loadLichSuTuVan);
  }
  
 



// Hiển thị tên người dùng ở header
const loginLink = document.getElementById("loginLink");
const userMenu = document.getElementById("userMenu");
const usernameDisplay = document.getElementById("usernameDisplay");

if (user) {
  loginLink.style.display = "none";
  userMenu.style.display = "inline-block";
  usernameDisplay.innerText = user.fullName || user.username;
} else {
  userMenu.style.display = "none";
}





window.logout = function () {
    localStorage.removeItem("user");
    alert("Đăng xuất thành công!");
    window.location.href = "index.html";
  };
  
  window.toggleUserDropdown = function () {
    const dropdown = document.getElementById("userDropdown");
    dropdown.classList.toggle("show");
  };
  
  document.addEventListener("click", function (e) {
    const menu = document.getElementById("userMenu");
    const dropdown = document.getElementById("userDropdown");
    if (!menu.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
  
  });
  