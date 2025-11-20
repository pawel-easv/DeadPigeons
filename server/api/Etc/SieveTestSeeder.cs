using System.Security.Cryptography;
using System.Text;
using Bogus;
using dataccess;
using dataccess.Models;

namespace api.Etc;

public class SieveTestSeeder(AppDbContext ctx, TimeProvider timeProvider) : ISeeder
{
    public async Task Seed()
    {
        await ctx.Database.EnsureCreatedAsync();

        await ctx.SaveChangesAsync();

        await ctx.SaveChangesAsync();
        
        ctx.ChangeTracker.Clear();
    }
    
    private static string Capitalize(string word)
    {
        if (string.IsNullOrEmpty(word)) return word;
        return char.ToUpper(word[0]) + word.Substring(1).ToLower();
    }

    private static string CapitalizeWords(string text)
    {
        if (string.IsNullOrEmpty(text)) return text;
        var words = text.Split(' ');
        return string.Join(" ", words.Select(Capitalize));
    }
}