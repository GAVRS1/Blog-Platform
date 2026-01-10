using System.Security.Claims;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppealsController : ControllerBase
{
    private readonly IModerationService _moderationService;
    private readonly IUserService _userService;

    public AppealsController(IModerationService moderationService, IUserService userService)
    {
        _moderationService = moderationService;
        _userService = userService;
    }

    [HttpGet("block-status")]
    public IActionResult GetBlockStatus()
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        User? user;
        try
        {
            user = _userService.GetUserById(userId);
        }
        catch
        {
            return Ok(new BlockStatusDto
            {
                IsBlocked = false
            });
        }

        if (user.Status != UserStatus.Banned)
        {
            return Ok(new BlockStatusDto
            {
                IsBlocked = false
            });
        }

        var action = _moderationService.GetLatestActionForUser(userId, ModerationActionType.Ban);

        return Ok(new BlockStatusDto
        {
            IsBlocked = true,
            ModerationActionId = action?.Id,
            Reason = action?.Reason,
            BlockedAt = action?.CreatedAt
        });
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateAppealRequest request)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Сообщение апелляции не может быть пустым.");
        }

        User user;
        try
        {
            user = _userService.GetUserById(userId);
        }
        catch
        {
            return BadRequest("Пользователь не найден.");
        }

        if (user.Status != UserStatus.Banned)
        {
            return BadRequest("Апелляция доступна только для заблокированных аккаунтов.");
        }

        var action = _moderationService.GetLatestActionForUser(userId, ModerationActionType.Ban);
        if (action == null)
        {
            return BadRequest("Не найдено активной блокировки для подачи апелляции.");
        }

        var appeal = new Appeal
        {
            ModerationActionId = action.Id,
            UserId = userId,
            Message = request.Message.Trim(),
            Status = AppealStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _moderationService.CreateAppeal(appeal);

        return Ok(new AppealDto
        {
            Id = appeal.Id,
            ModerationActionId = appeal.ModerationActionId,
            UserId = appeal.UserId,
            Message = appeal.Message,
            Resolution = appeal.Resolution,
            Status = appeal.Status,
            CreatedAt = appeal.CreatedAt,
            ResolvedAt = appeal.ResolvedAt
        });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
