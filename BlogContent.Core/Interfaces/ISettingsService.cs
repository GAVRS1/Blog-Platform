using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface ISettingsService
{
    PrivacySettings GetPrivacySettings(int userId);
    PrivacySettings UpdatePrivacySettings(int userId, PrivacySettings settings);
    NotificationSettings GetNotificationSettings(int userId);
    NotificationSettings UpdateNotificationSettings(int userId, NotificationSettings settings);
}
