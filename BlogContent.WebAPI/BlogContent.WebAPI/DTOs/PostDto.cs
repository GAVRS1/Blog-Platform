using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class PostDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public ContentType ContentType { get; set; }
    public List<PostMediaDto> Attachments { get; set; } = [];
}
