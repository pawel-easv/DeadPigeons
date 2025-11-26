using dataccess.Models;

public partial class Board
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public List<int> Numbers { get; set; } = null!;
    public int Price { get; set; }
    public bool Repeating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool Deleted { get; set; }
    
    public Guid? GameId { get; set; } // Make this nullable
    
    public virtual Game? Game { get; set; } // Make navigation property nullable too
    public virtual User User { get; set; } = null!;
}