using System.ComponentModel.DataAnnotations;
using api.Models.Requests;
using dataccess.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class BoardService(AppDbContext ctx) : IBoardService
{
    public async Task<Board> CreateBoard(CreateBoardDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
    
        var user = await ctx.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId && !u.Deleted);
        if (user == null)
            throw new ValidationException("User not found");

        // Validate that the game exists and is active
        var game = await ctx.Games.FirstOrDefaultAsync(g => g.Id == dto.GameId && !g.Deleted);
        if (game == null)
            throw new ValidationException("Game not found");

        if (!game.Active)
            throw new ValidationException("Cannot purchase boards for an inactive game");

        // Check if user has sufficient balance
        var balance = await ctx.Transactions
            .Where(t => t.UserId == dto.UserId && t.Approved == true)
            .Select(t => t.Amount)
            .SumAsync();

        if (balance < dto.Price)
            throw new ValidationException("Insufficient balance");

        var board = new Board
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            GameId = game.Id,
            CreatedAt = DateTime.UtcNow,
            Repeating = dto.Repeating,
            Numbers = dto.Numbers.ToList(),
            Price = dto.Price,
            Deleted = false
        };

        ctx.Boards.Add(board);

        var transaction = new dataccess.Models.Transaction
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Amount = -dto.Price,
            MobilepayReference = $"BOARD-{board.Id}",
            Approved = true,
            CreatedAt = DateTime.UtcNow,
            BoardId = board.Id,
            Deleted = false
        };

        ctx.Transactions.Add(transaction);

        await ctx.SaveChangesAsync();
        return board;
    }
    public async Task<Board> GetBoardByIdAsync(Guid boardId, Guid userId)
    {
        var board = await ctx.Boards
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == boardId && !b.Deleted && b.UserId == userId);

        if (board == null)
            throw new KeyNotFoundException("Board not found or access denied.");

        return board;
    }

    public async Task<IEnumerable<Board>> GetBoardsByUserAsync(Guid userId, bool includeDeleted = false)
    {
        var query = ctx.Boards
            .Include(b => b.User)
            .Include(b => b.Game)
            .Where(b => b.UserId == userId);

        if (!includeDeleted)
            query = query.Where(b => !b.Deleted);

        return await query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public async Task<Board> UpdateBoardAsync(Guid boardId, UpdateBoardDto dto, Guid requestingUserId)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);

        var board = await ctx.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId && !b.Deleted && b.UserId == requestingUserId);

        if (board == null)
            throw new KeyNotFoundException("Board not found or you don't have permission to update it.");

        // Only allow updates if the board hasn't been used in any game yet
        if (board.GameId != null)
            throw new InvalidOperationException("Cannot update a board that has already been played in a game.");

        board.Numbers = dto.Numbers.ToList();
        board.Price = dto.Price;
        board.Repeating = dto.Repeating;
        board.UpdatedAt = DateTime.UtcNow;

        await ctx.SaveChangesAsync();
        return board;
    }

    public async Task DeleteBoardAsync(Guid boardId, Guid requestingUserId)
    {
        var board = await ctx.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId && !b.Deleted && b.UserId == requestingUserId);

        if (board == null)
            throw new KeyNotFoundException("Board not found or you don't have permission to delete it.");

        // Prevent deletion if already played
        if (board.GameId != null)
            throw new InvalidOperationException("Cannot delete a board that has been used in a game.");

        board.Deleted = true;
        board.UpdatedAt = DateTime.UtcNow;

        await ctx.SaveChangesAsync();
    }

    public async Task<IEnumerable<Board>> GetActiveRepeatingBoardsAsync()
    {
        return await ctx.Boards
            .Include(b => b.User)
            .Where(b => b.Repeating && !b.Deleted && !b.User.Deleted)
            .ToListAsync();
    }

    public async Task<bool> IsBoardOwnerAsync(Guid boardId, Guid userId)
    {
        return await ctx.Boards
            .AnyAsync(b => b.Id == boardId && b.UserId == userId && !b.Deleted);
    }
    
    public async Task<IEnumerable<Board>> GetBoardsForCurrentGameWeekAsync(int year, int week)
    {
        var game = await ctx.Games
            .FirstOrDefaultAsync(g => g.Year == year && g.Week == week && g.Active && !g.Deleted);

        if (game == null)
            return Enumerable.Empty<Board>();

        var playedBoardIds = await ctx.Boards
            .Where(bp => bp.GameId == game.Id && !bp.Deleted)
            .Select(bp => bp.Id)
            .ToListAsync();

        var repeatingBoards = await GetActiveRepeatingBoardsAsync();

        return repeatingBoards
            .Where(b => !playedBoardIds.Contains(b.Id))
            .ToList();
    }
}