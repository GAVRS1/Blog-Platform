namespace BlogContent.WebAPI.DTOs;

public class CommentDto
{
    public string Content { get; set; } = string.Empty;
    public int PostId { get; set; }
}
