namespace api.Services;
// TransactionService.cs
using dataccess.Models;
using Microsoft.EntityFrameworkCore;

public class TransactionService : ITransactionService
{
    private readonly AppDbContext _ctx;
    
    public TransactionService(AppDbContext ctx)
    {
        _ctx = ctx;
    }

    public async Task<Transaction> GetByIdAsync(Guid id)
    {
        var transaction = await _ctx.Transactions
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Id == id && t.Deleted != true);
        
        if (transaction == null)
        {
            throw new InvalidOperationException("Transaction not found.");
        }
        
        return transaction;
    }

    public async Task<List<Transaction>> GetAllAsync(bool includeDeleted = false)
    {
        var query = _ctx.Transactions
            .Include(t => t.User)
            .AsQueryable();
        
        if (!includeDeleted)
        {
            query = query.Where(t => t.Deleted != true);
        }
        
        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Transaction>> GetByUserIdAsync(Guid userId, bool includeDeleted = false)
    {
        var query = _ctx.Transactions
            .Include(t => t.User)
            .Where(t => t.UserId == userId);
        
        if (!includeDeleted)
        {
            query = query.Where(t => t.Deleted != true);
        }
        
        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Transaction>> GetPendingTransactionsAsync()
    {
        return await _ctx.Transactions
            .Include(t => t.User)
            .Where(t => t.Approved == false && t.Deleted != true)
            .OrderBy(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Transaction> GetByMobilepayReferenceAsync(string mobilepayReference)
    {
        var transaction = await _ctx.Transactions
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.MobilepayReference.ToLower() == mobilepayReference.ToLower() && t.Deleted != true);
        
        if (transaction == null)
        {
            throw new InvalidOperationException("Transaction not found.");
        }
        
        return transaction;
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        // Check if mobilepay reference already exists
        var exists = await _ctx.Transactions
            .AnyAsync(t => t.MobilepayReference.ToLower() == transaction.MobilepayReference.ToLower() && t.Deleted != true);
        
        if (exists)
        {
            throw new InvalidOperationException("A transaction with this MobilePay reference already exists.");
        }

        transaction.Id = Guid.NewGuid();
        transaction.CreatedAt = DateTime.UtcNow;
        transaction.Approved = false;
        transaction.Deleted = false;

        _ctx.Transactions.Add(transaction);
        await _ctx.SaveChangesAsync();
        
        return transaction;
    }

    public async Task<Transaction> ApproveTransactionAsync(Guid transactionId)
    {
        var transaction = await _ctx.Transactions.FindAsync(transactionId);
        
        if (transaction == null || transaction.Deleted == true)
        {
            throw new InvalidOperationException("Transaction not found.");
        }

        if (transaction.Approved == true)
        {
            throw new InvalidOperationException("Transaction is already approved.");
        }

        transaction.Approved = true;

        await _ctx.SaveChangesAsync();
        
        return transaction;
    }

    public async Task<Transaction> RejectTransactionAsync(Guid transactionId)
    {
        var transaction = await _ctx.Transactions.FindAsync(transactionId);
        
        if (transaction == null || transaction.Deleted == true)
        {
            throw new InvalidOperationException("Transaction not found.");
        }

        if (transaction.Approved == true)
        {
            throw new InvalidOperationException("Cannot reject an already approved transaction.");
        }

        // Soft delete the transaction
        transaction.Deleted = true;

        await _ctx.SaveChangesAsync();
        
        return transaction;
    }

    public async Task<bool> DeleteAsync(Guid id, bool softDelete = true)
    {
        var transaction = await _ctx.Transactions.FindAsync(id);
        
        if (transaction == null)
        {
            throw new InvalidOperationException("Transaction not found.");
        }

        if (softDelete)
        {
            transaction.Deleted = true;
        }
        else
        {
            _ctx.Transactions.Remove(transaction);
        }

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(Guid id)
    {
        var transaction = await _ctx.Transactions.FindAsync(id);
        
        if (transaction == null)
        {
            throw new InvalidOperationException("Transaction not found.");
        }

        if (transaction.Deleted != true)
        {
            throw new InvalidOperationException("Transaction is not deleted.");
        }

        transaction.Deleted = false;

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<int> GetPendingTransactionsCountAsync()
    {
        return await _ctx.Transactions
            .CountAsync(t => t.Approved == false && t.Deleted != true);
    }

    public async Task<decimal> GetTotalApprovedAmountByUserAsync(Guid userId)
    {
        return await _ctx.Transactions
            .Where(t => t.UserId == userId && t.Approved == true && t.Deleted != true)
            .SumAsync(t => t.Amount);
    }
}
