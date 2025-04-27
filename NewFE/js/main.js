// Kiểm tra email hợp lệ (regex đơn giản)
function isValidEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

// Hàm validate form đặt lịch
function validateForm() {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;

function showPopup(message) {
  document.getElementById('popup-message').innerText = message;
  document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

  if (!name || !email || !date || !time) {
    showPopup('Vui lòng điền đầy đủ các trường bắt buộc.');
    return false;
  }

  if (!isValidEmail(email)) {
    showPopup('Email không hợp lệ. Vui lòng nhập lại.');
    return false;
  }

  // Có thể thêm logic gửi dữ liệu về server tại đây
  showPopup('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');

  // Reset form nếu muốn
  document.getElementById('formBooking').reset();

  return false; // Chặn submit mặc định (nếu chưa kết nối backend)
}

// <!-- Xử lí logic chọn vai trò -->
// Lưu vai trò vào localStorage
function setRole(role) {
  document.addEventListener("DOMContentLoaded", function () {
    const roleSelect = document.getElementById("roleSelect");

    // Nếu đã lưu vai trò, tự động chọn
    const savedRole = localStorage.getItem("userRole");
    if (savedRole && roleSelect) {
      roleSelect.value = savedRole;
    }

    roleSelect.addEventListener("change", function () {
      const role = roleSelect.value;
      localStorage.setItem("userRole", role); // Lưu vai trò vào localStorage

      if (role === "user") {
        alert("Bạn đã chọn vai trò Người dùng.");
        window.location.href = "../index.html";
      } else if (role === "admin") {
        alert("Bạn đã chọn vai trò Admin. Chuyển đến trang quản trị.");
        window.location.href = "admin.html";
      }
    });
  });
}