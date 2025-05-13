const user = JSON.parse(localStorage.getItem("user"));

document.addEventListener("DOMContentLoaded", async () => {
  if (!user || !user.taiKhoanId) {
    alert("Vui lòng đăng nhập lại.");
    return;
  }

  const tableBody = document.querySelector("#historyTable tbody");
  const apiUrl = `http://localhost:5221/api/user/lich-su-goi/${user.taiKhoanId}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='7'>Không có lịch sử đăng ký gói nào.</td></tr>";
      return;
    }

data.forEach(row => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><a href="bill-details.html?id=${row.id}" class="link">${row.tenGoi}</a></td>
    <td>${row.gia.toLocaleString()}₫</td>
    <td>${new Date(row.ngayBatDau).toLocaleDateString()}</td>
    <td>${new Date(row.ngayKetThuc).toLocaleDateString()}</td>
    <td>${row.soLuot}</td>
    <td>${row.soLuotConLai}</td>
    <td>${row.trangThai === "con_hieu_luc" ? "Đang hoạt động" : "Hết hiệu lực"}</td>
  `;
  tableBody.appendChild(tr);
});

  } catch (err) {
    console.error("Lỗi tải lịch sử gói:", err);
    tableBody.innerHTML = "<tr><td colspan='7'>Không thể tải dữ liệu. Vui lòng thử lại sau.</td></tr>";
  }
});
