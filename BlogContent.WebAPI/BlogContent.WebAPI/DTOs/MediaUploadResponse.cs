namespace BlogContent.WebAPI.DTOs;

public class MediaUploadResponse
{
    public required string Url { get; init; }

    public string? ThumbnailUrl { get; init; }

    public required string MimeType { get; init; }

    public long SizeBytes { get; init; }

    public required string Type { get; init; }
}
