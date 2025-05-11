using System;
using System.Collections.Generic;

namespace IBODY_WebAPI.Models;

public partial class LuongChuyenGium
{
    public int Id { get; set; }

    public int? ChuyenGiaId { get; set; }

    public int? SoBuoi { get; set; }

    public decimal? LuongMotBuoi { get; set; }

    public decimal? TongLuong { get; set; }

    public int? Thang { get; set; }

    public int? Nam { get; set; }

    public virtual ChuyenGium? ChuyenGia { get; set; }
}
