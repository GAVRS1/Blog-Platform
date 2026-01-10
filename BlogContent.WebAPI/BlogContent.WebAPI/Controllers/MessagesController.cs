using System;
using System.Collections.Generic;
using System.Security.Claims;
using BlogContent.WebAPI.DTOs;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using BlogContent.WebAPI.Services;
using BlogContent.Services;
using BlogContent.WebAPI.Hubs;

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
    private readonly IHubContext<ChatHub> _chatHub;

    public MessagesController(
        IMessageService messageService,
        IUserService userService,
        IFollowService followService,
        IHubContext<ChatHub> chatHub)
    {
        _messageService = messageService;
        _userService = userService;
        _followService = followService;
        _chatHub = chatHub;
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
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (request == null || request.RecipientId <= 0 || string.IsNullOrWhiteSpace(request.Content) && (request.Attachments == null || request.Attachments.Count == 0))
        {
            return BadRequest("Recipient and message content are required.");
        }

        if (request.RecipientId == userId)
        {
            return BadRequest("Нельзя отправлять сообщения самому себе.");
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
        await _chatHub.Clients.Users(userId.ToString(), request.RecipientId.ToString())
            .SendAsync("MessageReceived", saved);

        return Ok(saved);
    }

    [HttpPost("read/{id}")]
    public async Task<IActionResult> MarkRead(int id)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var result = _messageService.MarkRead(userId, id);
        if (result.Marked > 0)
        {
            var payload = new
            {
                ReaderId = userId,
                SenderId = id,
                result.UpdatedMessages
            };

            await _chatHub.Clients.Users(userId.ToString(), id.ToString())
                .SendAsync("MessagesRead", payload);
        }

        return Ok(result);
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
