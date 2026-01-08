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
    public PrivacySettings PrivacySettings { get; set; } = null!;
    public NotificationSettings NotificationSettings { get; set; } = null!;
    public ICollection<Notification> ReceivedNotifications { get; set; } = [];
    public ICollection<Notification> SentNotifications { get; set; } = [];
    public ICollection<Post> Posts { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Like> Likes { get; set; } = [];
    public ICollection<CommentLike> CommentLikes { get; set; } = [];
    public ICollection<CommentReply> CommentReplies { get; set; } = [];
    public ICollection<Report> ReportsSent { get; set; } = [];
    public ICollection<Report> ReportsReceived { get; set; } = [];
    public ICollection<ModerationAction> ModerationActionsTaken { get; set; } = [];
    public ICollection<ModerationAction> ModerationActionsAgainst { get; set; } = [];
    public ICollection<Appeal> Appeals { get; set; } = [];
    public ICollection<Block> BlocksInitiated { get; set; } = [];
    public ICollection<Block> BlocksReceived { get; set; } = [];
}
