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
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IModerationService _moderationService;
    private readonly IUserService _userService;

    public AdminController(IModerationService moderationService, IUserService userService)
    {
        _moderationService = moderationService;
        _userService = userService;
    }

    [HttpGet("listReports")]
    public IActionResult ListReports([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var reportQuery = _moderationService.GetReports().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReportStatus>(status, true, out var parsedStatus))
        {
            reportQuery = reportQuery.Where(report => report.Status == parsedStatus);
        }

        var total = reportQuery.Count();
        var reports = reportQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
            })
            .ToList();

        return Ok(new PagedResponse<ReportDto>(reports, total, page, pageSize));
    }

    [HttpGet("listActions")]
    public IActionResult ListActions([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var actionQuery = _moderationService.GetActions().AsQueryable();
        var total = actionQuery.Count();
        var actions = actionQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(action => new ModerationActionDto
            {
                Id = action.Id,
                AdminUserId = action.AdminUserId,
                TargetUserId = action.TargetUserId,
                ReportId = action.ReportId,
                ActionType = action.ActionType,
                Reason = action.Reason,
                CreatedAt = action.CreatedAt
            })
            .ToList();

        return Ok(new PagedResponse<ModerationActionDto>(actions, total, page, pageSize));
    }

    [HttpGet("listAppeals")]
    public IActionResult ListAppeals([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var appealQuery = _moderationService.GetAppeals().AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AppealStatus>(status, true, out var parsedStatus))
        {
            appealQuery = appealQuery.Where(appeal => appeal.Status == parsedStatus);
        }

        var total = appealQuery.Count();
        var appeals = appealQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
            })
            .ToList();

        return Ok(new PagedResponse<AppealDto>(appeals, total, page, pageSize));
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

        var targetUserId = request.TargetUserId ?? report?.TargetUserId;
        var action = new ModerationAction
        {
            AdminUserId = adminUserId,
            TargetUserId = targetUserId,
            ReportId = request.ReportId,
            ActionType = request.ActionType,
            Reason = request.Reason,
            CreatedAt = DateTime.UtcNow
        };

        _moderationService.CreateAction(action);

        if (report != null)
        {
            if (request.ActionType == ModerationActionType.Ban)
            {
                report.Status = ReportStatus.Approved;
                _moderationService.UpdateReport(report);
            }
        }

        if (targetUserId.HasValue)
        {
            if (request.ActionType == ModerationActionType.Ban)
            {
                _userService.BanUser(targetUserId.Value);
            }
            else if (request.ActionType == ModerationActionType.Unban)
            {
                _userService.UnbanUser(targetUserId.Value);
            }
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

    [HttpPost("resolveReport")]
    public IActionResult ResolveReport([FromBody] ResolveReportRequest request)
    {
        var report = _moderationService.GetReportById(request.ReportId);
        if (report == null)
        {
            return NotFound("Жалоба не найдена.");
        }

        report.Status = request.Status;
        _moderationService.UpdateReport(report);

        return Ok(new ReportDto
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
    }

    [HttpPost("resolveAppeal")]
    public IActionResult ResolveAppeal([FromBody] ResolveAppealRequest request)
    {
        try
        {
            var appeal = _moderationService.ResolveAppeal(request.AppealId, request.Status, request.Resolution);
            if (request.Status == AppealStatus.Approved)
            {
                _userService.UnbanUser(appeal.UserId);
            }
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
