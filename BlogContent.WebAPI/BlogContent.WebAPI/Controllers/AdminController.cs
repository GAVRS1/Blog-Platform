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
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IModerationService _moderationService;

    public AdminController(IModerationService moderationService)
    {
        _moderationService = moderationService;
    }

    [HttpGet("listReports")]
    public IActionResult ListReports()
    {
        var reports = _moderationService.GetReports()
            .Select(report => new ReportDto
            {
                Id = report.Id,
                ReporterUserId = report.ReporterUserId,
                TargetUserId = report.TargetUserId,
                PostId = report.PostId,
                CommentId = report.CommentId,
                Reason = report.Reason,
                Details = report.Details,
                Status = report.Status,
                CreatedAt = report.CreatedAt
            });

        return Ok(reports);
    }

    [HttpGet("listActions")]
    public IActionResult ListActions()
    {
        var actions = _moderationService.GetActions()
            .Select(action => new ModerationActionDto
            {
                Id = action.Id,
                AdminUserId = action.AdminUserId,
                TargetUserId = action.TargetUserId,
                ReportId = action.ReportId,
                ActionType = action.ActionType,
                Reason = action.Reason,
                CreatedAt = action.CreatedAt
            });

        return Ok(actions);
    }

    [HttpGet("listAppeals")]
    public IActionResult ListAppeals()
    {
        var appeals = _moderationService.GetAppeals()
            .Select(appeal => new AppealDto
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

        return Ok(appeals);
    }

    [HttpPost("createAction")]
    public IActionResult CreateAction([FromBody] CreateModerationActionRequest request)
    {
        if (!TryGetUserId(out var adminUserId))
        {
            return Unauthorized();
        }

        Report? report = null;
        if (request.ReportId.HasValue)
        {
            report = _moderationService.GetReportById(request.ReportId.Value);
            if (report == null)
            {
                return NotFound("Жалоба не найдена.");
            }
        }

        var action = new ModerationAction
        {
            AdminUserId = adminUserId,
            TargetUserId = request.TargetUserId ?? report?.TargetUserId,
            ReportId = request.ReportId,
            ActionType = request.ActionType,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow
        };

        _moderationService.CreateAction(action);

        if (report != null)
        {
            report.Status = ReportStatus.Reviewed;
            _moderationService.UpdateReport(report);
        }

        return Ok(new ModerationActionDto
        {
            Id = action.Id,
            AdminUserId = action.AdminUserId,
            TargetUserId = action.TargetUserId,
            ReportId = action.ReportId,
            ActionType = action.ActionType,
            Reason = action.Reason,
            CreatedAt = action.CreatedAt
        });
    }

    [HttpPost("resolveAppeal")]
    public IActionResult ResolveAppeal([FromBody] ResolveAppealRequest request)
    {
        try
        {
            var appeal = _moderationService.ResolveAppeal(request.AppealId, request.Status, request.Resolution);
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
        catch (InvalidOperationException ex)
        {
            return NotFound(ex.Message);
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
