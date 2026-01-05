using BlogContent.Core.Enums;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace BlogContent.WebAPI.DTOs;

public class PostDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    [JsonIgnore]
    [BindNever]
    public ContentType ContentType { get; set; }
    public List<PostMediaDto> Attachments { get; set; } = [];
}
