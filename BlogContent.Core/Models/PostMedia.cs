using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class PostMedia
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public PostMediaType Type { get; set; }

    public int PostId { get; set; }
    public Post Post { get; set; } = null!;
}
