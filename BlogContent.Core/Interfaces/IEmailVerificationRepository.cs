using BlogContent.Core.Enums;
using BlogContent.Core.Models;

namespace BlogContent.Core.Interfaces;

public interface IEmailVerificationRepository
{
    EmailVerification Create(EmailVerification verification);
    void Update(EmailVerification verification);
    EmailVerification? GetByTemporaryKey(Guid key);
    EmailVerification? GetActiveForEmail(string email, EmailVerificationPurpose purpose);
}
