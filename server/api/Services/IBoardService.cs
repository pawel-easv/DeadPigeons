using api.Models.Requests;
using dataccess.Models;

namespace api.Services;

public interface IBoardService
{

    Task<Board> CreateBoard(CreateBoardDto dto);

    Task<Board> GetBoardByIdAsync(Guid boardId, Guid userId);
    
    Task<IEnumerable<Board>> GetBoardsByUserAsync(Guid userId, bool includeDeleted = false);
    
    Task<Board> UpdateBoardAsync(Guid boardId, UpdateBoardDto dto, Guid requestingUserId);
    
    Task DeleteBoardAsync(Guid boardId, Guid requestingUserId);

    Task<IEnumerable<Board>> GetActiveRepeatingBoardsAsync();
    
    Task<bool> IsBoardOwnerAsync(Guid boardId, Guid userId);

    Task<IEnumerable<Board>> GetBoardsForCurrentGameWeekAsync(int year, int week);
}