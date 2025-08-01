using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty; 
    public ContentType ContentType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; } 
    public string? AudioUrl { get; set; } 

    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Like> Likes { get; set; } = [];
}