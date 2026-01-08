using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class CreateModerationActionRequest
{
    public int? ReportId { get; set; }
    public int? TargetUserId { get; set; }
    public ModerationActionType ActionType { get; set; } = ModerationActionType.Other;
    public string Reason { get; set; } = string.Empty;
}
