document.getElementById("expertForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  const entries = Object.fromEntries(formData.entries());
  console.log("Hồ sơ chuyên gia:", entries);

  alert("Hồ sơ chuyên gia đã được gửi!\nChuyển về trang chính...");
  window.location.href = "index.html";
});
    
    