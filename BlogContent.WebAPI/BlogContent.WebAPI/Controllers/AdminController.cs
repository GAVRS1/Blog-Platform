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
    private readonly IPostService _postService;
    private readonly ICommentService _commentService;

    public AdminController(
        IModerationService moderationService,
        IUserService userService,
        IPostService postService,
        ICommentService commentService)
    {
        _moderationService = moderationService;
        _userService = userService;
        _postService = postService;
        _commentService = commentService;
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
            .Select(BuildReportDto)
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
                AdminUsername = action.AdminUser?.Username,
                TargetUserId = action.TargetUserId,
                TargetUsername = action.TargetUser?.Username,
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
                Username = appeal.User?.Username,
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

        var targetUserId = request.TargetUserId ?? (report == null ? null : GetReportTargetUserId(report));
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
            AdminUsername = action.AdminUser?.Username,
            TargetUserId = action.TargetUserId,
            TargetUsername = action.TargetUser?.Username,
            ReportId = action.ReportId,
            ActionType = action.ActionType,
            Reason = action.Reason,
            CreatedAt = action.CreatedAt
        });
    }

    [HttpPost("resolveReport")]
    public IActionResult ResolveReport([FromBody] ResolveReportRequest request)
    {
        if (!TryGetUserId(out var adminUserId))
        {
            return Unauthorized();
        }

        var report = _moderationService.GetReportById(request.ReportId);
        if (report == null)
        {
            return NotFound("Жалоба не найдена.");
        }

        report.Status = request.Status;
        _moderationService.UpdateReport(report);

        if (request.Status == ReportStatus.Approved)
        {
            var actionType = ModerationActionType.Other;
            if (report.PostId.HasValue)
            {
                _postService.DeletePost(report.PostId.Value);
                actionType = ModerationActionType.ContentRemoval;
            }
            else if (report.CommentId.HasValue)
            {
                _commentService.DeleteComment(report.CommentId.Value);
                actionType = ModerationActionType.ContentRemoval;
            }
            else if (report.TargetUserId.HasValue)
            {
                _userService.BanUser(report.TargetUserId.Value);
                actionType = ModerationActionType.Ban;
            }

            if (actionType != ModerationActionType.Other)
            {
                var action = new ModerationAction
                {
                    AdminUserId = adminUserId,
                    TargetUserId = GetReportTargetUserId(report),
                    ReportId = report.Id,
                    ActionType = actionType,
                    Reason = report.Reason,
                    CreatedAt = DateTime.UtcNow
                };
                _moderationService.CreateAction(action);
            }
        }
        return Ok(BuildReportDto(report));
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
            _moderationService.DeleteAppeal(appeal.Id);
            return Ok(new AppealDto
            {
                Id = appeal.Id,
                ModerationActionId = appeal.ModerationActionId,
                UserId = appeal.UserId,
                Username = appeal.User?.Username,
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

    [HttpDelete("deleteReportedPost/{reportId}")]
    public IActionResult DeleteReportedPost(int reportId)
    {
        if (!TryGetUserId(out var adminUserId))
        {
            return Unauthorized();
        }

        var report = _moderationService.GetReportById(reportId);
        if (report == null)
        {
            return NotFound("Жалоба не найдена.");
        }

        if (!report.PostId.HasValue)
        {
            return BadRequest("В жалобе отсутствует пост.");
        }

        _postService.DeletePost(report.PostId.Value);

        var action = new ModerationAction
        {
            AdminUserId = adminUserId,
            TargetUserId = GetReportTargetUserId(report),
            ReportId = report.Id,
            ActionType = ModerationActionType.ContentRemoval,
            Reason = report.Reason,
            CreatedAt = DateTime.UtcNow
        };
        _moderationService.CreateAction(action);

        report.Status = ReportStatus.Approved;
        _moderationService.UpdateReport(report);

        return Ok(BuildReportDto(report));
    }

    [HttpDelete("deleteReportedComment/{reportId}")]
    public IActionResult DeleteReportedComment(int reportId)
    {
        if (!TryGetUserId(out var adminUserId))
        {
            return Unauthorized();
        }

        var report = _moderationService.GetReportById(reportId);
        if (report == null)
        {
            return NotFound("Жалоба не найдена.");
        }

        if (!report.CommentId.HasValue)
        {
            return BadRequest("В жалобе отсутствует комментарий.");
        }

        _commentService.DeleteComment(report.CommentId.Value);

        var action = new ModerationAction
        {
            AdminUserId = adminUserId,
            TargetUserId = GetReportTargetUserId(report),
            ReportId = report.Id,
            ActionType = ModerationActionType.ContentRemoval,
            Reason = report.Reason,
            CreatedAt = DateTime.UtcNow
        };
        _moderationService.CreateAction(action);

        report.Status = ReportStatus.Approved;
        _moderationService.UpdateReport(report);

        return Ok(BuildReportDto(report));
    }

    [HttpPost("forceBan")]
    public IActionResult ForceBan([FromBody] ForceUserModerationRequest request)
    {
        if (!TryGetUserId(out var adminUserId))
        {
            return Unauthorized();
        }

        if (request.UserId <= 0)
        {
            return BadRequest("Некорректный идентификатор пользователя.");
        }

        _userService.BanUser(request.UserId);

        var action = new ModerationAction
        {
            AdminUserId = adminUserId,
            TargetUserId = request.UserId,
            ReportId = null,
            ActionType = ModerationActionType.Ban,
            Reason = request.Reason ?? "Принудительная блокировка",
            CreatedAt = DateTime.UtcNow
        };

        _moderationService.CreateAction(action);

        return Ok(new ModerationActionDto
        {
            Id = action.Id,
            AdminUserId = action.AdminUserId,
            AdminUsername = action.AdminUser?.Username,
            TargetUserId = action.TargetUserId,
            TargetUsername = action.TargetUser?.Username,
            ReportId = action.ReportId,
            ActionType = action.ActionType,
            Reason = action.Reason,
            CreatedAt = action.CreatedAt
        });
    }

    [HttpPost("forceUnban")]
    public IActionResult ForceUnban([FromBody] ForceUserModerationRequest request)
    {
        if (!TryGetUserId(out var adminUserId))
        {
            return Unauthorized();
        }

        if (request.UserId <= 0)
        {
            return BadRequest("Некорректный идентификатор пользователя.");
        }

        _userService.UnbanUser(request.UserId);

        var action = new ModerationAction
        {
            AdminUserId = adminUserId,
            TargetUserId = request.UserId,
            ReportId = null,
            ActionType = ModerationActionType.Unban,
            Reason = request.Reason ?? "Принудительная разблокировка",
            CreatedAt = DateTime.UtcNow
        };

        _moderationService.CreateAction(action);

        return Ok(new ModerationActionDto
        {
            Id = action.Id,
            AdminUserId = action.AdminUserId,
            AdminUsername = action.AdminUser?.Username,
            TargetUserId = action.TargetUserId,
            TargetUsername = action.TargetUser?.Username,
            ReportId = action.ReportId,
            ActionType = action.ActionType,
            Reason = action.Reason,
            CreatedAt = action.CreatedAt
        });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }

    private static int? GetReportTargetUserId(Report report)
    {
        return report.TargetUserId ?? report.Post?.UserId ?? report.Comment?.UserId;
    }

    private static ReportDto BuildReportDto(Report report)
    {
        return new ReportDto
        {
            Id = report.Id,
            ReporterUserId = report.ReporterUserId,
            ReporterUsername = report.ReporterUser?.Username,
            TargetUserId = GetReportTargetUserId(report),
            TargetUsername = report.TargetUser?.Username,
            PostId = report.PostId,
            CommentId = report.CommentId,
            Reason = report.Reason,
            Details = report.Details,
            Status = report.Status,
            CreatedAt = report.CreatedAt
        };
    }
}
