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
        return _context.Notifications
            .AsNoTracking()
            .Where(n => n.RecipientUserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

    public NotificationDto AddNotification(int recipientUserId, string type, string? text = null, int? senderId = null)
    {
        var notification = new Core.Models.Notification
        {
            Id = Guid.NewGuid(),
            RecipientUserId = recipientUserId,
            SenderId = senderId,
            Type = type,
            Text = text,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);
        _context.SaveChanges();

        return ToDto(notification);
    }

    private static NotificationDto ToDto(Core.Models.Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            RecipientUserId = notification.RecipientUserId,
            SenderId = notification.SenderId,
            Type = notification.Type,
            Text = notification.Text,
            CreatedAt = notification.CreatedAt,
            IsRead = notification.IsRead
        };
    }
}
