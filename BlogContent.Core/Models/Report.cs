using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class Report
{
    public int Id { get; set; }
    public int ReporterUserId { get; set; }
    public User ReporterUser { get; set; } = null!;
    public int? TargetUserId { get; set; }
    public User? TargetUser { get; set; }
    public int? PostId { get; set; }
    public Post? Post { get; set; }
    public int? CommentId { get; set; }
    public Comment? Comment { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public ReportStatus Status { get; set; } = ReportStatus.Pending;
    public DateTime CreatedAt { get; set; }
    public ICollection<ModerationAction> ModerationActions { get; set; } = [];
}
