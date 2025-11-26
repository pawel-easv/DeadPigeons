using api.Models.Requests;
using api.Services;
using dataccess.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly IBoardService _boardService;
    private readonly Guid _userId;

    public BoardsController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    private Guid CurrentUserId => _userId;

    [HttpGet]
    public async Task<IEnumerable<Board>> GetMyBoards([FromQuery] bool includeDeleted = false)
        => await _boardService.GetBoardsByUserAsync(CurrentUserId, includeDeleted);

    [HttpGet(nameof(GetBoard))]
    public async Task<Board> GetBoard(Guid id)
    {
        try
        {
            return await _boardService.GetBoardByIdAsync(id, CurrentUserId);
        }
        catch (KeyNotFoundException)
        {
            throw new KeyNotFoundException("Board not found or you don't have permission.");
        }
    }
    
    [HttpPost]
    public async Task<Board> CreateBoard([FromBody] CreateBoardDto dto)
    {
        try
        {
            var board = await _boardService.CreateBoard(dto);
            return board;
        }
        catch (ValidationException ex)
        {
            throw new ValidationException(ex.Message);
        }
    }

    [HttpPut(nameof(UpdateBoard))]
    public async Task<Board> UpdateBoard(Guid id, [FromBody] UpdateBoardDto dto)
    {
        try
        {
            var board = await _boardService.UpdateBoardAsync(id, dto, CurrentUserId);
            return board;
        }
        catch (KeyNotFoundException)
        {
            throw  new KeyNotFoundException("Board not found or you don't have permission.");
        }
        catch (InvalidOperationException ex)
        {
            throw new InvalidOperationException(ex.Message);
        }
        catch (ValidationException ex)
        {
            throw new ValidationException(ex.Message);
        }
    }
    
    [HttpDelete(nameof(DeleteBoard))]
    public async Task<bool> DeleteBoard(Guid id)
    {
        try
        {
            await _boardService.DeleteBoardAsync(id, CurrentUserId);
            return true;
        }
        catch (KeyNotFoundException)
        {
            throw new  KeyNotFoundException("Board not found or you don't have permission.");
        }
        catch (InvalidOperationException ex)
        {
            throw new  InvalidOperationException(ex.Message);
        }
    }
    
    [HttpGet(nameof(GetActiveRepeatingBoards))]
    public async Task<IEnumerable<Board>> GetActiveRepeatingBoards()
        => await _boardService.GetActiveRepeatingBoardsAsync();

    [HttpGet(nameof(GetBoardsForCurrentGameWeek))]
    public async Task<IEnumerable<Board>> GetBoardsForCurrentGameWeek(int year, int week)
        => await _boardService.GetBoardsForCurrentGameWeekAsync(year, week);
}