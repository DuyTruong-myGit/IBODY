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

        [HttpGet("hinh-thuc-tu-van")]
        public async Task<IActionResult> GetHinhThucTuVan()
        {
            var hinhThuc = await _context.HinhThucTuVans
                .Select(ht => new
                {
                    ht.Id,
                    ht.Ten,
                    ht.ThoiLuongPhut,
                    ht.GiaCoBan
                })
                .ToListAsync();

            return Ok(hinhThuc);
        }



        [HttpPost("tao-lich")]
        public async Task<IActionResult> TaoLichHen([FromBody] TaoLichHenDto dto)
        {
        // Kiểm tra có trùng giờ không (tùy chọn)
            var trungLich = await _context.LichHens.AnyAsync(lh =>
                lh.ChuyenGiaId == dto.ChuyenGiaId &&
                ((dto.ThoiGianBatDau >= lh.ThoiGianBatDau && dto.ThoiGianBatDau < lh.ThoiGianKetThuc) ||
                (dto.ThoiGianKetThuc > lh.ThoiGianBatDau && dto.ThoiGianKetThuc <= lh.ThoiGianKetThuc))
            );

            if (trungLich)
            {
                return BadRequest(new { message = "Chuyên gia đã có lịch trong khoảng thời gian này." });
            }

            var lichHen = new LichHen
            {
                NguoiDungId = dto.NguoiDungId,
                ChuyenGiaId = dto.ChuyenGiaId,
                HinhThucId = dto.HinhThucId,
                ThoiGianBatDau = dto.ThoiGianBatDau,
                ThoiGianKetThuc = dto.ThoiGianKetThuc,
                TomTat = dto.TomTat
            };

            _context.LichHens.Add(lichHen);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đặt lịch thành công!" });
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

