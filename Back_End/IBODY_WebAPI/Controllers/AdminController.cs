using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using IBODY_WebAPI.Data;
using Microsoft.AspNetCore.Identity;


namespace IBODY_WebAPI.Controllers
{
    [AllowAnonymous]
   //[Authorize(Roles = "quan_tri")]
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
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(FinalIbodyContext context,UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        [HttpGet("accounts")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var identityUsers = _userManager.Users.ToList(); // từ Identity
            var taiKhoans = await _context.TaiKhoans.ToListAsync();

            var result = taiKhoans.Select(tk =>
            {
                var identity = identityUsers.FirstOrDefault(u => u.Email == tk.Email);

                return new
                {
                    id = tk.Id,
                    email = tk.Email,
                    vaiTro = tk.VaiTro,
                    trangThai = tk.TrangThai,
                    identityId = identity?.Id,
                    fullName = identity?.FullName ?? ""
                };
            });

            return Ok(result);
        }



        // Xóa tài khoản 
        [HttpDelete("account/{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            var taiKhoan = await _context.TaiKhoans.FindAsync(id);
            if (taiKhoan == null)
                return NotFound(new { message = "Không tìm thấy tài khoản." });

            // Nếu là người dùng: xoá bản ghi liên quan trong bảng nguoi_dung
            var nguoiDung = await _context.NguoiDungs
                .FirstOrDefaultAsync(nd => nd.TaiKhoanId == id);
            if (nguoiDung != null)
                _context.NguoiDungs.Remove(nguoiDung);

            //Nếu là chuyên gia: xoá bản ghi liên quan trong bảng chuyen_gia
            var chuyenGia = await _context.ChuyenGia
                .FirstOrDefaultAsync(cg => cg.TaiKhoanId == id);
            if (chuyenGia != null)
                _context.ChuyenGia.Remove(chuyenGia);

            // xóa ở bảng identity
            var identityUser = await _userManager.FindByEmailAsync(taiKhoan.Email);
            if (identityUser != null)
            {
                await _userManager.DeleteAsync(identityUser);
            }

            // Xoá tài khoản
            _context.TaiKhoans.Remove(taiKhoan);

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa tài khoản và dữ liệu liên quan." });
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
            {
                account.VaiTro = "chuyen_gia";

                // ✅ Tìm và xóa người dùng khỏi bảng nguoi_dung
                var nguoiDung = await _context.NguoiDungs
                    .FirstOrDefaultAsync(nd => nd.TaiKhoanId == expert.TaiKhoanId);

                if (nguoiDung != null)
                    _context.NguoiDungs.Remove(nguoiDung);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã duyệt nâng cấp thành chuyên gia và chuyển dữ liệu hoàn tất." });
        }



        [HttpPost("expert-reject/{id}")]
        public async Task<IActionResult> RejectExpert(int id)
        {
        var expert = await _context.ChuyenGia.FindAsync(id);
        if (expert == null)
            return NotFound(new { message = "Không tìm thấy chuyên gia." });

        if (expert.TrangThai != "cho_duyet")
        {
            return BadRequest(new { message = "Chuyên gia đã được xử lý. Không thể từ chối nữa." });
        }
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
            if (lich.TrangThai == "da_thanh_toan" || lich.TrangThai == "da_dien_ra")
            {
                return BadRequest(new { message = "Lịch đã thanh toán hoặc đã kết thúc, không thể chỉnh sửa." });
            }
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

        // Lấy danh sách tất cả phương thức thanh toán hệ thống
        [HttpGet("he-thong-phuong-thuc")]
        public async Task<IActionResult> GetAllSystemMethods()
        {
            var list = await _context.PhuongThucChungs
                .OrderBy(p => p.Id)
                .Select(p => new
                {
                    p.Id,
                    p.Ten,
                    p.MoTa,
                    p.TrangThai
                })
                .ToListAsync();

            return Ok(list);
        }

        //  Thêm phương thức mới
        [HttpPost("themThanhToan")]
        public async Task<IActionResult> AddSystemMethod([FromBody] ThemPhuongThucDto dto)
        {
            if (await _context.PhuongThucChungs.AnyAsync(p => p.Ten == dto.Ten))
                return BadRequest(new { message = "Phương thức đã tồn tại." });

            var newMethod = new PhuongThucChung
            {
                Ten = dto.Ten,
                MoTa = dto.MoTa,
                TrangThai = dto.TrangThai ?? "hien"
            };

            _context.PhuongThucChungs.Add(newMethod);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thêm phương thức mới." });
        }

        //  Cập nhật phương thức
        [HttpPut("capNhatPhuongThucThanhToan/{id}")]
        public async Task<IActionResult> UpdateSystemMethod(int id, [FromBody] ThemPhuongThucDto dto)
        {
            var pt = await _context.PhuongThucChungs.FindAsync(id);
            if (pt == null)
                return NotFound(new { message = "Không tìm thấy phương thức." });

            pt.Ten = dto.Ten;
            pt.MoTa = dto.MoTa;
            pt.TrangThai = dto.TrangThai ?? pt.TrangThai;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã cập nhật phương thức." });
        }

        //Xóa phương thức
        [HttpDelete("xoaPhuongThucThanhToan/{id}")]
        public async Task<IActionResult> DeleteSystemMethod(int id)
        {
            var pt = await _context.PhuongThucChungs.FindAsync(id);
            if (pt == null)
                return NotFound(new { message = "Không tìm thấy phương thức." });

            _context.PhuongThucChungs.Remove(pt);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xóa phương thức thành công." });
        }



        // Lấy danh sách đánh giá của chuyên gia
        [HttpGet("danh-gia-chuyen-gia")]
        
        public async Task<IActionResult> GetDanhGiaChuyenGia()
        {
            var danhGia = await _context.DanhGia
                .Include(dg => dg.NguoiDung)
                .ThenInclude(nd => nd.TaiKhoan)
                .Include(dg => dg.ChuyenGia)
                .Select(dg => new
                {
                    dg.Id,
                    ChuyenGia = dg.ChuyenGia.HoTen,
                    NguoiDanhGia = dg.NguoiDung.HoTen,
                    EmailNguoiDanhGia = dg.NguoiDung.TaiKhoan.Email,
                    dg.DiemSo,
                    dg.NhanXet
                })
                .ToListAsync();

            return Ok(danhGia);
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
        public class ThemPhuongThucDto
    {
        public string Ten { get; set; } = null!;
        public string? MoTa { get; set; }
        public string? TrangThai { get; set; } 
    }
    
}
