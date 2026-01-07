using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet("privacy")]
    public IActionResult GetPrivacy()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var settings = _settingsService.GetPrivacySettings(userId);
        return Ok(ToPrivacyDto(settings));
    }

    [HttpPut("privacy")]
    public IActionResult UpdatePrivacy([FromBody] PrivacySettingsDto request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var updated = _settingsService.UpdatePrivacySettings(userId, new PrivacySettings
        {
            CanMessageFrom = request.CanMessageFrom,
            CanCommentFrom = request.CanCommentFrom,
            ProfileVisibility = request.ProfileVisibility,
            ShowActivity = request.ShowActivity,
            ShowEmail = request.ShowEmail
        });

        return Ok(ToPrivacyDto(updated));
    }

    [HttpGet("notifications")]
    public IActionResult GetNotifications()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var settings = _settingsService.GetNotificationSettings(userId);
        return Ok(ToNotificationDto(settings));
    }

    [HttpPut("notifications")]
    public IActionResult UpdateNotifications([FromBody] NotificationSettingsDto request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var updated = _settingsService.UpdateNotificationSettings(userId, new NotificationSettings
        {
            OnLikes = request.OnLikes,
            OnComments = request.OnComments,
            OnFollows = request.OnFollows,
            OnMessages = request.OnMessages
        });

        return Ok(ToNotificationDto(updated));
    }

    private static PrivacySettingsDto ToPrivacyDto(PrivacySettings settings)
    {
        return new PrivacySettingsDto
        {
            CanMessageFrom = settings.CanMessageFrom,
            CanCommentFrom = settings.CanCommentFrom,
            ProfileVisibility = settings.ProfileVisibility,
            ShowActivity = settings.ShowActivity,
            ShowEmail = settings.ShowEmail
        };
    }

    private static NotificationSettingsDto ToNotificationDto(NotificationSettings settings)
    {
        return new NotificationSettingsDto
        {
            OnLikes = settings.OnLikes,
            OnComments = settings.OnComments,
            OnFollows = settings.OnFollows,
            OnMessages = settings.OnMessages
        };
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
