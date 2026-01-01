using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Services;
using BlogContent.Services.Options;
using BlogContent.WebAPI.Controllers;
using BlogContent.WebAPI.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace BlogContent.Tests;

public class AuthFlowTests
{
    [Fact]
    public async Task CompleteRegistration_ShouldCreateUser()
    {
        var verificationRepo = new InMemoryEmailVerificationRepository();
        var emailService = new EmailVerificationService(
            verificationRepo,
            new NoopEmailSender(),
            Options.Create(new EmailVerificationOptions { CodeTTLMinutes = 5 }),
            Options.Create(new EmailTemplateOptions()),
            NullLogger<EmailVerificationService>.Instance);

        var userService = new InMemoryUserService();
        var authService = new AuthService(userService, emailService);

        var temporaryKey = await authService.StartRegistrationAsync("flow@example.com");
        var verification = verificationRepo.GetByTemporaryKey(temporaryKey)!;
        Assert.True(await authService.VerifyRegistrationAsync(temporaryKey, verification.Code));

        var user = await authService.CompleteRegistrationAsync(
            temporaryKey,
            "Secret123!",
            "tester",
            "Tester",
            null,
            null,
            null);

        Assert.True(user.EmailConfirmed);
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.Equal("flow@example.com", user.Email);
    }

    [Fact]
    public async Task RegisterVerifyEndpoint_ShouldReturnBadRequest_OnInvalidCode()
    {
        var controller = BuildController(result: false);

        var response = await controller.RegisterVerify(new BlogContent.WebAPI.DTOs.RegisterVerifyRequest
        {
            TemporaryKey = Guid.NewGuid(),
            Code = "0000"
        }, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(response);
    }

    [Fact]
    public async Task RegisterStart_ShouldReturnTemporaryKey()
    {
        var controller = BuildController();
        var result = await controller.RegisterStart(new BlogContent.WebAPI.DTOs.RegisterStartRequest
        {
            Email = "controller@example.com"
        }, CancellationToken.None) as OkObjectResult;

        Assert.NotNull(result);
        var temporaryKey = result!.Value?.GetType().GetProperty("temporaryKey")?.GetValue(result.Value);
        Assert.NotNull(temporaryKey);
    }

    private static AuthController BuildController(bool result = true)
    {
        var fakeAuthService = new FakeAuthService(result);
        var userService = new InMemoryUserService();
        var jwtOptions = Options.Create(new JwtOptions
        {
            Audience = "audience",
            Issuer = "issuer",
            Key = "01234567890123456789012345678901"
        });
        return new AuthController(fakeAuthService, userService, jwtOptions);
    }

    private class InMemoryEmailVerificationRepository : IEmailVerificationRepository
    {
        private readonly List<EmailVerification> _items = new();

        public EmailVerification Create(EmailVerification verification)
        {
            verification.Id = _items.Count + 1;
            _items.Add(verification);
            return verification;
        }

        public EmailVerification? GetActiveForEmail(string email, EmailVerificationPurpose purpose)
        {
            return _items.FirstOrDefault(x => x.Email == email && x.Purpose == purpose);
        }

        public EmailVerification? GetByTemporaryKey(Guid key)
        {
            return _items.FirstOrDefault(x => x.TemporaryKey == key);
        }

        public void Update(EmailVerification verification)
        {
            var existing = _items.FindIndex(x => x.Id == verification.Id);
            if (existing >= 0)
                _items[existing] = verification;
        }
    }

    private class NoopEmailSender : IEmailService
    {
        public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }

    private class InMemoryUserService : IUserService
    {
        private readonly List<User> _users = new();

        public void BanUser(int userId)
        {
        }

        public void CreateUser(User user)
        {
            user.Id = _users.Count + 1;
            _users.Add(user);
        }

        public void DeleteUser(int id)
        {
        }

        public User GetUserByEmail(string email)
        {
            return _users.FirstOrDefault(u => u.Email == email)!;
        }

        public User GetUserByUsername(string username)
        {
            return _users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase))!;
        }

        public User GetUserById(int id)
        {
            return _users.First(u => u.Id == id);
        }

        public PagedResult<User> SearchUsers(string query, int page, int pageSize)
        {
            var normalized = query?.Trim().ToLower() ?? string.Empty;
            if (string.IsNullOrEmpty(normalized))
            {
                return new PagedResult<User>(Enumerable.Empty<User>(), 0, page, pageSize);
            }

            var users = _users.Where(u =>
                u.Username.ToLower().Contains(normalized) ||
                u.Email.ToLower().Contains(normalized));
            var total = users.Count();
            var items = users.Skip((page - 1) * pageSize).Take(pageSize);
            return new PagedResult<User>(items, total, page, pageSize);
        }

        public IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds) => _users.Where(u => userIds.Contains(u.Id));

        public User? GetCurrentUser() => _users.FirstOrDefault();

        public void MakeAdmin(int userId)
        {
        }

        public void UnbanUser(int userId)
        {
        }

        public void UpdateUser(User user)
        {
        }
    }

    private class FakeAuthService : IAuthService
    {
        private readonly bool _verifyResult;

        public FakeAuthService(bool verifyResult = true)
        {
            _verifyResult = verifyResult;
        }

        public Task<User> CompleteRegistrationAsync(Guid temporaryKey, string password, string username, string? fullName, DateTime? birthDate, string? bio, string? profilePictureUrl, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new User
            {
                Id = 1,
                Email = "controller@example.com",
                Username = username,
                EmailConfirmed = true,
                Status = UserStatus.Active
            });
        }

        public User? Login(string email, string password) => null;

        public Task ResendCodeAsync(Guid temporaryKey, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<Guid> StartRegistrationAsync(string email, CancellationToken cancellationToken = default) => Task.FromResult(Guid.NewGuid());

        public bool UserExists(string email) => false;

        public Task<bool> VerifyRegistrationAsync(Guid temporaryKey, string code, CancellationToken cancellationToken = default) => Task.FromResult(_verifyResult);
    }
}
