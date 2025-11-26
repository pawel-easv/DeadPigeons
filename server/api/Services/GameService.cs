using dataccess.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class GameService : IGameService
{
    private readonly AppDbContext _ctx;
    
    public GameService(AppDbContext ctx)
    {
        _ctx = ctx;
    }

    public async Task<Game?> GetByIdAsync(Guid id)
    {
        var game = await _ctx.Games
            .Include(g => g.Boards)
            .FirstOrDefaultAsync(g => g.Id == id && g.Deleted != true);
        
        if (game == null)
        {
            throw new InvalidOperationException("Game not found.");
        }
        
        return game;
    }

    public async Task<Game?> GetCurrentGameAsync()
    {
        var today = DateTime.UtcNow;
        
        var culture = System.Globalization.CultureInfo.InvariantCulture;
        var calendar = culture.Calendar;
        var weekRule = culture.DateTimeFormat.CalendarWeekRule;
        var firstDay = culture.DateTimeFormat.FirstDayOfWeek;

        int currentWeek = calendar.GetWeekOfYear(today, weekRule, firstDay);
        int currentYear = today.Year;

        return await _ctx.Games
            .Include(g => g.Boards)
            .Where(g => g.Week == currentWeek &&
                        g.Year == currentYear &&
                        g.Deleted != true)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Game>> GetAllAsync(bool includeDeleted = false)
    {
        var query = _ctx.Games
            .Include(g => g.Boards)
            .AsQueryable();
        
        if (!includeDeleted)
        {
            query = query.Where(g => g.Deleted != true);
        }
        
        return await query
            .OrderByDescending(g => g.Year)
            .ThenByDescending(g => g.Week)
            .ToListAsync();
    }

    public async Task<List<Game>> GetGamesByYearAsync(int year, bool includeDeleted = false)
    {
        var query = _ctx.Games
            .Include(g => g.Boards)
            .Where(g => g.Year == year);
        
        if (!includeDeleted)
        {
            query = query.Where(g => g.Deleted != true);
        }
        
        return await query
            .OrderByDescending(g => g.Week)
            .ToListAsync();
    }

    public async Task<Game> GetGameByWeekAndYearAsync(int week, int year)
    {
        var game = await _ctx.Games
            .Include(g => g.Boards)
            .FirstOrDefaultAsync(g => g.Week == week && g.Year == year && g.Deleted != true);
        
        if (game == null)
        {
            throw new InvalidOperationException($"Game not found for week {week}, year {year}.");
        }
        
        return game;
    }

    public async Task<Game> CreateAsync(Game game)
    {
        var activeGames = await _ctx.Games
            .Where(g => g.Active && g.Deleted != true)
            .ToListAsync();
        
        foreach (var activeGame in activeGames)
        {
            activeGame.Active = false;
        }
        
        game.Id = Guid.NewGuid();
        game.CreatedAt = DateTime.UtcNow;
        game.Active = true;
        game.Deleted = false;
        game.WinningNumbers = null;
        game.PublishedAt = null;

        _ctx.Games.Add(game);
        await _ctx.SaveChangesAsync();
        
        return game;
    }

    public async Task<Game?> SetWinningNumbersAsync(Guid gameId, int[] winningNumbers)
    {
        if (winningNumbers == null || winningNumbers.Length != 3)
        {
            throw new InvalidOperationException("Winning numbers must be exactly 3 numbers.");
        }

        if (winningNumbers.Any(n => n < 1 || n > 16))
        {
            throw new InvalidOperationException("All winning numbers must be between 1 and 16.");
        }

        var game = await _ctx.Games.FindAsync(gameId);
        
        if (game == null || game.Deleted == true)
        {
            throw new InvalidOperationException("Game not found.");
        }

        if (game.WinningNumbers != null && game.WinningNumbers.Any())
        {
            throw new InvalidOperationException("Winning numbers have already been set for this game.");
        }

        game.WinningNumbers = winningNumbers.ToList();
        game.PublishedAt = DateTime.UtcNow;
        game.Active = true;

        await _ctx.SaveChangesAsync();
        
        return game;
    }

    public async Task<bool> DeleteAsync(Guid id, bool softDelete = true)
    {
        var game = await _ctx.Games.FindAsync(id);
        
        if (game == null)
        {
            throw new InvalidOperationException("Game not found.");
        }

        if (softDelete)
        {
            game.Deleted = true;
        }
        else
        {
            _ctx.Games.Remove(game);
        }

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RestoreAsync(Guid id)
    {
        var game = await _ctx.Games.FindAsync(id);
        
        if (game == null)
        {
            throw new InvalidOperationException("Game not found.");
        }

        if (!game.Deleted)
        {
            throw new InvalidOperationException("Game is not deleted.");
        }

        game.Deleted = false;

        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task<Game?> ActivateGameAsync(Guid gameId)
    {
        var activeGames = await _ctx.Games
            .Where(g => g.Active && g.Deleted != true)
            .ToListAsync();
        
        foreach (var activeGame in activeGames)
        {
            activeGame.Active = false;
        }

        var game = await _ctx.Games.FindAsync(gameId);
        
        if (game == null || game.Deleted == true)
        {
            throw new InvalidOperationException("Game not found.");
        }

        game.Active = true;

        await _ctx.SaveChangesAsync();
        
        return game;
    }

    private async Task<Game> CreateNextWeekGameAsync(Game currentGame)
    {
        var nextWeek = currentGame.Week + 1;
        var nextYear = currentGame.Year;

        if (nextWeek > 52)
        {
            nextWeek = 1;
            nextYear++;
        }

        var nextGame = new Game
        {
            Week = nextWeek,
            Year = nextYear
        };

        return await CreateAsync(nextGame);
    }
}
