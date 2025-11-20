using System;
using System.Collections.Generic;

namespace api.Models;

public partial class User
{
    public Guid Id { get; set; }

    public bool? Deleted { get; set; }

    public virtual ICollection<Board> Boards { get; set; } = new List<Board>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
