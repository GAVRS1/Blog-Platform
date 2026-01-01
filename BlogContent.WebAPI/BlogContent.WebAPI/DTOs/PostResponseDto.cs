using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class PostResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public ContentType ContentType { get; set; }
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? UserAvatar { get; set; }
    public bool IsOwn { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public List<PostMediaDto> Attachments { get; set; } = [];
}
