using System;
using System.Collections.Generic;

namespace IBODY_WebAPI.Models;

public partial class User
{
    public int Id { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? FullName { get; set; }

    public string? Email { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Role { get; set; } = null!;

    public virtual ICollection<ClientProfile> ClientProfiles { get; set; } = new List<ClientProfile>();

    public virtual ICollection<ExpertProfile> ExpertProfiles { get; set; } = new List<ExpertProfile>();
}
