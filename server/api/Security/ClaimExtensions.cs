using System.Security.Claims;
using dataccess.Models;

namespace api.Models;

public static class ClaimExtensions
{
    public static string GetUserId(this ClaimsPrincipal claims) =>
        claims.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    public static IEnumerable<Claim> ToClaims(this User user) =>
        [new("sub", user.Id.ToString()), new("role", user.Role)];

    public static ClaimsPrincipal ToPrincipal(this User user) =>
        new ClaimsPrincipal(new ClaimsIdentity(user.ToClaims()));
}