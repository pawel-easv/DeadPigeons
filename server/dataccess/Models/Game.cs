using System;
using System.Collections.Generic;

namespace dataccess.Models;

public partial class Game
{
    public Guid Id { get; set; }

    public int Week { get; set; }

    public int Year { get; set; }

    public bool? Active { get; set; }

    public List<int>? WinningNumbers { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? PublishedAt { get; set; }

    public bool? Deleted { get; set; }

    public virtual ICollection<BoardPlay> BoardPlays { get; set; } = new List<BoardPlay>();
}
