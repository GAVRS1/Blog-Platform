using System;
using System.Collections.Generic;

namespace BlogContent.Core.Models;

public class Message
{
    public Guid Id { get; set; }
    public int SenderId { get; set; }
    public User? Sender { get; set; }
    public int RecipientId { get; set; }
    public User? Recipient { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public ICollection<MessageAttachment> Attachments { get; set; } = [];
}
