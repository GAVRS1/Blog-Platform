using System;

namespace BlogContent.WebAPI.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Text { get; set; }
    public string? SubjectType { get; set; }
    public string? SubjectId { get; set; }
    public int? PostId { get; set; }
    public int? CommentId { get; set; }
    public int? UserId { get; set; }
    public int? MessageId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public int? SenderId { get; set; }
    public string? SenderDisplayName { get; set; }
    public int RecipientUserId { get; set; }
}
