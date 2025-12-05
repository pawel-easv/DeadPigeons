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
public class BoardsController : ControllerBase
{
    private readonly IBoardService _boardService;

    public BoardsController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirst("Id")?.Value 
                                             ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

    [HttpGet]
    public async Task<IEnumerable<Board>> GetMyBoards([FromQuery] bool includeDeleted = false)
        => await _boardService.GetBoardsByUserAsync(CurrentUserId, includeDeleted);

    [HttpGet(nameof(GetBoard))]
    public async Task<Board> GetBoard(Guid id)
    {
        return await _boardService.GetBoardByIdAsync(id, CurrentUserId);
    }
    
    [HttpPost]
    public async Task<Board> CreateBoard([FromBody] CreateBoardDto dto)
    {
        // Ensure the board is created for the current user
        dto.UserId = CurrentUserId;
        return await _boardService.CreateBoard(dto);
    }

    [HttpPut(nameof(UpdateBoard))]
    public async Task<Board> UpdateBoard(Guid id, [FromBody] UpdateBoardDto dto)
    {
        return await _boardService.UpdateBoardAsync(id, dto, CurrentUserId);
    }
    
    [HttpDelete(nameof(DeleteBoard))]
    public async Task DeleteBoard(Guid id)
    {
        await _boardService.DeleteBoardAsync(id, CurrentUserId);
    }
    
    [HttpGet(nameof(GetActiveRepeatingBoards))]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IEnumerable<Board>> GetActiveRepeatingBoards()
        => await _boardService.GetActiveRepeatingBoardsAsync();

    [HttpGet(nameof(GetBoardsForCurrentGameWeek))]
    public async Task<IEnumerable<Board>> GetBoardsForCurrentGameWeek(int year, int week)
        => await _boardService.GetBoardsForCurrentGameWeekAsync(year, week);
}