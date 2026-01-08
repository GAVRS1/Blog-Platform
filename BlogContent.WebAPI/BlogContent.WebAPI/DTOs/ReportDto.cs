using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class ReportDto
{
    public int Id { get; set; }
    public int ReporterUserId { get; set; }
    public int? TargetUserId { get; set; }
    public int? PostId { get; set; }
    public int? CommentId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public ReportStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
