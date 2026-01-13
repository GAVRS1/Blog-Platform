namespace BlogContent.WebAPI.DTOs;

public record CommentResponseDto
{
    public int Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public int PostId { get; init; }
    public int UserId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
    public string UserAvatar { get; init; } = string.Empty;
    public int LikeCount { get; init; }
    public int ReplyCount { get; init; }
    public bool IsLikedByCurrentUser { get; init; }
}

public record CommentReplyResponseDto
{
    public int Id { get; init; }
    public int CommentId { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public int UserId { get; init; }
    public string Username { get; init; } = string.Empty;
    public string UserFullName { get; init; } = string.Empty;
    public string UserAvatar { get; init; } = string.Empty;
}
