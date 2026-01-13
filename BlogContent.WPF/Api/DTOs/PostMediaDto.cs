using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class PostMediaDto
{
    public int Id { get; set; }
    public PostMediaType Type { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}
