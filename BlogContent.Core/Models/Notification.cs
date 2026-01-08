using System;

namespace BlogContent.Core.Models;

public class Notification
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Text { get; set; }
    public string? SubjectType { get; set; }
    public string? SubjectId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public int? SenderId { get; set; }
    public User? Sender { get; set; }
    public int RecipientUserId { get; set; }
    public User RecipientUser { get; set; } = null!;
}
