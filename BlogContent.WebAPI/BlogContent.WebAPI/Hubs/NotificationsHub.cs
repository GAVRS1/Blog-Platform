using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace BlogContent.WebAPI.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class NotificationsHub : Hub
{
    private readonly ILogger<NotificationsHub> _logger;

    public NotificationsHub(ILogger<NotificationsHub> logger)
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

        _logger.LogInformation("User {UserId} connected to NotificationsHub.", userId);
        await base.OnConnectedAsync();
    }

    public async Task SendNotification(int recipientUserId, string type, string? text = null)
    {
        if (!TryGetUserId(out var senderId))
        {
            Context.Abort();
            return;
        }

        if (recipientUserId <= 0 || string.IsNullOrWhiteSpace(type))
        {
            throw new HubException("Recipient and notification type are required.");
        }

        var notification = new
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            RecipientUserId = recipientUserId,
            Type = type,
            Text = text ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        await Clients.User(recipientUserId.ToString()).SendAsync("NotificationReceived", notification);
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out userId);
    }
}
