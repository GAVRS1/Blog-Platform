using System;
using System.Collections.Generic;

namespace BlogContent.WebAPI.DTOs;

public class MessageAttachmentDto
{
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = "Other";
    public string? MimeType { get; set; }
    public long? SizeBytes { get; set; }
    public string? ThumbnailUrl { get; set; }
}

public class MessageDto
{
    public Guid Id { get; set; }
    public int SenderId { get; set; }
    public int RecipientId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<MessageAttachmentDto> Attachments { get; set; } = [];
    public bool IsOwn { get; set; }
}

public class InboxItemDto
{
    public int OtherUserId { get; set; }
    public MessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}
