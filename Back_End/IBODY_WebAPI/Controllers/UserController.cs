using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly FinalIbodyContext _context;

        public UserController(FinalIbodyContext context)
        {
            _context = context;
        }

        // ✅ LẤY THÔNG TIN HỒ SƠ
        [HttpGet("profile/{accountId}")]
        public async Task<IActionResult> GetUserProfile(int accountId)
        {
            var user = await _context.NguoiDungs
                .FirstOrDefaultAsync(nd => nd.TaiKhoanId == accountId);

            if (user == null)
                return NotFound(new { message = "Không tìm thấy hồ sơ người dùng." });

            var account = await _context.TaiKhoans.FindAsync(accountId);

            return Ok(new
            {
                email = account?.Email,
                hoTen = user.HoTen,
                ngaySinh = user.NgaySinh,
                gioiTinh = user.GioiTinh,
                mucTieuTamLy = user.MucTieuTamLy
            });
        }

        // ✅ CẬP NHẬT THÔNG TIN HỒ SƠ
        [HttpPut("profile/{accountId}")]
        public async Task<IActionResult> UpdateUserProfile(int accountId, [FromBody] UpdateUserProfileDto dto)
        {
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(nd => nd.TaiKhoanId == accountId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy hồ sơ người dùng." });

            user.HoTen = dto.HoTen;
            user.NgaySinh = dto.NgaySinh;
            user.GioiTinh = dto.GioiTinh;
            user.MucTieuTamLy = dto.MucTieuTamLy;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật hồ sơ thành công." });
        }



        [HttpPut("change-password/{accountId}")]
        public async Task<IActionResult> ChangePassword(int accountId, [FromBody] ChangePasswordDto dto)
        {
            var account = await _context.TaiKhoans.FindAsync(accountId);
            if (account == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            // Kiểm tra mật khẩu hiện tại có đúng không
            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, account.MatKhau))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
            }

            // Gán mật khẩu mới (đã mã hoá)
            account.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công." });
        }


    }


    public class UpdateUserProfileDto
    {
        public string HoTen { get; set; } = null!;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? MucTieuTamLy { get; set; }
    }
}


public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}
