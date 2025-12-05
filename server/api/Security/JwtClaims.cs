namespace api.Models;

public record JwtClaims(Guid Id, string Role)
{
    public Guid Id { get; set; } = Id;
    public string Role { get; set; } = Role;
}