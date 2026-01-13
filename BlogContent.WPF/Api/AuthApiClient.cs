using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using System.Net.Http;

namespace BlogContent.WPF.Api;

public class AuthApiClient : ApiClientBase, IAuthService
{
    public AuthApiClient(HttpClient httpClient, ApiClientOptions options, ApiTokenStore tokenStore)
        : base(httpClient, options, tokenStore)
    {
    }

    public User? Login(string email, string password)
    {
        return LoginAsync(email, password).GetAwaiter().GetResult();
    }

    public bool UserExists(string email)
    {
        return UserExistsAsync(email).GetAwaiter().GetResult();
    }

    public Task<Guid> StartRegistrationAsync(string email, CancellationToken cancellationToken = default)
    {
        return StartRegistrationInternalAsync(email, cancellationToken);
    }

    public Task<bool> VerifyRegistrationAsync(Guid temporaryKey, string code, CancellationToken cancellationToken = default)
    {
        return VerifyRegistrationInternalAsync(temporaryKey, code, cancellationToken);
    }

    public Task<User> CompleteRegistrationAsync(Guid temporaryKey, string password, string username, string? fullName, DateTime? birthDate, string? bio, string? profilePictureUrl, CancellationToken cancellationToken = default)
    {
        return CompleteRegistrationInternalAsync(temporaryKey, password, username, fullName, birthDate, bio, profilePictureUrl, cancellationToken);
    }

    public Task ResendCodeAsync(Guid temporaryKey, CancellationToken cancellationToken = default)
    {
        return ResendCodeInternalAsync(temporaryKey, cancellationToken);
    }

    private async Task<User?> LoginAsync(string email, string password)
    {
        var response = await PostAsync<LoginResponse>("auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        }, requireAuth: false);

        if (response == null)
        {
            return null;
        }

        TokenStore.Update(response.Token, response.UserId);

        var userDto = await GetAsync<UserResponseDto>($"users/{response.UserId}");
        if (userDto == null)
        {
            return null;
        }

        var user = ApiDtoMapper.MapUser(userDto);
        TokenStore.SetUser(user);
        return user;
    }

    private async Task<bool> UserExistsAsync(string email)
    {
        var result = await GetAsync<UserCheckResponse>($"users/check?email={Uri.EscapeDataString(email)}", requireAuth: false);
        return result?.EmailTaken ?? false;
    }

    private async Task<Guid> StartRegistrationInternalAsync(string email, CancellationToken cancellationToken)
    {
        var response = await PostAsync<TemporaryKeyResponse>("auth/register/start", new RegisterStartRequest { Email = email }, requireAuth: false);
        return response?.TemporaryKey ?? Guid.Empty;
    }

    private async Task<bool> VerifyRegistrationInternalAsync(Guid temporaryKey, string code, CancellationToken cancellationToken)
    {
        await PostAsync<object>("auth/register/verify", new RegisterVerifyRequest
        {
            TemporaryKey = temporaryKey,
            Code = code
        }, requireAuth: false);

        return true;
    }

    private async Task<User> CompleteRegistrationInternalAsync(Guid temporaryKey, string password, string username, string? fullName, DateTime? birthDate, string? bio, string? profilePictureUrl, CancellationToken cancellationToken)
    {
        var response = await PostAsync<LoginResponse>("auth/register/complete", new RegisterCompleteRequest
        {
            TemporaryKey = temporaryKey,
            Password = password,
            Username = username,
            FullName = fullName,
            BirthDate = birthDate,
            Bio = bio,
            ProfilePictureUrl = profilePictureUrl
        }, requireAuth: false);

        if (response == null)
        {
            throw new InvalidOperationException("Регистрация не завершена.");
        }

        TokenStore.Update(response.Token, response.UserId);

        var userDto = await GetAsync<UserResponseDto>($"users/{response.UserId}");
        if (userDto == null)
        {
            throw new InvalidOperationException("Не удалось получить профиль пользователя.");
        }

        var user = ApiDtoMapper.MapUser(userDto);
        TokenStore.SetUser(user);
        return user;
    }

    private async Task ResendCodeInternalAsync(Guid temporaryKey, CancellationToken cancellationToken)
    {
        await PostAsync("auth/register/resend", new RegisterResendRequest { TemporaryKey = temporaryKey }, requireAuth: false);
    }

    private sealed record LoginResponse(string Token, int UserId);

    private sealed record UserCheckResponse(bool EmailTaken, bool UsernameTaken);

    private sealed record TemporaryKeyResponse(Guid TemporaryKey);
}
