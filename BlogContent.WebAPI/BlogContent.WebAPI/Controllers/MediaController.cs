using System;
using BlogContent.WebAPI.DTOs;
using BlogContent.WebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BlogContent.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IMediaStorageService _mediaStorageService;

    public MediaController(IMediaStorageService mediaStorageService)
    {
        _mediaStorageService = mediaStorageService;
    }

    /// <summary>
    /// Загружает медиа-файл и возвращает публичную ссылку.
    /// </summary>
    /// <param name="file">Загружаемый файл.</param>
    /// <param name="type">Тип файла: image, video, audio или file.</param>
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(MediaUploadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload([FromForm] IFormFile? file, [FromForm] string? type, CancellationToken cancellationToken)
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

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
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
