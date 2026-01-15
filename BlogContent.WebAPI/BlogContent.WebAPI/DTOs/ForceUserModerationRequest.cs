namespace BlogContent.WebAPI.DTOs;

public class ForceUserModerationRequest
{
    public int UserId { get; set; }
    public string? Reason { get; set; }
}
