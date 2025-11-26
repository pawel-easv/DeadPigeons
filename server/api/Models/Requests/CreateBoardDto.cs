using System.ComponentModel.DataAnnotations;
using NJsonSchema.Annotations;

namespace api.Models.Requests;

public class CreateBoardDto
{ 
    [Required]
    public Guid UserId { get; set; }
    [Required]
    public Guid GameId { get; set; }
    [NotNull] 
    [MinLength(5)][MaxLength(8)]
    public int[] Numbers { get; set; }
    [Required]
    [Range(0, int.MaxValue)] 
    public int Price {get; set;}
    [Required]
    public bool Repeating { get; set; }
}