using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using IBODY_WebAPI.Models;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly FinalIbodyContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthController(UserManager<ApplicationUser> userManager,
                              SignInManager<ApplicationUser> signInManager,
                              RoleManager<IdentityRole> roleManager,
                              FinalIbodyContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
        }

        //✅ Đăng ký
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                Gender = dto.Gender,
                Dob = dto.Dob,
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            //  Gán role Identity
            if (!await _roleManager.RoleExistsAsync("nguoi_dung"))
                await _roleManager.CreateAsync(new IdentityRole("nguoi_dung"));

            await _userManager.AddToRoleAsync(user, "nguoi_dung");

            //  THÊM VÀO BẢNG tài khoản để đồng bộ
            var taiKhoan = new TaiKhoan
            {
                Email = user.Email,
                MatKhau = "hashed_by_identity",
                VaiTro = "nguoi_dung",
                TrangThai = "hoat_dong"
            };

            _context.TaiKhoans.Add(taiKhoan);
            await _context.SaveChangesAsync();
            //THÊM VÀO BẢNG người dùngdùng để đồng bộ
            var nguoiDung = new NguoiDung
            {
                TaiKhoanId = taiKhoan.Id,
                HoTen = user.FullName,
                GioiTinh = user.Gender,
                NgaySinh = user.Dob,
                MucTieuTamLy = null
            };

            _context.NguoiDungs.Add(nguoiDung);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Đăng ký thành công" });
        }

        //  Đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var tk = await _context.TaiKhoans
            .FirstOrDefaultAsync(t => t.Email == dto.Email);

            if (tk == null)
                return Forbid("Tài khoản chưa được đăng ký đầy đủ trong hệ thống.");

            // Bước 2: Chặn nếu bị khóa
            if (tk.TrangThai == "khoa")
                return Forbid("Tài khoản của bạn đã bị khóa.");

            // Bước 3: Tìm user từ Identity
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { message = "Email không tồn tại." });

            // Bước 4: Kiểm tra mật khẩu
            var result = await _signInManager.PasswordSignInAsync(user, dto.Password, true, false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Mật khẩu không đúng." });

            var roles = await _userManager.GetRolesAsync(user);

            // Bước 5: Trả về thông tin đăng nhập
            return Ok(new
            {
                message = "Đăng nhập thành công!",
                user = new
                {
                    taiKhoanId = tk.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    roles = roles,
                    trangThai = tk.TrangThai
                }
            });
        }



        // [HttpPost("register")]
        // public async Task<IActionResult> RegisterAdmin(RegisterDto dto)
        // {
        //     var user = new ApplicationUser
        //     {
        //         UserName = dto.Email,
        //         Email = dto.Email,
        //         FullName = dto.FullName,
        //         Gender = dto.Gender,
        //         Dob = dto.Dob,
        //     };

        //     var result = await _userManager.CreateAsync(user, dto.Password);
        //     if (!result.Succeeded)
        //         return BadRequest(result.Errors);

        //     // Nếu vai trò không tồn tại thì tạo mới
        //     if (!await _roleManager.RoleExistsAsync(dto.VaiTro))
        //         await _roleManager.CreateAsync(new IdentityRole(dto.VaiTro));

        //     // Gán role vào Identity
        //     await _userManager.AddToRoleAsync(user, dto.VaiTro);

        //     // Đồng bộ với bảng tài khoản
        //     var taiKhoan = new TaiKhoan
        //     {
        //         Email = user.Email,
        //         MatKhau = "hashed_by_identity",
        //         VaiTro = dto.VaiTro,
        //         TrangThai = "hoat_dong"
        //     };

        //     _context.TaiKhoans.Add(taiKhoan);
        //     await _context.SaveChangesAsync();

        //     if (dto.VaiTro == "nguoi_dung")
        //     {
        //         var nguoiDung = new NguoiDung
        //         {
        //             TaiKhoanId = taiKhoan.Id,
        //             HoTen = user.FullName,
        //             GioiTinh = user.Gender,
        //             NgaySinh = user.Dob,
        //             MucTieuTamLy = null
        //         };

        //         _context.NguoiDungs.Add(nguoiDung);
        //         await _context.SaveChangesAsync();
        //     }

        //     // Nếu là quản trị thì không thêm vào bảng NguoiDung mà chờ xử lý riêng nếu cần

        //     return Ok(new { message = $"Đăng ký thành công với vai trò {dto.VaiTro}" });
        // }
    
    }
    public class RegisterDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public DateTime? Dob { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
//     public class RegisterDto
// {
//     public string Email { get; set; } = null!;
//     public string Password { get; set; } = null!;
//     public string? FullName { get; set; }
//     public string? Gender { get; set; }
//     public DateTime? Dob { get; set; }

//     public string VaiTro { get; set; } = "nguoi_dung"; 
// }
}
