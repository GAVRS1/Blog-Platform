using System.Collections.Concurrent;
using System.Security.Claims;
using System.Linq;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using BlogContent.WebAPI.Services;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Enums;
using BlogContent.Services;

namespace BlogContent.WebAPI.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private readonly IMessageService _messageService;
    private readonly IUserService _userService;
    private readonly IFollowService _followService;
    private static readonly ConcurrentDictionary<int, UserPresenceState> PresenceStates = new();
    private const string AccessDeniedMessage = "Пользователь ограничил круг лиц, которым доступно это действие.";

    public ChatHub(
        ILogger<ChatHub> logger,
        IMessageService messageService,
        IUserService userService,
        IFollowService followService)
    {
        _logger = logger;
        _messageService = messageService;
        _userService = userService;
        _followService = followService;
    }

    public override async Task OnConnectedAsync()
    {
        if (!TryGetUserId(out var userId))
        {
            Context.Abort();
            return;
        }

        var presence = PresenceStates.GetOrAdd(userId, _ => new UserPresenceState());
        var isFirstConnection = presence.Connections.TryAdd(Context.ConnectionId, 0) && presence.Connections.Count == 1;
        presence.LastSeenUtc = null;

        _logger.LogInformation("User {UserId} connected to ChatHub.", userId);

        var onlineUsers = PresenceStates
            .Where(entry => !entry.Value.Connections.IsEmpty)
            .Select(entry => entry.Key)
            .ToList();

        foreach (var onlineUserId in onlineUsers)
        {
            await Clients.Caller.SendAsync("UserOnline", new
            {
                UserId = onlineUserId,
                ConnectedAtUtc = DateTime.UtcNow
            });
        }

        if (isFirstConnection)
        {
            await Clients.All.SendAsync("UserOnline", new
            {
                UserId = userId,
                ConnectedAtUtc = DateTime.UtcNow
            });
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (TryGetUserId(out var userId) && PresenceStates.TryGetValue(userId, out var presence))
        {
            presence.Connections.TryRemove(Context.ConnectionId, out _);

            if (presence.Connections.IsEmpty)
            {
                presence.LastSeenUtc = DateTime.UtcNow;
                await Clients.All.SendAsync("UserOffline", new
                {
                    UserId = userId,
                    LastSeenUtc = presence.LastSeenUtc
                });
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(int recipientUserId, string content)
    {
        if (!TryGetUserId(out var senderId))
        {
            Context.Abort();
            return;
        }

        if (recipientUserId <= 0 || string.IsNullOrWhiteSpace(content))
        {
            throw new HubException("Recipient and content are required.");
        }

        var recipient = _userService.GetUserById(recipientUserId);
        if (recipient == null)
        {
            throw new HubException("Recipient not found.");
        }

        if (recipient.Id != senderId)
        {
            var relation = _followService.GetRelationship(senderId, recipient.Id);
            var audience = recipient.PrivacySettings?.CanMessageFrom ?? Audience.Everyone;
            if (!SettingsAccessChecker.CanAccess(audience, relation.AreFriends))
            {
                throw new HubException(AccessDeniedMessage);
            }
        }

        var message = _messageService.SendMessage(senderId, recipientUserId, content, null);

        await Clients.User(recipientUserId.ToString()).SendAsync("MessageReceived", message);
        await Clients.User(senderId.ToString()).SendAsync("MessageReceived", message);
    }

    public async Task MarkRead(int otherUserId)
    {
        if (!TryGetUserId(out var readerId))
        {
            Context.Abort();
            return;
        }

        if (otherUserId <= 0)
        {
            throw new HubException("Recipient is required.");
        }

        var result = _messageService.MarkRead(readerId, otherUserId);
        if (result.Marked <= 0)
        {
            return;
        }

        var payload = new
        {
            ReaderId = readerId,
            SenderId = otherUserId,
            result.UpdatedMessages
        };

        await Clients.Users(readerId.ToString(), otherUserId.ToString())
            .SendAsync("MessagesRead", payload);
    }

    public async Task SendTyping(int recipientUserId, bool isTyping)
    {
        if (!TryGetUserId(out var senderId))
        {
            Context.Abort();
            return;
        }

        if (recipientUserId <= 0)
        {
            throw new HubException("Recipient is required.");
        }

        await Clients.User(recipientUserId.ToString()).SendAsync("UserTyping", new
        {
            UserId = senderId,
            RecipientUserId = recipientUserId,
            IsTyping = isTyping,
            TimestampUtc = DateTime.UtcNow
        });
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out userId);
    }

    private sealed class UserPresenceState
    {
        public ConcurrentDictionary<string, byte> Connections { get; } = new();
        public DateTime? LastSeenUtc { get; set; }
    }
}
