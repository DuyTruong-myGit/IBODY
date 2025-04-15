using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IbodyContext _context;

        public AdminController(IbodyContext context)
        {
            _context = context;
        }

        // ✅ Lấy toàn bộ người dùng (kể cả chuyên gia)
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        // ✅ Xoá tài khoản người dùng (soft delete nếu cần)
        [HttpDelete("user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xoá người dùng thành công" });
        }

        // ✅ Danh sách chuyên gia chờ duyệt
        [HttpGet("experts/pending")]
        public async Task<IActionResult> GetPendingExperts()
        {
            var pending = await _context.ExpertProfiles
                .Include(x => x.User)
                .Where(x => x.IsApproved == false)
                .ToListAsync();

            return Ok(pending);
        }

        // ✅ Phê duyệt hồ sơ chuyên gia
        [HttpPost("experts/approve/{profileId}")]
        public async Task<IActionResult> ApproveExpert(int profileId)
        {
            var expert = await _context.ExpertProfiles.FindAsync(profileId);
            if (expert == null) return NotFound();

            expert.IsApproved = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã duyệt hồ sơ chuyên gia." });
        }

        // ✅ Từ chối (xoá) hồ sơ chuyên gia
        [HttpDelete("experts/reject/{profileId}")]
        public async Task<IActionResult> RejectExpert(int profileId)
        {
            var expert = await _context.ExpertProfiles.FindAsync(profileId);
            if (expert == null) return NotFound();

            _context.ExpertProfiles.Remove(expert);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã từ chối và xoá hồ sơ chuyên gia." });
        }
    }
}
