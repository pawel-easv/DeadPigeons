namespace api.Models;

public record JwtClaims(Guid Id)
{
    public Guid Id { get; set; } = Id;
}