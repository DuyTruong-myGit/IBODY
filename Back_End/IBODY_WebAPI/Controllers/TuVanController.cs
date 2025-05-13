using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/tu-van")]
    public class TuVanController : ControllerBase
    {
        private readonly FinalIbodyContext _context;

        public TuVanController(FinalIbodyContext context)
        {
            _context = context;
        }

        // Lấy danh sách chuyên gia đã xác thực 
        [HttpGet("chuyen-gia")]
        public async Task<IActionResult> GetExperts([FromQuery] string? keyword)
        {
            var query = _context.ChuyenGia
                .Include(cg => cg.TaiKhoan)
                .Where(cg => cg.TrangThai == "xac_thuc");

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                keyword = keyword.ToLower().Trim();
                query = query.Where(cg =>
                    cg.HoTen.ToLower().Contains(keyword) ||
                    cg.ChuyenMon.ToLower().Contains(keyword));
            }

            var result = await query
                .Select(cg => new
                {
                    cg.Id,
                    cg.HoTen,
                    cg.SoNamKinhNghiem,
                    cg.SoChungChi,
                    cg.ChuyenMon,
                    cg.GioiThieu,
                    Email = cg.TaiKhoan.Email
                })
                .ToListAsync();

            return Ok(result);
        }

        // sau khi người dùng chọn chuyên gia, lấy thông tin chi tiết của chuyên gia đó
        [HttpGet("chuyen-gia/{id}")]
        public async Task<IActionResult> GetExpertDetail(int id)
        {
            var expert = await _context.ChuyenGia
                .Include(cg => cg.TaiKhoan)
                .FirstOrDefaultAsync(cg => cg.Id == id && cg.TrangThai == "xac_thuc");

            if (expert == null)
                return NotFound(new { message = "Không tìm thấy chuyên gia." });

            var tk = await _context.TaiKhoans.FindAsync(expert.TaiKhoanId);
            if (tk == null || tk.TrangThai == "khoa")
                return Forbid("Tài khoản của bạn đã bị khóa.");

            // Lấy đánh giá (nếu có)
            var danhGias = await _context.DanhGia
                .Where(dg => dg.ChuyenGiaId == id)
                .Select(dg => new
                {
                    dg.DiemSo,
                    dg.NhanXet,
                    NguoiDanhGia = _context.NguoiDungs
                        .Where(nd => nd.Id == dg.NguoiDungId)
                        .Select(nd => nd.HoTen)
                        .FirstOrDefault()
                }).ToListAsync();

            // Lấy thời gian rảnh
            var thoiGianRanh = await _context.ThoiGianRanhChuyenGia
                .Where(t => t.ChuyenGiaId == id)
                .Select(t => new
                    {
                        t.ThuTrongTuan,
                        Tu = t.Tu.HasValue ? t.Tu.Value.ToString("HH:mm") : null,
                        Den = t.Den.HasValue ? t.Den.Value.ToString("HH:mm") : null
                    }).ToListAsync();

            return Ok(new
            {
                Id = expert.Id,
                TaiKhoanId = expert.TaiKhoanId,
                expert.HoTen,
                expert.SoNamKinhNghiem,
                expert.ChuyenMon,
                expert.SoChungChi,
                expert.GioiThieu,
                Email = expert.TaiKhoan.Email,
                ThoiGianRanh = thoiGianRanh,
                DanhGia = danhGias
            });
        }

        [HttpGet("avgDanhGia/{chuyenGiaId}")]
        public async Task<IActionResult> ThongKeDanhGia(int chuyenGiaId)
        {
            var danhGias = await _context.DanhGia
                .Where(dg => dg.ChuyenGiaId == chuyenGiaId)
                .ToListAsync();

            if (!danhGias.Any())
            {
                return Ok(new
                {
                    DiemTrungBinh = 0,
                    SoLuongDanhGia = 0
                });
            }

            var diemTB = Math.Round(danhGias.Average(dg => dg.DiemSo.GetValueOrDefault()), 1);
            var soLuong = danhGias.Count;

            return Ok(new
            {
                DiemTrungBinh = diemTB,
                SoLuongDanhGia = soLuong
            });
        }


    }
}  
