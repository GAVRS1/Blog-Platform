using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WebAPI.Services;

public class DatabaseMessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;

    public DatabaseMessageService(IMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public IEnumerable<InboxItemDto> GetInbox(int userId)
    {
        var items = new List<InboxItemDto>();
        var conversationUserIds = _messageRepository.GetConversationUserIds(userId);

        foreach (var otherUserId in conversationUserIds)
        {
            var lastMessage = _messageRepository.GetLastMessage(userId, otherUserId);
            if (lastMessage == null)
            {
                continue;
            }

            items.Add(new InboxItemDto
            {
                OtherUserId = otherUserId,
                LastMessage = MapMessage(lastMessage, userId),
                UnreadCount = _messageRepository.GetUnreadCount(userId, otherUserId)
            });
        }

        return items
            .OrderByDescending(x => x.LastMessage?.CreatedAt ?? DateTime.MinValue)
            .ToList();
    }

    public IEnumerable<MessageDto> GetDialog(int userId, int otherUserId, int page, int pageSize) =>
        _messageRepository.GetDialog(userId, otherUserId, page, pageSize)
            .Select(message => MapMessage(message, userId))
            .ToList();

    public MessageDto SendMessage(int senderId, int recipientId, string content, IEnumerable<MessageAttachmentDto>? attachments)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content ?? string.Empty,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
            ReadAt = null,
            Attachments = attachments?.Select(MapAttachment).ToList() ?? []
        };

        var saved = _messageRepository.AddMessage(message);
        return MapMessage(saved, senderId);
    }

    public MarkReadResultDto MarkRead(int userId, int otherUserId)
    {
        var updates = _messageRepository.MarkRead(userId, otherUserId, DateTime.UtcNow)
            .Select(message => new MessageReadUpdateDto
            {
                Id = message.Id,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt
            })
            .ToList();

        return new MarkReadResultDto
        {
            Marked = updates.Count,
            UpdatedMessages = updates
        };
    }

    private static MessageDto MapMessage(Message message, int viewerId)
    {
        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            RecipientId = message.RecipientId,
            Content = message.Content,
            CreatedAt = message.CreatedAt,
            IsRead = message.IsRead,
            ReadAt = message.ReadAt,
            Attachments = message.Attachments.Select(MapAttachment).ToList(),
            IsOwn = message.SenderId == viewerId
        };
    }

    private static MessageAttachmentDto MapAttachment(MessageAttachment attachment)
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
