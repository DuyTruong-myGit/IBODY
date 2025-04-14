const modal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');

function openAuthModal() {
  modal.classList.add('active');
}

function closeAuthModal() {
  modal.classList.remove('active');
}

// Ẩn modal khi bấm ra ngoài form
modal.addEventListener('click', function (e) {
  if (e.target === modal) {
    closeAuthModal();
  }
});

loginToggle.onclick = () => {
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  loginToggle.classList.add('active');
  registerToggle.classList.remove('active');
};

registerToggle.onclick = () => {
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
  registerToggle.classList.add('active');
  loginToggle.classList.remove('active');
};