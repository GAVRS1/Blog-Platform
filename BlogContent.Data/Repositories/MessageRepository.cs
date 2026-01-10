using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class MessageRepository(BlogContext context) : IMessageRepository
{
    private readonly BlogContext _context = context;

    public Message AddMessage(Message message)
    {
        _context.Messages.Add(message);
        _context.SaveChanges();
        return message;
    }

    public IEnumerable<Message> GetDialog(int userId, int otherUserId, int page, int pageSize)
    {
        var slice = _context.Messages
            .Include(m => m.Attachments)
            .Where(m =>
                (m.SenderId == userId && m.RecipientId == otherUserId) ||
                (m.SenderId == otherUserId && m.RecipientId == userId))
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToList();

        return slice
            .OrderBy(m => m.CreatedAt)
            .ToList();
    }

    public IEnumerable<int> GetConversationUserIds(int userId) =>
        _context.Messages
            .Where(m => m.SenderId == userId || m.RecipientId == userId)
            .AsNoTracking()
            .Select(m => m.SenderId == userId ? m.RecipientId : m.SenderId)
            .Distinct()
            .ToList();

    public Message? GetLastMessage(int userId, int otherUserId) =>
        _context.Messages
            .Include(m => m.Attachments)
            .Where(m =>
                (m.SenderId == userId && m.RecipientId == otherUserId) ||
                (m.SenderId == otherUserId && m.RecipientId == userId))
            .OrderByDescending(m => m.CreatedAt)
            .AsNoTracking()
            .FirstOrDefault();

    public int GetUnreadCount(int userId, int otherUserId) =>
        _context.Messages.Count(m =>
            m.RecipientId == userId &&
            m.SenderId == otherUserId &&
            !m.IsRead);

    public IEnumerable<Message> MarkRead(int userId, int otherUserId, DateTime readAt)
    {
        var messages = _context.Messages
            .Where(m =>
                m.RecipientId == userId &&
                m.SenderId == otherUserId &&
                !m.IsRead)
            .ToList();

        if (messages.Count == 0)
        {
            return messages;
        }

        foreach (var message in messages)
        {
            message.IsRead = true;
            message.ReadAt = readAt;
        }

        _context.SaveChanges();
        return messages;
    }
}
