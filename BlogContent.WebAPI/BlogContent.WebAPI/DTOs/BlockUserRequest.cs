namespace BlogContent.WebAPI.DTOs;

public class BlockUserRequest
{
    public int TargetUserId { get; set; }
    public string? Reason { get; set; }
}
