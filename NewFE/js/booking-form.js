document.addEventListener("DOMContentLoaded", function () {
    const roleSelect = document.getElementById("roleSelect");
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) roleSelect.value = savedRole;
  
    roleSelect.addEventListener("change", function () {
      const role = roleSelect.value;
      localStorage.setItem("userRole", role);
      window.location.href = role === "admin" ? "admin.html" : "../index.html";
    });
  });
  
  // 🟢 Validate email
  function isValidEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  
  let tempBooking = null;
  
  // 🟢 Validate form
  function validateForm() {
    const expert = document.getElementById("expert").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const slot = document.getElementById("slot").value;
    const note = document.getElementById("note").value.trim();
  
    if (!expert || !name || !email || !date || !slot) {
      showPopup("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return false;
    }
  
    if (!isValidEmail(email)) {
      showPopup("Email không hợp lệ. Vui lòng nhập đúng.");
      return false;
    }
  
    tempBooking = { expert, name, email, date, time: slot, note };
    document.getElementById("paymentModal").style.display = "flex";
    return false;
  }
  
  // 🟢 Thanh toán
  function confirmPayment() {
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(tempBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));
  
    document.getElementById("paymentModal").style.display = "none";
    showPopup("Thanh toán thành công! Lịch hẹn của bạn đã được xác nhận.");
  
    document.getElementById("formBooking").reset();
  }
  
  // 🟢 Huỷ thanh toán
  function cancelPayment() {
    tempBooking = null;
    document.getElementById("paymentModal").style.display = "none";
    showPopup("Bạn đã huỷ đặt lịch. Lịch hẹn chưa được tạo.");
  }
  
  // 🟢 Popup
  function showPopup(msg) {
    document.getElementById("popup-message").innerText = msg;
    document.getElementById("popup").style.display = "flex";
  }
  
  function closePopup() {
    document.getElementById("popup").style.display = "none";
  }
  