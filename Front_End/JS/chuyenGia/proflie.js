// document.addEventListener('DOMContentLoaded', () => {
//   const user = JSON.parse(localStorage.getItem('user'));
//   if (!user || !user.taiKhoanId) {
//     alert("Vui lòng đăng nhập.");
//     window.location.href = "login.html";
//     return;
//   }

//   let chuyenGiaId = null;
//   let scheduleData = [];

//   // Tab chuyển đổi
//   const tabs = document.querySelectorAll('.tab-btn');
//   const contents = document.querySelectorAll('.tab-content');
//   tabs.forEach(tab => {
//     tab.addEventListener('click', () => {
//       tabs.forEach(t => t.classList.remove('active'));
//       contents.forEach(c => c.classList.remove('active'));
//       tab.classList.add('active');
//       document.getElementById(tab.dataset.tab).classList.add('active');
//     });
//   });

//   // Lấy thông tin chuyên gia từ API
//   fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${user.taiKhoanId}`)
//     .then(res => res.json())
//     .then(data => {
//       chuyenGiaId = data.id;

//       // Hiển thị thông tin hiện tại
//       document.getElementById('cgFullName').textContent = data.hoTen;
//       document.getElementById('cgEmail').textContent = user.email;
//       document.getElementById('cgSpecialty').textContent = data.chuyenMon;
//       document.getElementById('cgExperience').textContent = data.soNamKinhNghiem;
//       document.getElementById('cgCertificates').textContent = data.soChungChi;
//       document.getElementById('cgIntro').textContent = data.gioiThieu;

//       // Điền sẵn form chỉnh sửa
//       document.getElementById('editFullName').value = data.hoTen;
//       document.getElementById('editSpecialty').value = data.chuyenMon;
//       document.getElementById('editExperience').value = data.soNamKinhNghiem;
//       document.getElementById('editCertificates').value = data.soChungChi;
//       document.getElementById('editIntro').value = data.gioiThieu;

//       loadSchedule(); // ✅ Gọi sau khi có ID
//     });

//   // Gửi form chỉnh sửa thông tin
//   document.getElementById('editForm').addEventListener('submit', async e => {
//     e.preventDefault();

//     if (!chuyenGiaId) {
//       alert("Không thể xác định ID chuyên gia.");
//       return;
//     }

//     const payload = {
//       hoTen: document.getElementById('editFullName').value,
//       chuyenMon: document.getElementById('editSpecialty').value,
//       soNamKinhNghiem: parseInt(document.getElementById('editExperience').value),
//       soChungChi: document.getElementById('editCertificates').value,
//       gioiThieu: document.getElementById('editIntro').value
//     };

//     const res = await fetch(`http://localhost:5221/api/chuyen-gia/cap-nhat/${chuyenGiaId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     const result = await res.json();
//     document.getElementById('editResult').textContent = result.message;
//   });

//   // Gửi form đổi mật khẩu
//   document.getElementById('passwordForm').addEventListener('submit', async e => {
//     e.preventDefault();

//     const payload = {
//       matKhauCu: document.getElementById('oldPassword').value,
//       matKhauMoi: document.getElementById('newPassword').value
//     };

//     const res = await fetch(`http://localhost:5221/api/chuyen-gia/doi-mat-khau/${user.taiKhoanId}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     const result = await res.json();
//     document.getElementById('passwordResult').textContent = result.message;
//   });

//   function loadSchedule() {
//     fetch(`http://localhost:5221/api/thoi-gian-ranh/chuyen-gia/${chuyenGiaId}`)
//       .then(res => res.json())
//       .then(data => {
//         scheduleData = data;
//         const tbody = document.querySelector("#scheduleTable tbody");
//         tbody.innerHTML = "";
//         data.forEach(item => {
//           const row = document.createElement("tr");
//           row.innerHTML = `
//             <td>${thuToText(item.thuTrongTuan)}</td>
//             <td>${item.tu}</td>
//             <td>${item.den}</td>
//             <td>
//               <button onclick="editSchedule(${item.id})">✏️</button>
//               <button onclick="deleteSchedule(${item.id})">🗑️</button>
//             </td>`;
//           tbody.appendChild(row);
//         });
//       });
//   }

//   window.editSchedule = function (id) {
//     const item = scheduleData.find(s => s.id === id);
//     if (item) {
//       document.getElementById('scheduleId').value = item.id;
//       document.getElementById('thuTrongTuan').value = item.thuTrongTuan;
//       document.getElementById('tu').value = item.tu;
//       document.getElementById('den').value = item.den;
//     }
//   };

//   window.deleteSchedule = async function (id) {
//     if (confirm("Xác nhận xoá?")) {
//       await fetch(`http://localhost:5221/api/thoi-gian-ranh/${id}`, { method: 'DELETE' });
//       loadSchedule();
//       document.getElementById('scheduleForm').reset();
//       document.getElementById('scheduleId').value = "";
//     }
//   };

