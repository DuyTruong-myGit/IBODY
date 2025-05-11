using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/dat-lich")]
    public class DatLichController : ControllerBase
    {
        private readonly FinalIbodyContext _context;
        public DatLichController(FinalIbodyContext context)
        {
            _context = context;
        }



               [HttpPost("tao-lich")]
         public async Task<IActionResult> TaoLichHen([FromBody] TaoLichHenDto dto)
        {
            try
            {
                // Lấy tài khoản từ người dùng
                var nguoiDung = await _context.NguoiDungs
                    .FirstOrDefaultAsync(nd => nd.Id == dto.NguoiDungId);

                if (nguoiDung == null)
                    return BadRequest("Không tìm thấy người dùng");

                var taiKhoanId = nguoiDung.TaiKhoanId;

                // Kiểm tra gói còn hiệu lực và còn lượt
                var goi = await _context.GoiDangKies
                    .Where(g => g.TaiKhoanId == taiKhoanId
                             && g.TrangThai == "con_hieu_luc"
                             && g.NgayKetThuc >= DateTime.Today
                             && g.SoLuotConLai > 0)
                    .OrderByDescending(g => g.NgayKetThuc)
                    .FirstOrDefaultAsync();

                if (goi == null)
                    return BadRequest("Không tìm thấy gói còn hiệu lực hoặc đã hết lượt tư vấn.");

                // Trừ lượt
                goi.SoLuotConLai--;
                if (goi.SoLuotConLai == 0)
                    goi.TrangThai = "het_hieu_luc";

                // Tạo lịch mới
                var lichHen = new LichHen
                {
                    NguoiDungId = dto.NguoiDungId,
                    ChuyenGiaId = dto.ChuyenGiaId,
                    HinhThucId = dto.HinhThucId,
                    ThoiGianBatDau = dto.ThoiGianBatDau,
                    ThoiGianKetThuc = dto.ThoiGianKetThuc,
                    TomTat = dto.TomTat,
                    TrangThai = "cho_duyet"
                };

                _context.LichHens.Add(lichHen);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Tạo lịch hẹn thành công.", lichHenId = lichHen.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi tạo lịch: " + ex.Message });
            }
        }

        [HttpGet("hinh-thuc-tu-van")]
        public async Task<IActionResult> GetHinhThucTuVan()
        {
            var list = await _context.HinhThucTuVans.ToListAsync();
            return Ok(list);
        }



    }

        

public class TaoLichHenDto
{
    public int NguoiDungId { get; set; }
    public int ChuyenGiaId { get; set; }
    public int HinhThucId { get; set; }
    public DateTime ThoiGianBatDau { get; set; }
    public DateTime ThoiGianKetThuc { get; set; }
    public string? TomTat { get; set; }
}

}

