document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Bạn cần đăng nhập.");
    window.location.href = "index.html";
    return;
  }

  // ====== 1. Hiển thị tên người dùng ======
  const loginLink = document.getElementById("loginLink");
  const userMenu = document.getElementById("userMenu");
  const usernameDisplay = document.getElementById("usernameDisplay");

  if (loginLink && userMenu && usernameDisplay) {
    loginLink.style.display = "none";
    userMenu.style.display = "inline-block";
    usernameDisplay.innerText = user.fullName || user.username;
  }

  // ====== 2. Tải thông tin cá nhân ======
  async function loadThongTinCaNhan() {
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

  loadThongTinCaNhan();


  // ====== 3. Cập nhật thông tin người dùng ======
  const updateForm = document.getElementById("updateInfoForm");
  if (updateForm) {
    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dto = {
        hoTen: document.getElementById("hoTen").value,
        ngaySinh: document.getElementById("ngaySinh").value || null,
        gioiTinh: document.getElementById("gioiTinh").value,
        mucTieuTamLy: document.getElementById("mucTieuTamLy").value,
      };

      try {
        const res = await fetch(`http://localhost:5221/api/user/profile/${user.taiKhoanId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dto),
        });

        const result = await res.json();
        if (res.ok) {
          alert("Cập nhật thông tin thành công!");
        } else {
          alert(result.message || "Cập nhật thất bại.");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi máy chủ khi cập nhật.");
      }
    });
  }

  // ====== 4. Đổi mật khẩu ======
  const changePasswordForm = document.getElementById("changePasswordForm");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const current = document.getElementById("currentPassword").value;
      const newPw = document.getElementById("newPassword").value;
      const confirm = document.getElementById("confirmNewPassword").value;

      if (newPw !== confirm) return alert("Mật khẩu mới không khớp.");

      try {
        const res = await fetch(`http://localhost:5221/api/user/change-password/${user.taiKhoanId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: current,
            newPassword: newPw,
          }),
        });

        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (res.ok) {
            alert(data.message || "Đổi mật khẩu thành công.");
          } else {
            alert(data.message || "Đổi mật khẩu thất bại.");
          }
        } catch (e) {
          console.error("Phản hồi không hợp lệ JSON:", text);
          alert("Lỗi máy chủ: phản hồi không hợp lệ.");
        }
      } catch (err) {
        console.error("Lỗi mạng:", err);
        alert("Không thể kết nối đến máy chủ.");
      }
    });
  }

  // ====== 5. Tải lịch sử tư vấn ======
  async function loadLichSuTuVan() {
    const container = document.getElementById("lichSuTuVanList");
    if (!container) return;

    container.innerHTML = "<p>Đang tải dữ liệu...</p>";

    try {
      const res = await fetch(`http://localhost:5221/api/user/lichSuTuVan/${user.taiKhoanId}`);
      const data = await res.json();

      if (res.ok && data.length > 0) {
        container.innerHTML = data
          .map(
            (item) => `
            <div class="lich-tu-van-item">
              <h4>Chuyên gia: ${item.chuyenGia}</h4>
              <p>📅 ${new Date(item.thoiGianBatDau).toLocaleDateString()} – ⏰ ${new Date(item.thoiGianBatDau).toLocaleTimeString()} → ${new Date(item.thoiGianKetThuc).toLocaleTimeString()}</p>
              <p>💬 ${item.tomTat}</p>
              <p>💰 ${item.tongTien.toLocaleString()}đ | 🧾 Hóa đơn #${item.hoaDonId} | Thanh toán: ${new Date(item.thoiGianThanhToan).toLocaleString()}</p>
            </div>
          `
          )
          .join("");
      } else {
        container.innerHTML = "<p>Chưa có lịch sử tư vấn nào.</p>";
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = "<p>Lỗi khi tải lịch sử tư vấn.</p>";
    }
  }

  loadLichSuTuVan();

  // ====== 6. Chuyển tab giao diện ======
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.add("hidden"));

      tab.classList.add("active");
      const target = document.getElementById(`${tab.dataset.tab}-tab`);
      if (target) target.classList.remove("hidden");
    });
  });

  // ====== 7. Logout & dropdown user menu ======
  window.logout = function () {
    localStorage.removeItem("user");
    alert("Đăng xuất thành công!");
    window.location.href = "index.html";
  };

  window.toggleUserDropdown = function () {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown) dropdown.classList.toggle("show");
  };

  document.addEventListener("click", function (e) {
    const menu = document.getElementById("userMenu");
    const dropdown = document.getElementById("userDropdown");
    if (menu && dropdown && !menu.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
});
