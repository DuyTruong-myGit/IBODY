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

        // hiển thị toàn bộ lịch hẹn đang có trên hệ thống
        [HttpGet("lich-hen")]
        public async Task<IActionResult> GetAllLichHen()
        {
            var lich = await _context.LichHens
                .Include(lh => lh.NguoiDung)
                .Include(lh => lh.ChuyenGia)
                .Include(lh => lh.HinhThuc)
                .Select(lh => new
                {
                    lh.Id,
                    lh.ThoiGianBatDau,
                    lh.ThoiGianKetThuc,
                    lh.TomTat,
                    NguoiDung = new
                    {
                        lh.NguoiDung.Id,
                        lh.NguoiDung.HoTen
                    },
                    ChuyenGia = new
                    {
                        lh.ChuyenGia.Id,
                        lh.ChuyenGia.HoTen,
                        lh.ChuyenGia.ChuyenMon
                    },
                    HinhThuc = lh.HinhThuc.Ten
                })
                .OrderByDescending(lh => lh.ThoiGianBatDau)
                .ToListAsync();

            return Ok(lich);
        }

        // Cập nhật lịch hẹn trên hệ thống
        [HttpPut("lich-hen/{id}")]
        public async Task<IActionResult> UpdateLichHen(int id, [FromBody] UpdateLichHenDto dto)
        {
            var lich = await _context.LichHens.FindAsync(id);
            if (lich == null)
                return NotFound(new { message = "Không tìm thấy lịch hẹn." });

            lich.ThoiGianBatDau = dto.ThoiGianBatDau;
            lich.ThoiGianKetThuc = dto.ThoiGianKetThuc;
            lich.TomTat = dto.TomTat;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật lịch hẹn thành công." });
        }



        // Xóa lịch hẹn trên hệ thống
        [HttpDelete("lich-hen/{id}")]
        public async Task<IActionResult> DeleteLichHen(int id)
        {
            var lich = await _context.LichHens.FindAsync(id);
            if (lich == null)
                return NotFound(new { message = "Không tìm thấy lịch hẹn." });

            _context.LichHens.Remove(lich);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa lịch hẹn thành công." });
        }

        // Hiển thị danh sách báo cáo vi phạm của người dùng
        [HttpGet("bao-cao")]
        public async Task<IActionResult> GetBaoCaoViPham()
        {
            var danhSach = await _context.BaoCaoViPhams
                .Where(bc => bc.LoaiDoiTuong == "nguoi_dung")
                .Select(bc => new
                {
                    bc.Id,
                    bc.NguoiBaoCaoId,
                    DoiTuongId = bc.DoiTuongId,
                    bc.LyDo,
                    bc.ThoiGian,
                    EmailNguoiBiBaoCao = _context.TaiKhoans
                        .Where(tk => tk.Id == bc.DoiTuongId)
                        .Select(tk => tk.Email)
                        .FirstOrDefault()
                })
                .OrderByDescending(bc => bc.ThoiGian)
                .ToListAsync();

            return Ok(danhSach);
        }
        // khóa tài khoản chuyên gia
        [HttpPost("khoa-tai-khoan/{id}")]
        public async Task<IActionResult> KhoaTaiKhoan(int id)
        {
            var tk = await _context.TaiKhoans.FindAsync(id);
            if (tk == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            tk.TrangThai = "khoa";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã khóa tài khoản chuyên gia." });
        }
        // mở khóa tài khoản chuyên gia
        [HttpPost("mo-khoa-tai-khoan/{id}")]
        public async Task<IActionResult> MoKhoaTaiKhoan(int id)
        {
            var tk = await _context.TaiKhoans.FindAsync(id);
            if (tk == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            if (tk.TrangThai != "khoa")
                return BadRequest(new { message = "Tài khoản không bị khóa." });

            tk.TrangThai = "hoat_dong";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã mở khóa tài khoản thành công." });
        }



    }



    public class UpdateAccountDto
    {
        public string VaiTro { get; set; } = null!;
        public string TrangThai { get; set; } = null!;
    }

    public class UpdateLichHenDto
    {
        public DateTime ThoiGianBatDau { get; set; }
        public DateTime ThoiGianKetThuc { get; set; }
        public string? TomTat { get; set; }
    }

    
}
