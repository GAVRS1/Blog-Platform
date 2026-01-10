using System.Security.Claims;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/Admin")]
[Authorize]
public class ReportController : ControllerBase
{
    private readonly IModerationService _moderationService;

    public ReportController(IModerationService moderationService)
    {
        _moderationService = moderationService;
    }

    [HttpPost("createReport")]
    public IActionResult CreateReport([FromBody] CreateReportRequest request)
    {
        if (!TryGetUserId(out var reporterUserId))
        {
            return Unauthorized();
        }

        var report = new Report
        {
            ReporterUserId = reporterUserId,
            TargetUserId = request.TargetUserId,
            PostId = request.PostId,
            CommentId = request.CommentId,
            Reason = request.Reason,
            Details = request.Details,
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _moderationService.CreateReport(report);

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

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out userId);
    }
}
