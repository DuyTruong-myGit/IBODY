const user = JSON.parse(localStorage.getItem("user"));

if (!user || !Array.isArray(user.roles) || !user.roles.includes("quan_tri")) {
  alert("Bạn không có quyền truy cập trang quản trị.");
  window.location.href = "index.html";
}

let currentEditId = null;

async function loadLichHen() {
  try {
    const res = await fetch("http://localhost:5221/api/admin/lich-hen");
    const data = await res.json();
    const list = data.data || data;

    const tbody = document.getElementById("lichHenTableBody");
    tbody.innerHTML = "";

    list.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.nguoiDung.hoTen}</td>
        <td>${item.chuyenGia.hoTen}</td>
        <td>${item.chuyenGia.chuyenMon}</td>
        <td>${new Date(item.thoiGianBatDau).toLocaleString()}</td>
        <td>${new Date(item.thoiGianKetThuc).toLocaleString()}</td>
        <td>${item.hinhThuc}</td>
        <td>${item.tomTat || ''}</td>
        <td>
          <button onclick="suaLichHen(${item.id}, \`${item.tomTat || ''}\`, '${item.thoiGianBatDau}', '${item.thoiGianKetThuc}')">Sửa</button>
          <button onclick="xoaLichHen(${item.id})" style="color:red;">Xoá</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Lỗi tải lịch hẹn:", err);
  }
}

async function xoaLichHen(id) {
  if (confirm("Bạn có chắc muốn xoá lịch hẹn này?")) {
    await fetch(`http://localhost:5221/api/admin/lich-hen/${id}`, { method: "DELETE" });
    loadLichHen();
  }
}

function suaLichHen(id, tomTat, batDau, ketThuc) {
    currentEditId = id;
    document.getElementById("editTomTat").value = tomTat || '';
    document.getElementById("editBatDau").value = toInputDatetime(batDau);
    document.getElementById("editKetThuc").value = toInputDatetime(ketThuc);
    document.getElementById("modalEdit").style.display = "flex";
  }
  
  function toInputDatetime(iso) {
    const dt = new Date(iso);
    const pad = n => n.toString().padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

async function submitEdit() {
    const tomTat = document.getElementById("editTomTat").value;
    const thoiGianBatDau = document.getElementById("editBatDau").value;
    const thoiGianKetThuc = document.getElementById("editKetThuc").value;
  
    if (!tomTat || !thoiGianBatDau || !thoiGianKetThuc) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
  
    const body = {
      ThoiGianBatDau: thoiGianBatDau,
      ThoiGianKetThuc: thoiGianKetThuc,
      TomTat: tomTat
    };
  
    console.log("🔁 Gửi JSON:", JSON.stringify(body));
  
    try {
      const res = await fetch(`http://localhost:5221/api/admin/lich-hen/${currentEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
  
      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Lỗi:", err);
        alert("Cập nhật thất bại: " + (err.message || "Lỗi dữ liệu"));
        return;
      }
  
      closeModal();
      loadLichHen();
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  }
  
  
  function closeModal() {
    document.getElementById("modalEdit").style.display = "none";
    currentEditId = null;
  }

document.addEventListener("DOMContentLoaded", loadLichHen);
