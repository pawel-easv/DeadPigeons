using dataccess.Models;

public interface IGameService
{
    Task<Game?> GetByIdAsync(Guid id);
    Task<Game?> GetCurrentGameAsync();
    Task<List<Game>> GetAllAsync(bool includeDeleted = false);
    Task<List<Game>> GetGamesByYearAsync(int year, bool includeDeleted = false);
    Task<Game?> GetGameByWeekAndYearAsync(int week, int year);
    Task<Game> CreateAsync(Game game);
    Task<Game?> SetWinningNumbersAsync(Guid gameId, int[] winningNumbers);
    Task<bool> DeleteAsync(Guid id, bool softDelete = true);
    Task<bool> RestoreAsync(Guid id);
    Task<Game?> ActivateGameAsync(Guid gameId);
}