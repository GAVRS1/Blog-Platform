using System;
using System.Collections.Generic;
using System.Security.Claims;
using BlogContent.WebAPI.DTOs;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Services;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private const int DefaultPageSize = 30;
    private const int MaxPageSize = 100;

    private const string AccessDeniedMessage = "Пользователь ограничил круг лиц, которым доступно это действие.";

    private readonly IMessageService _messageService;
    private readonly IUserService _userService;
    private readonly IFollowService _followService;
    private readonly ISettingsService _settingsService;
    private readonly INotificationService _notificationService;

    public MessagesController(
        IMessageService messageService,
        IUserService userService,
        IFollowService followService,
        ISettingsService settingsService,
        INotificationService notificationService)
    {
        _messageService = messageService;
        _userService = userService;
        _followService = followService;
        _settingsService = settingsService;
        _notificationService = notificationService;
    }

    [HttpGet("inbox")]
    public IActionResult GetInbox()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var inbox = _messageService.GetInbox(userId);
        return Ok(inbox);
    }

    [HttpGet("dialog/{id}")]
    public IActionResult GetDialog(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = DefaultPageSize)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var normalizedPage = Math.Max(page, 1);
        var normalizedPageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        var messages = _messageService.GetDialog(userId, id, normalizedPage, normalizedPageSize);
        return Ok(messages);
    }

    [HttpPost]
    public IActionResult SendMessage([FromBody] SendMessageRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (request == null || request.RecipientId <= 0 || string.IsNullOrWhiteSpace(request.Content) && (request.Attachments == null || request.Attachments.Count == 0))
        {
            return BadRequest("Recipient and message content are required.");
        }

        var recipient = _userService.GetUserById(request.RecipientId);
        if (recipient == null)
        {
            return NotFound();
        }

        if (recipient.Id != userId)
        {
            var relation = _followService.GetRelationship(userId, recipient.Id);
            var audience = recipient.PrivacySettings?.CanMessageFrom ?? Audience.Everyone;
            if (!SettingsAccessChecker.CanAccess(audience, relation.AreFriends))
            {
                return StatusCode(403, new AccessDeniedResponse { Message = AccessDeniedMessage });
            }
        }

        var saved = _messageService.SendMessage(userId, request.RecipientId, request.Content ?? string.Empty, request.Attachments);

        if (recipient.Id != userId)
        {
            var settings = _settingsService.GetNotificationSettings(recipient.Id);
            if (settings.OnMessages)
            {
                _notificationService.AddNotification(
                    recipient.Id,
                    "message",
                    "Новое сообщение.",
                    userId);
            }
        }

        return Ok(saved);
    }

    [HttpPost("read/{id}")]
    public IActionResult MarkRead(int id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var marked = _messageService.MarkRead(userId, id);
        return Ok(new { marked });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}

public class SendMessageRequest
{
    public int RecipientId { get; set; }
    public string? Content { get; set; }
    public List<MessageAttachmentDto> Attachments { get; set; } = [];
}
