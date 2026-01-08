using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class AppealDto
{
    public int Id { get; set; }
    public int ModerationActionId { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Resolution { get; set; }
    public AppealStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
