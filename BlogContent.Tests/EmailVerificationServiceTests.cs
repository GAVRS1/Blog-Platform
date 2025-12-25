using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.Services.Options;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace BlogContent.Tests;

public class EmailVerificationServiceTests
{
    private readonly InMemoryEmailVerificationRepository _repository = new();
    private readonly FakeEmailService _emailService = new();

    private EmailVerificationService CreateService(EmailVerificationOptions? options = null)
    {
        return new EmailVerificationService(
            _repository,
            _emailService,
            Options.Create(options ?? new EmailVerificationOptions
            {
                CodeTTLMinutes = 1,
                MaxAttempts = 3,
                MaxResends = 2,
                ResendCooldownSeconds = 0
            }),
            Options.Create(new EmailTemplateOptions()),
            NullLogger<EmailVerificationService>.Instance);
    }

    [Fact]
    public async Task StartAndVerify_ShouldSucceed_ForValidFlow()
    {
        var service = CreateService();

        var verification = await service.StartAsync("user@example.com", EmailVerificationPurpose.Registration);
        Assert.Equal(EmailVerificationStatus.Pending, verification.Status);
        Assert.Single(_emailService.Messages);

        var result = await service.VerifyAsync(verification.TemporaryKey, verification.Code);
        Assert.True(result);
        var stored = _repository.GetByTemporaryKey(verification.TemporaryKey)!;
        Assert.Equal(EmailVerificationStatus.Verified, stored.Status);
    }

    [Fact]
    public async Task Verify_ShouldFailAndExpire_WhenCodeIsExpired()
    {
        var service = CreateService(new EmailVerificationOptions { CodeTTLMinutes = 0, ResendCooldownSeconds = 0 });
        var verification = await service.StartAsync("expired@example.com", EmailVerificationPurpose.Registration);

        // Force expiration
        verification.ExpiresAt = DateTime.UtcNow.AddSeconds(-1);
        _repository.Update(verification);

        var result = await service.VerifyAsync(verification.TemporaryKey, verification.Code);
        Assert.False(result);
        var stored = _repository.GetByTemporaryKey(verification.TemporaryKey)!;
        Assert.Equal(EmailVerificationStatus.Expired, stored.Status);
    }

    [Fact]
    public async Task Verify_ShouldLockAfterMaxAttempts()
    {
        var service = CreateService(new EmailVerificationOptions { MaxAttempts = 2, ResendCooldownSeconds = 0 });
        var verification = await service.StartAsync("wrong@example.com", EmailVerificationPurpose.Registration);

        Assert.False(await service.VerifyAsync(verification.TemporaryKey, "0000"));
        Assert.False(await service.VerifyAsync(verification.TemporaryKey, "1111"));

        var stored = _repository.GetByTemporaryKey(verification.TemporaryKey)!;
        Assert.Equal(EmailVerificationStatus.Locked, stored.Status);
        Assert.Equal(2, stored.Attempts);
    }

    [Fact]
    public async Task Resend_ShouldRespectLimit()
    {
        var service = CreateService(new EmailVerificationOptions { MaxResends = 1, ResendCooldownSeconds = 0 });
        var verification = await service.StartAsync("resend@example.com", EmailVerificationPurpose.Registration);

        await service.ResendAsync(verification.TemporaryKey);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ResendAsync(verification.TemporaryKey));
    }

    private class InMemoryEmailVerificationRepository : IEmailVerificationRepository
    {
        private readonly List<EmailVerification> _items = new();

        public EmailVerification Create(EmailVerification verification)
        {
            verification.Id = _items.Count + 1;
            _items.Add(Clone(verification));
            return verification;
        }

        public EmailVerification? GetActiveForEmail(string email, EmailVerificationPurpose purpose)
        {
            return _items.FirstOrDefault(x => x.Email == email &&
                                              x.Purpose == purpose &&
                                              (x.Status == EmailVerificationStatus.Pending || x.Status == EmailVerificationStatus.Verified));
        }

        public EmailVerification? GetByTemporaryKey(Guid key)
        {
            return _items.FirstOrDefault(x => x.TemporaryKey == key)?.Let(Clone);
        }

        public void Update(EmailVerification verification)
        {
            var existing = _items.FindIndex(x => x.Id == verification.Id);
            if (existing >= 0)
            {
                _items[existing] = Clone(verification);
            }
        }

        private static EmailVerification Clone(EmailVerification source) => new()
        {
            Id = source.Id,
            Email = source.Email,
            Code = source.Code,
            ExpiresAt = source.ExpiresAt,
            Attempts = source.Attempts,
            ResendCount = source.ResendCount,
            LastSentAt = source.LastSentAt,
            Status = source.Status,
            Purpose = source.Purpose,
            TemporaryKey = source.TemporaryKey
        };
    }

    private class FakeEmailService : IEmailService
    {
        public List<(string To, string Subject, string Body)> Messages { get; } = new();

        public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
        {
            Messages.Add((to, subject, body));
            return Task.CompletedTask;
        }
    }
}

internal static class FunctionalExtensions
{
    public static TOut Let<TIn, TOut>(this TIn? source, Func<TIn, TOut> mapper) where TIn : class
        => source == null ? default! : mapper(source);
}
