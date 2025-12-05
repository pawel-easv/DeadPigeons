using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using api.Models;
using api.Models.Requests;
using dataccess;
using dataccess.Models;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class AuthService(
    AppDbContext ctx,
    ILogger<AuthService> logger,
    TimeProvider timeProvider,
    AppOptions appOptions) : IAuthService
{
    public async Task<JwtClaims> VerifyAndDecodeToken(string token)
    {
        if (string.IsNullOrEmpty(token))
            throw new ValidationException("No token provided!");

        // Remove "Bearer " prefix if present
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring(7);
        }

        var builder = CreateJwtBuilder();

        try
        {
            var json = builder.Decode(token) 
                       ?? throw new ValidationException("Authentication failed!");
            
            var payload = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(json);
            
            if (payload == null)
                throw new ValidationException("Invalid token payload!");

            // Extract Id claim (could be under different keys)
            var userId = payload.ContainsKey("Id") ? payload["Id"].ToString()
                       : payload.ContainsKey(ClaimTypes.NameIdentifier) ? payload[ClaimTypes.NameIdentifier].ToString()
                       : throw new ValidationException("User ID not found in token!");

            var role = payload.ContainsKey("Role") ? payload["Role"].ToString()
                     : payload.ContainsKey(ClaimTypes.Role) ? payload[ClaimTypes.Role].ToString()
                     : "User";

            var claims = new JwtClaims(Guid.Parse(userId), role);

            // Verify user still exists
            var userExists = await ctx.Users.AnyAsync(u => u.Id == claims.Id && !u.Deleted);
            if (!userExists)
                throw new ValidationException("User not found or has been deleted!");

            return claims;
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to verify JWT");
            throw new ValidationException("Failed to verify JWT");
        }
    }

    public async Task<JwtResponse> Login(LoginRequestDto dto)
    {
        var user = await ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && !u.Deleted)
                   ?? throw new ValidationException("Invalid email or password!");
        
        var passwordHash = HashPassword(dto.Password, user.Salt);
        
        if (passwordHash != user.PasswordHash)
            throw new ValidationException("Invalid email or password!");

        var token = CreateJwt(user);
        return new JwtResponse(token);
    }

    public async Task<JwtResponse> Register(RegisterRequestDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);

        if (await ctx.Users.AnyAsync(u => u.Email == dto.Email && !u.Deleted))
            throw new ValidationException("Email is already taken");

        var salt = Guid.NewGuid();
        var passwordHash = HashPassword(dto.Password, salt);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            CreatedAt = DateTime.UtcNow,
            Salt = salt,
            PasswordHash = passwordHash,
            Role = "User",
            Deleted = false
        };

        ctx.Users.Add(user);
        await ctx.SaveChangesAsync();

        var token = CreateJwt(user);
        return new JwtResponse(token);
    }

    public async Task<JwtResponse> CreateFirstAdminIfNoneExists(RegisterRequestDto dto)
    {
        if (await ctx.Users.AnyAsync())
        {
            throw new ValidationException("System already initialized. Cannot create first admin.");
        }
        
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
        
        if (dto.Password.Length < 8)
            throw new ValidationException("First admin password must be at least 8 characters.");

        var salt = Guid.NewGuid();
        var passwordHash = HashPassword(dto.Password, salt);

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email.ToLowerInvariant().Trim(),
            Salt = salt,
            PasswordHash = passwordHash,
            Role = Roles.Admin,
            CreatedAt = DateTime.UtcNow,
            Deleted = false
        };

        ctx.Users.Add(admin);
        await ctx.SaveChangesAsync();

        var token = CreateJwt(admin);
        return new JwtResponse(token);
    }
    
    private JwtBuilder CreateJwtBuilder()
    {
        return JwtBuilder.Create()
            .WithAlgorithm(new HMACSHA512Algorithm())
            .WithSecret(appOptions.JwtSecret)
            .WithUrlEncoder(new JwtBase64UrlEncoder())
            .WithJsonSerializer(new JsonNetSerializer())
            .MustVerifySignature();
    }

    private string CreateJwt(User user)
    {
        var expirationTime = timeProvider.GetUtcNow().AddDays(7).ToUnixTimeSeconds();
    
        return CreateJwtBuilder()
            .AddClaim(ClaimTypes.NameIdentifier, user.Id.ToString())
            .AddClaim("Id", user.Id.ToString())  
            .AddClaim(ClaimTypes.Role, user.Role)
            .AddClaim("Role", user.Role)
            .AddClaim(ClaimTypes.Email, user.Email)
            .AddClaim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
            .AddClaim("exp", expirationTime)
            .AddClaim("iat", timeProvider.GetUtcNow().ToUnixTimeSeconds()) 
            .Encode();
    }
    
    private string HashPassword(string password, Guid salt)
    {
        var hashBytes = SHA512.HashData(Encoding.UTF8.GetBytes(password + salt));
        return string.Concat(hashBytes.Select(b => b.ToString("x2")));
    }
}