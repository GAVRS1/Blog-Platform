using System.Security.Claims;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace BlogContent.WebAPI.Authorization;

public class AdminRequirementHandler : AuthorizationHandler<AdminRequirement>
{
    private readonly IUserService _userService;

    public AdminRequirementHandler(IUserService userService)
    {
        _userService = userService;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, AdminRequirement requirement)
    {
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Task.CompletedTask;
        }

        var user = _userService.GetUserById(userId);
        if (user != null && user.Status == UserStatus.Admin)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
