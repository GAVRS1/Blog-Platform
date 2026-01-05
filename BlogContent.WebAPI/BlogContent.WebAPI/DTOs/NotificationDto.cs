using System;

namespace BlogContent.WebAPI.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public int? SenderId { get; set; }
    public int RecipientUserId { get; set; }
}
