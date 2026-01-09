using System;

namespace BlogContent.Core.Models;

public class MessageAttachment
{
    public int Id { get; set; }
    public Guid MessageId { get; set; }
    public Message? Message { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = "Other";
    public string? MimeType { get; set; }
    public long? SizeBytes { get; set; }
    public string? ThumbnailUrl { get; set; }
}
