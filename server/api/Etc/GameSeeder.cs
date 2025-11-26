// Services/GameSeederService.cs

using api.Etc;
using dataccess.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;


public class GameSeeder : ISeeder
{
    private readonly AppDbContext _ctx;
    private readonly ILogger<GameSeeder> _logger;
    private static readonly TimeZoneInfo DanishTz = 
        TimeZoneInfo.FindSystemTimeZoneById("Romance Standard Time");

    public GameSeeder(AppDbContext ctx, ILogger<GameSeeder> logger)
    {
        _ctx = ctx;
        _logger = logger;
    }

    public async Task Seed()
    {
        var today = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, DanishTz).Date;

        // Find current ISO week/year
        int currentWeek = GetIso8601WeekOfYear(today);
        int currentYear = today.Year;
        var thursday = today.AddDays(3 - ((int)today.DayOfWeek + 6) % 7);
        currentYear = thursday.Year; // correct ISO year

        var startDate = today.AddDays(-(today.DayOfWeek == DayOfWeek.Sunday ? 6 : (int)today.DayOfWeek - 1)); // Monday of this week
        var gamesToCreate = new List<Game>();
        var weeksAdded = 0;
        const int maxWeeks = 26;

        var existingGames = await _ctx.Games
            .Where(g => !g.Deleted)
            .Select(g => new { g.Week, g.Year })
            .ToListAsync();

        var existingSet = existingGames
            .Select(g => $"{g.Year}-{g.Week}")
            .ToHashSet();

        for (int i = 0; i < maxWeeks; i++)
        {
            var monday = startDate.AddDays(i * 7);

            int week = GetIso8601WeekOfYear(monday);
            int year = monday.Year;
            var thursdayThisWeek = monday.AddDays(3);
            year = thursdayThisWeek.Year; 

            string key = $"{year}-{week}";

            if (existingSet.Contains(key))
                continue; 

            bool isCurrentWeek = (week == currentWeek && year == currentYear);

            gamesToCreate.Add(new Game
            {
                Id = Guid.NewGuid(),
                Week = week,
                Year = year,
                Active = false,
                CreatedAt = DateTime.UtcNow,
                Deleted = false,
                WinningNumbers = null,
                PublishedAt = null
            });

            weeksAdded++;
            if (weeksAdded >= 200) 
            {
                _ctx.Games.AddRange(gamesToCreate);
                await _ctx.SaveChangesAsync();
                gamesToCreate.Clear();
            }
        }

        if (gamesToCreate.Any())
        {
            _ctx.Games.AddRange(gamesToCreate);
            await _ctx.SaveChangesAsync();
        }

        // Final step: ensure exactly ONE active game (in case of weird data)
        var activeGames = await _ctx.Games.Where(g => g.Active && !g.Deleted).ToListAsync();
        foreach (var g in activeGames)
            g.Active = (g.Week == currentWeek && g.Year == currentYear);

        await _ctx.SaveChangesAsync();

        _logger.LogInformation("Game seeder completed: {Weeks} new games created. Current week: {Week}/{Year}", 
            weeksAdded + existingGames.Count, currentWeek, currentYear);
    }

    private static int GetIso8601WeekOfYear(DateTime date)
    {
        var culture = System.Globalization.CultureInfo.GetCultureInfo("da-DK");
        return culture.Calendar.GetWeekOfYear(
            date,
            System.Globalization.CalendarWeekRule.FirstFourDayWeek,
            DayOfWeek.Monday);
    }
}