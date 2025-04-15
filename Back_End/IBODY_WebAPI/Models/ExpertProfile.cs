using System;
using System.Collections.Generic;

namespace IBODY_WebAPI.Models;

public partial class ExpertProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? Age { get; set; }

    public string? Gender { get; set; }

    public string? Purpose { get; set; }

    public string? VerificationImage { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool IsApproved { get; set; }

    public virtual User User { get; set; } = null!;
}
