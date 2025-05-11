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
        public async Task<IActionResult> GetLichHenChuyenGia(int chuyenGiaId, [FromQuery] int taiKhoanId, [FromQuery] string? trangThai = null)
        {
            var tk = await _context.TaiKhoans.FindAsync(taiKhoanId);
            if (tk == null || tk.TrangThai == "khoa")
                return Forbid("Tài khoản của bạn đã bị khóa.");
            
                var lichQuery = _context.LichHens
                    .Where(lh => lh.ChuyenGiaId == chuyenGiaId);

                // ✅ Nếu có truyền trạng thái → lọc thêm
                if (!string.IsNullOrEmpty(trangThai))
                {
                    lichQuery = lichQuery.Where(lh => lh.TrangThai == trangThai);
                }

                var lich = await lichQuery
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

            lich.TrangThai = "da_dien_ra";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã duyệt lịch, sẵn sàng cho buổi tư vấn." });
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


        
        [HttpPost("hoan-tat/{lichHenId}")]
        public async Task<IActionResult> HoanTatLichHen(int lichHenId)
        {
            var lich = await _context.LichHens
                .Include(l => l.NguoiDung)
                .FirstOrDefaultAsync(l => l.Id == lichHenId);

            if (lich == null)
                return NotFound(new { message = "Không tìm thấy lịch hẹn." });

            if (lich.TrangThai != "da_dien_ra")
                return BadRequest(new { message = "Lịch chưa được duyệt hoặc đã hoàn tất." });

            // ✅ Đánh dấu hoàn tất
            lich.TrangThai = "da_hoan_tat";

            // ✅ Giảm lượt trong gói người dùng
            var taiKhoanId = lich.NguoiDung.TaiKhoanId;
            var goiDangKy = await _context.GoiDangKies
                .Where(g => g.TaiKhoanId == taiKhoanId && g.TrangThai == "con_hieu_luc")
                .OrderByDescending(g => g.NgayKetThuc)
                .FirstOrDefaultAsync();

            if (goiDangKy != null && goiDangKy.SoLuotConLai > 0)
            {
                goiDangKy.SoLuotConLai--;

                // if (goiDangKy.SoLuotConLai == 0)
                // {
                //     goiDangKy.TrangThai = "het_hieu_luc";
                //     goiDangKy.NgayKetThuc = DateTime.Today;
                // }    bỏ vì phải giữ nguyên gói đăng kí dù cho hết lượt
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "✅ Đã hoàn tất buổi tư vấn và trừ lượt người dùng." });
        }

    }


}