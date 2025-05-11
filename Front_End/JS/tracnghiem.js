const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    alert('Vui lòng đăng nhập');
    window.location.href = 'login.html';
}

const questions = [
  // Mỗi câu hỏi gồm id, text, type ('stress', 'anxiety', 'depression')
  { id: 1, text: 'Tôi cảm thấy khó thư giãn.', type: 'stress' },
  { id: 2, text: 'Tôi cảm thấy sợ hãi không có lý do rõ ràng.', type: 'anxiety' },
  { id: 3, text: 'Tôi không thấy gì làm mình hứng thú.', type: 'depression' },
  // ... thêm đủ 21 câu, chia đều 3 nhóm
];

const levels = [
  { value: 0, label: 'Không bao giờ' },
  { value: 1, label: 'Thỉnh thoảng' },
  { value: 2, label: 'Thường xuyên' },
  { value: 3, label: 'Gần như luôn luôn' },
];

function renderQuestions() {
  const container = document.getElementById('questionsContainer');
  questions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `<p><strong>Câu ${index + 1}:</strong> ${q.text}</p>` + levels.map(l => `
      <label><input type="radio" name="q${q.id}" value="${l.value}" required> ${l.label}</label>
    `).join('<br>');
    container.appendChild(div);
  });
}

document.getElementById('quizForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const answers = questions.map(q => ({
    id: q.id,
    type: q.type,
    value: parseInt(formData.get(`q${q.id}`))
  }));

  // Tính điểm
  let stress = 0, anxiety = 0, depression = 0;
  answers.forEach(a => {
    if (a.type === 'stress') stress += a.value;
    if (a.type === 'anxiety') anxiety += a.value;
    if (a.type === 'depression') depression += a.value;
  });

  const result = {
    userId: user.taiKhoanId,
    stress, anxiety, depression
  };

  // Gửi lên backend (nếu cần)
  await fetch('http://localhost:5221/api/tracnghiem/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  });

  showResult(result);
});

function showResult({ stress, anxiety, depression }) {
  function classify(score) {
    if (score <= 7) return 'Bình thường';
    if (score <= 14) return 'Nhẹ';
    if (score <= 21) return 'Trung bình';
    if (score <= 28) return 'Nặng';
    return 'Rất nặng';
  }

  document.getElementById('resultContainer').innerHTML = `
    <h3>Kết quả:</h3>
    <p>Trầm cảm: ${depression} (${classify(depression)})</p>
    <p>Lo âu: ${anxiety} (${classify(anxiety)})</p>
    <p>Stress: ${stress} (${classify(stress)})</p>
    <a href="./NguoiDung/search-expert.html">→ Gặp chuyên gia ngay</a>
  `;
}

renderQuestions();
