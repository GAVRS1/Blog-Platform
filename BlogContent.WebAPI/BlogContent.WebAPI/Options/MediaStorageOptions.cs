using System;
using System.Collections.Generic;
using System.Linq;

namespace BlogContent.WebAPI.Options;

public class MediaTypeOptions
{
    public long MaxSizeBytes { get; set; }

    public string[] AllowedMimeTypes { get; set; } = [];
}

public class MediaStorageOptions
{
    public string UploadsFolder { get; set; } = "uploads";

    public string RequestPath { get; set; } = "/uploads";

    public Dictionary<string, MediaTypeOptions> Types { get; set; } = CreateDefaultTypes();

    public string NormalizedRequestPath => RequestPath?.StartsWith('/') == true ? RequestPath : $"/{RequestPath}";

    public MediaTypeOptions? GetTypeOptions(string type)
    {
        EnsureDefaults();
        if (string.IsNullOrWhiteSpace(type))
        {
            return null;
        }

        var normalized = type.Trim();
        return Types.GetValueOrDefault(normalized);
    }

    public long GetMaxAllowedSize()
    {
        EnsureDefaults();
        return Types.Values.DefaultIfEmpty(new MediaTypeOptions()).Max(t => t.MaxSizeBytes);
    }

    public void EnsureDefaults()
    {
        Types = Types != null
            ? new Dictionary<string, MediaTypeOptions>(Types, StringComparer.OrdinalIgnoreCase)
            : CreateDefaultTypes();

        foreach (var (key, value) in CreateDefaultTypes())
        {
            if (!Types.ContainsKey(key))
            {
                Types[key] = value;
            }
        }
    }

    private static Dictionary<string, MediaTypeOptions> CreateDefaultTypes()
    {
        return new Dictionary<string, MediaTypeOptions>(StringComparer.OrdinalIgnoreCase)
        {
            ["image"] = new()
            {
                MaxSizeBytes = 5 * 1024 * 1024,
                AllowedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" }
            },
            ["video"] = new()
            {
                MaxSizeBytes = 50 * 1024 * 1024,
                AllowedMimeTypes = new[] { "video/mp4", "video/webm", "video/quicktime" }
            },
            ["audio"] = new()
            {
                MaxSizeBytes = 15 * 1024 * 1024,
                AllowedMimeTypes = new[] { "audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/ogg" }
            },
            ["file"] = new()
            {
                MaxSizeBytes = 15 * 1024 * 1024,
                AllowedMimeTypes = new[] { "application/pdf", "text/plain", "application/zip", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
            }
        };
    }
}
