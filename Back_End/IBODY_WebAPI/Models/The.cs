using System;
using System.Collections.Generic;

namespace IBODY_WebAPI.Models;

public partial class The
{
    public int Id { get; set; }

    public string? Ten { get; set; }

    public virtual ICollection<TheChuyenGium> TheChuyenGia { get; set; } = new List<TheChuyenGium>();
}
