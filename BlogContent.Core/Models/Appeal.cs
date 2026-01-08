using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class Appeal
{
    public int Id { get; set; }
    public int ModerationActionId { get; set; }
    public ModerationAction ModerationAction { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Message { get; set; } = string.Empty;
    public string? Resolution { get; set; }
    public AppealStatus Status { get; set; } = AppealStatus.Pending;
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
