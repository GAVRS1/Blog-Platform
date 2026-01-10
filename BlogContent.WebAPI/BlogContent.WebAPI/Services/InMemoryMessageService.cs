using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WebAPI.Services;

public class InMemoryMessageService : IMessageService
{
    private readonly ConcurrentDictionary<string, List<MessageDto>> _conversations = new();
    private readonly ConcurrentDictionary<(int userId, int otherUserId), int> _unread = new();
    private readonly object _lock = new();

    public IEnumerable<InboxItemDto> GetInbox(int userId)
    {
        var items = new List<InboxItemDto>();

        lock (_lock)
        {
            foreach (var kvp in _conversations)
            {
                var ids = ParseKey(kvp.Key);
                if (ids.first != userId && ids.second != userId)
                {
                    continue;
                }

                var otherUserId = ids.first == userId ? ids.second : ids.first;
                var lastMessage = kvp.Value.LastOrDefault();
                var unread = _unread.TryGetValue((userId, otherUserId), out var count) ? count : 0;

                items.Add(new InboxItemDto
                {
                    OtherUserId = otherUserId,
                    LastMessage = lastMessage == null ? null : CloneForViewer(lastMessage, userId),
                    UnreadCount = unread
                });
            }
        }

        return items
            .OrderByDescending(x => x.LastMessage?.CreatedAt ?? DateTime.MinValue)
            .ToList();
    }

    public IEnumerable<MessageDto> GetDialog(int userId, int otherUserId, int page, int pageSize)
    {
        var key = BuildKey(userId, otherUserId);
        List<MessageDto> snapshot;

        lock (_lock)
        {
            if (!_conversations.TryGetValue(key, out var list))
            {
                return Enumerable.Empty<MessageDto>();
            }

            snapshot = list.OrderByDescending(m => m.CreatedAt).ToList();
        }

        return snapshot
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .OrderBy(m => m.CreatedAt)
            .Select(m => CloneForViewer(m, userId))
            .ToList();
    }

    public MessageDto SendMessage(int senderId, int recipientId, string content, IEnumerable<MessageAttachmentDto>? attachments)
    {
        var key = BuildKey(senderId, recipientId);
        var message = new MessageDto
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content ?? string.Empty,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
            ReadAt = null,
            Attachments = attachments?.Select(CloneAttachment).ToList() ?? []
        };

        lock (_lock)
        {
            var list = _conversations.GetOrAdd(key, _ => []);
            list.Add(message);
            _unread.AddOrUpdate((recipientId, senderId), 1, (_, current) => current + 1);
        }

        return CloneForViewer(message, senderId);
    }

    public MarkReadResultDto MarkRead(int userId, int otherUserId)
    {
        var updated = new List<MessageReadUpdateDto>();
        var key = BuildKey(userId, otherUserId);

        lock (_lock)
        {
            if (_conversations.TryGetValue(key, out var messages))
            {
                var now = DateTime.UtcNow;
                foreach (var message in messages)
                {
                    if (message.RecipientId != userId || message.SenderId != otherUserId || message.IsRead)
                    {
                        continue;
                    }

                    message.IsRead = true;
                    message.ReadAt = now;
                    updated.Add(new MessageReadUpdateDto
                    {
                        Id = message.Id,
                        IsRead = true,
                        ReadAt = message.ReadAt
                    });
                }
            }

            _unread.TryRemove((userId, otherUserId), out _);
        }

        return new MarkReadResultDto
        {
            Marked = updated.Count,
            UpdatedMessages = updated
        };
    }

    private static string BuildKey(int a, int b) => a < b ? $"{a}:{b}" : $"{b}:{a}";

    private static (int first, int second) ParseKey(string key)
    {
        var parts = key.Split(':');
        return (int.Parse(parts[0]), int.Parse(parts[1]));
    }

    private static MessageDto CloneForViewer(MessageDto source, int viewerId)
    {
        return new MessageDto
        {
            Id = source.Id,
            SenderId = source.SenderId,
            RecipientId = source.RecipientId,
            Content = source.Content,
            CreatedAt = source.CreatedAt,
            IsRead = source.IsRead,
            ReadAt = source.ReadAt,
            Attachments = source.Attachments.Select(CloneAttachment).ToList(),
            IsOwn = source.SenderId == viewerId
        };
    }

    private static MessageAttachmentDto CloneAttachment(MessageAttachmentDto attachment)
    {
        return new MessageAttachmentDto
        {
            Url = attachment.Url,
            MediaType = attachment.MediaType,
            MimeType = attachment.MimeType,
            SizeBytes = attachment.SizeBytes,
            ThumbnailUrl = attachment.ThumbnailUrl
        };
    }
}
