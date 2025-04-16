document.getElementById("expertForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = this;
  const formData = new FormData(form);

  const rawUser = localStorage.getItem("user");
  if (!rawUser) {
    alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
    return;
  }

  const user = JSON.parse(rawUser);
  formData.append("userId", user.id); // ✅ gắn đúng userId

  try {
    for (let [key, value] of formData.entries()) {
      console.log(key, value); // log kiểm tra
    }

    const response = await fetch("http://localhost:5221/api/Profile/expert", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      alert("Hồ sơ chuyên gia đã được gửi!\nChuyển về trang chính...");
      window.location.href = "index.html";
    } else {
      const resText = await response.text();
      alert("Không thể gửi hồ sơ: " + resText);
    }
  } catch (err) {
    console.error("Lỗi gửi hồ sơ chuyên gia:", err);
    alert("Đã xảy ra lỗi khi gửi hồ sơ.");
  }
});
