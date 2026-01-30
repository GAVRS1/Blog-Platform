using System.Threading;
using System.Threading.Tasks;

namespace BlogContent.WebAPI.Services;

public interface ITurnstileService
{
    Task<bool> VerifyAsync(string token, string? remoteIp, CancellationToken cancellationToken);
}
