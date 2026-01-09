using System;
using System.Security.Claims;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public IActionResult List([FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        var items = _notificationService.GetLatest(userId, normalizedPage, normalizedPageSize);
        return Ok(items);
    }

    [HttpGet("unread")]
    public IActionResult UnreadCount()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var unread = _notificationService.GetUnreadCount(userId);
        return Ok(new { unread });
    }

    [HttpPost("read/all")]
    public IActionResult MarkAllRead()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var marked = _notificationService.MarkAllRead(userId);
        return Ok(new { marked });
    }

    [HttpPost("read/{id}")]
    public IActionResult MarkRead(Guid id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var marked = _notificationService.MarkRead(userId, id);
        return Ok(new { marked });
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var deleted = _notificationService.Delete(userId, id);
        return Ok(new { deleted });
    }

    [HttpDelete]
    public IActionResult DeleteAll()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var deleted = _notificationService.DeleteAll(userId);
        return Ok(new { deleted });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
