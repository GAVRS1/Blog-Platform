using System;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

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
    /// Публичная загрузка без аутентификации (используется при регистрации).
    /// </summary>
    [HttpPost("upload/public")]
    [AllowAnonymous]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(MediaUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadPublic([FromForm] MediaUploadRequest request, CancellationToken cancellationToken)
        => await HandleUploadAsync(request.File, request.Type, cancellationToken, isAnonymous: true);

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

        if (string.IsNullOrWhiteSpace(type))
        {
            return BadRequest("Необходимо указать тип файла (image, video, audio или file).");
        }

        try
        {
            var result = await _mediaStorageService.SaveAsync(file, type, cancellationToken);
            var response = new MediaUploadResponse
            {
                Url = ToAbsoluteUrl(result.Url),
                ThumbnailUrl = result.ThumbnailUrl is null ? null : ToAbsoluteUrl(result.ThumbnailUrl),
                MimeType = result.MimeType,
                SizeBytes = result.SizeBytes
            };

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
