const BASE_API = "http://localhost:5221";
const user = JSON.parse(localStorage.getItem("user"));

document.addEventListener("DOMContentLoaded", async () => {
  if (!user?.taiKhoanId) return alert("Chưa đăng nhập.");

  const res = await fetch(`${BASE_API}/api/chuyen-gia/nhan-luong/${user.taiKhoanId}`);
  const data = await res.json();

  document.getElementById("expertName").textContent = data.hoTen || "Không rõ";
  document.getElementById("expertEmail").textContent = user.email;
  document.getElementById("bankAccount").textContent = data.soTaiKhoan || "Chưa cập nhật";
  document.getElementById("bankName").textContent = data.tenNganHang || "Chưa cập nhật";

  document.getElementById("totalCa").textContent = data.tongCa;
  document.getElementById("donGia").textContent = data.donGia.toLocaleString();
  document.getElementById("tongTien").textContent = data.tongTien.toLocaleString();

  const list = document.getElementById("listChiTietCa");
  data.chiTietCa.forEach(ca => {
    const li = document.createElement("li");
    li.textContent = `${new Date(ca.thoiGianBatDau).toLocaleString()} → ${new Date(ca.thoiGianKetThuc).toLocaleTimeString()} | ${ca.tomTat}`;
    list.appendChild(li);
  });

  const historyBody = document.getElementById("lichSuLuongBody");
  data.lichSuNhanLuong.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(item.ngayTao).toLocaleDateString()}</td>
      <td>${item.soCa}</td>
      <td>${item.soTien.toLocaleString()} VNĐ</td>
      <td>${item.trangThai}</td>
    `;
    historyBody.appendChild(row);
  });

  document.getElementById("guiYeuCauBtn").addEventListener("click", async () => {
    if (data.tongCa === 0) {
      return alert("Bạn chưa có buổi tư vấn nào hoàn tất.");
    }

    const confirmSend = confirm("Xác nhận gửi yêu cầu nhận lương?");
    if (!confirmSend) return;

    const res = await fetch(`${BASE_API}/api/chuyen-gia/gui-yeu-cau-nhan-luong`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user.taiKhoanId)
    });

    const result = await res.json();
    alert(result.message || "Gửi yêu cầu thành công.");
    location.reload();
  });
});
