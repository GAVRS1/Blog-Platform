using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;

namespace BlogContent.Data.Repositories;

public class SettingsRepository(BlogContext context) : ISettingsRepository
{
    private readonly BlogContext _context = context;

    public PrivacySettings? GetPrivacySettings(int userId)
    {
        return _context.PrivacySettings.FirstOrDefault(settings => settings.UserId == userId);
    }

    public NotificationSettings? GetNotificationSettings(int userId)
    {
        return _context.NotificationSettings.FirstOrDefault(settings => settings.UserId == userId);
    }

    public void AddPrivacySettings(PrivacySettings settings)
    {
        _context.PrivacySettings.Add(settings);
        _context.SaveChanges();
    }

    public void AddNotificationSettings(NotificationSettings settings)
    {
        _context.NotificationSettings.Add(settings);
        _context.SaveChanges();
    }

    public void UpdatePrivacySettings(PrivacySettings settings)
    {
        _context.PrivacySettings.Update(settings);
        _context.SaveChanges();
    }

    public void UpdateNotificationSettings(NotificationSettings settings)
    {
        _context.NotificationSettings.Update(settings);
        _context.SaveChanges();
    }
}
