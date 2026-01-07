namespace BlogContent.WebAPI.DTOs;

public class NotificationSettingsDto
{
    public bool OnLikes { get; set; }
    public bool OnComments { get; set; }
    public bool OnFollows { get; set; }
    public bool OnMessages { get; set; }
}
