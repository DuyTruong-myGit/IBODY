using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Controllers
{    
    [ApiController]
    [Route("api/lich-hen")]
    public class LichHenController : ControllerBase
    {
        private readonly FinalIbodyContext _context;

        public LichHenController(FinalIbodyContext context)
        {
            _context = context;
        }

        //Lịch hẹn dành cho chuyên gia đang đăng nhập
        [HttpGet("chuyen-gia/{chuyenGiaId}")]
        public async Task<IActionResult> GetLichHenChuyenGia(int chuyenGiaId,[FromQuery] int taiKhoanId)
        {
            var tk = await _context.TaiKhoans.FindAsync(taiKhoanId);
            if (tk == null || tk.TrangThai == "khoa")
                return Forbid("Tài khoản của bạn đã bị khóa.");
            
            var lich = await _context.LichHens
                .Where(lh => lh.ChuyenGiaId == chuyenGiaId)
                .Include(lh => lh.NguoiDung)
                .Include(lh => lh.HinhThuc)
                .Select(lh => new
                {
                    lh.Id,
                    lh.ThoiGianBatDau,
                    lh.ThoiGianKetThuc,
                    HinhThuc = lh.HinhThuc.Ten,
                    TomTat = lh.TomTat,
                    NguoiDatLich = new
                    {
                        lh.NguoiDung.Id,
                        lh.NguoiDung.HoTen
                    }
                })
                .OrderBy(lh => lh.ThoiGianBatDau)
                .ToListAsync();

            return Ok(lich);
        }


        [HttpDelete("huy-lich-chuyen-gia/{lichHenId}")]
        public async Task<IActionResult> HuyLichHenChuyenGia(int lichHenId,[FromQuery] int taiKhoanId)
        {
            var tk = await _context.TaiKhoans.FindAsync(taiKhoanId);
            if (tk == null || tk.TrangThai == "khoa")
                return Forbid("Tài khoản của bạn đã bị khóa.");
                
            var lich = await _context.LichHens.FindAsync(lichHenId);
            if (lich == null)
                return NotFound(new { message = "Lịch hẹn không tồn tại." });

            _context.LichHens.Remove(lich);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Chuyên gia đã hủy lịch hẹn thành công." });
        }



    }


}