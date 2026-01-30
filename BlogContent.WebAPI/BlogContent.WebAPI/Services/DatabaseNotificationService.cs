using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using BlogContent.Data;
using BlogContent.WebAPI.DTOs;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.WebAPI.Services;

public class DatabaseNotificationService : INotificationService
{
    private readonly BlogContext _context;
    private readonly IDistributedCache _cache;
    private static readonly DistributedCacheEntryOptions LatestCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
    };
    private static readonly DistributedCacheEntryOptions UnreadCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1)
    };

    public DatabaseNotificationService(BlogContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public IEnumerable<NotificationDto> GetLatest(int userId, int page, int pageSize)
    {
        var cacheKey = LatestCacheKey(userId, page, pageSize);
        var cached = _cache.GetString(cacheKey);
        if (!string.IsNullOrWhiteSpace(cached))
        {
            var cachedNotifications = JsonSerializer.Deserialize<List<NotificationDto>>(cached);
            if (cachedNotifications != null)
            {
                return cachedNotifications;
            }
        }

        var notifications = _context.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = notifications
            .Select(ToDto)
            .ToList();

        CacheLatest(userId, cacheKey, result);
        return result;
    }

    public int GetUnreadCount(int userId)
    {
        var cached = _cache.GetString(UnreadCountCacheKey(userId));
        if (!string.IsNullOrWhiteSpace(cached) && int.TryParse(cached, out var cachedCount))
        {
            return cachedCount;
        }

        var count = _context.Notifications.Count(n => n.RecipientUserId == userId && !n.IsRead);
        _cache.SetString(UnreadCountCacheKey(userId), count.ToString(), UnreadCacheOptions);
        return count;
    }

    public int MarkAllRead(int userId)
    {
        var notifications = _context.Notifications
            .Where(n => n.RecipientUserId == userId && !n.IsRead)
            .ToList();

        if (notifications.Count == 0)
        {
            return 0;
        }

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }

        _context.SaveChanges();
        InvalidateCache(userId);
        return notifications.Count;
    }

    public int MarkRead(int userId, Guid notificationId)
    {
        var notification = _context.Notifications
            .FirstOrDefault(n => n.RecipientUserId == userId && n.Id == notificationId);

        if (notification == null || notification.IsRead)
        {
            return 0;
        }

        notification.IsRead = true;
        _context.SaveChanges();
        InvalidateCache(userId);
        return 1;
    }

    public int DeleteAll(int userId)
    {
        var notifications = _context.Notifications
            .Where(n => n.RecipientUserId == userId)
            .ToList();

        if (notifications.Count == 0)
        {
            return 0;
        }

        _context.Notifications.RemoveRange(notifications);
        _context.SaveChanges();
        InvalidateCache(userId);
        return notifications.Count;
    }

    public int Delete(int userId, Guid notificationId)
    {
        var notification = _context.Notifications
            .FirstOrDefault(n => n.RecipientUserId == userId && n.Id == notificationId);

        if (notification == null)
        {
            return 0;
        }

        _context.Notifications.Remove(notification);
        _context.SaveChanges();
        InvalidateCache(userId);
        return 1;
    }

    public NotificationDto AddNotification(
        int recipientUserId,
        string type,
        string? text = null,
        int? senderId = null,
        string? subjectType = null,
        string? subjectId = null)
    {
        var existing = _context.Notifications.FirstOrDefault(n =>
            n.RecipientUserId == recipientUserId
            && n.SenderId == senderId
            && n.Type == type
            && n.SubjectType == subjectType
            && n.SubjectId == subjectId);

        if (existing != null)
        {
            existing.CreatedAt = DateTime.UtcNow;
            existing.IsRead = false;
            existing.Text = text;
            _context.SaveChanges();
            InvalidateCache(recipientUserId);
            return ToDto(existing);
        }

        var notification = new Core.Models.Notification
        {
            Id = Guid.NewGuid(),
            RecipientUserId = recipientUserId,
            SenderId = senderId,
            Type = type,
            Text = text,
            SubjectType = subjectType,
            SubjectId = subjectId,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);
        _context.SaveChanges();

        InvalidateCache(recipientUserId);
        return ToDto(notification);
    }

    private static string LatestCacheKey(int userId, int page, int pageSize)
    {
        return $"notifications:latest:{userId}:{page}:{pageSize}";
    }

    private static string LatestCacheIndexKey(int userId)
    {
        return $"notifications:latest:index:{userId}";
    }

    private static string UnreadCountCacheKey(int userId)
    {
        return $"notifications:unread:{userId}";
    }

    private void CacheLatest(int userId, string cacheKey, List<NotificationDto> notifications)
    {
        var serialized = JsonSerializer.Serialize(notifications);
        _cache.SetString(cacheKey, serialized, LatestCacheOptions);

        var indexKey = LatestCacheIndexKey(userId);
        var indexSerialized = _cache.GetString(indexKey);
        var keys = string.IsNullOrWhiteSpace(indexSerialized)
            ? new HashSet<string>(StringComparer.Ordinal)
            : JsonSerializer.Deserialize<HashSet<string>>(indexSerialized) ?? new HashSet<string>(StringComparer.Ordinal);
        if (keys.Add(cacheKey))
        {
            _cache.SetString(indexKey, JsonSerializer.Serialize(keys), LatestCacheOptions);
        }
    }

    private void InvalidateCache(int userId)
    {
        _cache.Remove(UnreadCountCacheKey(userId));

        var indexKey = LatestCacheIndexKey(userId);
        var indexSerialized = _cache.GetString(indexKey);
        if (string.IsNullOrWhiteSpace(indexSerialized))
        {
            return;
        }

        var keys = JsonSerializer.Deserialize<HashSet<string>>(indexSerialized) ?? new HashSet<string>(StringComparer.Ordinal);
        foreach (var key in keys)
        {
            _cache.Remove(key);
        }

        _cache.Remove(indexKey);
    }

    private NotificationDto ToDto(Core.Models.Notification notification)
    {
        var dto = new NotificationDto
        {
            Id = notification.Id,
            RecipientUserId = notification.RecipientUserId,
            SenderId = notification.SenderId,
            Type = notification.Type,
            Text = notification.Text,
            SubjectType = notification.SubjectType,
            SubjectId = notification.SubjectId,
            CreatedAt = notification.CreatedAt,
            IsRead = notification.IsRead
        };

        PopulateSenderDisplayName(dto);
        PopulateTargets(dto);
        return dto;
    }

    private void PopulateTargets(NotificationDto dto)
    {
        if (dto.SubjectType == null || string.IsNullOrWhiteSpace(dto.SubjectId))
        {
            return;
        }

        if (dto.SubjectType.Equals("post", StringComparison.OrdinalIgnoreCase)
            && int.TryParse(dto.SubjectId, out var postId))
        {
            dto.PostId = postId;
            return;
        }

        if (dto.SubjectType.Equals("comment", StringComparison.OrdinalIgnoreCase)
            && int.TryParse(dto.SubjectId, out var commentId))
        {
            dto.CommentId = commentId;
            dto.PostId = _context.Comments
                .AsNoTracking()
                .Where(c => c.Id == commentId)
                .Select(c => (int?)c.PostId)
                .FirstOrDefault();
            return;
        }

        if (dto.SubjectType.Equals("user", StringComparison.OrdinalIgnoreCase)
            && int.TryParse(dto.SubjectId, out var userId))
        {
            dto.UserId = userId;
        }
    }

    private void PopulateSenderDisplayName(NotificationDto dto)
    {
        if (dto.SenderId == null)
        {
            return;
        }

        var sender = _context.Users
            .AsNoTracking()
            .Where(u => u.Id == dto.SenderId)
            .Select(u => new
            {
                u.Username,
                ProfileUsername = u.Profile == null ? null : u.Profile.Username,
                ProfileFullName = u.Profile == null ? null : u.Profile.FullName
            })
            .FirstOrDefault();

        if (sender == null)
        {
            return;
        }

        var displayName = sender.ProfileFullName;
        if (string.IsNullOrWhiteSpace(displayName))
        {
            displayName = string.IsNullOrWhiteSpace(sender.ProfileUsername)
                ? sender.Username
                : sender.ProfileUsername;
        }

        dto.SenderDisplayName = displayName;
    }
}
