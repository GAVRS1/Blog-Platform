namespace BlogContent.WebAPI.DTOs;

public class CreateReportRequest
{
    public int? TargetUserId { get; set; }
    public int? PostId { get; set; }
    public int? CommentId { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
}
