using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class ModerationActionDto
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public string? AdminUsername { get; set; }
    public int? TargetUserId { get; set; }
    public string? TargetUsername { get; set; }
    public int? ReportId { get; set; }
    public ModerationActionType ActionType { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
