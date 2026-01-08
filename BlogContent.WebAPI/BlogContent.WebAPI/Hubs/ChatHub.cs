using System.Collections.Concurrent;
using System.Security.Claims;
using System.Linq;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace BlogContent.WebAPI.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;
    private static readonly ConcurrentDictionary<int, UserPresenceState> PresenceStates = new();

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
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

        var message = new
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            RecipientId = recipientUserId,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        await Clients.User(recipientUserId.ToString()).SendAsync("MessageReceived", message);
        await Clients.User(senderId.ToString()).SendAsync("MessageReceived", message);
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
