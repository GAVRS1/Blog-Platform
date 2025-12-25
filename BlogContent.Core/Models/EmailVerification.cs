using BlogContent.Core.Enums;

namespace BlogContent.Core.Models;

public class EmailVerification
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; }
    public int ResendCount { get; set; }
    public DateTime? LastSentAt { get; set; }
    public EmailVerificationStatus Status { get; set; } = EmailVerificationStatus.Pending;
    public EmailVerificationPurpose Purpose { get; set; } = EmailVerificationPurpose.Registration;
    public Guid TemporaryKey { get; set; } = Guid.NewGuid();
}
