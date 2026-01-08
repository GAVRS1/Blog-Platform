using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class ModerationAction
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public User AdminUser { get; set; } = null!;
    public int? TargetUserId { get; set; }
    public User? TargetUser { get; set; }
    public int? ReportId { get; set; }
    public Report? Report { get; set; }
    public ModerationActionType ActionType { get; set; } = ModerationActionType.Other;
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ICollection<Appeal> Appeals { get; set; } = [];
}
