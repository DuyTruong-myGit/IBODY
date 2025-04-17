using System;
using System.Collections.Generic;

namespace IBODY_WebAPI.Models;

public partial class BinhLuan
{
    public int Id { get; set; }

    public int? NguoiBinhLuanId { get; set; }

    public string? LoaiDoiTuong { get; set; }

    public int? DoiTuongId { get; set; }

    public string? NoiDung { get; set; }

    public DateTime? ThoiGian { get; set; }

    public virtual TaiKhoan? NguoiBinhLuan { get; set; }
}
