window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));


  if (user.roles && user.roles.includes("chuyen_gia")) {
    window.location.href = "../HTML/chuyengia/indexChuyenGia.html";
    return;
  }


});



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
    fullName,
    email,
    password,
    gender: null, // nếu sau này thêm select => lấy value ở đây
    dob: null     // nếu có input type="date" => lấy từ registerForm.dob.value
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
      // ✅ Sau khi đăng ký xong → tự động đăng nhập luôn
      const loginRes = await fetch("http://localhost:5221/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const loginResult = await loginRes.json();

      if (loginRes.ok) {
        localStorage.setItem("user", JSON.stringify(loginResult.user));
        alert("Đăng ký & đăng nhập thành công!");
        closeAuthModal();
        window.location.href = "index.html"; // Trang chủ
      } else {
        alert("Đăng ký thành công, nhưng tự động đăng nhập thất bại.");
      }
    } else {
      alert(result.message || "Đăng ký thất bại.");
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

  const loginData = { email, password };

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
      const user = result.user;
      console.log("USER LOGGED IN:", user);
      localStorage.setItem("user", JSON.stringify(user));

      // Kiểm tra quyền và chuyển hướng
      console.log("→ Chuẩn bị redirect... user.roles = ", user.roles);
      if (Array.isArray(user.roles)) {
        if (user.roles.includes("quan_tri")) {
          console.log("✅ Quyền admin xác thực → chuyển trang admin");
          setTimeout(() => {
            window.location.replace("../HTML/Admin/admin-dashboard.html");
          }, 100);
        } else if (user.roles.includes("chuyen_gia")) {
          console.log("✅ Quyền chuyên gia xác thực → chuyển trang chuyên gia");
          setTimeout(() => {
            window.location.replace("../HTML/chuyenGia/IndexChuyenGia.html");
          }, 100);
        } else {
          console.log("👤 Quyền người dùng thông thường → về trang chủ");
          window.location.replace("index.html");
        }
      }
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
  window.location.href = "./index.html";
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



document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const nav = document.querySelector(".nav");

  toggleBtn?.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const avatarImg = document.querySelector(".user-button img");

  if (user && avatarImg) {
    avatarImg.src = user.avatarUrl
      ? `http://localhost:5221${user.avatarUrl}`
      : "../img/default-avatar.png";
  }
});
