document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
    if (!user){
    alert("Vui lòng đăng nhập để tiếp tục.");
    return window.location.href = "../index.html";} 

  const goiId = new URLSearchParams(window.location.search).get("goiId");
  if (!goiId) return alert("Không xác định được gói dịch vụ.");

  // Hiển thị thông tin người dùng
  document.getElementById("userFullName").textContent = user.fullName || "Không rõ";
  document.getElementById("userEmail").textContent = user.email;

  try {
    // ✅ Gọi API lấy chi tiết gói
    const res = await fetch(`http://localhost:5221/api/goi-dich-vu/chi-tiet/${goiId}`);
    const goi = await res.json();

    // ✅ Hiển thị gói
    document.getElementById("goiTen").textContent = goi.ten;
    document.getElementById("goiMoTa").textContent = goi.moTa;
    document.getElementById("goiGia").textContent = Number(goi.gia).toLocaleString() + "₫";
    document.getElementById("goiThoiHan").textContent = `${goi.thoiHanNgay} ngày`;
    document.getElementById("chuyenKhoanGhiChu").textContent =`user_${user.taiKhoanId}_goi_${goi.id}`;


    // ✅ Khi bấm xác nhận thanh toán
    document.getElementById("paymentForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const res2 = await fetch("http://localhost:5221/api/goi-dich-vu/dang-ky", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taiKhoanId: user.taiKhoanId,
            goiDichVuId: goi.id
          })
        });

        const text = await res2.text();
        const data = JSON.parse(text);
        if (!res2.ok) return alert("❌ Lỗi đăng ký gói: " + (data.message || "Lỗi không xác định"));

        alert("✅ Thanh toán & đăng ký gói thành công!");
        window.location.href = "dang-ky-goi.html";
      } catch (err) {
        alert("❌ Lỗi khi thanh toán: " + err.message);
      }
    });

  } catch (err) {
    alert("❌ Không thể tải thông tin gói: " + err.message);
  }
});
