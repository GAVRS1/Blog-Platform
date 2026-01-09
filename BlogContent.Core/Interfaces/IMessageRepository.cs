using System;
using System.Collections.Generic;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IMessageRepository
{
    Message AddMessage(Message message);
    IEnumerable<Message> GetDialog(int userId, int otherUserId, int page, int pageSize);
    IEnumerable<int> GetConversationUserIds(int userId);
    Message? GetLastMessage(int userId, int otherUserId);
    int GetUnreadCount(int userId, int otherUserId);
    IEnumerable<Message> MarkRead(int userId, int otherUserId, DateTime readAt);
}
