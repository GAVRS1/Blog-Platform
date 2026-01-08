namespace BlogContent.Core.Models;

public class Block
{
    public int Id { get; set; }
    public int BlockerUserId { get; set; }
    public User BlockerUser { get; set; } = null!;
    public int BlockedUserId { get; set; }
    public User BlockedUser { get; set; } = null!;
    public string? Reason { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UnblockedAt { get; set; }
}
