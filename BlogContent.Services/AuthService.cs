using BlogContent.Core.Models;
using BlogContent.Core.Security;
namespace BlogContent.Services;

public class AuthService
{
    private readonly UserService _userService;

    public AuthService(UserService userService) => _userService = userService;

    public User? Login(string email, string password)
    {
        try
        {
            User user = _userService.GetUserByEmail(email);

            if (user == null)
                return null;

            // Проверка статуса пользователя
            if (user.Status == Core.Enums.UserStatus.Banned)
                throw new Exception("Ваш аккаунт заблокирован. Обратитесь к администратору.");

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
}
