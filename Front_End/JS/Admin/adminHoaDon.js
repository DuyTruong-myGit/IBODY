const user = JSON.parse(localStorage.getItem("user"));

if (!user || !Array.isArray(user.roles) || !user.roles.includes("quan_tri")) {
  alert("Bạn không có quyền truy cập trang quản trị.");
  window.location.href = "index.html";
}

async function loadHoaDon() {
  try {
    const res = await fetch("http://localhost:5221/api/admin/hoaDonPhiaChuyenGia");
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];

    const tbody = document.getElementById("hoaDonTableBody");
    tbody.innerHTML = "";

    list.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.email}</td>
        <td>${item.tongTien.toLocaleString()} VNĐ</td>
        <td>${new Date(item.thoiGianTao).toLocaleString()}</td>
        <td><button onclick="xoaHoaDon(${item.id})" style="color:red;">Xoá</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi tải hóa đơn:", err);
  }
}

async function xoaHoaDon(id) {
  if (confirm("Bạn có chắc muốn xoá hóa đơn này không?")) {
    await fetch(`http://localhost:5221/api/admin/huyHoaDon/${id}`, { method: "DELETE" });
    loadHoaDon();
  }
}

document.addEventListener("DOMContentLoaded", loadHoaDon);


document.getElementById("logoutLink")?.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "../index.html";
});