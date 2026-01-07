using BlogContent.Core.Enums;

namespace BlogContent.WebAPI.DTOs;

public class PrivacySettingsDto
{
    public Audience CanMessageFrom { get; set; }
    public Audience CanCommentFrom { get; set; }
    public Audience ProfileVisibility { get; set; }
    public bool ShowActivity { get; set; }
    public bool ShowEmail { get; set; }
}
