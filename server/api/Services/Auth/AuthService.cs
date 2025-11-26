using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using api.Models;
using api.Models.Requests;
using dataccess;
using dataccess.Models;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Microsoft.EntityFrameworkCore;
using ValidationException = Bogus.ValidationException;

namespace api.Services;

public class AuthService(
    AppDbContext ctx,
    ILogger<AuthService> logger,
    TimeProvider timeProvider,
    AppOptions appOptions) : IAuthService
{
    public async Task<JwtClaims> VerifyAndDecodeToken(string token)
    {
        if (token == null)
            throw new ValidationException("No token attached!");

        var builder = CreateJwtBuilder();

        string jsonString;
        try
        {
            jsonString = builder.Decode(token)
                         ?? throw new ValidationException("Authentication failed!");
        }
        catch (Exception e)
        {
            logger.LogError(e.Message, e);
            throw new ValidationException("Valided to verify JWT");
        }

        var jwtClaims = JsonSerializer.Deserialize<JwtClaims>(jsonString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        }) ?? throw new ValidationException("Authentication failed!");

        _ = ctx.Users.FirstOrDefault(u => u.Id == jwtClaims.Id)
            ?? throw new ValidationException("Authentication is valid, but user is not found!");

        return jwtClaims;
    }

    public async Task<JwtResponse> Login(LoginRequestDto dto)
    {
        var user = ctx.Users.FirstOrDefault(u => u.Email == dto.Email)
                   ?? throw new ValidationException("User is not found!");
        var passwordsMatch = user.PasswordHash==
                             SHA512.HashData(
                                     Encoding.UTF8.GetBytes(dto.Password + user.Salt))
                                 .Aggregate("", (current, b) => current + b.ToString("x2"));
        if (!passwordsMatch)
            throw new ValidationException("Password is incorrect!");

        var token = CreateJwt(user);
        return new JwtResponse(token);
    }

    public async Task<JwtResponse> Register(RegisterRequestDto dto)
    {
        // Validate input DTO
        Validator.ValidateObject(dto, new ValidationContext(dto), true);

        // Check if email is taken
        if (ctx.Users.Any(u => u.Email == dto.Email))
            throw new ValidationException("Email is already taken");

        // Generate salt & hash password
        var salt = Guid.NewGuid();
        var hashBytes = SHA512.HashData(Encoding.UTF8.GetBytes(dto.Password + salt));
        var passwordHash = string.Concat(hashBytes.Select(b => b.ToString("x2")));

        var user = new User()
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

        var tokenForUser = CreateJwt(user);
        return new JwtResponse(tokenForUser);
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
        var hashBytes = SHA512.HashData(Encoding.UTF8.GetBytes(dto.Password + salt));
        var passwordHash = string.Concat(hashBytes.Select(b => b.ToString("x2")));

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email.ToLowerInvariant().Trim(),
            Salt = salt,
            PasswordHash = passwordHash,
            Role = "Admin",
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
        return CreateJwtBuilder()
            .AddClaim(nameof(User.Id), user.Id)
            .AddClaim(nameof(User.Role), user.Role)
            .Encode();
    }

}