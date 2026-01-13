using BlogContent.Core.Models;

namespace BlogContent.WPF.Api;

public class ApiTokenStore
{
    public string? AccessToken { get; private set; }
    public int? CurrentUserId { get; private set; }
    public User? CurrentUser { get; private set; }

    public void Update(string? token, int? userId, User? user = null)
    {
        AccessToken = token;
        CurrentUserId = userId;
        if (user != null)
        {
            CurrentUser = user;
        }
    }

    public void SetUser(User user)
    {
        CurrentUser = user;
        CurrentUserId = user?.Id;
    }

    public void Clear()
    {
        AccessToken = null;
        CurrentUserId = null;
        CurrentUser = null;
    }
}
