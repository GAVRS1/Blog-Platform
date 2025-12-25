using System.Text;
using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Services.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BlogContent.Services;

public class EmailVerificationService : IEmailVerificationService
{
    private readonly IEmailVerificationRepository _repository;
    private readonly IEmailService _emailService;
    private readonly EmailVerificationOptions _verificationOptions;
    private readonly EmailTemplateOptions _templateOptions;
    private readonly ILogger<EmailVerificationService> _logger;
    private static readonly char[] Digits = "0123456789".ToCharArray();
    private readonly Random _random = new();

    public EmailVerificationService(
        IEmailVerificationRepository repository,
        IEmailService emailService,
        IOptions<EmailVerificationOptions> verificationOptions,
        IOptions<EmailTemplateOptions> templateOptions,
        ILogger<EmailVerificationService> logger)
    {
        _repository = repository;
        _emailService = emailService;
        _verificationOptions = verificationOptions.Value;
        _templateOptions = templateOptions.Value;
        _logger = logger;
    }

    public async Task<EmailVerification> StartAsync(string email, EmailVerificationPurpose purpose, CancellationToken cancellationToken = default)
    {
        var existing = _repository.GetActiveForEmail(email, purpose);
        if (existing is { Status: EmailVerificationStatus.Verified })
        {
            return existing;
        }

        if (existing != null && IsExpired(existing))
        {
            existing.Status = EmailVerificationStatus.Expired;
            _repository.Update(existing);
            existing = null;
        }

        var verification = new EmailVerification
        {
            Email = email,
            Code = GenerateCode(),
            ExpiresAt = DateTime.UtcNow.AddMinutes(_verificationOptions.CodeTTLMinutes),
            Attempts = 0,
            ResendCount = 0,
            Status = EmailVerificationStatus.Pending,
            Purpose = purpose,
            TemporaryKey = Guid.NewGuid(),
            LastSentAt = DateTime.UtcNow
        };

        verification = _repository.Create(verification);
        await SendEmailAsync(verification, cancellationToken);
        return verification;
    }

    public async Task<EmailVerification> ResendAsync(Guid temporaryKey, CancellationToken cancellationToken = default)
    {
        var verification = _repository.GetByTemporaryKey(temporaryKey)
            ?? throw new InvalidOperationException("Verification session not found");

        if (verification.Status is EmailVerificationStatus.Locked or EmailVerificationStatus.Completed)
        {
            throw new InvalidOperationException("Verification is locked or already completed");
        }

        if (verification.ResendCount >= _verificationOptions.MaxResends)
        {
            throw new InvalidOperationException("Resend limit reached");
        }

        if (verification.LastSentAt.HasValue &&
            verification.LastSentAt.Value.AddSeconds(_verificationOptions.ResendCooldownSeconds) > DateTime.UtcNow)
        {
            throw new InvalidOperationException("Please wait before requesting another code");
        }

        verification.Code = GenerateCode();
        verification.ExpiresAt = DateTime.UtcNow.AddMinutes(_verificationOptions.CodeTTLMinutes);
        verification.ResendCount += 1;
        verification.LastSentAt = DateTime.UtcNow;
        verification.Status = EmailVerificationStatus.Pending;

        _repository.Update(verification);
        await SendEmailAsync(verification, cancellationToken);

        return verification;
    }

    public async Task<bool> VerifyAsync(Guid temporaryKey, string code, CancellationToken cancellationToken = default)
    {
        var verification = _repository.GetByTemporaryKey(temporaryKey);
        if (verification == null)
        {
            return false;
        }

        if (verification.Status is EmailVerificationStatus.Locked or EmailVerificationStatus.Completed)
        {
            return false;
        }

        if (IsExpired(verification))
        {
            verification.Status = EmailVerificationStatus.Expired;
            _repository.Update(verification);
            return false;
        }

        if (!string.Equals(verification.Code, code, StringComparison.Ordinal))
        {
            verification.Attempts += 1;
            if (verification.Attempts >= _verificationOptions.MaxAttempts)
            {
                verification.Status = EmailVerificationStatus.Locked;
            }
            _repository.Update(verification);
            return false;
        }

        verification.Status = EmailVerificationStatus.Verified;
        _repository.Update(verification);
        return true;
    }

    public Task<EmailVerification?> GetAsync(Guid temporaryKey, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_repository.GetByTemporaryKey(temporaryKey));
    }

    public Task MarkCompletedAsync(Guid temporaryKey, CancellationToken cancellationToken = default)
    {
        var verification = _repository.GetByTemporaryKey(temporaryKey);
        if (verification == null)
        {
            return Task.CompletedTask;
        }

        verification.Status = EmailVerificationStatus.Completed;
        _repository.Update(verification);
        return Task.CompletedTask;
    }

    private bool IsExpired(EmailVerification verification) => DateTime.UtcNow > verification.ExpiresAt;

    private string GenerateCode()
    {
        var builder = new StringBuilder();
        for (int i = 0; i < _verificationOptions.CodeLength; i++)
        {
            builder.Append(Digits[_random.Next(Digits.Length)]);
        }

        return builder.ToString();
    }

    private Task SendEmailAsync(EmailVerification verification, CancellationToken cancellationToken)
    {
        var body = _templateOptions.VerificationBodyTemplate.Replace("{CODE}", verification.Code);
        return _emailService.SendEmailAsync(
            verification.Email,
            _templateOptions.VerificationSubject,
            body,
            cancellationToken);
    }
}
