using System;
using System.Linq;
using System.Security.Claims;
using BlogContent.Core.Interfaces;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/follows")]
[Authorize]
public class FollowsController : ControllerBase
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    private readonly IFollowService _followService;
    private readonly IUserService _userService;
    private readonly ISettingsService _settingsService;
    private readonly INotificationService _notificationService;

    public FollowsController(
        IFollowService followService,
        IUserService userService,
        ISettingsService settingsService,
        INotificationService notificationService)
    {
        _followService = followService;
        _userService = userService;
        _settingsService = settingsService;
        _notificationService = notificationService;
    }

    [HttpPost("{userId}")]
    public IActionResult Follow(int userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        _followService.Follow(currentUserId, userId);

        if (currentUserId != userId)
        {
            var settings = _settingsService.GetNotificationSettings(userId);
            if (settings.OnFollows)
            {
                _notificationService.AddNotification(
                    userId,
                    "follow",
                    "Новый подписчик.",
                    currentUserId);
            }
        }

        return Ok(new { followed = true });
    }

    [HttpDelete("{userId}")]
    public IActionResult Unfollow(int userId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        _followService.Unfollow(currentUserId, userId);
        return Ok(new { unfollowed = true });
    }

    [HttpGet("{userId}/followers")]
    public IActionResult GetFollowers(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var result = _followService.GetFollowers(userId, normalizedPage, normalizedPageSize);
        var users = _userService.GetUsersByIds(result.Items).Select(u => u.ToDto());
        var response = new PagedResponse<UserResponseDto>(users, result.Total, result.Page, result.PageSize);
        return Ok(response);
    }

    [HttpGet("{userId}/following")]
    public IActionResult GetFollowing(int userId, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var result = _followService.GetFollowing(userId, normalizedPage, normalizedPageSize);
        var users = _userService.GetUsersByIds(result.Items).Select(u => u.ToDto());
        var response = new PagedResponse<UserResponseDto>(users, result.Total, result.Page, result.PageSize);
        return Ok(response);
    }

    [HttpGet("{userId}/counters")]
    public IActionResult GetCounters(int userId)
    {
        var counters = _followService.GetCounters(userId);
        return Ok(new { followers = counters.Followers, following = counters.Following });
    }

    [HttpGet("relationship/{otherUserId}")]
    public IActionResult GetRelationship(int otherUserId)
    {
        if (!TryGetUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        var relation = _followService.GetRelationship(currentUserId, otherUserId);
        return Ok(new
        {
            iFollow = relation.IFollow,
            followsMe = relation.FollowsMe,
            areFriends = relation.AreFriends
        });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
