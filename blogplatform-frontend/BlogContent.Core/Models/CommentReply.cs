
namespace BlogContent.Core.Models;

public class CommentReply
{
    public int Id { get; set; }
    public int CommentId { get; set; }
    public Comment Comment { get; set; }
    public string Content { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
