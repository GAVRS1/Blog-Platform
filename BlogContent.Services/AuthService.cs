using BlogContent.Core.Enums;
using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.Core.Security;

namespace BlogContent.Services;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly IEmailVerificationService _emailVerificationService;

    public AuthService(IUserService userService, IEmailVerificationService emailVerificationService)
    {
        _userService = userService;
        _emailVerificationService = emailVerificationService;
    }

    public User? Login(string email, string password)
    {
        try
        {
            User user = _userService.GetUserByEmail(email);

            if (user == null)
                return null;

            // Проверка статуса пользователя
            if (user.Status == UserStatus.Banned)
                throw new Exception("Ваш аккаунт заблокирован. Обратитесь к администратору.");

            if (user.Status == UserStatus.PendingEmailConfirmation || !user.EmailConfirmed)
                throw new Exception("Подтвердите email перед входом.");

            // Проверка пароля
            if (PasswordHasher.VerifyPassword(password, user.PasswordHash))
                return user;

            return null;
        }
        catch (Exception)
        {
            throw;
        }
    }

    public bool UserExists(string email)
    {
        try
        {
            User user = _userService.GetUserByEmail(email);
            return user != null;
        }
        catch
        {
            return false;
        }
    }

    public async Task<Guid> StartRegistrationAsync(string email, CancellationToken cancellationToken = default)
    {
        if (UserExists(email))
            throw new InvalidOperationException("Пользователь с таким email уже существует.");

        var verification = await _emailVerificationService.StartAsync(email, EmailVerificationPurpose.Registration, cancellationToken);
        return verification.TemporaryKey;
    }

    public async Task<bool> VerifyRegistrationAsync(Guid temporaryKey, string code, CancellationToken cancellationToken = default)
    {
        return await _emailVerificationService.VerifyAsync(temporaryKey, code, cancellationToken);
    }

    public async Task<User> CompleteRegistrationAsync(
        Guid temporaryKey,
        string password,
        string username,
        string? fullName,
        DateTime? birthDate,
        string? bio,
        string? profilePictureUrl,
        CancellationToken cancellationToken = default)
    {
        var verification = await _emailVerificationService.GetAsync(temporaryKey, cancellationToken)
                          ?? throw new InvalidOperationException("Сессия подтверждения не найдена.");

        if (verification.Status != EmailVerificationStatus.Verified)
            throw new InvalidOperationException("Email не подтвержден.");

        if (UserExists(verification.Email))
            throw new InvalidOperationException("Пользователь с таким email уже существует.");

        var profile = new Profile
        {
            Username = username,
            FullName = fullName ?? string.Empty,
            Bio = bio ?? string.Empty,
            ProfilePictureUrl = profilePictureUrl ?? string.Empty
        };

        if (birthDate.HasValue)
        {
            var birth = DateOnly.FromDateTime(birthDate.Value.Date);
            profile.BirthDate = birth;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var age = today.Year - birth.Year;
            if (birth.AddYears(age) > today)
            {
                age--;
            }
            profile.Age = Math.Max(age, 0);
        }

        var user = new User
        {
            Email = verification.Email,
            Username = username,
            PasswordHash = PasswordHasher.HashPassword(password),
            Profile = profile,
            EmailConfirmed = true,
            Status = UserStatus.Active
        };

        _userService.CreateUser(user);
        await _emailVerificationService.MarkCompletedAsync(temporaryKey, cancellationToken);
        return user;
    }

    public async Task ResendCodeAsync(Guid temporaryKey, CancellationToken cancellationToken = default)
    {
        await _emailVerificationService.ResendAsync(temporaryKey, cancellationToken);
    }
}
