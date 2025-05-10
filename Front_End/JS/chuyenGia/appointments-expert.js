window.addEventListener("DOMContentLoaded", () => {
  loadAppointments();
});

async function loadAppointments() {
  const user = JSON.parse(localStorage.getItem("user"));
  const chuyenGiaId = user.taiKhoanId;

  const listContainer = document.getElementById("appointmentsList");
  listContainer.innerHTML = "<p>Đang tải lịch hẹn...</p>";

  try {
    const res = await fetch(`http://localhost:5221/api/lich-hen/chuyen-gia/${chuyenGiaId}?taiKhoanId=${chuyenGiaId}`);
    if (!res.ok) throw new Error("Lỗi API");

    const data = await res.json();
    listContainer.innerHTML = "";

    // Lọc các lịch hẹn có thời gian bắt đầu >= thời điểm hiện tại

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingAppointments = data.filter(app => {
      const start = new Date(app.thoiGianBatDau);
      return start >= today && (app.trangThai === "da_thanh_toan" || app.trangThai === "xac_nhan");
    });

    if (upcomingAppointments.length === 0) {
      listContainer.innerHTML = "<p>Không có lịch hẹn sắp tới.</p>";
      return;
    }
    upcomingAppointments.forEach(appointment => {
      const card = document.createElement("div");
      card.className = "appointment-card";
      card.innerHTML = `
        <div class="appointment-info">
          <h3>👤 ${appointment.nguoiDatLich.hoTen}</h3>
          <p>🕒 Thời gian: ${formatDate(appointment.thoiGianBatDau)}</p>
          <p>💡 Hình thức: ${appointment.hinhThuc}</p>
          <p>📝 Ghi chú: ${appointment.tomTat || 'Không có'}</p>
        </div>
        <div class="appointment-actions">
          <button class="btn-confirm" onclick="confirmAppointment(${appointment.id})">Đã xác nhận</button>
          <button class="btn-reject" onclick="rejectAppointment(${appointment.id})">Từ chối</button>
        </div>
      `;
      listContainer.appendChild(card);
    });

  } catch (err) {
    console.error("loadAppointments() failed:", err);
    listContainer.innerHTML = "<p>Không thể tải lịch hẹn.</p>";
  }
}

function confirmAppointment(id) {
  alert("✅ Bạn đã xác nhận lịch hẹn #" + id);
}

function rejectAppointment(id) {
  alert("⚠️ Bạn đã từ chối lịch hẹn #" + id);
}

function formatDate(raw) {
  const date = new Date(raw);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!"); 
  window.location.href = "../index.html";
}



function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!"); 
  window.location.href = "../index.html";
}