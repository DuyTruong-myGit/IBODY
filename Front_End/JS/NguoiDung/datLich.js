const BASE_API = "http://localhost:5221";

document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const chuyenGiaId = new URLSearchParams(window.location.search).get("chuyenGiaId");
  if (!user || !chuyenGiaId) return alert("Thiếu thông tin đăng nhập hoặc chuyên gia.");

  // 1. Load thông tin người dùng
  const userRes = await fetch(`${BASE_API}/api/user/profile/${user.taiKhoanId}`);
  const userData = await userRes.json();
  document.getElementById("fullName").value = userData.hoTen;
  document.getElementById("email").value = userData.email;
  document.getElementById("phone").value = "Không có"; // cập nhật nếu cần

  // 2. Load thông tin chuyên gia
  const expertRes = await fetch(`${BASE_API}/api/tu-van/chuyen-gia/${chuyenGiaId}`);
  const expert = await expertRes.json();
  const ratingRes = await fetch(`${BASE_API}/api/tu-van/avgDanhGia/${chuyenGiaId}`);
  const rating = await ratingRes.json();

  document.getElementById("expertName").innerHTML = `<strong>Họ tên:</strong> ${expert.hoTen}`;
  document.getElementById("expertChuyenMon").innerHTML = `<strong>Chuyên môn:</strong> ${expert.chuyenMon}`;
  document.getElementById("expertDanhGia").innerHTML = `<strong>Đánh giá:</strong> ⭐ ${rating.diemTrungBinh ?? 0} (${rating.soLuongDanhGia ?? 0} đánh giá)`;
  document.getElementById("expertGioiThieu").innerHTML = `<strong>Giới thiệu:</strong> ${expert.gioiThieu}`;

  // 3. Load hình thức tư vấn
  const htRes = await fetch(`${BASE_API}/api/dat-lich/hinh-thuc-tu-van`);
  const htList = await htRes.json();
  const hinhThucId = document.getElementById("hinhThucId");
  htList.forEach(ht => {
    const opt = document.createElement("option");
    opt.value = ht.id;
    opt.textContent = `${ht.ten} - ${ht.thoiLuongPhut} phút - ${ht.giaCoBan.toLocaleString()}₫`;
    hinhThucId.appendChild(opt);
  });

  // 4. Load slot trống khi chọn ngày
  document.getElementById("ngay").addEventListener("change", async () => {
    const date = document.getElementById("ngay").value;
    if (!date) return;
    const res = await fetch(`${BASE_API}/api/dat-lich/khoang-trong?chuyenGiaId=${chuyenGiaId}&ngay=${date}`);
    const slots = await res.json();

    const slotContainer = document.getElementById("slotContainer");
    slotContainer.innerHTML = "";

    if (slots.length === 0) {
      slotContainer.innerHTML = "❌ Không còn khung giờ trống.";
      return;
    }

    slots.forEach((s, i) => {
      const btn = document.createElement("button");
      btn.textContent = `${s.start} - ${s.end}`;
      btn.onclick = () => {
        document.querySelectorAll("#slotContainer button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        sessionStorage.setItem("slotIndex", i);
      };
      btn.dataset.index = i;
      slotContainer.appendChild(btn);
    });
  });

  // 5. Gửi form đặt lịch
  document.getElementById("bookingForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const index = sessionStorage.getItem("slotIndex");
    const date = document.getElementById("ngay").value;
    const soCa = Number(document.getElementById("soCa").value);
    const hinhThuc = Number(document.getElementById("hinhThucId").value);
    const tomTat = document.getElementById("notes").value;

    if (index === null || !date || !hinhThuc || !tomTat) {
      return alert("❗ Vui lòng điền đầy đủ thông tin và chọn khung giờ.");
    }

    const resSlots = await fetch(`${BASE_API}/api/dat-lich/khoang-trong?chuyenGiaId=${chuyenGiaId}&ngay=${date}`);
    const slots = await resSlots.json();
    const slot = slots[index];
    const batDau = `${date}T${slot.start}:00`;

    const body = {
      nguoiDungId: userData.id, // chính xác ID người dùng (không phải taiKhoanId)
      chuyenGiaId: parseInt(chuyenGiaId),
      hinhThucId: hinhThuc,
      thoiGianBatDau: batDau,
      soCa,
      tomTat
    };

    const res = await fetch(`${BASE_API}/api/dat-lich/tao-lich`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    try {
      const result = JSON.parse(text);
      if (!res.ok) return alert("❌ Lỗi: " + (result.message || "Không xác định"));
      alert("✅ Đặt lịch thành công!");
      window.location.href = "lich-hen-user.html";
    } catch {
      alert("❌ Lỗi từ server: " + text);
    }
  });
});
