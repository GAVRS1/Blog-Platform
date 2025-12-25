using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;
public interface IAuthService
{
    User? Login(string email, string password);
    bool UserExists(string email);
    Task<Guid> StartRegistrationAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> VerifyRegistrationAsync(Guid temporaryKey, string code, CancellationToken cancellationToken = default);
    Task<User> CompleteRegistrationAsync(Guid temporaryKey, string password, string username, string? fullName, DateTime? birthDate, string? bio, string? profilePictureUrl, CancellationToken cancellationToken = default);
    Task ResendCodeAsync(Guid temporaryKey, CancellationToken cancellationToken = default);
}
