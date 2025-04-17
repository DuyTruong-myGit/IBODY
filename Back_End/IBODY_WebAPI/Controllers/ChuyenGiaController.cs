using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IBODY_WebAPI.Models;

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
