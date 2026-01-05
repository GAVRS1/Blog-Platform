using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace BlogContent.WebAPI.DTOs;

public class MediaUploadBatchRequest
{
    [Required]
    public List<IFormFile> Files { get; set; } = [];

    /// <summary>
    /// Optional list of media type hints aligned by index with <see cref="Files"/>.
    /// </summary>
    public List<string>? Types { get; set; }
}
