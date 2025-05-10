const user = JSON.parse(localStorage.getItem("user"));

if (!user || !Array.isArray(user.roles) || !user.roles.includes("quan_tri")) {
  window.location.href = "index.html";
}
async function loadDashboardStats() {
  try {
    const [resUsers, resExperts, resAppointments, resReviews, resReports] = await Promise.all([
      fetch("http://localhost:5221/api/admin/accounts"),
      fetch("http://localhost:5221/api/admin/demSoLuongChuyenGia"),
      fetch("http://localhost:5221/api/admin/lich-hen"),
      fetch("http://localhost:5221/api/admin/danhGiaCuaChuyenGia"),
      fetch("http://localhost:5221/api/admin/bao-cao")
    ]);

    const users = await resUsers.json();
    const experts = await resExperts.json();
    const appointments = await resAppointments.json();
    const reviews = await resReviews.json();
    const reports = await resReports.json();

    document.getElementById("countUsers").innerText = users.count || 0;
    document.getElementById("countExperts").innerText = experts.count || 0;
    document.getElementById("countAppointments").innerText = appointments.count || 0;
    document.getElementById("countReviews").innerText = reviews.count || 0;
    document.getElementById("countReports").innerText = reports.count || 0;
  } catch (err) {
    console.error("Lỗi tải thống kê:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadDashboardStats);

document.getElementById("logoutLink")?.addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "../index.html";
});
