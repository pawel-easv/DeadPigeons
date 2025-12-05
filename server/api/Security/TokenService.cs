using dataccess.Models;

namespace api.Models;

using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;


public interface ITokenService
{
    string CreateToken(User user);
}

public class TokenService(IConfiguration config) : ITokenService
{
    public const string SignatureAlgorithm = SecurityAlgorithms.HmacSha512;
    public const string JwtKey = "JwtKey";

    public string CreateToken(User user)
    {
        var key = Convert.FromBase64String(config.GetValue<string>(JwtKey)!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SignatureAlgorithm
            ),
            Subject = new ClaimsIdentity(user.ToClaims()),
            Expires = DateTime.UtcNow.AddDays(7),
        };
        var tokenHandler = new JsonWebTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return token;
    }

    public static TokenValidationParameters ValidationParameters(IConfiguration config)
    {
        var key = Convert.FromBase64String(config.GetValue<string>(JwtKey)!);
        return new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAlgorithms = [SignatureAlgorithm],
            ValidateIssuerSigningKey = true,
            TokenDecryptionKey = null,

            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero,
        };
    }
}