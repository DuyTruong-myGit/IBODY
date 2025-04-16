const ageInput = document.getElementById('age');
const guardianInfo = document.getElementById('guardianInfo');
const purposeInput = document.getElementById('purposeInput');
const purposeOptions = document.getElementById('purposeOptions');

ageInput.addEventListener('input', () => {
  const age = parseInt(ageInput.value);
  guardianInfo.style.display = (age && age < 16) ? 'block' : 'none';
});

purposeInput.addEventListener('click', () => {
  purposeOptions.style.display = purposeOptions.style.display === 'flex' ? 'none' : 'flex';
});

purposeOptions.querySelectorAll('label').forEach(option => {
  option.addEventListener('click', () => {
    purposeInput.value = option.textContent;
    purposeOptions.style.display = 'none';
  });
});

document.addEventListener('click', function(event) {
  if (!purposeOptions.contains(event.target) && event.target !== purposeInput) {
    purposeOptions.style.display = 'none';
  }
});

document.getElementById('profileForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const obj = Object.fromEntries(formData.entries());
  obj.userId = JSON.parse(localStorage.getItem("user"))?.id; // lấy user ID từ localStorage

  const response = await fetch("http://localhost:5221/api/Profile/client", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(obj)
  });

  if (response.ok) {
    alert("Hồ sơ đã được lưu!\nChuyển hướng về trang chính...");
    window.location.href = "index.html";
  } else {
    alert("Không thể lưu hồ sơ. Vui lòng thử lại.");
  }
});