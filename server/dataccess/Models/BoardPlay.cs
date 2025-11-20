using System;
using System.Collections.Generic;

namespace dataccess.Models;

public partial class BoardPlay
{
    public Guid Id { get; set; }

    public Guid BoardId { get; set; }

    public Guid GameId { get; set; }

    public bool? IsWinner { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? Deleted { get; set; }

    public virtual Board Board { get; set; } = null!;

    public virtual Game Game { get; set; } = null!;
}
