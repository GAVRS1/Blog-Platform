using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace BlogContent.WebAPI.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

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

        _logger.LogInformation("User {UserId} connected to ChatHub.", userId);
        await base.OnConnectedAsync();
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

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out userId);
    }
}
