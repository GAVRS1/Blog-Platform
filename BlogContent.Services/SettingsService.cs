using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.Services;

public class SettingsService : ISettingsService
{
    private readonly ISettingsRepository _settingsRepository;

    public SettingsService(ISettingsRepository settingsRepository)
    {
        _settingsRepository = settingsRepository;
    }

    public PrivacySettings GetPrivacySettings(int userId)
    {
        var settings = _settingsRepository.GetPrivacySettings(userId);
        if (settings != null)
        {
            return settings;
        }

        settings = new PrivacySettings
        {
            UserId = userId
        };

        _settingsRepository.AddPrivacySettings(settings);
        return settings;
    }

    public PrivacySettings UpdatePrivacySettings(int userId, PrivacySettings settings)
    {
        var existing = _settingsRepository.GetPrivacySettings(userId);
        if (existing == null)
        {
            settings.UserId = userId;
            _settingsRepository.AddPrivacySettings(settings);
            return settings;
        }

        existing.CanMessageFrom = settings.CanMessageFrom;
        existing.CanCommentFrom = settings.CanCommentFrom;
        existing.ProfileVisibility = settings.ProfileVisibility;
        existing.ShowActivity = settings.ShowActivity;
        existing.ShowEmail = settings.ShowEmail;

        _settingsRepository.UpdatePrivacySettings(existing);
        return existing;
    }

    public NotificationSettings GetNotificationSettings(int userId)
    {
        var settings = _settingsRepository.GetNotificationSettings(userId);
        if (settings != null)
        {
            return settings;
        }

        settings = new NotificationSettings
        {
            UserId = userId
        };

        _settingsRepository.AddNotificationSettings(settings);
        return settings;
    }

    public NotificationSettings UpdateNotificationSettings(int userId, NotificationSettings settings)
    {
        var existing = _settingsRepository.GetNotificationSettings(userId);
        if (existing == null)
        {
            settings.UserId = userId;
            _settingsRepository.AddNotificationSettings(settings);
            return settings;
        }

        existing.OnLikes = settings.OnLikes;
        existing.OnComments = settings.OnComments;
        existing.OnFollows = settings.OnFollows;
        existing.OnMessages = settings.OnMessages;

        _settingsRepository.UpdateNotificationSettings(existing);
        return existing;
    }
}
