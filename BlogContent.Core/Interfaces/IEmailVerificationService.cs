using BlogContent.Core.Enums;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IEmailVerificationService
{
    Task<EmailVerification> StartAsync(string email, EmailVerificationPurpose purpose, CancellationToken cancellationToken = default);
    Task<EmailVerification> ResendAsync(Guid temporaryKey, CancellationToken cancellationToken = default);
    Task<bool> VerifyAsync(Guid temporaryKey, string code, CancellationToken cancellationToken = default);
    Task<EmailVerification?> GetAsync(Guid temporaryKey, CancellationToken cancellationToken = default);
    Task MarkCompletedAsync(Guid temporaryKey, CancellationToken cancellationToken = default);
}
