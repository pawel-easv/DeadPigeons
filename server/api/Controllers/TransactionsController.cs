using api.Services;
using dataccess.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly IAuthService _authService;
    
    public TransactionsController(ITransactionService transactionService, IAuthService authService)
    {
        _transactionService = transactionService;
        _authService = authService;
    }
    
    [HttpGet(nameof(GetAllTransactions))]
    public async Task<List<Transaction>> GetAllTransactions([FromQuery] bool includeDeleted = false)
    {
        return await _transactionService.GetAllAsync(includeDeleted);
    }
    
    [HttpGet(nameof(GetTransactionById))]
    public async Task<Transaction> GetTransactionById(Guid id)
    {
        return await _transactionService.GetByIdAsync(id);
    }
    
    [HttpGet(nameof(GetTransactionsByUserId))]
    public async Task<List<Transaction>> GetTransactionsByUserId(Guid userId, [FromQuery] bool includeDeleted = false)
    {
        return await _transactionService.GetByUserIdAsync(userId, includeDeleted);
    }
    
    [HttpGet(nameof(GetPendingTransactions))]
    public async Task<List<Transaction>> GetPendingTransactions()
    {
        return await _transactionService.GetPendingTransactionsAsync();
    }
    
    [HttpGet(nameof(GetTransactionByMobilepayReference))]
    public async Task<Transaction> GetTransactionByMobilepayReference(string reference)
    {
        return await _transactionService.GetByMobilepayReferenceAsync(reference);
    }
    
    [HttpPost(nameof(CreateTransaction))]
    public async Task<Transaction> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        var transaction = new Transaction
        {
            UserId = dto.UserId,
            Amount = dto.Amount,
            MobilepayReference = dto.MobilepayReference
        };
        
        // Only set BoardId if it has a value
        if (dto.BoardId.HasValue)
        {
            transaction.BoardId = dto.BoardId.Value;
        }
        
        return await _transactionService.CreateAsync(transaction);
    }
    
    [HttpPost(nameof(ApproveTransaction))]
    public async Task<Transaction> ApproveTransaction(Guid transactionId)
    {
        return await _transactionService.ApproveTransactionAsync(transactionId);
    }
    
    [HttpPost(nameof(RejectTransaction))]
    public async Task<Transaction> RejectTransaction(Guid transactionId)
    {
        return await _transactionService.RejectTransactionAsync(transactionId);
    }
    
    [HttpDelete(nameof(DeleteTransaction))]
    public async Task<bool> DeleteTransaction(Guid id, [FromQuery] bool permanent = false)
    {
        return await _transactionService.DeleteAsync(id, !permanent);
    }
    
    [HttpPost(nameof(RestoreTransaction))]
    public async Task<bool> RestoreTransaction(Guid id)
    {
        return await _transactionService.RestoreAsync(id);
    }
    
    [HttpGet(nameof(GetPendingTransactionsCount))]
    public async Task<int> GetPendingTransactionsCount()
    {
        return await _transactionService.GetPendingTransactionsCountAsync();
    }
    
    [HttpGet(nameof(GetUserBalance))]
    public async Task<decimal> GetUserBalance(Guid userId)
    {
        return await _transactionService.GetTotalApprovedAmountByUserAsync(userId);
    }
}

public class CreateTransactionDto
{
    public Guid UserId { get; set; }
    public int Amount { get; set; }
    public string MobilepayReference { get; set; } = null!;
    public Guid? BoardId { get; set; }
}