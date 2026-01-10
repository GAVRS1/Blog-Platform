namespace BlogContent.WebAPI.DTOs;

public class BlockedUserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public PublicUserProfileDto? Profile { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}
