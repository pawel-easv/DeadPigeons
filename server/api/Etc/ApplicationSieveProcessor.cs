using dataccess;
using dataccess.Models;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace api.Etc;

/// <summary>
///     Custom Sieve processor with fluent API configuration for entities
/// </summary>
public class ApplicationSieveProcessor : SieveProcessor
{
    public ApplicationSieveProcessor(IOptions<SieveOptions> options) : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<User>(u => u.Id)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.FirstName)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.LastName)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.Email)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.Role)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.CreatedAt)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.UpdatedAt)
            .CanFilter()
            .CanSort();
            
        mapper.Property<User>(u => u.Deleted)
            .CanFilter()
            .CanSort();

        return mapper;
    }
}