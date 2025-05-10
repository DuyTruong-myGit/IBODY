// thanh-toan.js

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const lichHenId = new URLSearchParams(window.location.search).get("lichHenId");
  if (!user || !lichHenId) return window.location.href = "login.html";

  const resLich = await fetch(`http://localhost:5221/api/dat-lich/chi-tiet/${lichHenId}`);
  const lich = await resLich.json();

  if (!resLich.ok || lich.trangThai !== "cho_thanh_toan") {
    alert("❌ Lịch hẹn không hợp lệ hoặc chưa được duyệt.");
    return window.location.href = "lich-hen-user.html";
  }

  const infoBox = document.getElementById("lichHenInfo");
  infoBox.innerHTML = `
    <p><strong>Chuyên gia:</strong> ${lich.chuyenGia?.hoTen}</p>
    <p><strong>Thời gian:</strong> ${new Date(lich.thoiGianBatDau).toLocaleString()} → ${new Date(lich.thoiGianKetThuc).toLocaleTimeString()}</p>
    <p><strong>Hình thức:</strong> ${lich.hinhThuc?.ten}</p>
    <p><strong>Giá:</strong> ${Number(lich.hinhThuc?.giaCoBan).toLocaleString()} VNĐ</p>
    <p><strong>Tóm tắt:</strong> ${lich.tomTat || "(không có)"}</p>
  `;

  const ptRes = await fetch("http://localhost:5221/api/user/phuong-thuc-thanh-toan");
  const ptList = await ptRes.json();
  const ptSelect = document.getElementById("paymentMethod");
  ptList.forEach(pt => {
    const opt = document.createElement("option");
    opt.value = pt.id;
    opt.textContent = pt.ten;
    ptSelect.appendChild(opt);
  });

  document.getElementById("paymentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const phuongThucId = document.getElementById("paymentMethod").value;
    if (!phuongThucId) return alert("Vui lòng chọn phương thức thanh toán.");

    const resPay = await fetch("http://localhost:5221/api/user/thanh-toan-lich-hen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lichHenId: lichHenId,
        taiKhoanId: user.taiKhoanId,
        phuongThucId: Number(phuongThucId),
        soTien: lich.hinhThuc.giaCoBan
      })
    });

    const payText = await resPay.text();
    try {
      const data = JSON.parse(payText);
      if (!resPay.ok) return alert("❌ Thanh toán thất bại: " + (data.message || "Lỗi không xác định"));
      alert("✅ Thanh toán thành công!");
      window.location.href = "bill-popup.html";
    } catch {
      alert("❌ Lỗi phản hồi: " + payText);
    }
  });
});
