namespace BlogContent.WPF.Models;

public sealed record MediaUploadResult(
    MediaUrlReference Url,
    MediaUrlReference? ThumbnailUrl,
    string MimeType,
    long SizeBytes,
    string Type);
