using System;
using System.Collections.Generic;

namespace dataccess.Models;

public partial class User
{
    public Guid Id { get; set; }

    public bool Deleted { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string Role { get; set; } = null!;

    public Guid Salt { get; set; }

    public string PasswordHash { get; set; } = null!;

    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
