using BlogContent.WPF.Api;

namespace BlogContent.WPF.Services;

public class MediaUrlResolver
{
    private readonly ApiClientOptions _options;

    public MediaUrlResolver(ApiClientOptions options)
    {
        _options = options ?? throw new ArgumentNullException(nameof(options));
    }

    public string? ToAbsoluteUrl(string? mediaPath)
    {
        if (string.IsNullOrWhiteSpace(mediaPath))
        {
            return null;
        }

        var cleaned = mediaPath.Replace("\\", "/");

        if (Uri.TryCreate(cleaned, UriKind.Absolute, out _))
        {
            return cleaned;
        }

        var baseUrl = _options.BaseUrl?.TrimEnd('/') ?? string.Empty;
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return cleaned;
        }

        if (cleaned.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase))
        {
            return $"{baseUrl}{cleaned}";
        }

        if (cleaned.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
        {
            return $"{baseUrl}/{cleaned}";
        }

        var normalized = cleaned.TrimStart('/');
        return $"{baseUrl}/uploads/{normalized}";
    }

    public string? ToRelativeUrl(string? mediaUrl)
    {
        if (string.IsNullOrWhiteSpace(mediaUrl))
        {
            return null;
        }

        var cleaned = mediaUrl.Replace("\\", "/");

        if (Uri.TryCreate(cleaned, UriKind.Absolute, out var absolute))
        {
            return absolute.AbsolutePath;
        }

        if (cleaned.StartsWith("/uploads", StringComparison.OrdinalIgnoreCase))
        {
            return cleaned;
        }

        if (cleaned.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
        {
            return "/" + cleaned;
        }

        return $"/uploads/{cleaned.TrimStart('/')}";
    }
}
