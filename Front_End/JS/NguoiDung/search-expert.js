// =================== ÁP DỤNG LOGIC MENU GIỐNG TRANG INDEX ===================
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

  // Toggle dropdown user
  const userButton = document.querySelector(".user-button");
  const userDropdown = document.getElementById("userDropdown");
  userButton?.addEventListener("click", () => {
    userDropdown.classList.toggle("show");
  });

  // Ẩn dropdown khi click ra ngoài
  document.addEventListener("click", function (e) {
    if (!userMenu.contains(e.target)) {
      userDropdown?.classList.remove("show");
    }
  });

  // Sự kiện logout
  const logoutLinks = document.querySelectorAll('[onclick="logout()"]');
  logoutLinks.forEach(el => el.addEventListener("click", logout));

  // Load chuyên gia & tìm kiếm
  loadExperts();
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  searchBtn.addEventListener("click", () => loadExperts(searchInput.value));
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") loadExperts(searchInput.value);
  });
});

function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "index.html";
}

// =================== DANH SÁCH CHUYÊN GIA ===================
const API_BASE_URL = "http://localhost:5221/api/tu-van";

async function loadExperts(keyword = "") {
  try {
    const url = new URL(`${API_BASE_URL}/chuyen-gia`);
    if (keyword.trim()) url.searchParams.append("keyword", keyword.trim());
    const response = await fetch(url);
    const data = await response.json();

    const listContainer = document.getElementById("expertList");
    listContainer.innerHTML = "";

    if (data.length === 0) {
      listContainer.innerHTML = "<p>Không tìm thấy chuyên gia nào phù hợp.</p>";
      return;
    }

    data.forEach(expert => {
      const item = document.createElement("div");
      item.className = "expert-card";
      item.innerHTML = `
        <h3>${expert.hoTen}</h3>
        <p><strong>Chuyên môn:</strong> ${expert.chuyenMon}</p>
        <p><strong>Kinh nghiệm:</strong> ${expert.soNamKinhNghiem} năm</p>
        <p><strong>Chứng chỉ:</strong> ${expert.soChungChi}</p>
        <p><strong>Email:</strong> ${expert.email}</p>
        <button onclick="viewExpertDetail(${expert.id})">Xem chi tiết</button>
      `;
      listContainer.appendChild(item);
    });
  } catch (err) {
    console.error("Lỗi tải chuyên gia:", err);
  }
}

function viewExpertDetail(id) {
  window.location.href = `profile-expert.html?id=${id}`;
}