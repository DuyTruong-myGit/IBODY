using IBODY_WebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IBODY_WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly IbodyContext _context;
        private readonly IWebHostEnvironment _env;

        public ProfileController(IbodyContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // POST: api/Profile/client
        [HttpPost("client")]
        public async Task<IActionResult> SubmitClientProfile([FromBody] ClientProfileDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound(new { message = "User không tồn tại." });

            var profile = new ClientProfile
            {
                UserId = dto.UserId,
                Age = dto.Age,
                Gender = dto.Gender,
                Purpose = dto.Purpose,
                GuardianName = dto.GuardianName,
                GuardianPhone = dto.GuardianPhone,
                CreatedAt = DateTime.Now
            };

            _context.ClientProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hồ sơ khách hàng đã lưu thành công." });
        }

        // POST: api/Profile/expert
        [HttpPost("expert")]
        public async Task<IActionResult> SubmitExpertProfile([FromForm] ExpertProfileDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound(new { message = "User không tồn tại." });

            var uploadsDir = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "verification");
            Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}_{dto.VerificationFile.FileName}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.VerificationFile.CopyToAsync(stream);
            }

            var profile = new ExpertProfile
            {
                UserId = dto.UserId,
                Age = dto.Age,
                Gender = dto.Gender,
                Purpose = dto.Purpose,
                VerificationImage = fileName,
                CreatedAt = DateTime.Now,
                IsApproved = false // mặc định là chưa duyệt
            };

            _context.ExpertProfiles.Add(profile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hồ sơ chuyên gia đã lưu thành công." });
        }
    }

    public class ClientProfileDto
    {
        public int UserId { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; } = null!;
        public string Purpose { get; set; } = null!;
        public string? GuardianName { get; set; }
        public string? GuardianPhone { get; set; }
    }

    public class ExpertProfileDto
    {
        public int UserId { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; } = null!;
        public string Purpose { get; set; } = null!;
        public IFormFile VerificationFile { get; set; } = null!;
    }
}