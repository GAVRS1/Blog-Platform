using System.Collections.Generic;
using BlogContent.WebAPI.DTOs;

namespace BlogContent.WebAPI.Services;

public interface IMessageService
{
    IEnumerable<InboxItemDto> GetInbox(int userId);
    IEnumerable<MessageDto> GetDialog(int userId, int otherUserId, int page, int pageSize);
    MessageDto SendMessage(int senderId, int recipientId, string content, IEnumerable<MessageAttachmentDto>? attachments);
    MarkReadResultDto MarkRead(int userId, int otherUserId);
}
