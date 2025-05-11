// lich-su-giao-dich.js

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
    if (!user){
    alert("Vui lòng đăng nhập để tiếp tục.");
    return window.location.href = "../index.html";} 

  const container = document.getElementById("transactionList");
  try {
    const res = await fetch(`http://localhost:5221/api/user/lichSuTuVan/${user.taiKhoanId}`);
    const list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = "<p>Không có giao dịch nào.</p>";
      return;
    }

    container.innerHTML = list.map(tx => {
      const date = new Date(tx.thoiGianThanhToan);
      return `
        <div class="transaction-item" onclick="window.location.href='bill-popup.html?hoaDonId=${tx.hoaDonId}'">
          <p><strong>Chuyên gia:</strong> ${tx.chuyenGia}</p>
          <p><strong>Hình thức:</strong> ${tx.ten}</p>
          <p><strong>Ngày thanh toán:</strong> ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
          <p><strong>Số tiền:</strong> ${Number(tx.tongTien).toLocaleString()}₫</p>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("❌ Lỗi tải lịch sử giao dịch:", err);
    container.innerHTML = "<p>Lỗi khi tải giao dịch.</p>";
  }
});
