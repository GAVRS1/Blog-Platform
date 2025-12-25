using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogContent.Data.Repositories;

public class EmailVerificationRepository(BlogContext context) : IEmailVerificationRepository
{
    private readonly BlogContext _context = context;

    public EmailVerification Create(EmailVerification verification)
    {
        _context.EmailVerifications.Add(verification);
        _context.SaveChanges();
        return verification;
    }

    public EmailVerification? GetByTemporaryKey(Guid key)
    {
        return _context.EmailVerifications.AsNoTracking().FirstOrDefault(ev => ev.TemporaryKey == key);
    }

    public EmailVerification? GetActiveForEmail(string email, EmailVerificationPurpose purpose)
    {
        return _context.EmailVerifications.AsNoTracking()
            .FirstOrDefault(ev => ev.Email == email &&
                                  ev.Purpose == purpose &&
                                  (ev.Status == EmailVerificationStatus.Pending || ev.Status == EmailVerificationStatus.Verified));
    }

    public void Update(EmailVerification verification)
    {
        _context.EmailVerifications.Update(verification);
        _context.SaveChanges();
    }
}
