// support-user.js
const API_BASE_URL = "http://localhost:5221/api";
const user = JSON.parse(localStorage.getItem("user"));

// Lắng nghe sự kiện gửi form
const form = document.getElementById("supportForm");
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const topic = document.getElementById("supportTopic").value.trim();
  const content = document.getElementById("supportContent").value.trim();

  if (!topic || !content) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  // Gửi nội dung hỗ trợ về hệ thống (giả định gửi qua API báo cáo như gửi yêu cầu hỗ trợ)
  const payload = {
    nguoiBaoCaoId: user.taiKhoanId,
    chuyenGiaTaiKhoanId: 0, // ID 0 tượng trưng cho báo cáo hỗ trợ (không phải chuyên gia cụ thể)
    lyDo: `[HỖ TRỢ] ${topic}: ${content}`
  };

  try {
    const res = await fetch(`${API_BASE_URL}/bao-cao/gui`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Yêu cầu hỗ trợ đã được gửi thành công!");
      form.reset();
    } else {
      const data = await res.json();
      alert(data.message || "Gửi yêu cầu thất bại.");
    }
  } catch (error) {
    console.error("Lỗi gửi hỗ trợ:", error);
    alert("Đã xảy ra lỗi trong quá trình gửi yêu cầu.");
  }
});
