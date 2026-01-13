using BlogContent.Core.Interfaces;
using BlogContent.Core.Models;
using BlogContent.WebAPI.DTOs;
using System.Net.Http;

namespace BlogContent.WPF.Api;

public class UsersApiClient : ApiClientBase, IUserService
{
    public UsersApiClient(HttpClient httpClient, ApiClientOptions options, ApiTokenStore tokenStore)
        : base(httpClient, options, tokenStore)
    {
    }

    public User GetUserById(int id)
    {
        var dto = GetAsync<UserResponseDto>($"users/{id}").GetAwaiter().GetResult();
        if (dto == null)
        {
            throw new InvalidOperationException("Пользователь не найден.");
        }

        return ApiDtoMapper.MapUser(dto);
    }

    public IEnumerable<User> GetUsersByIds(IEnumerable<int> userIds)
    {
        var tasks = userIds.Select(async id => await GetAsync<UserResponseDto>($"users/{id}"));
        var results = Task.WhenAll(tasks).GetAwaiter().GetResult();
        return results.Where(dto => dto != null).Select(dto => ApiDtoMapper.MapUser(dto!));
    }

    public User GetUserByEmail(string email)
    {
        throw new NotSupportedException("Поиск пользователя по email не поддерживается WebAPI.");
    }

    public User GetUserByUsername(string username)
    {
        throw new NotSupportedException("Поиск пользователя по username не поддерживается WebAPI.");
    }

    public PagedResult<User> SearchUsers(string query, int page, int pageSize)
    {
        var response = GetAsync<PagedResponse<UserResponseDto>>($"users/search?query={Uri.EscapeDataString(query)}&page={page}&pageSize={pageSize}", requireAuth: false)
            .GetAwaiter()
            .GetResult();

        if (response == null)
        {
            return new PagedResult<User>(Enumerable.Empty<User>(), 0, page, pageSize);
        }

        var items = response.Items.Select(ApiDtoMapper.MapUser);
        return new PagedResult<User>(items, response.Total, response.Page, response.PageSize);
    }

    public void CreateUser(User user)
    {
        throw new NotSupportedException("Создание пользователя выполняется через регистрацию.");
    }

    public void UpdateUser(User user)
    {
        var request = new UpdateProfileRequest
        {
            FullName = user.Profile?.FullName,
            BirthDate = user.Profile?.BirthDate == default ? null : user.Profile?.BirthDate,
            Bio = user.Profile?.Bio,
            ProfilePictureUrl = user.Profile?.ProfilePictureUrl
        };

        PutAsync("users/profile", request).GetAwaiter().GetResult();
    }

    public void DeleteUser(int id)
    {
        throw new NotSupportedException("Удаление пользователя не поддерживается в WebAPI.");
    }

    public void BanUser(int userId)
    {
        throw new NotSupportedException("Блокировка пользователя доступна только в админских API.");
    }

    public void UnbanUser(int userId)
    {
        throw new NotSupportedException("Разблокировка пользователя доступна только в админских API.");
    }

    public void MakeAdmin(int userId)
    {
        throw new NotSupportedException("Назначение администратора доступно только в админских API.");
    }

    public User? GetCurrentUser()
    {
        if (TokenStore.CurrentUser != null)
        {
            return TokenStore.CurrentUser;
        }

        var dto = GetAsync<UserResponseDto>("auth/me").GetAwaiter().GetResult();
        if (dto == null)
        {
            return null;
        }

        var user = ApiDtoMapper.MapUser(dto);
        TokenStore.SetUser(user);
        return user;
    }
}
