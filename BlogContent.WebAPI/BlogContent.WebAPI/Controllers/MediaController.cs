using System;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IMediaStorageService _mediaStorageService;
    private readonly ILogger<MediaController> _logger;

    public MediaController(IMediaStorageService mediaStorageService, ILogger<MediaController> logger)
    {
        _mediaStorageService = mediaStorageService;
        _logger = logger;
    }

    /// <summary>
    /// Загружает медиа-файл и возвращает публичную ссылку.
    /// </summary>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(MediaUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload([FromForm] MediaUploadRequest request, CancellationToken cancellationToken)
        => await HandleUploadAsync(request.File, request.Type, cancellationToken, isAnonymous: false);

    /// <summary>
    /// Пакетная загрузка до 10 файлов.
    /// </summary>
    [HttpPost("upload/batch")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(List<MediaUploadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadBatch([FromForm] MediaUploadBatchRequest request, CancellationToken cancellationToken)
        => await HandleBatchUploadAsync(request, cancellationToken, isAnonymous: false);

    /// <summary>
    /// Публичная загрузка без аутентификации (используется при регистрации).
    /// </summary>
    [HttpPost("upload/public")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(MediaUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadPublic([FromForm] MediaUploadRequest request, CancellationToken cancellationToken)
        => await HandleUploadAsync(request.File, request.Type, cancellationToken, isAnonymous: true);

    /// <summary>
    /// Публичная пакетная загрузка (до 10 файлов) — для пользовательских сценариев регистрации.
    /// </summary>
    [HttpPost("upload/public/batch")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(List<MediaUploadResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadPublicBatch([FromForm] MediaUploadBatchRequest request, CancellationToken cancellationToken)
        => await HandleBatchUploadAsync(request, cancellationToken, isAnonymous: true);

    private async Task<IActionResult> HandleUploadAsync(
        IFormFile? file,
        string? type,
        CancellationToken cancellationToken,
        bool isAnonymous)
    {
        if (file == null)
        {
            return BadRequest("Необходимо прикрепить файл в поле 'file'.");
        }

        try
        {
            var result = await _mediaStorageService.SaveAsync(file, type, cancellationToken);
            var response = ToAbsoluteResponse(result);

            if (isAnonymous)
            {
                _logger.LogInformation(
                    "Анонимная загрузка файла {FileName} ({MimeType}, {Size} байт) как {MediaType}.",
                    file.FileName,
                    file.ContentType,
                    file.Length,
                    type);
            }

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Неверные параметры загрузки файла {FileName} для типа {MediaType}.", file.FileName, type);
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Ошибка при сохранении файла {FileName} для типа {MediaType}.", file.FileName, type);
            return BadRequest(ex.Message);
        }
    }

    private async Task<IActionResult> HandleBatchUploadAsync(
        MediaUploadBatchRequest request,
        CancellationToken cancellationToken,
        bool isAnonymous)
    {
        if (request.Files == null || request.Files.Count == 0)
        {
            return BadRequest("Необходимо прикрепить файлы в поле 'files'.");
        }

        if (request.Files.Count > 10)
        {
            return BadRequest("Максимум 10 файлов за раз.");
        }

        try
        {
            var responses = new List<MediaUploadResponse>(request.Files.Count);
            var typeHints = NormalizeTypeHints(request.Types, request.Files.Count);

            for (var i = 0; i < request.Files.Count; i++)
            {
                var file = request.Files[i];
                var typeHint = typeHints[i];
                var result = await _mediaStorageService.SaveAsync(file, typeHint, cancellationToken);
                responses.Add(ToAbsoluteResponse(result));
            }

            if (isAnonymous)
            {
                _logger.LogInformation("Анонимная пакетная загрузка {Count} файлов.", responses.Count);
            }

            return Ok(responses);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Неверные параметры пакетной загрузки файлов.");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Ошибка при пакетной загрузке файлов.");
            return BadRequest(ex.Message);
        }
    }

    private static List<string?> NormalizeTypeHints(List<string>? types, int count)
    {
        if (types == null || types.Count == 0)
        {
            return Enumerable.Repeat<string?>(null, count).ToList();
        }

        if (types.Count == 1)
        {
            return Enumerable.Repeat(types[0], count).ToList();
        }

        if (types.Count >= count)
        {
            return types.Take(count).ToList();
        }

        var padded = new List<string?>(types);
        while (padded.Count < count)
        {
            padded.Add(null);
        }
        return padded;
    }

    private MediaUploadResponse ToAbsoluteResponse(MediaUploadResponse result)
    {
        return new MediaUploadResponse
        {
            Url = ToAbsoluteUrl(result.Url),
            ThumbnailUrl = result.ThumbnailUrl is null ? null : ToAbsoluteUrl(result.ThumbnailUrl),
            MimeType = result.MimeType,
            SizeBytes = result.SizeBytes,
            Type = result.Type
        };
    }

    private string ToAbsoluteUrl(string url)
    {
        if (Uri.TryCreate(url, UriKind.Absolute, out _))
        {
            return url;
        }

        var request = HttpContext.Request;
        return $"{request.Scheme}://{request.Host}{url}";
    }
}
