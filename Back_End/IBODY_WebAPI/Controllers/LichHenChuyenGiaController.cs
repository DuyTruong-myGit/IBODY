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
                .Where(lh => lh.ChuyenGiaId == chuyenGiaId && (lh.TrangThai == "cho_duyet" || lh.TrangThai == "da_thanh_toan"))
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
            if (lich.TrangThai == "da_thanh_toan")
                return BadRequest(new { message = "Lịch đã thanh toán, không thể hủy." });

            var danhGiaLienQuan = _context.DanhGia.Where(dg => dg.LichHenId == lichHenId);
            _context.DanhGia.RemoveRange(danhGiaLienQuan); // phải xóa đánh giá trước vì nó có khóa ngoại với lịch hẹn
            
            _context.LichHens.Remove(lich);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Chuyên gia đã hủy lịch hẹn thành công." });
        }




        [HttpPost("duyet-lich/{lichHenId}")]
        public async Task<IActionResult> DuyetLichHen(int lichHenId)
        {
            var lich = await _context.LichHens.FindAsync(lichHenId);
            if (lich == null || lich.TrangThai != "cho_duyet")
                return BadRequest("Lịch không hợp lệ.");

            lich.TrangThai = "cho_thanh_toan";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt lịch, chờ thanh toán." });
        }

        [HttpPost("tu-choi-lich/{lichHenId}")]
        public async Task<IActionResult> TuChoiLichHen(int lichHenId)
        {
            var lich = await _context.LichHens.FindAsync(lichHenId);
            if (lich == null || lich.TrangThai != "cho_duyet")
                return BadRequest("Lịch không hợp lệ.");

            lich.TrangThai = "da_huy";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã từ chối lịch." });
        }


    }


}