document.addEventListener("DOMContentLoaded", function () {
    // 🟢 Xử lý chọn vai trò
    const roleSelect = document.getElementById("roleSelect");
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) roleSelect.value = savedRole;
    roleSelect.addEventListener("change", function () {
      const role = roleSelect.value;
      localStorage.setItem("userRole", role);
      window.location.href = role === "admin" ? "admin.html" : "../index.html";
    });
  
    // 🟢 Biến toàn cục
    const ITEMS_PER_PAGE = 5;
    let currentPage = 1;
    let searchKeyword = "";
  
    const experts = JSON.parse(localStorage.getItem("experts")) || [];
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  
    // 🟢 Hàm lưu localStorage
    function saveExperts() { localStorage.setItem("experts", JSON.stringify(experts)); }
    function saveBookings() { localStorage.setItem("bookings", JSON.stringify(bookings)); }
  
    // 🟢 Hàm đọc file ảnh
    function readImageFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsDataURL(file);
      });
    }
  
    // 🟢 Preview ảnh chọn
    const expertImageInput = document.getElementById('expertImage');
    const imagePreviewDiv = document.getElementById('imagePreview');
  
    expertImageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imagePreviewDiv.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        };
        reader.readAsDataURL(file);
      } else {
        imagePreviewDiv.innerHTML = '<span style="font-size: 12px; color: #999;">Chưa chọn ảnh</span>';
      }
    });
  
    // 🟢 Render danh sách chuyên gia
    function renderExperts() {
      const tableBody = document.getElementById("expertTableBody");
      tableBody.innerHTML = "";
  
      const filteredExperts = experts.filter(expert =>
        expert.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
  
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const paginatedExperts = filteredExperts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
      paginatedExperts.forEach((expert) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${expert.image ? `<img src="${expert.image}" style="width:50px; height:50px; object-fit:cover; border-radius:50%;">` : ''}</td>
          <td>${expert.name}</td>
          <td>${expert.specialty}</td>
          <td>${expert.experience}</td>
          <td>${expert.price}</td>
          <td>
            <button onclick="editExpert(${experts.indexOf(expert)})" style="padding:5px 10px; background-color:#4CAF50; color:white; border:none; border-radius:5px; margin-right:5px;">Sửa</button>
            <button onclick="deleteExpert(${experts.indexOf(expert)})" style="padding:5px 10px; background-color:var(--secondary-color); color:white; border:none; border-radius:5px;">Xoá</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
  
      renderPagination(filteredExperts.length);
      renderDashboard(); // 🆕 Luôn cập nhật dashboard khi render
    }
  
    // 🟢 Phân trang
    function renderPagination(totalItems) {
      const pagination = document.getElementById("pagination");
      pagination.innerHTML = "";
  
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      if (totalPages <= 1) return;
  
      const prevBtn = document.createElement("button");
      prevBtn.innerText = "Trang trước";
      prevBtn.disabled = currentPage === 1;
      prevBtn.onclick = () => { currentPage--; renderExperts(); };
      pagination.appendChild(prevBtn);
  
      const pageInfo = document.createElement("span");
      pageInfo.innerText = ` Trang ${currentPage} / ${totalPages} `;
      pagination.appendChild(pageInfo);
  
      const nextBtn = document.createElement("button");
      nextBtn.innerText = "Trang sau";
      nextBtn.disabled = currentPage === totalPages;
      nextBtn.onclick = () => { currentPage++; renderExperts(); };
      pagination.appendChild(nextBtn);
    }
  
    // 🟢 Xử lý xoá chuyên gia
    window.deleteExpert = function(index) {
      if (confirm("Bạn chắc chắn muốn xoá chuyên gia này?")) {
        experts.splice(index, 1);
        saveExperts();
        renderExperts();
      }
    };
  
    // 🟢 Xử lý edit chuyên gia
    window.editExpert = function(index) {
      const expert = experts[index];
      document.getElementById("expertName").value = expert.name;
      document.getElementById("expertSpecialty").value = expert.specialty;
      document.getElementById("expertExperience").value = expert.experience;
      document.getElementById("expertPrice").value = expert.price;
      document.getElementById("editIndex").value = index;
      imagePreviewDiv.innerHTML = expert.image ? `<img src="${expert.image}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : '<span style="font-size: 12px; color: #999;">Chưa chọn ảnh</span>';
      document.querySelector("#addExpertForm button[type='submit']").innerText = "Cập nhật chuyên gia";
      window.scrollTo({ top: document.getElementById("addExpertForm").offsetTop - 50, behavior: 'smooth' });
    };
  
    // 🟢 Submit thêm/cập nhật chuyên gia
    document.getElementById("addExpertForm").addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const name = document.getElementById("expertName").value.trim();
      const specialty = document.getElementById("expertSpecialty").value.trim();
      const experience = document.getElementById("expertExperience").value.trim();
      const price = document.getElementById("expertPrice").value.trim();
      const editIndex = document.getElementById("editIndex").value;
      const imageFile = document.getElementById("expertImage").files[0];
  
      if (!name || !specialty || !experience || !price) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
  
      let imageBase64 = "";
      if (imageFile) {
        imageBase64 = await readImageFile(imageFile);
      }
  
      if (editIndex === "") {
        experts.push({ name, specialty, experience, price, image: imageBase64 });
        alert("Đã thêm chuyên gia thành công!");
      } else {
        experts[editIndex] = { name, specialty, experience, price, image: imageBase64 || experts[editIndex].image };
        alert("Đã cập nhật chuyên gia thành công!");
      }
  
      saveExperts();
      renderExperts();
      this.reset();
      document.getElementById("editIndex").value = "";
      document.querySelector("#addExpertForm button[type='submit']").innerText = "Thêm chuyên gia";
      imagePreviewDiv.innerHTML = '<span style="font-size: 12px; color: #999;">Chưa chọn ảnh</span>';
    });
  
    // 🟢 Search chuyên gia theo tên
    const searchBox = document.getElementById("searchBox");
    searchBox.addEventListener("input", function() {
      searchKeyword = this.value;
      currentPage = 1;
      renderExperts();
    });
  
    // 🟢 Render danh sách đơn đặt lịch
    function renderBookings() {
      const bookingBody = document.getElementById("bookingTableBody");
      bookingBody.innerHTML = "";
      bookings.forEach((booking, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${booking.name}</td>
          <td>${booking.email}</td>
          <td>${booking.date}</td>
          <td>${booking.time}</td>
          <td>${booking.note || '-'}</td>
          <td><button onclick="deleteBooking(${index})" style="padding:5px 10px; background-color:var(--secondary-color); color:white; border:none; border-radius:5px;">Xoá</button></td>
        `;
        bookingBody.appendChild(row);
      });
  
      renderDashboard(); // 🆕 Luôn cập nhật dashboard khi render
    }
  
    // 🟢 Xử lý xoá đơn đặt lịch
    window.deleteBooking = function(index) {
      if (confirm("Bạn có chắc chắn muốn xoá đơn đặt lịch này?")) {
        bookings.splice(index, 1);
        saveBookings();
        renderBookings();
      }
    };
  
    // 🟢 Dashboard số liệu tổng quan
    function renderDashboard() {
      document.getElementById("totalExperts").innerText = experts.length;
      document.getElementById("totalBookings").innerText = bookings.length;
    }
  
    // 🟢 Khởi tạo ban đầu
    renderExperts();
    renderBookings();
    renderDashboard();
  });
  