namespace BlogContent.WebAPI.DTOs;

public class BlockStatusDto
{
    public bool IsBlocked { get; set; }
    public int? ModerationActionId { get; set; }
    public string? Reason { get; set; }
    public DateTime? BlockedAt { get; set; }
}
