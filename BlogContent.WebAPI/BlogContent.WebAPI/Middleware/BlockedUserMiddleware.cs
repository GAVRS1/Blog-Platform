using System.Security.Claims;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using System.Linq;

namespace BlogContent.WebAPI.Middleware;

public class BlockedUserMiddleware
{
    private static readonly string[] AllowedPaths =
    [
        "/api/auth/me",
        "/api/appeals"
    ];

    private readonly RequestDelegate _next;

    public BlockedUserMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
            if (!AllowedPaths.Any(allowed => path.StartsWith(allowed, StringComparison.OrdinalIgnoreCase)))
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdClaim, out var userId))
                {
                    try
                    {
                        var user = userService.GetUserById(userId);
                        if (user != null && user.Status == UserStatus.Banned)
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";
                            await context.Response.WriteAsJsonAsync(new
                            {
                                code = "AccountBlocked",
                                message = "Аккаунт заблокирован администратором."
                            });
                            return;
                        }
                    }
                    catch
                    {
                        // ignore user lookup errors
                    }
                }
            }
        }

        await _next(context);
    }
}
