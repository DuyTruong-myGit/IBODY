using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using IBODY_WebAPI.Models;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthController(UserManager<ApplicationUser> userManager,
                              SignInManager<ApplicationUser> signInManager,
                              RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
        }

        // ✅ Đăng ký
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                Gender = dto.Gender,
                Dob = dto.Dob
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Gán mặc định vai trò người dùng
            if (!await _roleManager.RoleExistsAsync("nguoi_dung"))
                await _roleManager.CreateAsync(new IdentityRole("nguoi_dung"));

            await _userManager.AddToRoleAsync(user, "nguoi_dung");

            return Ok("Đăng ký thành công");
        }

        // ✅ Đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized("Không tìm thấy tài khoản");

            var result = await _signInManager.PasswordSignInAsync(user, dto.Password, true, false);
            if (!result.Succeeded) return Unauthorized("Sai mật khẩu");

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                message = "Đăng nhập thành công",
                user = new
                {
                    user.Email,
                    user.FullName,
                    roles = roles
                }
            });
        }
    }

    public class RegisterDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public DateOnly? Dob { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
