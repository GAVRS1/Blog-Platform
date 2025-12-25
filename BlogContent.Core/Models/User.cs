using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; }
    public UserStatus Status { get; set; } = UserStatus.PendingEmailConfirmation;
    public Profile Profile { get; set; } = new Profile();
    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Like> Likes { get; set; } = [];
    public ICollection<CommentLike> CommentLikes { get; set; } = [];
    public ICollection<CommentReply> CommentReplies { get; set; } = [];
}