//   document.getElementById('scheduleForm').addEventListener('submit', async e => {
//     e.preventDefault();
//     const id = document.getElementById('scheduleId').value;
//     const thu = parseInt(document.getElementById('thuTrongTuan').value);
//     const tu = document.getElementById('tu').value;
//     const den = document.getElementById('den').value;

//     // Kiểm tra trùng thời gian
//     const isConflict = scheduleData.some(item => {
//       if (id && item.id == id) return false;
//       return item.thuTrongTuan == thu && !(den <= item.tu || tu >= item.den);
//     });

//     if (isConflict) {
//       alert("Khung giờ bạn nhập bị trùng với lịch rảnh đã có. Vui lòng kiểm tra lại.");
//       return;
//     }

//     const payload = { chuyenGiaId, thuTrongTuan: thu, tu, den };
//     const url = id
//       ? `http://localhost:5221/api/thoi-gian-ranh/${id}`
//       : `http://localhost:5221/api/thoi-gian-ranh`;
//     const method = id ? 'PUT' : 'POST';

//     const res = await fetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload)
//     });

//     if (!res.ok) {
//       const result = await res.json();
//       alert(result.message || "Lỗi không xác định.");
//       return;
//     }

//     document.getElementById('scheduleForm').reset();
//     document.getElementById('scheduleId').value = "";
//     loadSchedule();
//   });
// });

// function resetScheduleForm() {
//   document.getElementById('scheduleForm').reset();
//   document.getElementById('scheduleId').value = "";
// }

// function logout() {
//   localStorage.removeItem("user");
//   alert("Đăng xuất thành công!");
//   window.location.href = "../index.html";
// }

