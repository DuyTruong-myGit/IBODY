const modal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');

function openAuthModal() {
  modal.classList.add('active');
}

function closeAuthModal() {
  modal.classList.remove('active');
}

// Ẩn modal khi bấm ra ngoài form
modal.addEventListener('click', function (e) {
  if (e.target === modal) {
    closeAuthModal();
  }
});

loginToggle.onclick = () => {
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  loginToggle.classList.add('active');
  registerToggle.classList.remove('active');
};

registerToggle.onclick = () => {
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
  registerToggle.classList.add('active');
  loginToggle.classList.remove('active');
};


// ======================== XỬ LÝ ĐĂNG KÝ ========================
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = registerForm.fullName.value;
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  const confirmPassword = registerForm.confirmPassword.value;

  if (password !== confirmPassword) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }

  const userData = {
    username: email, 
    password: password,
    fullName: fullName,
    email: email
  };

  try {
    const response = await fetch("http://localhost:5221/api/Auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    if (response.ok) {
      alert("Đăng ký thành công! Vui lòng tiếp tục hoàn tất hồ sơ.");
      closeAuthModal();
      window.location.href = "../HTML/setup-choose-role.html";
    } else {
      alert(result.message || "Đăng ký thất bại");
    }
  } catch (err) {
    console.error(err);
    alert("Lỗi kết nối máy chủ.");
  }
});

// ======================== XỬ LÝ ĐĂNG NHẬP ========================
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  const loginData = {
    username: email,
    password: password
  };

  try {
    const response = await fetch("http://localhost:5221/api/Auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    const result = await response.json();
    if (response.ok) {
      alert("Đăng nhập thành công!");
      localStorage.setItem("user", JSON.stringify(result.user)); // lưu user tạm
      closeAuthModal();
      window.location.href = "index.html"; // về trang chủ
    } else {
      alert(result.message || "Sai tài khoản hoặc mật khẩu");
    }
  } catch (err) {
    console.error(err);
    alert("Không thể kết nối đến máy chủ.");
  }
});




document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
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
});

// Xử lý sự kiện click vào nút đăng xuất


function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "index.html";
}



function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

// Ẩn dropdown khi click ra ngoài
document.addEventListener("click", function (e) {
  const menu = document.getElementById("userMenu");
  const dropdown = document.getElementById("userDropdown");
  if (!menu.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});
