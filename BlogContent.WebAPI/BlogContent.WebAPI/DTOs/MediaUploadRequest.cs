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
    /// The media category: image, video, audio or file.
    /// </summary>
    [Required]
    [RegularExpression("^(image|video|audio|file)$", ErrorMessage = "Тип файла должен быть image, video, audio или file.")]
    public string Type { get; set; } = string.Empty;
}
