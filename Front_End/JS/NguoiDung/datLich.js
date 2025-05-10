// dat-lich.js

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const chuyenGiaId = new URLSearchParams(window.location.search).get("chuyenGiaId");
  if (!user || !chuyenGiaId) return window.location.href = "../login.html";

  const userRes = await fetch(`http://localhost:5221/api/user/profile/${user.taiKhoanId}`);
  const userData = await userRes.json();
  const nguoiDungId = userData.id;
  document.getElementById("fullName").value = userData.hoTen;
  document.getElementById("email").value = userData.email;
  document.getElementById("phone").value = "Không có";

  const expertRes = await fetch(`http://localhost:5221/api/tu-van/chuyen-gia/${chuyenGiaId}`);
  const expertData = await expertRes.json();
  const danhGiaRes = await fetch(`http://localhost:5221/api/tu-van/avgDanhGia/${chuyenGiaId}`);
  const danhGiaData = await danhGiaRes.json();

  const infoCards = document.querySelectorAll(".info-card");
  infoCards[0].innerHTML = `
    <h4>Chuyên gia: ${expertData.hoTen}</h4>
    <p><strong>Chuyên môn:</strong> ${expertData.chuyenMon}</p>
    <p><strong>Đánh giá:</strong> ⭐ ${danhGiaData.diemTrungBinh ?? 0} (${danhGiaData.soLuongDanhGia ?? 0} đánh giá)</p>
    <p><strong>Giới thiệu:</strong> ${expertData.gioiThieu}</p>`;

  const hinhThucRes = await fetch("http://localhost:5221/api/dat-lich/hinh-thuc-tu-van");
  const hinhThucList = await hinhThucRes.json();

  const hinhThucSelect = document.getElementById("hinhThucId");
  hinhThucList.forEach(ht => {
    const opt = document.createElement("option");
    opt.value = ht.id;
    opt.textContent = `${ht.ten} (${ht.thoiLuongPhut} phút - ${Number(ht.giaCoBan).toLocaleString()}₫)`;
    hinhThucSelect.appendChild(opt);
  });

  const ranhRes = await fetch(`http://localhost:5221/api/thoi-gian-ranh/chuyen-gia/${chuyenGiaId}`);
  const ranhList = await ranhRes.json();

  document.getElementById("bookingForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const timeInput = document.getElementById("bookingTime").value;
    const durationMinutes = Number(document.getElementById("duration").value);
    const hinhThucId = document.getElementById("hinhThucId").value;
    if (!timeInput || !durationMinutes || !hinhThucId) return alert("Vui lòng điền đầy đủ thông tin.");

    const start = new Date(timeInput);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const weekday = start.getDay();
    const hmStart = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    const hmEnd = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;

    const isWithin = ranhList.some(slot =>
      slot.thuTrongTuan === weekday &&
      slot.tu <= hmStart &&
      slot.den >= hmEnd
    );

    if (!isWithin) return alert("❌ Thời gian bạn chọn không nằm trong thời gian rảnh của chuyên gia.");

    const notes = document.getElementById("notes").value;

    const resLich = await fetch("http://localhost:5221/api/dat-lich/tao-lich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nguoiDungId,
        chuyenGiaId,
        hinhThucId: Number(hinhThucId),
        thoiGianBatDau: start.toISOString(),
        thoiGianKetThuc: end.toISOString(),
        tomTat: notes
      })
    });

    const text = await resLich.text();
    try {
      const data = JSON.parse(text);
      if (!resLich.ok) return alert("❌ Không thể tạo lịch: " + (data.message || "Lỗi không xác định"));
      alert("✅ Đặt lịch thành công! Chờ chuyên gia duyệt.");
      window.location.href = "lich-hen-user.html";
    } catch {
      alert("❌ Lỗi tạo lịch: " + text);
    }
  });
});
