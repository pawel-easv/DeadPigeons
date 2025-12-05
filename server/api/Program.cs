using System.Text;
using System.Text.Json.Serialization;
using api.Controllers;
using api.Etc;
using api.Middleware;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Sieve.Models;
using Sieve.Services;

namespace api;

public class Program
{
public static void ConfigureServices(IServiceCollection services)
{
    services.AddSingleton(TimeProvider.System);
    services.InjectAppOptions();
    services.AddMyDbContext();
    services.AddControllers().AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
        opts.JsonSerializerOptions.MaxDepth = 128;
    });
    
    services.AddOpenApiDocument();
    services.AddCors();
    services.AddScoped<IUserService, UserService>();
    services.AddScoped<IAuthService, AuthService>();
    services.AddScoped<IGameService, GameService>();
    services.AddScoped<ITransactionService, TransactionService>();
    services.AddScoped<IBoardService, BoardService>();

    services.AddScoped<ISeeder, GameSeeder>();
    
    // Get JWT secret from configuration
    var serviceProvider = services.BuildServiceProvider();
    var appOptions = serviceProvider.GetRequiredService<AppOptions>();

    services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(appOptions.JwtSecret)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                // Important: Specify the algorithm
                ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha512 }
            };

            // Add logging for authentication failures
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogError(context.Exception, "Authentication failed: {Message}", 
                        context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogInformation("Token validated successfully for user: {User}", 
                        context.Principal?.Identity?.Name ?? "Unknown");
                    return Task.CompletedTask;
                },
                OnChallenge = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogWarning("Authentication challenge: {Error} - {ErrorDescription}", 
                        context.Error, context.ErrorDescription);
                    return Task.CompletedTask;
                }
            };
        });

    services.AddAuthorization(options =>
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    });

    services.AddExceptionHandler<GlobalExceptionHandler>();
    services.Configure<SieveOptions>(options =>
    {
        options.CaseSensitive = false;
        options.DefaultPageSize = 10;
        options.MaxPageSize = 100;
    });
    services.AddScoped<ISieveProcessor, ApplicationSieveProcessor>();
}

public static void Main()
{
    var builder = WebApplication.CreateBuilder();

    ConfigureServices(builder.Services);
    var app = builder.Build();
    
    app.UseExceptionHandler(config => { });
    app.UseOpenApi();
    app.UseSwaggerUi();
    app.MapScalarApiReference(options => options.OpenApiRoutePattern = "/swagger/v1/swagger.json");
    
    app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(x => true));
    
    app.UseMiddleware<AuthDebugMiddleware>();
    
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    
    app.GenerateApiClientsFromOpenApi("/../../client/src/core/generated-client.ts").GetAwaiter().GetResult();
    
    if (app.Environment.IsDevelopment())
        using (var scope = app.Services.CreateScope())
        {
            scope.ServiceProvider.GetRequiredService<ISeeder>().Seed().GetAwaiter().GetResult();
        }
    
    app.Run();
}
}