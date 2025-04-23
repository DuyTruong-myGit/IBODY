using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IBODY_WebAPI.Helpers;
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

        
            //Đánh giá chuyên gia chỉ sau khi kết thúc lịch hẹn
        [HttpPost("them_DanhGia")]
        public async Task<IActionResult> DanhGiaChuyenGia([FromBody] DanhGiaDto dto)
        {
            var lich = await _context.LichHens
                .FirstOrDefaultAsync(lh => lh.Id == dto.LichHenId &&
                                        lh.NguoiDungId == dto.NguoiDungId &&
                                        lh.ChuyenGiaId == dto.ChuyenGiaId);

            if (lich == null)
                return BadRequest("Lịch hẹn không hợp lệ.");

            if (lich.ThoiGianKetThuc > DateTime.Now)
                return BadRequest("Bạn chỉ có thể đánh giá sau khi buổi tư vấn kết thúc.");
            //kiểm tra chống spam
            var daDanhGia = await _context.DanhGia
            .AnyAsync(dg => dg.LichHenId == dto.LichHenId && dg.NguoiDungId == dto.NguoiDungId);
            if (daDanhGia)
            {
                return BadRequest(new { message = "Bạn đã đánh giá lịch hẹn này rồi." });
            }
            var danhGia = new DanhGium
            {
                LichHenId = dto.LichHenId,
                NguoiDungId = dto.NguoiDungId,
                ChuyenGiaId = dto.ChuyenGiaId,
                DiemSo = dto.DiemSo,
                NhanXet = dto.NhanXet
            };

            _context.DanhGia.Add(danhGia);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi đánh giá!" });
        }

        // THỰC HIỆN THANH TOÁN LỊCH HẸN
        [HttpPost("thanh-toan-lich-hen")]
        public async Task<IActionResult> ThanhToanLichHen([FromBody] ThanhToanDto dto)
        {
            var lichHen = await _context.LichHens.FindAsync(dto.LichHenId);
            Console.WriteLine($"➡️ LichHenId: {dto.LichHenId}, TaiKhoanId: {dto.TaiKhoanId}, SoTien: {dto.SoTien}");
            if (lichHen == null || lichHen.TrangThai != "cho_thanh_toan")
                return BadRequest("Lịch hẹn không hợp lệ hoặc đã thanh toán.");
            if (lichHen.ThoiGianBatDau < DateTime.Now)
                return BadRequest("Lịch hẹn đã diễn ra, không thể thanh toán.");
            var hoaDon = new HoaDon
            {
                TaiKhoanId = dto.TaiKhoanId,
                GoiDichVuId = null,
                TongTien = dto.SoTien,
                ThoiGianTao = DateTime.Now
            };
            _context.HoaDons.Add(hoaDon);
            await _context.SaveChangesAsync();

            var giaoDich = new GiaoDich
            {
                HoaDonId = hoaDon.Id,
                PhuongThucId = dto.PhuongThucId,
                SoTien = dto.SoTien,
                ThoiGian = DateTime.Now
            };
            _context.GiaoDiches.Add(giaoDich);

            // ✅ Cập nhật trạng thái lịch hẹn
            lichHen.TrangThai = "da_thanh_toan";

            await _context.SaveChangesAsync();
            return Ok(new { message = "Thanh toán thành công!" });
        }
        

        [HttpPost("guiTinNhan")]
        public async Task<IActionResult> GuiTinNhan([FromBody] GuiTinNhanDto dto)
        {
            var tinNhan = new TinNhan
            {
                NguoiGuiId = dto.NguoiGuiId,
                NguoiNhanId = dto.NguoiNhanId,
                NoiDung = dto.NoiDung,
                ThoiGian = DateTime.Now
            };
            if (BadWordsFilter.ContainsBadWords(dto.NoiDung))
            {
                return BadRequest(new { message = "Tin nhắn chứa từ ngữ không phù hợp." });
            }

            _context.TinNhans.Add(tinNhan);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi tin nhắn." });
        }

        [HttpGet("lichSuTinNhan")]
        public async Task<IActionResult> LichSuTinNhan([FromQuery] int taiKhoan1, [FromQuery] int taiKhoan2)
        {
            var lichSu = await _context.TinNhans
                .Where(t =>
                    (t.NguoiGuiId == taiKhoan1 && t.NguoiNhanId == taiKhoan2) ||
                    (t.NguoiGuiId == taiKhoan2 && t.NguoiNhanId == taiKhoan1))
                .OrderBy(t => t.ThoiGian)
                .ToListAsync();

            return Ok(lichSu);
        }


        [HttpGet("lichSuTuVan/{taiKhoanId}")]
        public async Task<IActionResult> GetLichSuTuVan(int taiKhoanId)
        {
            // Tìm người dùng
            var nguoiDung = await _context.NguoiDungs
                .FirstOrDefaultAsync(nd => nd.TaiKhoanId == taiKhoanId);

            if (nguoiDung == null)
                return NotFound(new { message = "Không tìm thấy người dùng." });

            var lichSu = await _context.LichHens
                .Where(lh => lh.NguoiDungId == nguoiDung.Id && lh.TrangThai == "da_thanh_toan")
                .Include(lh => lh.ChuyenGia)
                .Include(lh => lh.HinhThuc)
                .Join(_context.HoaDons,
                    lh => lh.NguoiDung.TaiKhoanId,
                    hd => hd.TaiKhoanId,
                    (lh, hd) => new { LichHen = lh, HoaDon = hd })
                .Join(_context.GiaoDiches,
                    combo => combo.HoaDon.Id,
                    gd => gd.HoaDonId,
                    (combo, gd) => new
                    {
                        combo.LichHen.Id,
                        ChuyenGia = combo.LichHen.ChuyenGia.HoTen,
                        combo.LichHen.ThoiGianBatDau,
                        combo.LichHen.ThoiGianKetThuc,
                        combo.LichHen.TomTat,
                        combo.LichHen.HinhThuc.Ten,
                        HoaDonId = combo.HoaDon.Id,
                        TongTien = combo.HoaDon.TongTien,
                        PhuongThucId = gd.PhuongThucId,
                        ThoiGianThanhToan = gd.ThoiGian
                    })
                .OrderByDescending(x => x.ThoiGianThanhToan)
                .ToListAsync();

            return Ok(lichSu);
        }


    }


    public class UpdateUserProfileDto
    {
        public string HoTen { get; set; } = null!;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? MucTieuTamLy { get; set; }
    }

    public class DanhGiaDto
    {
    public int LichHenId { get; set; }
    public int NguoiDungId { get; set; }
    public int ChuyenGiaId { get; set; }
    public int DiemSo { get; set; }
    public string? NhanXet { get; set; }
    }

    public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

//    public class BinhLuanDto
// {
//     public int NguoiBinhLuanId { get; set; }  
//     public int ChuyenGiaId { get; set; }   
//     public string NoiDung { get; set; } = null!;
// }

    public class ThanhToanDto
{
    public int LichHenId { get; set; }
    public int TaiKhoanId { get; set; }
    public int PhuongThucId { get; set; }
    public decimal SoTien { get; set; }
}

    public class GuiTinNhanDto
{
    public int NguoiGuiId { get; set; }
    public int NguoiNhanId { get; set; }
    public string NoiDung { get; set; } = null!;
}

}



