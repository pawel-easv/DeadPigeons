namespace api.Middleware;

public class AuthDebugMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthDebugMiddleware> _logger;

    public AuthDebugMiddleware(RequestDelegate next, ILogger<AuthDebugMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value ?? "";
        
        if (path.Contains("/Auth/WhoAmI", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("=== WhoAmI Request Debug ===");
            
            // Log Authorization header
            if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                _logger.LogInformation("Authorization Header Present: {Header}", 
                    authHeader.ToString().Substring(0, Math.Min(50, authHeader.ToString().Length)));
            }
            else
            {
                _logger.LogWarning("No Authorization Header Found!");
            }

            // Log all headers
            _logger.LogInformation("All Headers:");
            foreach (var header in context.Request.Headers)
            {
                _logger.LogInformation("  {Key}: {Value}", header.Key, 
                    header.Key.Equals("Authorization", StringComparison.OrdinalIgnoreCase) 
                        ? header.Value.ToString().Substring(0, Math.Min(30, header.Value.ToString().Length)) + "..."
                        : header.Value.ToString());
            }
        }

        await _next(context);

        if (path.Contains("/Auth/WhoAmI", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Response Status Code: {StatusCode}", context.Response.StatusCode);
            
            if (context.User?.Identity?.IsAuthenticated == true)
            {
                _logger.LogInformation("User IS authenticated");
                foreach (var claim in context.User.Claims)
                {
                    _logger.LogInformation("  Claim: {Type} = {Value}", claim.Type, claim.Value);
                }
            }
            else
            {
                _logger.LogWarning("User is NOT authenticated");
            }
        }
    }
}