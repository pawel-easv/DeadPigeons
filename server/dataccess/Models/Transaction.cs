using System;
using System.Collections.Generic;

namespace dataccess.Models;

public partial class Transaction
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public int Amount { get; set; }

    public string MobilepayReference { get; set; } = null!;

    public bool? Approved { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? Deleted { get; set; }

    public Guid? BoardId { get; set; }

    public virtual User? User { get; set; }
}
