
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Vui lòng đăng nhập để tiếp tục.");
    return window.location.href = "../index.html";}

  // Lấy thông tin hóa đơn gần nhất
  const res = await fetch(`http://localhost:5221/api/user/lichSuTuVan/${user.taiKhoanId}`);
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    document.body.innerHTML = "<p>Không tìm thấy hóa đơn thanh toán.</p>";
    return;
  }

  const bill = data[0]; // hóa đơn mới nhất
  const date = new Date(bill.thoiGianThanhToan);

  document.getElementById("userFullName").textContent = user.fullName || user.username || "(Không rõ)";
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("paymentDate").textContent = date.toLocaleDateString();
  document.getElementById("paymentTime").textContent = date.toLocaleTimeString();
  document.getElementById("coursePrice").textContent = Number(bill.tongTien).toLocaleString() + "₫";
  document.getElementById("paymentAmount").textContent = Number(bill.tongTien).toLocaleString() + "₫";
  document.getElementById("paymentMethod").textContent = bill.ten;
});
