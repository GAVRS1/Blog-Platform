using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class PrivacySettings
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public Audience CanMessageFrom { get; set; } = Audience.Everyone;
    public Audience CanCommentFrom { get; set; } = Audience.Everyone;
    public Audience ProfileVisibility { get; set; } = Audience.Everyone;
    public bool ShowActivity { get; set; } = true;
    public bool ShowEmail { get; set; } = false;
}
