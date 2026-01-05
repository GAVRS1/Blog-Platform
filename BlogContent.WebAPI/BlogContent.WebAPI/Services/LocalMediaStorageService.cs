using System;
using System.IO;
using System.Linq;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BlogContent.WebAPI.Services;

public class LocalMediaStorageService : IMediaStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly MediaStorageOptions _options;
    private readonly ILogger<LocalMediaStorageService> _logger;

    public LocalMediaStorageService(
        IWebHostEnvironment environment,
        IOptions<MediaStorageOptions> options,
        ILogger<LocalMediaStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
        _options = options.Value;
        _options.EnsureDefaults();
    }

    public async Task<MediaUploadResponse> SaveAsync(IFormFile file, string? mediaType, CancellationToken cancellationToken = default)
    {
        if (file == null)
        {
            throw new ArgumentNullException(nameof(file), "Файл не передан.");
        }

        if (file.Length <= 0)
        {
            _logger.LogWarning("Попытка загрузить пустой файл {FileName}.", file.FileName);
            throw new InvalidOperationException("Файл пустой.");
        }

        var resolvedType = ResolveType(mediaType, file.ContentType);
        var typeOptions = _options.GetTypeOptions(resolvedType)
                          ?? _options.GetTypeOptions(_options.DefaultType)
                          ?? new MediaTypeOptions();

        if (typeOptions.MaxSizeBytes > 0 && file.Length > typeOptions.MaxSizeBytes)
        {
            _logger.LogWarning(
                "Отклонена загрузка файла {FileName}: размер {Size} превышает лимит {Limit} байт для {MediaType}.",
                file.FileName,
                file.Length,
                typeOptions.MaxSizeBytes,
                resolvedType);
            throw new InvalidOperationException($"Размер файла превышает максимально допустимый ({typeOptions.MaxSizeBytes} байт).");
        }

        var allowedMimeTypes = typeOptions.AllowedMimeTypes ?? Array.Empty<string>();
        if (allowedMimeTypes.Length > 0 &&
            !allowedMimeTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
        {
            _logger.LogInformation(
                "Загрузка файла с нестрогим MIME-типом {MimeType} для {MediaType} разрешена (разрешённые: {Allowed}).",
                file.ContentType,
                resolvedType,
                string.Join(", ", allowedMimeTypes));
        }

        var uploadsRoot = EnsureUploadsRoot();
        var normalizedType = resolvedType.Trim().ToLowerInvariant();
        var targetDirectory = Path.Combine(uploadsRoot, normalizedType);
        Directory.CreateDirectory(targetDirectory);

        var extension = Path.GetExtension(file.FileName);
        var fileName = GenerateUniqueFileName(targetDirectory, extension);
        var filePath = Path.Combine(targetDirectory, fileName);

        await using (var stream = new FileStream(filePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var relativePath = $"{normalizedType}/{fileName}".Replace("\\", "/");
        var url = $"{_options.NormalizedRequestPath.TrimEnd('/')}/{relativePath}";

        return new MediaUploadResponse
        {
            Url = url,
            ThumbnailUrl = normalizedType == "image" ? url : null,
            MimeType = file.ContentType,
            SizeBytes = file.Length,
            Type = normalizedType
        };
    }

    private string ResolveType(string? type, string mimeType)
    {
        var normalizedProvided = type?.Trim().ToLowerInvariant();
        var inferred = InferTypeFromMime(mimeType);

        var isGeneric = string.IsNullOrWhiteSpace(normalizedProvided)
                        || normalizedProvided.Equals("other", StringComparison.OrdinalIgnoreCase)
                        || normalizedProvided.Equals("raw", StringComparison.OrdinalIgnoreCase)
                        || _options.GetTypeOptions(normalizedProvided) == null;

        if (!isGeneric && _options.GetTypeOptions(normalizedProvided) != null)
        {
            return normalizedProvided!;
        }

        if (!string.IsNullOrWhiteSpace(inferred) && _options.GetTypeOptions(inferred) != null)
        {
            return inferred!;
        }

        return _options.DefaultType;
    }

    private static string? InferTypeFromMime(string mimeType)
    {
        if (string.IsNullOrWhiteSpace(mimeType))
        {
            return null;
        }

        var lower = mimeType.ToLowerInvariant();
        if (lower.StartsWith("image/")) return "image";
        if (lower.StartsWith("video/")) return "video";
        if (lower.StartsWith("audio/")) return "audio";

        return null;
    }

    private string EnsureUploadsRoot()
    {
        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var uploadsRoot = Path.Combine(webRoot, _options.UploadsFolder);

        try
        {
            Directory.CreateDirectory(uploadsRoot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Не удалось создать каталог загрузок {UploadsRoot}.", uploadsRoot);
            throw new InvalidOperationException("Хранилище недоступно.", ex);
        }

        return uploadsRoot;
    }

    private string GenerateUniqueFileName(string targetDirectory, string extension)
    {
        const int maxAttempts = 5;
        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(targetDirectory, fileName);

            if (!File.Exists(filePath))
            {
                return fileName;
            }

            _logger.LogWarning("Коллизия имени файла {FileName}, пробуем другое имя.", fileName);
        }

        throw new InvalidOperationException("Не удалось сгенерировать уникальное имя файла для загрузки.");
    }
}
