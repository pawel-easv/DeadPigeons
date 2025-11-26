using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using api.Models.Requests;
using api.Services;
using dataccess.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IAuthService _authService;
    
    public UsersController(IUserService userService, IAuthService authService)
    {
        _userService = userService;
        _authService = authService;
    }
    
    [HttpGet(nameof(GetAllUsers))]
    public async Task<List<User>> GetAllUsers([FromQuery] bool includeDeleted = false)
    {
        return await _userService.GetAllAsync(includeDeleted);

    }
    [HttpGet(nameof(GetUserById))]
    public async Task<User?> GetUserById(Guid id)
    {
        return await _userService.GetByIdAsync(id);
    }
    
    [HttpGet(nameof(GetUserByEmail))]
    public async Task<User?> GetUserByEmail(string email)
    { 
        return await _userService.GetByEmailAsync(email);
    }

    [HttpGet(nameof(GetBalanceById))]
    public async Task<decimal> GetBalanceById(Guid userId)
    {
        return await _userService.GetBalanceAsync(userId);
    }
    
    [HttpPut(nameof(UpdateUser))]
    public async Task<User> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        return await _userService.UpdateAsync(id, dto);
    }
    
    [HttpDelete(nameof(DeleteUser))]
    public async Task<ActionResult> DeleteUser(Guid id, [FromQuery] bool permanent = false)
    {
        var success = await _userService.DeleteAsync(id, !permanent);
        
        if (!success)
        {
            return NotFound(new { message = "User not found" });
        }
        
        return NoContent();
    }
    
    [HttpPost(nameof(RestoreUser))]
    public async Task<ActionResult> RestoreUser(Guid id)
    {
        var success = await _userService.RestoreAsync(id);
        
        if (!success)
        {
            return NotFound(new { message = "User not found or not deleted" });
        }
        
        return Ok(new { message = "User restored successfully" });
    }
    
    [HttpPost(nameof(ChangePassword))]
    public async Task<ActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var success = await _userService.ChangePasswordAsync(id, request.CurrentPassword, request.NewPassword);
        
        if (!success)
        {
            return BadRequest(new { message = "Invalid current password or user not found" });
        }
        
        return Ok(new { message = "Password changed successfully" });
    }
    
}

public class UpdateUserRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}