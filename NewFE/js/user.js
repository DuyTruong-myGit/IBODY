document.addEventListener("DOMContentLoaded", function() {
    // 🟢 Xử lý vai trò
    const roleSelect = document.getElementById("roleSelect");
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) roleSelect.value = savedRole;
    roleSelect.addEventListener("change", function () {
      const role = roleSelect.value;
      localStorage.setItem("userRole", role);
      window.location.href = role === "admin" ? "admin.html" : "index.html";
    });
  
    // 🟢 Nếu user thì show nút "Đăng ký trở thành chuyên gia"
    const role = localStorage.getItem("userRole");
    if (role === "user") {
      document.getElementById("becomeExpertSection").style.display = "block";
    }
  
    // 🟢 Mở/Đóng form popup
    window.openBecomeExpertForm = function() {
      document.getElementById("becomeExpertModal").style.display = "flex";
    };
    window.closeBecomeExpertForm = function() {
      document.getElementById("becomeExpertModal").style.display = "none";
    };
  
    // 🟢 Preview ảnh đăng ký chuyên gia
    const newExpertImageInput = document.getElementById('newExpertImage');
    const previewNewExpertImage = document.getElementById('previewNewExpertImage');
  
    newExpertImageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewNewExpertImage.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
      } else {
        previewNewExpertImage.innerHTML = '<span style="font-size:12px; color:#999;">Chưa có ảnh</span>';
      }
    });
  
    // 🟢 Submit form trở thành chuyên gia
    document.getElementById("becomeExpertForm").addEventListener("submit", async function(e) {
      e.preventDefault();
  
      const name = document.getElementById("newExpertName").value.trim();
      const specialty = document.getElementById("newExpertSpecialty").value.trim();
      const experience = document.getElementById("newExpertExperience").value.trim();
      const price = document.getElementById("newExpertPrice").value.trim();
      const imageFile = document.getElementById("newExpertImage").files[0];
  
      if (!name || !specialty || !experience || !price) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
  
      let imageBase64 = "";
      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
          imageBase64 = e.target.result;
          saveNewExpert();
        };
        reader.readAsDataURL(imageFile);
      } else {
        saveNewExpert();
      }
  
      function saveNewExpert() {
        const experts = JSON.parse(localStorage.getItem("experts")) || [];
        experts.push({
          name,
          specialty,
          experience,
          price,
          image: imageBase64
        });
        localStorage.setItem("experts", JSON.stringify(experts));
  
        alert("Đăng ký thành công! Bạn đã trở thành chuyên gia.");
        closeBecomeExpertForm();
        location.reload();
      }
    });
  
  });
  