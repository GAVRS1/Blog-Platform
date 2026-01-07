using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface ISettingsRepository
{
    PrivacySettings? GetPrivacySettings(int userId);
    NotificationSettings? GetNotificationSettings(int userId);
    void AddPrivacySettings(PrivacySettings settings);
    void AddNotificationSettings(NotificationSettings settings);
    void UpdatePrivacySettings(PrivacySettings settings);
    void UpdateNotificationSettings(NotificationSettings settings);
}
