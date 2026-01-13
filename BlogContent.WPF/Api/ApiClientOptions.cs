namespace BlogContent.WPF.Api;

public class ApiClientOptions
{
    public string BaseUrl { get; init; } = string.Empty;
    public string ApiPrefix { get; init; } = "/api";

    public string BuildApiPath(string relativePath)
    {
        var trimmedBase = BaseUrl.TrimEnd('/');
        if (trimmedBase.EndsWith("/api", StringComparison.OrdinalIgnoreCase))
        {
            trimmedBase = trimmedBase[..^4];
        }
        var trimmedPrefix = ApiPrefix.Trim('/');
        var trimmedPath = relativePath.TrimStart('/');

        if (string.IsNullOrWhiteSpace(trimmedBase))
        {
            return $"/{trimmedPrefix}/{trimmedPath}".Replace("//", "/");
        }

        return $"{trimmedBase}/{trimmedPrefix}/{trimmedPath}";
    }
}
