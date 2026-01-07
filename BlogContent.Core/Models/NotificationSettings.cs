namespace BlogContent.Core.Models;

public class NotificationSettings
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public bool OnLikes { get; set; } = true;
    public bool OnComments { get; set; } = true;
    public bool OnFollows { get; set; } = true;
    public bool OnMessages { get; set; } = true;
}
