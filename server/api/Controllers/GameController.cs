
using api.Services;
using dataccess.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly IGameService _gameService;
    private readonly IAuthService _authService;
    
    public GamesController(IGameService gameService, IAuthService authService)
    {
        _gameService = gameService;
        _authService = authService;
    }
    
    [HttpGet(nameof(GetCurrentGame))]
    public async Task<Game?> GetCurrentGame()
    {
        return await _gameService.GetCurrentGameAsync();
    }
    
    [HttpGet(nameof(GetAllGames))]
    public async Task<List<Game>> GetAllGames([FromQuery] bool includeDeleted = false)
    {
        return await _gameService.GetAllAsync(includeDeleted);
    }
    
    [HttpGet(nameof(GetGameById))]
    public async Task<Game?> GetGameById(Guid id)
    {
        return await _gameService.GetByIdAsync(id);
    }
    
    [HttpGet(nameof(GetGamesByYear))]
    public async Task<List<Game>> GetGamesByYear(int year, [FromQuery] bool includeDeleted = false)
    {
        return await _gameService.GetGamesByYearAsync(year, includeDeleted);
    }
    
    [HttpGet(nameof(GetGameByWeekAndYear))]
    public async Task<Game?> GetGameByWeekAndYear(int week, int year)
    {
        return await _gameService.GetGameByWeekAndYearAsync(week, year);
    }
    
    [HttpPost(nameof(CreateGame))]
    public async Task<Game> CreateGame([FromBody] CreateGameDto dto)
    {
        var game = new Game
        {
            Week = dto.Week,
            Year = dto.Year
        };
        
        return await _gameService.CreateAsync(game);
    }
    
    [HttpPost(nameof(SetWinningNumbers))]
    public async Task<Game?> SetWinningNumbers([FromBody] SetWinningNumbersDto dto)
    {
        return await _gameService.SetWinningNumbersAsync(dto.GameId, dto.WinningNumbers);
    }
    
    [HttpPost(nameof(ActivateGame))]
    public async Task<Game?> ActivateGame(Guid gameId)
    {
        return await _gameService.ActivateGameAsync(gameId);
    }
    
    [HttpDelete(nameof(DeleteGame))]
    public async Task<bool> DeleteGame(Guid id, [FromQuery] bool permanent = false)
    {
        return await _gameService.DeleteAsync(id, !permanent);
    }
    
    [HttpPost(nameof(RestoreGame))]
    public async Task<bool> RestoreGame(Guid id)
    {
        return await _gameService.RestoreAsync(id);
    }
    
    [HttpGet(nameof(GetGameStats))]
    public async Task<GameStatsDto> GetGameStats()
    {
        var currentGame = await _gameService.GetCurrentGameAsync();
        
        if (currentGame == null)
        {
            throw new Exception("No current game found");
        }
        return new GameStatsDto
        {
            TotalBoards = 0,
            TotalRevenue = 0,
            ActiveRepeatingBoards = 0,
            PendingTransactions = 0
        };
    }
}

public class CreateGameDto
{
    public int Week { get; set; }
    public int Year { get; set; }
}

public class SetWinningNumbersDto
{
    public Guid GameId { get; set; }
    public int[] WinningNumbers { get; set; } = Array.Empty<int>();
}

public class GameStatsDto
{
    public int TotalBoards { get; set; }
    public decimal TotalRevenue { get; set; }
    public int ActiveRepeatingBoards { get; set; }
    public int PendingTransactions { get; set; }
}