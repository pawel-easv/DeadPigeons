using System.Security.Claims;
using api.Models;
using api.Models.Requests;
using api.Services;
using dataccess.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }
    
    private Guid CurrentUserId => Guid.Parse(User.FindFirst("Id")?.Value 
                                              ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
    
    [HttpGet]
    [Authorize(Roles = Roles.Admin)]  // Only admins can see all users
    public async Task<List<User>> GetAllUsers([FromQuery] bool includeDeleted = false)
    {
        return await _userService.GetAllAsync(includeDeleted);
    }
    
    [HttpGet(nameof(GetUserById))]
    public async Task<User?> GetUserById(Guid id)
    {
        // Resource-based authorization: Users can only view themselves, admins can view all
        if (id != CurrentUserId && !User.IsInRole(Roles.Admin))
        {
            throw new UnauthorizedAccessException("You don't have permission to view this user");
        }
        
        return await _userService.GetByIdAsync(id);
    }
    
    [HttpGet(nameof(GetCurrentUser))]
    public async Task<User?> GetCurrentUser()
    {
        return await _userService.GetByIdAsync(CurrentUserId);
    }
    
    [HttpGet(nameof(GetUserByEmail))]
    [Authorize(Roles = Roles.Admin)]  // Only admins can search by email
    public async Task<User?> GetUserByEmail(string email)
    { 
        return await _userService.GetByEmailAsync(email);
    }

    [HttpGet(nameof(GetBalanceById))]
    public async Task<decimal> GetBalanceById(Guid userId)
    {
        // Resource-based authorization: Users can only view their own balance
        if (userId != CurrentUserId && !User.IsInRole(Roles.Admin))
        {
            throw new UnauthorizedAccessException("You don't have permission to view this balance");
        }
        
        return await _userService.GetBalanceAsync(userId);
    }
    
    [HttpGet(nameof(GetMyBalance))]
    public async Task<decimal> GetMyBalance()
    {
        return await _userService.GetBalanceAsync(CurrentUserId);
    }
    
    [HttpPut(nameof(UpdateUser))]
    public async Task<User?> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        // Resource-based authorization: Users can only update themselves, admins can update all
        if (id != CurrentUserId && !User.IsInRole(Roles.Admin))
        {
            throw new UnauthorizedAccessException("You don't have permission to update this user");
        }
        
        // Non-admins cannot change their own role
        if (id == CurrentUserId && !User.IsInRole(Roles.Admin))
        {
            var currentUser = await _userService.GetByIdAsync(id);
            if (currentUser != null && dto.Role != currentUser.Role)
            {
                throw new UnauthorizedAccessException("You cannot change your own role");
            }
        }
        
        return await _userService.UpdateAsync(id, dto);
    }
    
    [HttpDelete(nameof(DeleteUser))]
    [Authorize(Roles = Roles.Admin)]  // Only admins can delete users
    public async Task<bool> DeleteUser(Guid id, [FromQuery] bool permanent = false)
    {
        return await _userService.DeleteAsync(id, !permanent);
    }
    
    [HttpPost(nameof(RestoreUser))]
    [Authorize(Roles = Roles.Admin)]  // Only admins can restore users
    public async Task<bool> RestoreUser(Guid id)
    {
        return await _userService.RestoreAsync(id);
    }
    
    [HttpPost(nameof(ChangePassword))]
    public async Task<bool> ChangePassword(Guid id, [FromBody] ChangePasswordRequest request)
    {
        // Resource-based authorization: Users can only change their own password
        if (id != CurrentUserId)
        {
            throw new UnauthorizedAccessException("You can only change your own password");
        }
        
        return await _userService.ChangePasswordAsync(id, request.CurrentPassword, request.NewPassword);
    }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}