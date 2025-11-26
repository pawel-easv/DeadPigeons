using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using System.Transactions;
using api.Models.Requests;
using dataccess.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _ctx;
    
    public UserService(AppDbContext ctx)
    {
        _ctx = ctx;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _ctx.Users
            .Include(u => u.Boards)
            .Include(u => u.Transactions)
            .FirstOrDefaultAsync(u => u.Id == id && u.Deleted != true);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _ctx.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower() && u.Deleted != true);
    }

    public async Task<List<User>> GetAllAsync(bool includeDeleted = false)
    {
        var query = _ctx.Users.AsQueryable();
        
        if (!includeDeleted)
        {
            query = query.Where(u => u.Deleted != true);
        }
        
        return await query.ToListAsync();
    }

    public async Task<User> CreateAsync(User user, string password)
    {
        if (await EmailExistsAsync(user.Email))
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }
        
        user.Id = Guid.NewGuid();
        user.Salt = Guid.NewGuid();
        user.PasswordHash = HashPassword(password, user.Salt);
        user.CreatedAt = DateTime.UtcNow;
        user.Deleted = false;

        _ctx.Users.Add(user);
        await _ctx.SaveChangesAsync();
        
        return user;
    }

    public async Task<User?> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
        var user = await _ctx.Users.FindAsync(id);
        
        if (user == null || user.Deleted == true)
        {
            return null;
        }
        
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.Role = dto.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        
        return user;
    }

    public async Task<bool> DeleteAsync(Guid id, bool softDelete = true)
    {
        var user = await _ctx.Users.FindAsync(id);
        
        if (user == null)
        {
            return false;
        }

        if (softDelete)
        {
            user.Deleted = true;
            user.DeletedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _ctx.Users.Remove(user);
        }

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(Guid id)
    {
        var user = await _ctx.Users.FindAsync(id);
        
        if (user == null)
        {
            throw new  InvalidOperationException("User not found.");
        }

        if (!user.Deleted)
        {
            throw new InvalidOperationException("User is not deleted.");
        }

        user.Deleted = false;
        user.DeletedAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<User?> AuthenticateAsync(string email, string password)
    {
        var user = await GetByEmailAsync(email);
        
        if (user == null)
        {
            throw new  InvalidOperationException("User not found.");
        }
        
        var hashedPassword = HashPassword(password, user.Salt);
        
        if (hashedPassword != user.PasswordHash)
        {
            throw new InvalidOperationException("Invalid password.");
        }

        return user;
    }

    public async Task<bool> ChangePasswordAsync(Guid id, string currentPassword, string newPassword)
    {
        var user = await _ctx.Users.FindAsync(id);
        
        if (user == null || user.Deleted == true)
        {
            return false;
        }
        
        var currentHashedPassword = HashPassword(currentPassword, user.Salt);
        
        if (currentHashedPassword != user.PasswordHash)
        {
            return false;
        }
        
        user.Salt = Guid.NewGuid();
        user.PasswordHash = HashPassword(newPassword, user.Salt);
        user.UpdatedAt = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<decimal> GetBalanceAsync(Guid userId)
    {
        var userExists = await _ctx.Users
            .AnyAsync(u => u.Id == userId && !u.Deleted);

        if (!userExists)
        {
            throw new InvalidOperationException("User not found or has been deleted.");
        }

        var balance = await _ctx.Transactions
            .Where(t => t.UserId == userId && t.Approved == true)
            .Select(t => t.Amount)
            .SumAsync();
        
        return balance;
    }
    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _ctx.Users
            .AnyAsync(u => u.Email.ToLower() == email.ToLower() && u.Deleted != true);
    }
    
    private string HashPassword(string password, Guid salt)
    {
        using var sha256 = SHA256.Create();
        var combinedBytes = Encoding.UTF8.GetBytes(password + salt.ToString());
        var hashBytes = sha256.ComputeHash(combinedBytes);
        return Convert.ToBase64String(hashBytes);
    }
}