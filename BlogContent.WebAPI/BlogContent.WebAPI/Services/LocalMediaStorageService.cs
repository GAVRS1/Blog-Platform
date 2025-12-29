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

    public async Task<MediaUploadResponse> SaveAsync(IFormFile file, string mediaType, CancellationToken cancellationToken = default)
    {
        if (file == null)
        {
            throw new ArgumentNullException(nameof(file), "Файл не передан.");
        }

        var typeOptions = _options.GetTypeOptions(mediaType);
        if (typeOptions == null)
        {
            throw new ArgumentException("Указан неподдерживаемый тип медиа.", nameof(mediaType));
        }

        if (file.Length <= 0)
        {
            throw new InvalidOperationException("Файл пустой.");
        }

        var allowedMimeTypes = typeOptions.AllowedMimeTypes ?? Array.Empty<string>();

        if (allowedMimeTypes.Length > 0 &&
            !allowedMimeTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"MIME-тип '{file.ContentType}' не поддерживается для типа '{mediaType}'.");
        }

        if (typeOptions.MaxSizeBytes > 0 && file.Length > typeOptions.MaxSizeBytes)
        {
            throw new InvalidOperationException($"Размер файла превышает максимально допустимый ({typeOptions.MaxSizeBytes} байт).");
        }

        var uploadsRoot = EnsureUploadsRoot();
        var normalizedType = mediaType.Trim().ToLowerInvariant();
        var targetDirectory = Path.Combine(uploadsRoot, normalizedType);
        Directory.CreateDirectory(targetDirectory);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(targetDirectory, fileName);

        await using (var stream = File.Create(filePath))
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
            SizeBytes = file.Length
        };
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
}
