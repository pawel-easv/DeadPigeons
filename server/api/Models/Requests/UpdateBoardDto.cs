using System.ComponentModel.DataAnnotations;

namespace api.Models.Requests;

public class UpdateBoardDto
{
    [Required]
    [MinLength(5)]
    [MaxLength(8)]
    public int[] Numbers { get; set; } = default!;

    [Range(10, 1000)]
    public int Price { get; set; }

    public bool Repeating { get; set; }
}