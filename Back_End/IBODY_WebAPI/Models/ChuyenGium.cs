using System;
using System.Collections.Generic;

namespace IBODY_WebAPI.Models;

public partial class ChuyenGium
{
    public int Id { get; set; }

    public int? TaiKhoanId { get; set; }

    public string? HoTen { get; set; }

    public int? SoNamKinhNghiem { get; set; }

    public string? SoChungChi { get; set; }

    public string? ChuyenMon { get; set; }

    public string? GioiThieu { get; set; }

    public string? TrangThai { get; set; }

    public virtual ICollection<DanhGium> DanhGia { get; set; } = new List<DanhGium>();

    public virtual ICollection<HocVanChuyenGium> HocVanChuyenGia { get; set; } = new List<HocVanChuyenGium>();

    public virtual ICollection<LichHen> LichHens { get; set; } = new List<LichHen>();

    public virtual TaiKhoan? TaiKhoan { get; set; }

    public virtual ICollection<TheChuyenGium> TheChuyenGia { get; set; } = new List<TheChuyenGium>();

    public virtual ICollection<ThoiGianRanhChuyenGium> ThoiGianRanhChuyenGia { get; set; } = new List<ThoiGianRanhChuyenGium>();
}
