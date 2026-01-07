using System;
using System.Collections.Generic;
using System.Security.Claims;
using BlogContent.WebAPI.DTOs;
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

    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
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

        var saved = _messageService.SendMessage(userId, request.RecipientId, request.Content ?? string.Empty, request.Attachments);
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
