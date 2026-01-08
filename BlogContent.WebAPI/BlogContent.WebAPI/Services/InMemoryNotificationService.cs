using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WebAPI.Services;

public class InMemoryNotificationService : INotificationService
{
    private readonly ConcurrentDictionary<int, List<NotificationDto>> _notifications = new();
    private readonly object _lock = new();

    public IEnumerable<NotificationDto> GetLatest(int userId, int page, int pageSize)
    {
        lock (_lock)
        {
            if (!_notifications.TryGetValue(userId, out var list))
            {
                return Enumerable.Empty<NotificationDto>();
            }

            return list
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(Clone)
                .ToList();
        }
    }

    public int GetUnreadCount(int userId)
    {
        lock (_lock)
        {
            if (!_notifications.TryGetValue(userId, out var list))
            {
                return 0;
            }

            return list.Count(n => !n.IsRead);
        }
    }

    public int MarkAllRead(int userId)
    {
        lock (_lock)
        {
            if (!_notifications.TryGetValue(userId, out var list))
            {
                return 0;
            }

            var marked = 0;
            foreach (var notification in list.Where(n => !n.IsRead))
            {
                notification.IsRead = true;
                marked++;
            }

            return marked;
        }
    }

    public int MarkRead(int userId, Guid notificationId)
    {
        lock (_lock)
        {
            if (!_notifications.TryGetValue(userId, out var list))
            {
                return 0;
            }

            var notification = list.FirstOrDefault(n => n.Id == notificationId);
            if (notification == null || notification.IsRead)
            {
                return 0;
            }

            notification.IsRead = true;
            return 1;
        }
    }

    public NotificationDto AddNotification(
        int recipientUserId,
        string type,
        string? text = null,
        int? senderId = null,
        string? subjectType = null,
        string? subjectId = null)
    {
        lock (_lock)
        {
            var list = _notifications.GetOrAdd(recipientUserId, _ => []);
            var existing = list.FirstOrDefault(n =>
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
                return Clone(existing);
            }

            var notification = new NotificationDto
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

            HydrateSubjects(notification);
            list.Add(notification);
            return Clone(notification);
        }
    }

    private static void HydrateSubjects(NotificationDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.SubjectType)
            && !string.IsNullOrWhiteSpace(dto.SubjectId))
        {
            if (dto.SubjectType == "post"
                && int.TryParse(dto.SubjectId, out var postId))
            {
                dto.PostId = postId;
            }

            if (dto.SubjectType == "comment"
                && int.TryParse(dto.SubjectId, out var commentId))
            {
                dto.CommentId = commentId;
            }

            if (dto.SubjectType == "user"
                && int.TryParse(dto.SubjectId, out var userId))
            {
                dto.UserId = userId;
            }
        }

        if (dto.UserId == null && dto.SenderId.HasValue)
        {
            dto.UserId = dto.SenderId;
        }
    }

    private static NotificationDto Clone(NotificationDto dto)
    {
        return new NotificationDto
        {
            Id = dto.Id,
            RecipientUserId = dto.RecipientUserId,
            SenderId = dto.SenderId,
            Type = dto.Type,
            Text = dto.Text,
            SubjectType = dto.SubjectType,
            SubjectId = dto.SubjectId,
            PostId = dto.PostId,
            CommentId = dto.CommentId,
            UserId = dto.UserId,
            CreatedAt = dto.CreatedAt,
            IsRead = dto.IsRead
        };
    }
}
