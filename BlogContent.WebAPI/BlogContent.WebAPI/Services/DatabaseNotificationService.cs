using System;
using System.Collections.Generic;
using System.Linq;
using BlogContent.Data;
using BlogContent.WebAPI.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.WebAPI.Services;

public class DatabaseNotificationService : INotificationService
{
    private readonly BlogContext _context;

    public DatabaseNotificationService(BlogContext context)
    {
        _context = context;
    }

    public IEnumerable<NotificationDto> GetLatest(int userId, int page, int pageSize)
    {
        var notifications = _context.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return notifications
            .Select(ToDto)
            .ToList();
    }

    public int GetUnreadCount(int userId)
    {
        return _context.Notifications.Count(n => n.RecipientUserId == userId && !n.IsRead);
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

        return ToDto(notification);
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
}
