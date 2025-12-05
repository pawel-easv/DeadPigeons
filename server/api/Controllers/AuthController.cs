using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using api.Models;
using api.Models.Requests;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost(nameof(SetupFirstAdmin))]
    [AllowAnonymous]
    public async Task<JwtResponse> SetupFirstAdmin([FromBody] RegisterRequestDto dto)
    {
        return await authService.CreateFirstAdminIfNoneExists(dto);
    }

    [HttpPost(nameof(Login))]
    [AllowAnonymous]
    public async Task<JwtResponse> Login([FromBody] LoginRequestDto dto)
    {
        return await authService.Login(dto);
    }

    [HttpPost(nameof(Register))]
    [AllowAnonymous]
    public async Task<JwtResponse> Register([FromBody] RegisterRequestDto dto)
    {
        return await authService.Register(dto);
    }

    [HttpGet(nameof(WhoAmI))]
    public async Task<JwtClaims> WhoAmI()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("Id")?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value
                   ?? User.FindFirst("Role")?.Value;

        return new JwtClaims(Guid.Parse(userId), role);

    }
}