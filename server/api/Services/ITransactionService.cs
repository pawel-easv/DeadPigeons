using dataccess.Models;

namespace api.Services;


public interface ITransactionService
{
    Task<Transaction> GetByIdAsync(Guid id);
    Task<List<Transaction>> GetAllAsync(bool includeDeleted = false);
    Task<List<Transaction>> GetByUserIdAsync(Guid userId, bool includeDeleted = false);
    Task<List<Transaction>> GetPendingTransactionsAsync();
    Task<Transaction> GetByMobilepayReferenceAsync(string mobilepayReference);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> ApproveTransactionAsync(Guid transactionId);
    Task<Transaction> RejectTransactionAsync(Guid transactionId);
    Task<bool> DeleteAsync(Guid id, bool softDelete = true);
    Task<bool> RestoreAsync(Guid id);
    Task<int> GetPendingTransactionsCountAsync();
    Task<decimal> GetTotalApprovedAmountByUserAsync(Guid userId);
}