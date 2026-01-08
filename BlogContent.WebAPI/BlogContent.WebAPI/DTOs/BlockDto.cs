namespace BlogContent.WebAPI.DTOs;

public class BlockDto
{
    public int Id { get; set; }
    public int BlockerUserId { get; set; }
    public int BlockedUserId { get; set; }
    public string? Reason { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UnblockedAt { get; set; }
}
