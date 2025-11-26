using System.ComponentModel.DataAnnotations;
using api.Models;
using api.Models.Requests;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost(nameof(SetupFirstAdmin))]
    [AllowAnonymous]
    public async Task<IActionResult> SetupFirstAdmin([FromBody] RegisterRequestDto dto)
    {
        try
        {
            var result = await authService.CreateFirstAdminIfNoneExists(dto);
            return Ok(result);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    [HttpPost(nameof(Login))]
    public async Task<JwtResponse> Login([FromBody] LoginRequestDto dto)
    {
        return await authService.Login(dto);
    }

    [HttpPost(nameof(Register))]
    public async Task<JwtResponse> Register([FromBody] RegisterRequestDto dto)
    {
        return await authService.Register(dto);
    }


    [HttpPost(nameof(WhoAmI))]
    public async Task<JwtClaims> WhoAmI()
    {
        var jwtClaims = await authService.VerifyAndDecodeToken(Request.Headers.Authorization.FirstOrDefault());
        return jwtClaims;
    }
}