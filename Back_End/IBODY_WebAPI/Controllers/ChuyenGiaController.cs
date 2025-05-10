using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IBODY_WebAPI.Models;
using IBODY_WebAPI.Helpers;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/chuyen-gia")]
    public class ChuyenGiaController : ControllerBase
    {
        private readonly FinalIbodyContext _context;

        public ChuyenGiaController(FinalIbodyContext context)
        {
            _context = context;
        }

        //  API cập nhật thông tin hồ sơ chuyên gia
        [HttpPut("cap-nhat/{chuyenGiaId}")]
        public async Task<IActionResult> CapNhatChuyenGia(int chuyenGiaId, [FromBody] CapNhatChuyenGiaDto dto)
        {
            var cg = await _context.ChuyenGia.FindAsync(chuyenGiaId);
            if (cg == null)
                return NotFound(new { message = "Không tìm thấy chuyên gia." });

           
            cg.HoTen = dto.HoTen;
            cg.SoNamKinhNghiem = dto.SoNamKinhNghiem;
            cg.SoChungChi = dto.SoChungChi;
            cg.ChuyenMon = dto.ChuyenMon;
            cg.GioiThieu = dto.GioiThieu;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật hồ sơ chuyên gia thành công." });
        }


        [HttpPut("doi-mat-khau/{taiKhoanId}")]
        public async Task<IActionResult> DoiMatKhauChuyenGia(int taiKhoanId, [FromBody] DoiMatKhauDto dto)
        {
            var account = await _context.TaiKhoans.FindAsync(taiKhoanId);
            if (account == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            // Kiểm tra mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(dto.MatKhauCu, account.MatKhau))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
            }

            // Mã hóa và cập nhật mật khẩu mới
            account.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }


        [HttpPost("guiTinNhan")]
        public async Task<IActionResult> ExpertGuiTinNhan([FromBody] GuiTinNhanDto dto)
        {
            var coLichHen = await _context.LichHens.AnyAsync(lh =>
                lh.ChuyenGia.TaiKhoanId == dto.NguoiGuiId &&
                lh.NguoiDung.TaiKhoanId == dto.NguoiNhanId &&
                lh.TrangThai == "da_thanh_toan");

            if (!coLichHen)
            {
                return Forbid("Bạn chỉ có thể nhắn với người dùng đã đặt lịch và đã thanh toán.");
            }

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

            return Ok(new { message = "Đã gửi tin nhắn từ chuyên gia." });
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


        [HttpGet("hoaDonCuaChuyenGia")]
        public async Task<IActionResult> GetHoaDonTuVan(int chuyenGiaTaiKhoanId)
        {
            var hoaDons = await _context.LichHens
                .Include(lh => lh.NguoiDung)
                .Include(lh => lh.HinhThuc)
                .Where(lh => lh.ChuyenGia.TaiKhoanId == chuyenGiaTaiKhoanId && lh.TrangThai == "da_thanh_toan")
                .Join(_context.HoaDons,
                    lichHen => lichHen.NguoiDung.TaiKhoanId,
                    hoaDon => hoaDon.TaiKhoanId,
                    (lichHen, hoaDon) => new
                    {
                        HoaDonId = hoaDon.Id,
                        TaiKhoanNguoiDung = hoaDon.TaiKhoanId,
                        TenNguoiDung = lichHen.NguoiDung.HoTen,
                        ThoiGianTao = hoaDon.ThoiGianTao,
                        TongTien = hoaDon.TongTien,
                        HinhThuc = lichHen.HinhThuc.Ten,
                        TuVanThoiGian = lichHen.ThoiGianBatDau
                    })
                .OrderByDescending(h => h.ThoiGianTao)
                .ToListAsync();

            return Ok(hoaDons);
        }

        // API lấy danh sách đánh giá của chuyên gia
        [HttpGet("danhGia/{taiKhoanId}")]
        public async Task<IActionResult> GetDanhGiaCuaToi(int taiKhoanId)
        {
            // Tìm chuyên gia theo tài khoản ID
            var chuyenGia = await _context.ChuyenGia
                .FirstOrDefaultAsync(cg => cg.TaiKhoanId == taiKhoanId);

            if (chuyenGia == null)
                return NotFound(new { message = "Không tìm thấy chuyên gia tương ứng với tài khoản." });

            var danhGiaList = await _context.DanhGia
                .Where(dg => dg.ChuyenGiaId == chuyenGia.Id)
                .Include(dg => dg.NguoiDung)
                    .ThenInclude(nd => nd.TaiKhoan)
                .Include(dg => dg.LichHen)
                .OrderByDescending(dg => dg.LichHen.ThoiGianBatDau)
                .Select(dg => new
                {
                    dg.Id,
                    HoTenNguoiDung = dg.NguoiDung.HoTen,
                    EmailNguoiDung = dg.NguoiDung.TaiKhoan.Email,
                    ThoiGianTuvan = dg.LichHen.ThoiGianBatDau,
                    DiemSo = dg.DiemSo,
                    NhanXet = dg.NhanXet
                })
                .ToListAsync();

            return Ok(danhGiaList);
        }



        [HttpGet("khach-hang-tu-van/{chuyenGiaId}")]
        public async Task<IActionResult> GetKhachHangTungTuVan(int chuyenGiaId)
        {
            // Lấy danh sách lịch hẹn đã thanh toán hoặc đã diễn ra
            var lichHenList = await _context.LichHens
                .Include(lh => lh.NguoiDung).ThenInclude(nd => nd.TaiKhoan)
                .Include(lh => lh.HinhThuc)
                .Where(lh => lh.ChuyenGiaId == chuyenGiaId 
                        && (lh.TrangThai == "da_thanh_toan" || lh.TrangThai == "da_dien_ra"))
                .Select(lh => new
                {
                    LichHenId = lh.Id,
                    HoTenKhachHang = lh.NguoiDung.HoTen,
                    Email = lh.NguoiDung.TaiKhoan.Email,
                    TaiKhoanIdNguoiDung = lh.NguoiDung.TaiKhoan.Id, 
                    Ngay = lh.ThoiGianBatDau.Value.Date,
                    GioBatDau = lh.ThoiGianBatDau,
                    GioKetThuc = lh.ThoiGianKetThuc,
                    TomTat = lh.TomTat,
                    HinhThuc = lh.HinhThuc.Ten,
                    TrangThai = lh.TrangThai
                })
                .OrderByDescending(lh => lh.GioBatDau)
                .ToListAsync();

            return Ok(lichHenList);
        }

        [HttpGet("thongTin/{taiKhoanId}")]
        public async Task<IActionResult> GetThongTinTheoTaiKhoan(int taiKhoanId)
        {
            var chuyenGia = await _context.ChuyenGia
                .FirstOrDefaultAsync(cg => cg.TaiKhoanId == taiKhoanId);

            if (chuyenGia == null)
                return NotFound();

            return Ok(chuyenGia);
        }



    }


    public class CapNhatChuyenGiaDto
    {
        public string HoTen { get; set; } = null!;
        public int SoNamKinhNghiem { get; set; }
        public string SoChungChi { get; set; } = null!;
        public string ChuyenMon { get; set; } = null!;
        public string GioiThieu { get; set; } = null!;
    }

    public class DoiMatKhauDto
{
    public string MatKhauCu { get; set; } = null!;
    public string MatKhauMoi { get; set; } = null!;
}



}
