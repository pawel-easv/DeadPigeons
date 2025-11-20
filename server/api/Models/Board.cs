using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Board
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public List<int> Numbers { get; set; } = null!;

    public int? FieldCount { get; set; }

    public int Price { get; set; }

    public bool? Repeating { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? TransactionId { get; set; }

    public bool? Deleted { get; set; }

    public virtual ICollection<BoardPlay> BoardPlays { get; set; } = new List<BoardPlay>();

    public virtual Transaction? Transaction { get; set; }

    public virtual User User { get; set; } = null!;
}
