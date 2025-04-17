using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using IBODY_WebAPI.Data;

namespace IBODY_WebAPI.Controllers
{
    [Authorize(Roles = "quan_tri")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        [HttpGet("dashboard")]
    public IActionResult GetAdminInfo()
    {
        return Ok("Xin chào quản trị viên!");
    }
        private readonly FinalIbodyContext _context;

        public AdminController(FinalIbodyContext context)
        {
            _context = context;
        }


        [HttpGet("accounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var accounts = await _context.TaiKhoans
                .Select(t => new
                {
                    t.Id,
                    t.Email,
                    t.VaiTro,
                    t.TrangThai
                })
                .ToListAsync();

            return Ok(accounts);
        }

        [HttpPut("account/{id}")]
        public async Task<IActionResult> UpdateAccount(int id, [FromBody] UpdateAccountDto dto)
        {
            var account = await _context.TaiKhoans.FindAsync(id);
            if (account == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            account.VaiTro = dto.VaiTro;
            account.TrangThai = dto.TrangThai;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật tài khoản thành công." });
        }

        // ✅ Xóa tài khoản (hard delete)
        [HttpDelete("account/{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var account = await _context.TaiKhoans.FindAsync(id);
            if (account == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            _context.TaiKhoans.Remove(account);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa tài khoản thành công." });
        }


        [HttpGet("expert-requests")]
        public async Task<IActionResult> GetPendingExpertRequests()
        {
        var pending = await _context.ChuyenGia
        .Where(cg => cg.TrangThai == "cho_duyet")
        .Select(cg => new
        {
            cg.Id,
            cg.TaiKhoanId,
            cg.HoTen,
            cg.SoNamKinhNghiem,
            cg.SoChungChi,
            cg.ChuyenMon,
            cg.GioiThieu,
            cg.TrangThai
        }).ToListAsync();

        return Ok(pending);
        }   


        [HttpPost("expert-approve/{id}")]
        public async Task<IActionResult> ApproveExpert(int id)
        {
        var expert = await _context.ChuyenGia.FindAsync(id);
        if (expert == null)
            return NotFound();

        expert.TrangThai = "xac_thuc";

            // cập nhật role của tài khoản
        var account = await _context.TaiKhoans.FindAsync(expert.TaiKhoanId);
        if (account != null)
            account.VaiTro = "chuyen_gia";

        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã duyệt nâng cấp thành chuyên gia." });
        }



        [HttpPost("expert-reject/{id}")]
        public async Task<IActionResult> RejectExpert(int id)
        {
        var expert = await _context.ChuyenGia.FindAsync(id);
        if (expert == null)
            return NotFound();

        expert.TrangThai = "tu_choi";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã từ chối yêu cầu nâng cấp." });
        }




    }



    public class UpdateAccountDto
    {
        public string VaiTro { get; set; } = null!;
        public string TrangThai { get; set; } = null!;
    }


    
}
