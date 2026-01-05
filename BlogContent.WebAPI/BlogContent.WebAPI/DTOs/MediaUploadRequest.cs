using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BlogContent.WebAPI.DTOs;

/// <summary>
/// Represents a media upload request sent as multipart/form-data.
/// </summary>
public class MediaUploadRequest
{
    /// <summary>
    /// The file to upload.
    /// </summary>
    [Required]
    public IFormFile File { get; set; } = default!;

    /// <summary>
    /// The media category: image, video, audio, file or other. Optional for auto-detection.
    /// </summary>
    public string? Type { get; set; }
}
