using System;
using System.Collections.Generic;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WebAPI.Services;

public interface INotificationService
{
    IEnumerable<NotificationDto> GetLatest(int userId, int page, int pageSize);
    int GetUnreadCount(int userId);
    int MarkAllRead(int userId);
    int MarkRead(int userId, Guid notificationId);
    NotificationDto AddNotification(int recipientUserId, string type, string? text = null, int? senderId = null);
}
