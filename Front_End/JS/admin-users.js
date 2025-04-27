const user = JSON.parse(localStorage.getItem("user"));

if (!user || !Array.isArray(user.roles) || !user.roles.includes("quan_tri")) {
  alert("Bạn không có quyền truy cập trang quản trị.");
  window.location.href = "index.html";
}

async function loadAccounts() {
  try {
    const res = await fetch("http://localhost:5221/api/admin/accounts");
    const data = await res.json();
    const accounts = data.data || [];

    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    accounts.forEach(account => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${account.id}</td>
        <td>${account.email}</td>
        <td>${account.vaiTro}</td>
        <td>${account.trangThai}</td>
        <td>${account.fullName}</td>
        <td>
          <button onclick="khoaTaiKhoan(${account.id})">Khóa</button>
          <button onclick="moKhoaTaiKhoan(${account.id})">Mở</button>
          <button onclick="xoaTaiKhoan(${account.id})" style="color:red;">Xoá</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi tải tài khoản:", err);
  }
}

async function xoaTaiKhoan(id) {
  if (confirm("Bạn có chắc muốn xoá tài khoản này?")) {
    await fetch(`http://localhost:5221/api/admin/account/${id}`, { method: "DELETE" });
    loadAccounts();
  }
}

async function khoaTaiKhoan(id) {
  await fetch(`http://localhost:5221/api/admin/khoa-tai-khoan/${id}`, { method: "POST" });
  loadAccounts();
}

async function moKhoaTaiKhoan(id) {
  await fetch(`http://localhost:5221/api/admin/mo-khoa-tai-khoan/${id}`, { method: "POST" });
  loadAccounts();
}

document.addEventListener("DOMContentLoaded", loadAccounts);
