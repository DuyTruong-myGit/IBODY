using IBODY_WebAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using IBODY_WebAPI.Data;
using IBODY_WebAPI.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.FileProviders;



var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/api/auth/login";
    options.AccessDeniedPath = "/api/auth/denied";
});


 builder.Services.AddDbContext<FinalIbodyContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Add CORS (cho phép frontend truy cập API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// ✅ Add Controllers & JSON options
builder.Services.AddControllers();

// ✅ Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IEmailService, EmailService>();


BadWordsFilter.Load("Configs/badwords.json");

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    if (!await roleManager.RoleExistsAsync("quan_tri"))
    {
        var role = new IdentityRole("quan_tri");
        await roleManager.CreateAsync(role);
        Console.WriteLine("Vai trò 'quan_tri' đã được thêm thành công.");
    }
}

app.UseStaticFiles(); // Cho wwwroot

// Thêm cấu hình cho folder 'img'
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "img")),
    RequestPath = "/img"
});


// ✅ Use middleware
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Nếu có dùng Authentication/Authorization thì mở lại
 app.UseAuthentication();
 app.UseAuthorization();

app.MapControllers();


app.Run();
