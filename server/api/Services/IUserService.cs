using api.Models.Requests;
using dataccess.Models;

namespace api.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<List<User>> GetAllAsync(bool includeDeleted = false);
    Task<User?> UpdateAsync(Guid id, UpdateUserDto dto);
    Task<bool> DeleteAsync(Guid id, bool softDelete = true);
    Task<bool> RestoreAsync(Guid id);
    Task<bool> ChangePasswordAsync(Guid id, string currentPassword, string newPassword);
    Task<decimal> GetBalanceAsync(Guid userId);
}