// function thuToText(thu) {
//   const mapping = {
//     0: "Chủ nhật",
//     1: "Thứ 2",
//     2: "Thứ 3",
//     3: "Thứ 4",
//     4: "Thứ 5",
//     5: "Thứ 6",
//     6: "Thứ 7"
//   };
//   return mapping[thu] || `Thứ ${thu}`;
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   if (!user || !user.taiKhoanId || !user.roles.includes("chuyen_gia")) {
//     alert("Vui lòng đăng nhập với tài khoản chuyên gia.");
//     return (window.location.href = "../index.html");
//   }

//   try {
//     const res = await fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${user.taiKhoanId}`);
//     if (!res.ok) throw new Error("Không thể tải hồ sơ");

//     const data = await res.json();

//     document.getElementById("previewAvatar").src = data.avatarUrl || "../images/user.png";
//     document.getElementById("fullName").value = data.hoTen || "";
//     document.getElementById("chuyenMon").value = data.chuyenMon || "";
//     document.getElementById("gioiThieu").value = data.gioiThieu || "";
//     document.getElementById("soNam").value = data.soNamKinhNghiem || 0;
//     document.getElementById("soChungChi").value = data.soChungChi || "";

//   } catch (err) {
//     alert("Lỗi: " + err.message);
//   }
// });

// async function uploadAvatar() {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const fileInput = document.getElementById("avatar");
//   const file = fileInput.files[0];

//   if (!file) {
//     alert("Vui lòng chọn ảnh đại diện.");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("file", file);

//   try {
//     const res = await fetch(`http://localhost:5221/api/chuyen-gia/upload-avatar/${user.taiKhoanId}`, {
//       method: "POST",
//       body: formData
//     });

//     const result = await res.json();
//     if (!res.ok) throw new Error(result.message || "Lỗi khi cập nhật ảnh");

//     alert("✅ Đã cập nhật ảnh đại diện!");
//     document.getElementById("previewAvatar").src = result.avatarUrl;
//   } catch (err) {
//     alert("❌ " + err.message);
//   }
// }
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.taiKhoanId || !user.roles.includes("chuyen_gia")) {
    alert("Bạn cần đăng nhập với tài khoản chuyên gia.");
    return (window.location.href = "../index.html");
  }

  let chuyenGiaId = null;
  let scheduleData = [];

  // Kích hoạt chuyển tab
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Lấy thông tin chuyên gia
  fetch(`http://localhost:5221/api/chuyen-gia/thongTin/${user.taiKhoanId}`)
    .then(res => res.json())
    .then(data => {
      console.log("🔎 CHUYEN GIA DATA:", data);

      chuyenGiaId = data.id;

      // Tab Thông tin hiện tại
      document.getElementById('cgFullName').textContent = data.hoTen;
      document.getElementById('cgEmail').textContent = user.email;
      document.getElementById('cgSpecialty').textContent = data.chuyenMon;
      document.getElementById('cgExperience').textContent = data.soNamKinhNghiem;
      document.getElementById('cgCertificates').textContent = data.soChungChi;
      document.getElementById('cgIntro').textContent = data.gioiThieu;
      document.getElementById('currentAvatar').src =data.avatarUrl ? `http://localhost:5221${data.avatarUrl}` : "../images/user.png";


      // Tab chỉnh sửa
      document.getElementById('editFullName').value = data.hoTen;
      document.getElementById('editSpecialty').value = data.chuyenMon;
      document.getElementById('editExperience').value = data.soNamKinhNghiem;
      document.getElementById('editCertificates').value = data.soChungChi;
      document.getElementById('editIntro').value = data.gioiThieu;

      loadSchedule();
    });

  // Gửi form chỉnh sửa thông tin
  document.getElementById('editForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!chuyenGiaId) return alert("Không có ID chuyên gia.");

    const payload = {
      hoTen: document.getElementById('editFullName').value,
      chuyenMon: document.getElementById('editSpecialty').value,
      soNamKinhNghiem: parseInt(document.getElementById('editExperience').value),
      soChungChi: document.getElementById('editCertificates').value,
      gioiThieu: document.getElementById('editIntro').value
    };

    const res = await fetch(`http://localhost:5221/api/chuyen-gia/cap-nhat/${chuyenGiaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    alert(result.message || "Đã lưu thay đổi.");

    // Nếu có avatar → upload
    const file = document.getElementById("avatarInput").files[0];
    if (file) uploadAvatar();
  });

  // Đổi mật khẩu
  document.getElementById('passwordForm').addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      matKhauCu: document.getElementById('oldPassword').value,
      matKhauMoi: document.getElementById('newPassword').value
    };

    const res = await fetch(`http://localhost:5221/api/chuyen-gia/doi-mat-khau/${user.taiKhoanId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    document.getElementById('passwordResult').textContent = result.message;
  });

  // Load thời gian rảnh
  function loadSchedule() {
    fetch(`http://localhost:5221/api/thoi-gian-ranh/chuyen-gia/${chuyenGiaId}`)
      .then(res => res.json())
      .then(data => {
        scheduleData = data;
        const tbody = document.querySelector("#scheduleTable tbody");
        tbody.innerHTML = "";
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${thuToText(item.thuTrongTuan)}</td>
            <td>${item.tu}</td>
            <td>${item.den}</td>
            <td>
              <button onclick="editSchedule(${item.id})">✏️</button>
              <button onclick="deleteSchedule(${item.id})">🗑️</button>
            </td>`;
          tbody.appendChild(row);
        });
      });
  }

  window.editSchedule = function (id) {
    const item = scheduleData.find(s => s.id === id);
    if (item) {
      document.getElementById('scheduleId').value = item.id;
      document.getElementById('thuTrongTuan').value = item.thuTrongTuan;
      document.getElementById('tu').value = item.tu;
      document.getElementById('den').value = item.den;
    }
  };

  window.deleteSchedule = async function (id) {
    if (confirm("Xác nhận xoá?")) {
      await fetch(`http://localhost:5221/api/thoi-gian-ranh/${id}`, { method: 'DELETE' });
      loadSchedule();
      document.getElementById('scheduleForm').reset();
      document.getElementById('scheduleId').value = "";
    }
  };

  document.getElementById('scheduleForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('scheduleId').value;
    const thu = parseInt(document.getElementById('thuTrongTuan').value);
    const tu = document.getElementById('tu').value;
    const den = document.getElementById('den').value;

    // Kiểm tra trùng
    const isConflict = scheduleData.some(item => {
      if (id && item.id == id) return false;
      return item.thuTrongTuan == thu && !(den <= item.tu || tu >= item.den);
    });

    if (isConflict) {
      alert("Khung giờ bị trùng với lịch rảnh đã có.");
      return;
    }

    const payload = { chuyenGiaId, thuTrongTuan: thu, tu, den };
    const url = id
      ? `http://localhost:5221/api/thoi-gian-ranh/${id}`
      : `http://localhost:5221/api/thoi-gian-ranh`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const result = await res.json();
      alert(result.message || "Lỗi không xác định.");
      return;
    }

    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleId').value = "";
    loadSchedule();
  });
});

function logout() {
  localStorage.removeItem("user");
  alert("Đăng xuất thành công!");
  window.location.href = "../index.html";
}

function thuToText(thu) {
  const mapping = {
    0: "Chủ nhật",
    1: "Thứ 2",
    2: "Thứ 3",
    3: "Thứ 4",
    4: "Thứ 5",
    5: "Thứ 6",
    6: "Thứ 7"
  };
  return mapping[thu] || `Thứ ${thu}`;
}

async function uploadAvatar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const file = document.getElementById("avatarInput").files[0];

  if (!file) {
    alert("Vui lòng chọn ảnh.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`http://localhost:5221/api/chuyen-gia/upload-avatar/${user.taiKhoanId}`, {
      method: "POST",
      body: formData
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Lỗi khi tải ảnh");

    alert("✅ Đã cập nhật ảnh đại diện!");
    document.getElementById("currentAvatar").src = `http://localhost:5221${result.avatarUrl}`;
  } catch (err) {
    alert("❌ " + err.message);
  }
}
